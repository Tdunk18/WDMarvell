#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This dog script prints how much has to be deleted to convert from Linear to RAID 1

. /usr/local/sbin/data-volume-config_helper.sh

md=`userDataMD`
if [ "$md" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get MD"
    exit 1
fi

raidType=`userDataRAIDType`
if [ "${raidType}" == "UNKNOWN" ]; then
    logger  -p local2.notice "$0: Failed to get RAID type"
    exit 1
fi
#If already RAID1, nothing to delete
if [ "${raidType}" == "RAID1" ]; then
    echo "0"
    exit 0
fi

#Get file system block size
fileSystemBlockSize=`fsBlockSize $md`
if [ "$fileSystemBlockSize" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get block size"
    exit 1
fi

fsMinSize=`minimumFileSystemInFSBlocks $md`
if [ "$fsMinSize" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get minimum file system size"
    exit 1
fi

spaceForFileSystem=`raid1FileSystemSizeInFSBlocks $md`
if [ "$spaceForFileSystem" = "ERROR" ]; then
    logger  -p local2.notice "$0: Failed to get space required for file system"
    exit 1
fi

deleteAmount=`expr $fsMinSize - $spaceForFileSystem`

#Print number of megabytes to remove
if [ "$deleteAmount" -ge "0" ]; then
    #Convert to MB
    deleteAmount=`expr $deleteAmount \* $fileSystemBlockSize`
    deleteAmount=`expr $deleteAmount / 1000000`
    #Add one for integer truncation
    deleteAmount=`expr $deleteAmount + 1`
    echo $deleteAmount
else
    echo "0"
fi

exit 0
