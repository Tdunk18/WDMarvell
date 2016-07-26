#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script converts an md from RAID 1 to Linear

#Assumptions:
##File system is unmounted
##md is running

#Inputs:
#Path to md device:  /dev/mdX

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

##Verify currently configured as RAID1
raidType=`userDataRAIDType`
if [ "$raidType" != "RAID1" ]; then
    logger  -p local2.notice "$0: Expected RAID type RAID1 got \"$raidType\""
    exit 1
fi

##Verify file system is not mounted.
mount | grep ^$md
if [ $? -eq 0 ]; then
    logger  -p local2.notice "$0: Error file system mounted on $md"
    exit 1
fi

#Get list of raid elements
elms=( `arrayElements $deviceName` )
if [ "${elms[0]}" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get array element list"
    exit 1
fi

#Require two partitions to be present for conversion.
if [ "${#elms[@]}" -ne "$DVC_DRIVE_COUNT" ]; then
    logger  -p local2.notice "$0: Expected $DVC_DRIVE_COUNT but found ${#elms[@]} drives" 
    exit 1
fi

#Find good partition to start linear with.
#RAID1 might be rebuilding so be careful to get synced array element.
#NOTE:  It's tempting to use [U_] from /proc/mdstat, but it doesn't seem to be
#a simple correlation to sda4[X] where X would be position in [U_].
cmd="mdadm --detail $md"
mdadmDetail=`$cmd`
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"
    exit 1
else

    #Find good partition
    #mdadm --detail /dev/md1
    #     Number   Major   Minor   RaidDevice State
    #        0       8        4        0      active sync   /dev/sda4
    #        2       8       20        1      spare rebuilding   /dev/sdb4
    syncedPartitionList=( `echo "$mdadmDetail" | sed -n -e '/^[ ]*Number/,$ s/.*active sync[ ]*\(\/dev\/.*\)/\1/p'` )
fi

if [ -z ${syncedPartitionList[0]} ]; then
    logger  -p local2.notice "$0: No synced RAID partitions found"    
    exit 1
fi

sync

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

#Recreate md as linear using good partition as first partition
cmd="mdadm --create  $md --verbose --level=linear --force --raid-devices=1 --run ${syncedPartitionList[0]} --metadata=1.0"
stdOut=`$cmd`
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"
    exit 1
fi

#Add rest of partitions to mirror
for devicePath in "${elms[@]}"
do
    if [[ $devicePath = ${syncedPartitionList[0]} ]]; then
        #Don't add already present partition
        continue
    fi

    cmd="mdadm $md --verbose --grow --add  $devicePath"
    stdOut=`$cmd`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: $cmd returned $result"
        exit 1
    fi
done

#Wait for complete
mdadm --wait $md
sleep 1

#resize array
#resize2fs -f $md
cmd="resize2fs -fp $md >>$raidConversionProgressFile"
resize2fs -fp $md >>$raidConversionProgressFile
result=$?
if [ $result -ne 0 ]; then
    logger  -p local2.notice "$0: $cmd returned $result"
    exit 1
fi

exit 0

 