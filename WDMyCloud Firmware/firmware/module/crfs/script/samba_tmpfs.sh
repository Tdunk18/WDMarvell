#!/bin/sh
TMPFS_SIZE=32

case $1 in
	1)
		tmpfs=$(grep -r /tmp/samba /etc/mtab)
		if [ -z "$tmpfs" ];then
			mount -t tmpfs none /tmp/samba -o size="$TMPFS_SIZE"m
		fi
		;;
	
	0)
		tmpfs=$(grep -r /tmp/samba /etc/mtab)
		if [ -n "$tmpfs" ];then
		umount /tmp/samba
		fi
		;;
	
	*)
		ads=`xmldbc -g '/system_mgr/samba/ads_enable'`
		echo "ads=$ads"
		if [ "$ads" == "1" ]; then
			tmpfs=$(grep -r /tmp/samba /etc/mtab)
			if [ -z "$tmpfs" ];then
				mount -t tmpfs none /tmp/samba -o size="$TMPFS_SIZE"m
			fi
		else
			tmpfs=$(grep -r /tmp/samba /etc/mtab)
			if [ -n "$tmpfs" ];then
				umount /tmp/samba
			fi
		fi
		;;
esac
