#!/bin/sh
DSK_INDEX=abcdefghijklmnopqrstuvwxyz
RAID_INDEX=123456789

umount_swap()
{
	swapoff /dev/md0
	mdadm -S /dev/md0
}

umount_hidden()
{
	dsknum=1
	# umount hidden partition
	echo "umount hidden partition"
	while [ $dsknum -le 26 ]
	do
		HIDDEN_PATH=/mnt/HD_`expr substr "$DSK_INDEX" "$dsknum" 1`4
		mount_disk=`mount | grep "$HIDDEN_PATH"`
		if [ -n "$mount_disk" ];then
			#echo "umount $HIDDEN_PATH"
			fuser -mk "$HIDDEN_PATH"
			umount $HIDDEN_PATH
			mount_disk=`mount | grep "$HIDDEN_PATH"`
			if [ -n "$mount_disk" ];then
				echo"@@@ run lazy umount"
				umount -l $HIDDEN_PATH
			fi
		fi
		dsknum=`expr $dsknum + 1`
	done
}

umount_iso_mount()
{
  for isoMount_path in `ls /mnt/isoMount`
  do
    mount_disk=`mount | grep "$isoMount_path"`
		if [ -n "$mount_disk" ];then
			echo "umount /mnt/isoMount/${isoMount_path}"
			fuser -mk "/mnt/isoMount/${isoMount_path}"
			umount /mnt/isoMount/${isoMount_path}
			mount_disk=`mount | grep "$isoMount_path"`
			if [ -n "$mount_disk" ];then
				echo"@@@ run lazy umount"
				umount -l /mnt/isoMount/${isoMount_path}
			fi
			updateWDDatabase -u /mnt/isoMount/${isoMount_path}
		fi
  done
}

umount_sata()
{
	echo "umount user disk partition"
	dsknum=1
	# umount disk partition
	while [ $dsknum -le 26 ]
	do
		DISK_PATH=/mnt/HD/HD_`expr substr "$DSK_INDEX" "$dsknum" 1`2
		mount_disk=`mount | grep "$DISK_PATH"`
		if [ -n "$mount_disk" ];then
			echo "umount $DISK_PATH"
			fuser -mk "$mount_disk"
			umount $DISK_PATH
			mount_disk=`mount | grep "$DISK_PATH"`
			if [ -n "$mount_disk" ];then
				echo"@@@ run lazy umount"
				umount -l $DISK_PATH
			fi
			updateWDDatabase -u $DISK_PATH
		fi
		dsknum=`expr $dsknum + 1`
	done
}

stop_raid()
{
	echo "stop raid"
	dsknum=9
	# STOP raid
	while [ $dsknum -gt 0 ]
	do
		raid_dev=md`expr substr "$RAID_INDEX" "$dsknum" 1`
		search_raid=$(cat /proc/mdstat | grep -r "$raid_dev")
		if  [ -n "$search_raid" ];then
			echo "stop raid $raid_dev"
			cryptsetup luksClose $raid_dev 2>/dev/null
			mdadm -S /dev/$raid_dev
		fi
		dsknum=`expr $dsknum - 1`
	done
}

stop_encryption()
{
	# STOP raid encryption
	dsknum=9
	while [ $dsknum -gt 0 ]
	do
		raid_dev=md`expr substr "$RAID_INDEX" "$dsknum" 1`
		cryptsetup luksClose $raid_dev 2>/dev/null
		dsknum=`expr $dsknum - 1`
	done
	
	# STOP standard encryption
	dsknum=1
	while [ $dsknum -le 26 ]
	do
		dev=sd`expr substr "$DSK_INDEX" "$dsknum" 1`2
		cryptsetup luksClose $dev 2>/dev/null
		dsknum=`expr $dsknum + 1`
	done
}

umount_usb()
{
	echo "umount usb dev"
	find /mnt/USB/ -name 'USB'\* |
	while IFS=: read usb_disk
	do
		mount_disk=`mount | grep "$usb_disk"`
		if [ "$usb_disk" != "/mnt/USB/" ];then
			if [ -n "$mount_disk" ];then
				fuser -mk "$usb_disk"
				umount $usb_disk 2>/dev/null
				mount_disk=`mount | grep "$usb_disk"`
				if [ -n "$mount_disk" ];then
					echo "@@ usb run lazy umount"
					umount -l $usb_disk 2>/dev/null
				fi
			fi
		fi
	done
}

case $1 in
	swap)
	umount_swap
	;;
	
	usb)
	usbumount all
	;;
	
	hidden)
	umount_hidden
	;;
	
	sata)
	umount_swap
	umount_hidden
	umount_iso_mount
	umount_sata
	sqlite3 /usr/local/nas/orion/orion.db "delete from volumes where mount_path like '%/mnt/HD/HD_%'" > /dev/null
	stop_encryption
	stop_raid
	;;
	
	all)
	diskmgr -p
	;;
esac
