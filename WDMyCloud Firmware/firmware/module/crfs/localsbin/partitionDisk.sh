#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# partitionDisk.sh
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /etc/system.conf
. /etc/nas/config/wd-nas.conf 2>/dev/null

if [ $DVC_DRIVE_COUNT -gt 1 ]; then
	. /usr/local/sbin/data-volume-config_helper.sh
fi

. /usr/local/sbin/drive_helper.sh

# Apollo 3G parition layout:
#
# /dev/md0 -RFS
# 	/dev/${disk}1 - RFS (main)
#	/dev/${disk}2 - RFS (backup)
#/dev/${disk}3 - swap
#/dev/${disk}4 - /DataVolume (includes /var)
#

backgroundPattern="${backgroundPattern:-0}"

#
# this script assumes that all preparatory steps have already been taken!
#
declare -a driveList=( )
driveList=(`internalDrives`)
echo "driveList=${driveList[@]}"
numDrives="${#driveList[@]}"
numDrives=${numDrives:-"0"}
if [ "${numDrives}" -eq "0" ]; then
    driveList=( /dev/sda )
    numDrives="1"
    echo "0 drives found, assume 1 drive as /dev/sda"
fi

# clear any old partitioning data, etc.
for drive in "${driveList[@]}"
do
    partitions=(`ls $drive?`)
    for partition in "${partitions[@]}"
    do
        dd if=/dev/zero of=$partition bs=1M count=32
    done

    # use badblocks here to preseve any background pattern
    badblocks -swf -b 1048576 -t ${backgroundPattern} $drive 16 0
done
sync
sleep 2

if [ "${numDrives}" -eq "1" ]; then
    DVC_PARTED_CMDS=$DVC_PARTED_CMDS_ONE_DRIVE
else
    DVC_PARTED_CMDS=$DVC_PARTED_CMDS_TWO_DRIVE
fi

#parted mklabel msdos
# use a 'here document' to allow parted to understand the -1M
parted ${driveList[0]} --align optimal <<EOP
${DVC_PARTED_CMDS}
quit
EOP

sleep 5
sfdisk -R ${driveList[0]}

#Wait for dev nodes to get populated
while sleep 2; do
      expectedPartitions=`parted -m ${driveList[0]} print | sed -n -e '/^[0-9]\+:/ s#\([0-9]\+\).*#'"${driveList[0]}"'\1#p'`
      ls ${expectedPartitions[@]} >/dev/null 2>&1
      if [ $? -eq 0 ]; then break; fi     
      echo "waiting for "${expectedPartitions[@]}
done

# Copy same partition map on to other drive
if [ $DVC_DRIVE_COUNT -gt 1 ]; then
	for drive in "${driveList[@]:1}"
	do
		copyPartitionMap "${driveList[0]}" "$drive"
	done
fi

sync
sleep 1
for drive in "${driveList[@]}"
do
    parted $drive print
done


