#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#

#This script monitors and sends alerts on failed user data arrays.
#An attempt will be made to resync failed RAID1 elements

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/system.conf
. /usr/local/sbin/data-volume-config_helper.sh
. /etc/nas/alert-param.sh

#Prints list of SATA connectors with failed elements
#An attempt will be made to re-sync failed mirror elements
checkAndReinsertRAID1() {
    local md
    local faultyDisk
    local elements=()
    local listSATAConnectorsWithFailedElems=()
    local mdadmStdIO
    local uniqueSATAConnectorsWithFailedElems=()
    local twoArrays=()
    local cmd
    local stdout
    local result

    md=$1

    #Remove any faulty 
	faultyDisk=`mdadm --detail "/dev/${md}" | sed -n -e '/faulty/s#\(.*\)\(/dev/.*\)#\2#p'`
    if [ -n "$faultyDisk" ]; then
        logger  -p local2.notice "$0: removing faulty disk ${faultyDisk} from /dev/${md}"
        mdadm /dev/${md} --remove ${faultyDisk} > /dev/null 2>&1
    fi

    #Get missing drives and expected partitions
    twoArrays=( `missingDrivesExpectedPartitions $md` )
    #No drive detected on connector
    listSATAConnectorsWithFailedElems=( `parseMissingDrivesExpectedPartitions MISSING_DRIVES_ON_SATA_CONNECTORS ${twoArrays[@]}` )
    if [ ${#listSATAConnectorsWithFailedElems[@]} -ne 0 ]; then
        logger  -p local2.notice "$0: checkAndReinsertRAID1: Missing drive :${listSATAConnectorsWithFailedElems[@]}:"        
    fi
    #Drive found so make list of element to test for presents in md
    elements=( `parseMissingDrivesExpectedPartitions EXPECTED_PARTITIONS_ON_PRESENT_DRIVES ${twoArrays[@]}` )
    
    #Collect present devices
    mdadmStdIO=`mdadm --detail "/dev/${md}"`

    #Go through list of partitions on present drives and try to re-sync if missing from md
    for elem in "${elements[@]}"
    do
        echo "$mdadmStdIO" | grep "${elem}" >/dev/null 2>&1
        if [ $? -ne 0 ]; then
            #Try and re-sync missing
            cmd="mdadm /dev/${md} --add ${elem}"
            stdout=`$cmd 2>&1`
            result=$?
            logger  -p local2.notice "$0: Re-inserting: $cmd returned $result with $stdout"
            if [ $result -ne 0 ];then
                #Re-sync attempt failed
                sataLoc=`SATALocation ${elem%%[0-9]}`
                if [ -n $sataLoc ]; then
                    listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $sataLoc )
                fi
            fi
        fi
    done

    #Remove duplicates
    uniqueSATAConnectorsWithFailedElems=( `uniqueStringArray ${listSATAConnectorsWithFailedElems[@]}` )
    #Print list of SATA connectors with failed elements
    echo ${uniqueSATAConnectorsWithFailedElems[@]}
}

#Get user data RAID type.
md=`userDataMD`
raidType=`userDataRAIDType`

#It is possible that the periodic monitor could start while the @reboot one is
#running.  Don't allow two to be running at the same time.
if [ -f /tmp/monitorUserRaidInProgress ]; then
    logger  -p local2.notice "$0: RAID monitor already in progress"        
    exit 0
fi

#Mark monitor in progress to prevent conversion/RAID stopping for a moment
touch /tmp/monitorUserRaidInProgress >/dev/null 2>&1

#Check to see if conversion is in progress
if [ -f /tmp/raidConversionInProgresss ]; then
    logger  -p local2.notice "$0: Skipping user RAID monitor conversion in progress"        
    rm /tmp/monitorUserRaidInProgress >/dev/null 2>&1
    exit 0
fi

listSATAConnectorsWithFailedElems=()
if [ "$raidType" = "RAID1" ]; then
    #RAID1:  Check and re-sync broken RAID if possible
    listSATAConnectorsWithFailedElems=( `checkAndReinsertRAID1 "${md}"` )
else
    #LINEAR or UNKNOWN
    #NOTE:  If element of LINEAR fails, LINEAR will not start on reboot and will
    #be of UNKNOWN type

    #LINEAR has no good indication of failure.  If element superblocks are
    #un-readable, report as bad drive.

    #Get missing drives and expected partitions
    twoArrays=( `missingDrivesExpectedPartitions $md` )
    #No drive detected on connector
    listSATAConnectorsWithFailedElems=( `parseMissingDrivesExpectedPartitions MISSING_DRIVES_ON_SATA_CONNECTORS ${twoArrays[@]}` )
    if [ ${#listSATAConnectorsWithFailedElems[@]} -ne 0 ]; then
        logger  -p local2.notice "$0: Missing drive :${listSATAConnectorsWithFailedElems[@]}:"        
    fi

    #Drive found so make list of super blocks to test
    elements=( `parseMissingDrivesExpectedPartitions EXPECTED_PARTITIONS_ON_PRESENT_DRIVES ${twoArrays[@]}` )

    #Test super blocks
    listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $(testSuperBlocks ${elements[@]}) )
fi

#Map to labeled location
labelsOfFailedDrives=()
for sataLoc in "${listSATAConnectorsWithFailedElems[@]}"
do
    label=`cabinetLabel $sataLoc`
    labelsOfFailedDrives=( ${labelsOfFailedDrives[@]} $label )
done

#Remove duplicate drives
uniqueLabelsOfFailedDrives=( `uniqueStringArray ${labelsOfFailedDrives[@]}` )

#Throttle alerts:  Only send drive failed alert once per power on
for label in "${uniqueLabelsOfFailedDrives[@]}"
do
    if [ ! -f /tmp/drive_fail ]; then
        sendAlert.sh "${FAILED_DRIVE}" $label
        if [ "$raidType" = "RAID1" ]; then
            echo -n "degraded" >/tmp/drive_fail
            ledCtrl.sh LED_EV_DEGRADED_MIR LED_STAT_ERR
        else
            echo -n "bad" >/tmp/drive_fail
            ledCtrl.sh LED_EV_RAID_CFG LED_STAT_ERR
        fi
        logger  -p local2.notice "$0: Sent ALERT ${FAILED_DRIVE} $label"

        #indicate that an event has occured on RAID
        incUpdateCount.pm "raid" >/dev/null 2>&1
    fi
done

#If no user data array partition is bad,
if [ ${#uniqueLabelsOfFailedDrives[@]} -eq 0 ]; then
    #If a user data array partition was bad in past,
    if [ -f /tmp/drive_fail ]; then
        rm -f /tmp/drive_fail
        #Regardless which less than 'good' state that was recovered from, mark them both OK
        ledCtrl.sh LED_EV_DEGRADED_MIR LED_STAT_OK
        ledCtrl.sh LED_EV_RAID_CFG LED_STAT_OK

        #Since we already tried to repair RAID1 before marking it bad and linear has
        #no way to repair, logging this mostly to see if it ever occurs
        logger local2.notice "$0: Unexpected RAID repaired after indicating failure"

        #indicate that an event has occured on RAID
        incUpdateCount.pm "raid" >/dev/null 2>&1
    fi
fi

#Check and fix up swap MD RAID1 if need be.
listSATAConnectorsWithFailedElems=( `checkAndReinsertRAID1 "${swapDevice##*/}"` )

if [ ${#listSATAConnectorsWithFailedElems[@]} -gt 0 ]; then
    logger  -p local2.notice "$0: SWAP RAID partition on ${listSATAConnectorsWithFailedElems[@]} has failed"        
fi

#Clean up exclusion flag
rm /tmp/monitorUserRaidInProgress >/dev/null 2>&1

exit 0
