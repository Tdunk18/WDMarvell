#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script converts an md from Linear to RAID 1 

#Assumptions:
##The file system is unmounted
##md linear is running
##

#Inputs:
#Full path to md device:  /dev/mdX

#Outputs:
##Return non zero on error

. /usr/local/sbin/data-volume-config_helper.sh
. /etc/nas/config/data-volume-config.conf 2>/dev/null
. /etc/system.conf

#Parse inputs
while getopts ":d:" opt; do
    case $opt in
        d ) md=$OPTARG ;;
        ? ) logger  -p local2.notice "$0: invalid option"
            exit 1 ;;
    esac
done

shift $(($OPTIND - 1))

if [ -z "$md" ]; then
    logger  -p local2.notice "$0: Need to specify full path to md device ex. $0 -d /dev/mdX"
    exit 1
fi

#Verify assumptions:
##Verify md is up and running
deviceName=`basename $md`
cat /proc/mdstat | grep ^$deviceName
if [ $? -ne 0 ]; then
    logger  -p local2.notice "$0: $md is not up and running"
    exit 1
fi

##Verify currently configured as linear
raidType=`userDataRAIDType`
if [ "$raidType" != "LINEAR" ]; then
    logger  -p local2.notice "$0: Expected RAID type LINEAR got \"$raidType\""
    exit 1
fi

##Verify file system is not mounted.
mount | grep ^$md
if [ $? -eq 0 ]; then
    logger  -p local2.notice "$0: Error file system mounted on $md"
    exit 1
fi

#Get list of raid elements
partitionList=( `arrayElements $deviceName` )
if [ "${partitionList[0]}" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get array element list"
    exit 1
fi

#Require two partitions to be present for conversion.
if [ "${#partitionList[@]}" -ne "$DVC_DRIVE_COUNT" ]; then
    logger  -p local2.notice "$0: Expected $DVC_DRIVE_COUNT but found ${#partitionList[@]} drives" 
    exit 1
fi

#NOTE:  Blocks returned from commands are not all equal in size
#cat /sys/block/sdb/sdb4/size reports in 512 byte blocks
#mdadm --detail /dev/md1 reports in 1024 byte blocks 
#cat /proc/mdstat reports in 1024 byte blocks 
#resize2fs -P returns number of file system blocks blocks.

spaceForFileSystem=`raid1FileSystemSizeInFSBlocks $deviceName`
if [ "$spaceForFileSystem" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get space required for file system"
    exit 1
fi

#Wait for RAID to finish any work it might be doing.
mdadm --wait $md
sync

#Resize file system to fit on first partition in array
cmd="resize2fs -fp $md $spaceForFileSystem >>$raidConversionProgressFile"
resize2fs -fp $md $spaceForFileSystem >>$raidConversionProgressFile
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"
    exit 1
fi

sync

#Capture first partition of RAID.(It now contains entire file system)
firstPart=`cat /proc/mdstat | sed -n -e "/^${deviceName} :/,/^[ \t]*$/ s/.* \(.*\)\[0\].*/\1/p"`
firstPart="/dev/$firstPart"

#Stop md
cmd="mdadm --stop $md"
stdOut=`$cmd`
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"

    #Figure out what process is using md
    cmd="fuser -m $md"
    stdOut=( `$cmd` )
    logger -s -p local2.notice  "$0: ${stdOut[@]}"

    for process in "${stdOut[@]}"
    do
        logger -s -p local2.notice  "task: $(ps  -auxw | grep $process)"
    done

    exit 1
fi

sleep 2

#Recreate md as mirror with first partition from linear
cmd="mdadm --create $md --verbose --level=mirror --raid-devices="${#partitionList[*]}" --run $firstPart missing --metadata=1.0"
stdOut=`$cmd`
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"
    exit 1
fi

#Add rest of partitions to mirror
for devicePath in "${partitionList[@]}"
do
    if [[ $devicePath = $firstPart ]]; then
        continue
    fi

    cmd="mdadm $md --add --verbose $devicePath"
    stdOut=`$cmd`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: $cmd returned $result"
        exit 1
    fi
done

exit 0

