#!/bin/bash
#
# � 2011 Western Digital Technologies, Inc. All rights reserved.
#
. /etc/system.conf
. /etc/nas/config/wd-nas.conf 2>/dev/null

getProject() {
  #model=`xmldbc -g hw_ver`
  case "$modelNumber" in 
	LT4A )
					#LT4A
					echo 4
					;;
	KC2A )
					#KC2A
					echo 2
					;;
	BZVM )
					#ZION
					echo 2
					;;
	GLCR )
					#Glacier
					echo 1
					;;
	BNEZ )
					#Sprite
					echo 4
					;;
	BWZE )
					#Yellowstone
					echo 4
					;;
	BBAZ )
					#Aurora
					echo 2
					;;
	BWAZ )
					#Yosemite
					echo 2
					;;	
	BG2Y )
					#BlackIce
					echo 1
					;;						
    BAGX )
		            #Mirrorman
					echo 1
					;;
    BWVZ )
		            #Grandteton
                    echo 2
					;;
    BLHW )          #Alpina
		            echo 1
					;;
    BVBZ )          #Ranger peak
		            echo 2
					;;
	BNFA )
					#Black Canyon
					echo 4
					;;
	BBCL )
					#Bryce Canyon
					echo 2
					;;
	* )
					#Others
					echo 4
					;;  
  esac
}
#Print list of SATA connectors
SATAConnectors() {
    #This filter is difficult to maintain.  Be nice if there was a way to look up SATA driver name
    local filter=sata
    #local filter=ahci

    #Use device sym link to locate which SATA connector physical drive is connected.
#    find /sys/devices/ -type d -name "host?" -print | grep $filter | sed -n -e 's/.*host\([0-9]\)/\1/p'
#    find /sys/devices/ -type d -name "host?" -print | grep $filter | grep scsi_host | sed -n -e 's/.*host\([0-9]\)/\1/p'

	# + 20140530.VODKA
    #find /sys/devices/ -type d -name "host?" -print | grep scsi_host | sed -n -e 's/.*host\([0-9]\)/\1/p'
	num=`getProject`
	for ((i=0; i<num; i++)); do
		#host? exist for check hdd exist
		if [ -e "/sys/class/scsi_host/host$i/device/target$i:0:0/$i:0:0:0" ]; then
			 #if host? exist , check /sys/block to find sd?
			 echo $i
		fi
	done	
}

#Print SATA device based on location
#$1 is location [0-1]
#NOTE:  When device is missing, its device name is unknown and will be returned as empty string
SATADevice() {
    local loc
    #This filter is difficult to maintain.  Be nice if there was a way to look up SATA driver name
    local filter=sata
    #local filter=ahci

    loc="$1"

    #Use device sym link to locate which SATA connector physical drive is connected.
    #find /sys/block/ -type l -name device -exec ls -l {} \; | grep $filter | grep host${loc} | sed -n -e 's/.*\/sys\/block\/\(sd.\)\/.*/\1/p'
#   ls -l /sys/block | grep $filter | grep host${loc} | awk '{print $9}' This was capturing '->'
#   ls -l /sys/block | grep $filter | grep host${loc} | sed -n -e 's/.*->.*\(sd.\).*/\/dev\/\1/p'
    ls -l /sys/block | grep host${loc} | sed -n -e 's/.*->.*\(sd.\).*/\/dev\/\1/p'
}

#Print list of internal devices (/dev/sda /dev/sdb)
# internalDrives() {
    # local connectors
    # local SATALoc
    # local device
    # local driveList

    # connectors=( `SATAConnectors`)
    # driveList=

    # for SATALoc in "${connectors[@]}"
    # do
        # device=`SATADevice $SATALoc`
        
        # if [ -n "$device" ]; then
            # #Drive is present
            # driveList=( ${driveList[@]} $device )
        # fi
    # done

    # echo "${driveList[@]}"
# }

#internalDrivesAlpha() {
internalDrives() {
	num=`getProject`
	drivelist=
	for ((i=0; i<num; i++)); do
		#host? exist for check hdd exist
		if [ -e "/sys/class/scsi_host/host$i/device/target$i:0:0/$i:0:0:0" ]; then
			 #if host? exist , check /sys/block to find sd?
			 loc=`ls -l /sys/block | grep host$i | sed -n -e 's/.*->.*\(sd.\).*/\/dev\/\1/p'`
			 drivelist=( ${drivelist[@]} $loc )
		fi
	done

	echo "${drivelist[@]}"
}

# restore raid $1 == wait to wait
restoreRaid ()
{
    currentRootDevice=`cat /proc/cmdline | awk '/root/ { print $1 }' | cut -d= -f2`
    duplicate_md=
    if [ "${currentRootDevice}" != "/dev/nfs" ]; then
        # stop any duplicate md devices and make sure both disks are part of the current rootfs md device
        if [ "${currentRootDevice}" == "/dev/md0" ]; then
            if [ -e /dev/md1 ]; then
                duplicate_md="/dev/md1"
            fi
        elif [ "${currentRootDevice}" == "/dev/md1" ]; then
            if [ -e /dev/md0 ]; then
                duplicate_md="/dev/md0"
            fi
        fi
        if [ ! -z ${duplicate_md} ]; then
            echo "stopping duplicate md device ${duplicate_md}"
            mdadm --stop ${duplicate_md}
            mdadm --wait ${duplicate_md}
            sleep 1
        fi
        # always attempt to add all mirror partitions - its ok to fail if they are already there
		# "--remove" will only remove failed disks, and is necessary to allow "--add" them for
		# resyncing the array; in a standalone program, use the following to identify failed disks
		# mdadm --detail "${currentRootDevice}" | sed -n -e '/faulty/s#\(.*\)\(/dev/.*\)#\2#p'
		devices=(`internalDrives`)
		for (( i=0; i<${#devices[@]}; i++ )); do
			restoreDevice="${devices[$i]}1"
			echo "Restore raid device: $restoreDevice"
			mdadm ${currentRootDevice} --remove ${restoreDevice} > /dev/null 2>&1
			mdadm ${currentRootDevice} --add ${restoreDevice} > /dev/null 2>&1
			[ "$1" == "wait" ] && mdadm --wait ${currentRootDevice} 
			
			restoreDevice="${devices[$i]}2"
			echo "Restore raid device: $restoreDevice"
			mdadm ${currentRootDevice} --remove ${restoreDevice} > /dev/null 2>&1
			mdadm ${currentRootDevice} --add ${restoreDevice} > /dev/null 2>&1
			[ "$1" == "wait" ] && mdadm --wait ${currentRootDevice} 

		done
        sleep 1
    fi
}

#Return serial number of drive at $1 or ERROR (!!!Not used)
driveSerial() {
    local device
    local cmd
    local serial
    local result
    
    device="$1"
    cmd="hdparm -i /dev/$device"
    serial=`$cmd`
    result=$?
    serial=`echo "$serial" | sed -n -e 's/.*SerialNo=.*-\(.*\)/\1/p'`
    if [ $result -ne 0 ]; then
        logger "$0: $cmd returned $result"
        serial=ERROR
    fi

    echo "$serial"
}
