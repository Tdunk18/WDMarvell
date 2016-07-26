#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# masterInstall.sh
#

function InstallFailure()
{
    echo $(tput setaf 1) $(tput bold)
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "! FAILURE ! FAILURE ! FAILURE ! FAILURE !"
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "$(tput setaf 7) ${1}"
    echo $(tput setaf 1) $(tput bold)
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo $(tput sgr0)
    touch /_FAILED_MASTER_DISK_IMAGE_INSTALLATION_FAILED_
    ledCtrl.sh LED_EV_MASTER_INST LED_STAT_ERR

    dev_list=`ls /dev/sd??`
    dev_array=(${dev_list// / })
    for i in ${dev_array[@]}; do
	echo "erasing $i"
	dd if=/dev/zero of=$i bs=1M count=32
    done
    exit 1
}

#
# begin script
#

echo "Now running ${0}: `date`"
pwd
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /etc/system.conf
. /usr/local/sbin/ledConfig.sh

# first check host system's RAM size
if [ -e /FAILED_memory_check ]; then
	RAMsize=`cat /FAILED_memory_check`
	echo "NOT ENOUGH MEMORY!"
	echo "available memory: $RAMsize"
	echo "min required 2621440 kB"
	echo "exiting installation!"
	exit 1
fi
  
if [ $DVC_DRIVE_COUNT -gt 1 ]; then
	. /usr/local/sbin/data-volume-config_helper.sh
fi
. /usr/local/sbin/drive_helper.sh

declare -a driveList=( )
driveList=(`internalDrives`)
numDrives="${#driveList[@]}"
numDrives=${numDrives:-"0"}
if [ "${numDrives}" -ne "$DVC_DRIVE_COUNT" ]; then
	echo "-----------------------------------------------------------------------"
    echo "Expected ${DVC_DRIVE_COUNT} but found ${numDrives} drives, continuing.."
    if [ "${numDrives}" -eq "0" ]; then
        driveList=( /dev/sda )
        numDrives="1"
        echo "0 drives found, assume 1 drive as /dev/sda"
    fi
	echo "-----------------------------------------------------------------------"
fi
echo "driveList=${driveList[@]}"
echo "master_package_name=${master_package_name}"
backgroundPattern="${backgroundPattern:-0xE5}"

page_size=`getconf PAGE_SIZE`

# delete any previous status 'touch' files..
rm -f /*_DISK_IMAGE_INSTALLATION_*
# */

# get the HDD serial number to create a unique dpkg admin directory to support concurrent installs
SERIALNUMBER=`hdparm -i /dev/sda | grep Model | cut -d ',' -f 3 | cut -d '=' -f 2 | awk '{ print $1 }'`
dpkgAdminDir=/var/lib/dpkg-${SERIALNUMBER}
echo "dpkgAdminDir=${dpkgAdminDir}"
rm -rf ${dpkgAdminDir}
mkdir -p ${dpkgAdminDir}/updates
mkdir -p ${dpkgAdminDir}/info
mkdir -p ${dpkgAdminDir}/parts
mkdir -p ${dpkgAdminDir}/alternatives
mkdir -p ${dpkgAdminDir}/triggers
[ ! -e ${dpkgAdminDir}/status ] && touch ${dpkgAdminDir}/status
[ ! -e ${dpkgAdminDir}/available ] && touch ${dpkgAdminDir}/available
chmod -R 777 ${dpkgAdminDir}
# find the master installation package
echo "Master package name = ${master_package_name}"
upgradeFile=`find /upgrade | grep ${master_package_name}`
if [ -z ${upgradeFile} ]; then
    echo "File ${upgradeFile} not found - exiting."
    exit 1
else
    echo "Found ${upgradeFile} for master disk image installation..."
fi
# verify that we are nfs mounted
currentRootDevice=`cat /proc/cmdline | awk '/root/ { print $1 }' | cut -d= -f2`
if [ "${currentRootDevice}" == "/dev/nfs" ]; then
    touch /tmp/fresh_install
    sync
else
    echo "current root device (boot device) is not /dev/nfs: ${currentRootDevice}"
    echo "exiting ${0}.."
    exit 1
fi

swapoff -a

# stop any existing metadata devices
runningMds=(`ls /dev/md[0-9]*`)
for runningMd in "${runningMds[@]}"
do
    sleep 2
    mdadm --stop $runningMd
    mdadm --wait $runningMd
done
sleep 2
sync

for drive in "${driveList[@]}"
do
    hdparm -i ${drive} | grep Model    
done
sleep 2
echo

ledCtrl.sh LED_EV_MASTER_INST LED_STAT_IN_PROG

if [ -e /validate_pattern ]; then
    echo "Pattern valdiation option selected."
    if [ -e /quick_validate ]; then
        echo "Quick validation enabled, skipping disk zeroing."
    else
        echo "Writing zeros to all disk locations and verifying."
        # verify no bad blocks and put down zero's for backround pattern
        for drive in "${driveList[@]}"
        do
            badblocks -swf -b 1048576 -t 0x00 ${drive}
            if [ $? -ne 0 ]; then
                echo "badblocks failed verify during pattern validation on ${drive} - exiting."
            fi
        done
    fi
    # Configure a freshinstall and then grep for the background pattern latter (below)..
    if [ -e /DISABLED_no_badblocks_check ]; then
        mv /DISABLED_no_badblocks_check /no_badblocks_check
    else
        touch /no_badblocks_check
    fi
fi

# put down the backround pattern at the start of the disk
if [ -e /no_badblocks_check ]; then
    echo "Skipping badblocks check for begining of disk..."
else
    for drive in "${driveList[@]}"
    do
        echo "Write pattern (${backgroundPattern}) for 16MB at start of disk ${drive}"
        badblocks -swf -b 1048576 -t ${backgroundPattern} ${drive} 16 0
        if [ $? -ne 0 ]; then
            echo "badblocks failed verify during pattern validation on ${drive} - exiting."
        fi
    done
fi

# put down the backround pattern at the end of the disk
if [ -e /no_badblocks_check ]; then
    echo "Skipping badblocks check for end of disk..."
else
    for drive in "${driveList[@]}"
    do
        totalBlocks=$(hdparm -I ${drive} | grep "device size with M = 1024\*1024" | cut -d ":" -f 2 | awk '{print $1}')
        let firstBlock=${totalBlocks}-1
        echo "Write pattern (${backgroundPattern}) for 1MB at end of disk ($drive) from ${firstBlock} to ${totalBlocks}"
        badblocks -swf -b 1048576 -t ${backgroundPattern} ${drive} ${totalBlocks} ${firstBlock}
        if [ $? -ne 0 ]; then
            echo "badblocks failed verify during pattern validation on ${drive} - exiting."
        fi
    done
fi

# create the new disk partitions
if [ ! -e /just_do_badblocks_check ]; then
    echo "Creating disk partitions."
    partitionDisk.sh
    # make the kernel re-read the partition table
    # - sleep needed to prevent possible disk busy condition on sfdisk operation
    sleep 5
    echo "Existing mounts:"
    mount
    sleep 1
    echo
    for drive in "${driveList[@]}"
    do
        sfdisk -R ${drive}

        #Wait for dev nodes to get populated
        while sleep 2; do
            expectedPartitions=`parted -m $drive print | sed -n -e '/^[0-9]\+:/ s#\([0-9]\+\).*#'"$drive"'\1#p'`
            ls ${expectedPartitions[@]} >/dev/null 2>&1
            if [ $? -eq 0 ]; then break; fi     
            echo "waiting for "${expectedPartitions[@]}
        done
    done
    sleep 2
fi

# put down the backround pattern
if [ -e /no_badblocks_check ]; then
    echo "Skipping badblocks check and background pattern write!"
else
    echo "Write background pattern (${backgroundPattern}) and check for bad blocks:"
    if [ -e /just_do_badblocks_check ]; then
        echo "Configured to EXIT after badblocks operation."
        echo "...this may take several hours..."
        # check the whole disk in this case
        for drive in "${driveList[@]}"
        do
            badblocks -swf -b ${page_size} -t ${backgroundPattern} ${drive}
            if [ $? -ne 0 ]; then
                echo "Bad Block Check: FAILED on ${drive} - Exiting now."
                exit 1
            fi
        done

        echo "Bad Block Check: PASSED with pattern=${backgroundPattern}"
        echo "Exiting after sucessful pattern write and verify."
        exit 0
    else
         echo "Configured for full installation after badblocks operation."
         # only check the first three partitions on each drive here...
         devices=()
         for drive in "${driveList[@]}"
         do
             devices=( ${devices[@]} ${drive}1 ${drive}2 ${drive}3 )
         done
         for device in "${devices[@]}"
         do
             badblocks -swf -b ${page_size} -t ${backgroundPattern} ${device}
             if [ $? -ne 0 ]; then
                 echo "badblocks check failed on ${device} - Exiting now."
                 exit 1
             fi
         done
    fi
fi

if [ "${master_package_name}" == "apnc" ] || [ $DVC_DRIVE_COUNT -eq 1 ]; then

	# single drive system, only create rootfs raid
	mdadm --zero-superblock --force --verbose ${rootfsDisk1} > /dev/null
	mdadm --zero-superblock --force --verbose ${rootfsDisk2} > /dev/null
	sync
	mdadm --create ${rootfsDevice} --metadata=0.90 --verbose --raid-devices=2 --level=raid1 --run ${rootfsDisk1} missing
	mdadm --wait ${rootfsDevice}
	sleep 1

elif [ "${master_package_name}" == "ap2nc" ]; then

	# clear out any old md superblock data
	mds=( `mdArrays` )
	for md in "${mds[@]}"
	do
		arrayPartitions=( `mdElements $md` )
		for arrayPartition in "${arrayPartitions[@]}"
		do
			mdadm --zero-superblock --force --verbose ${arrayPartition} > /dev/null
		done
	done

	sync
	# Create rootfs RAID
	# Get first array element of rootfs
	rootfsElements=( `mdElements ${rootfsDevice##*/}` )
	mdadm --create ${rootfsDevice} --metadata=0.90 --verbose --raid-devices=2 --level=raid1 --run ${rootfsElements[0]} missing
	mdadm --wait ${rootfsDevice}
	sleep 1

	# Create the rest of the RAIDs
	for md in "${mds[@]}"
	do
		#Skip rootfs
		if [ "$md" = "${rootfsDevice##*/}" ]; then
			continue
		fi
		level=`raidLevel $md`
		arrayPartitions=( `mdElements $md` )
		mdadm --create /dev/${md} --metadata=1.0 --verbose --raid-devices="${#arrayPartitions[@]}" --level=$level ${arrayPartitions[@]}
		mdadm --wait /dev/${md}
	done
	sleep 1
fi

# create the swap partition
mkswap $swapDevice
if [ $? -ne 0 ]; then
    echo "mkswap failed - exiting."
    exit 1
fi

# format the rootfs raid mirror file system
mkfs.ext3 -b 4096 ${rootfsDevice} 
if [ $? -ne 0 ]; then
    echo "mkfs.ext3 failed - exiting."
    exit 1
fi

# format the temporary data volume for the file system image install
mkfs.ext4 -b ${page_size} -m 0 ${dataVolumeDevice}
#mkfs.xfs -f -b size=${page_size} ${disk}4

if [ $? -ne 0 ]; then
    echo "mkfs.ext4 failed - exiting."
    exit 1
fi

sync
sleep 2

# mount and configure the data volume
createDataVolume.sh

mkdir -p /CacheVolume
# make the datavolume cache directory visible on the rootfs device cache volume
mount --bind /DataVolume/cache /CacheVolume
if [ $? -ne 0 ]; then
    echo "mount failed - exiting."
    exit 1
fi
mkdir -p /CacheVolume/upgrade
sync
sleep 1

rm -rf ${dpkgAdminDir}/lock
rm -f ${dpkgAdminDir}/updates/*
# */

dpkg --admindir=${dpkgAdminDir} --force-depends -i ${upgradeFile}

echo "<<<<upgradeMountPath=${upgradeMountPath}>>>"
mount
mkdir -p ${upgradeMountPath}/usr/local/nas/upgrade
cp -vf /CacheVolume/upgrade/* ${upgradeMountPath}/usr/local/nas/upgrade
mkdir -p ${upgradeMountPath}/DataVolume/cache/upgrade
cp -vf /CacheVolume/upgrade/* ${upgradeMountPath}/DataVolume/cache/upgrade

first="0"
if [ ! -e /tmp/checksum_failed ]; then
	# save serial number of each installed drive into "/var/log/version.log"
	for drive in ${driveList[@]}; do
		serial_num=`hdparm -i $drive | grep Model | cut -d ',' -f 3 | cut -d '=' -f 2 | awk '{ print $1 }'`
		version=`cat ${upgradeMountPath}/etc/version`
		echo "${version} master-${drive}:serial_num=${serial_num}" >> ${upgradeMountPath}/var/log/version.log
		if [ "$first" == "0" ]; then
			echo -n "$serial_num" > ${upgradeMountPath}/var/log/master_drive_serial_number
			first="1"
		else
			echo -n ",$serial_num" >> ${upgradeMountPath}/var/log/master_drive_serial_number
		fi
    done
	
    # rootfs is left mounted by system-image DEBIAN postinst during a fresh-install
    # unmount rootfs and DataVolume
    umount ${upgradeMountPath}
    umount /CacheVolume
    umount /DataVolume
    
	if [ $DVC_DRIVE_COUNT -eq 1 ]; then
		# add the second partition to the raid mirror
		mdadm ${rootfsDevice} --add --verbose ${rootfsDisk2}
	else

		# add the rest of partitions to the rootfs raid mirror
		elemPath=()
		rootfsElements=( `mdElements ${rootfsDevice##*/}` )
		for element in "${rootfsElements[@]:1}"
		do
			elemPath=( ${elemPath[@]} ${element} )
		done
		sleep 2
		mdadm ${rootfsDevice} --add --verbose ${elemPath[@]}
		sleep 2
		mdadm --wait ${rootfsDevice}
		mdadm --grow --raid-devices=${#rootfsElements[@]} ${rootfsDevice}
	fi
	
    sleep 1
    echo
    echo "Please wait for raid RE-SYNC to complete.."
    sleep 1
    mdadm --wait ${rootfsDevice}
    sleep 1
    sync
    mdadm --detail ${rootfsDevice}
    echo "Done."
    mdadm --detail ${rootfsDevice} | grep State | grep clean
    result=$?
else
    # unmount rootfs and DataVolume
    umount ${upgradeMountPath}
    umount /CacheVolume
    umount /DataVolume
    error="ERROR: checksum failed - exiting."
    echo "$error"
    InstallFailure "$error"
fi

result=${result:-1}
if [ ${result} -eq 0 ]; then
    if [ -e /no_badblocks_check ]; then
        echo "DataVolume: Skipping bad blocks check and background pattern write!"
    else
        echo "DataVolume: Write background pattern (${backgroundPattern}) and check for bad blocks:"
        echo "...this may take several hours..."

        if [[ "$dataVolumeDevice" =~ "md" ]]; then
            # Stop data volume RAID
            mdadm --stop $dataVolumeDevice
            mdadm --wait $dataVolumeDevice
            # Get list of devices in 
            arrayPartitions=( `mdElements ${dataVolumeDevice##*/}` )
            for arrayPartition in "${arrayPartitions[@]}"
            do
                badblocks -swf -b 1048576 -t ${backgroundPattern} ${arrayPartition}
                if [ $? -ne 0 ]; then
		    error="Bad Block Check: FAILED on ${arrayPartition} - Exiting now."
		    echo "$error"
                    InstallFailure "$error"
                fi
            done

            # Recreate data volume RAID
            level=`raidLevel ${dataVolumeDevice##*/}`
            mdadm --create $dataVolumeDevice --metadata=1.0 --verbose --raid-devices="${#arrayPartitions[@]}" --level=$level ${arrayPartitions[@]}
            mdadm --wait $dataVolumeDevice
        else
            # Data volume is on disk partition
            badblocks -swf -b 1048576 -t ${backgroundPattern} ${dataVolumeDevice}
            if [ $? -ne 0 ]; then
                error="Bad Block Check: FAILED - Exiting now."
		echo "$error"
                InstallFailure "$error"
            fi
        fi
        echo "Bad Block Check: PASSED with pattern=${backgroundPattern}"
        if [ -e /just_do_badblocks_check ]; then
            echo "Exiting after sucessful pattern write and verify."
            exit 0
        fi
    fi

    # format the data volume file system
    mkfs.ext4 -b ${page_size} -m 0 $dataVolumeDevice
    if [ $? -ne 0 ]; then
	error="mkfs.ext4 failed - exiting."
	echo "$error"
        InstallFailure "$error"
    fi
    sync
    sleep 1

    # mount and configure the data volume, re-mount rootfs
    createDataVolume.sh
    echo "re-mount rootfs device ${rootfsDevice} on ${upgradeMountPath}"
    mount ${rootfsDevice} ${upgradeMountPath}
    sync
    sleep 1
    
    mkdir -p /CacheVolume/upgrade
    # make the datavolume cache directory visible on the rootfs device cache volume
    mount --bind /DataVolume/cache /CacheVolume
    if [ $? -ne 0 ]; then
        echo "mount failed - exiting."
        #exit 1
    fi

    ## workaround...
    cp -vf ${upgradeMountPath}/CacheVolume/upgrade/* ${upgradeMountPath}/usr/local/nas/upgrade
    #*/
    sync
    sleep 1

## Removed SmartWare installation on master ##
#    # define dpkg AdminDir for sw_nas_inst package and install
#    sw_nas_dpkgAdminDir=${upgradeMountPath}/var/lib/dpkg
#    echo "sw_nas_dpkgAdminDir=${sw_nas_dpkgAdminDir}"
#    mkdir -p ${sw_nas_dpkgAdminDir}/updates
#    mkdir -p ${sw_nas_dpkgAdminDir}/info
#    mkdir -p ${sw_nas_dpkgAdminDir}/parts
#    mkdir -p ${sw_nas_dpkgAdminDir}/alternatives
#    mkdir -p ${sw_nas_dpkgAdminDir}/triggers
#    if [ ! -e ${sw_nas_dpkgAdminDir}/status ]; then
#        touch ${sw_nas_dpkgAdminDir}/status
#    fi
#    if [ ! -e ${sw_nas_dpkgAdminDir}/available ]; then
#        touch ${sw_nas_dpkgAdminDir}/available
#    fi
#    chmod -R 777 ${sw_nas_dpkgAdminDir}
#
#    swUpgradeFile=`find /upgrade | grep sw-nas-inst`
#    if [ -f "${swUpgradeFile}" ]; then
#        echo "Software update file found, updating"
#        rm -rf ${sw_nas_dpkgAdminDir}/lock
#        rm -f ${sw_nas_dpkgAdminDir}/updates/*
#        # */
#        dpkg --root=${upgradeMountPath} -i ${swUpgradeFile}
#        if [ $? -ne 0 ]; then
#            error="sw-nas-inst failed - exiting."
#	    echo "$error"
#            InstallFailure "$error"
#        fi
#    fi
##

    sync
    sleep 1
    umount /DataVolume
fi

## ITR:60620 - Apollo-3G Installer failed to create master drive with E5
## Also remove verification check for SmartWare installation
#verify SmartWare installation
# sw_nas_status=$(dpkg --admindir=${sw_nas_dpkgAdminDir} -s sw-nas-inst | grep 'Status: install ok installed')
# if [ "$?" == "0" ]; then
#    echo "SmartWare installation ${sw_nas_status}"
# else
#    error="SmartWare installation failed"
#    echo "$error"
# fi
##

if [ ${result} -eq 0 ] && [ ! -e /tmp/checksum_failed ] && [ -e /no_badblocks_check ]; then
    # allow freshinstall if Smartware is missing (print warning)
    echo "------------------------------------------------"
    echo "PASSED : FRESH DISK IMAGE INSTALLATION : PASSED"
    [ -n "${error}" ] && echo "WARNING: $error"
    echo "------------------------------------------------"
    touch /FRESH_DISK_IMAGE_INSTALLATION_PASSED
    if [ -e /validate_pattern ]; then
        bp=${backgroundPattern}
        echo "Proceeding to run pattern search for 10 consecutive instances of ${backgroundPattern}"
        dd if=/dev/md0 bs=1M | od -tx1 -Ax | grep "$bp $bp $bp $bp $bp $bp $bp $bp $bp $bp"
        if [ $? -eq 1 ]; then
            echo "Pattern verification PASSED."
        else
            echo "Found some lines with a matching pattern - please inspect the output.."
        fi
    else
        echo "powering down now.."
        # ledCtrl.sh LED_EV_FRESH_INST LED_STAT_OK
        # halt turns off led 
        halt 2>&1
    fi
elif [ ${result} -eq 0 ] && [ ! -e /tmp/checksum_failed ]; then
    # fail masterinstall on any error condition
    [ -n "${error}" ] && InstallFailure "$error"
    echo "------------------------------------------------"
    echo "PASSED : MASTER DISK IMAGE INSTALLATION : PASSED"
    echo "------------------------------------------------"
    touch /MASTER_DISK_IMAGE_INSTALLATION_PASSED
    # ledCtrl.sh LED_EV_MASTER_INST LED_STAT_OK
    echo "powering down now.."
    # halt turns off led 
    halt 2>&1
else
    error="FAILED MASTER DISK IMAGE INSTALLATION"
    echo "$error"
    InstallFailure "$error"
fi

exit 0
