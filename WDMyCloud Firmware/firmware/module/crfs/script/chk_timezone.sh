#!/bin/sh

DBG=1

DPRINTF()
{
	if [ "$DBG" = 1 ];then
		echo "$1" >> /tmp/dbg_timezone
	fi
}

case $1 in
	system_ready)
		#call by system_daemon
		if [ -e /tmp/new_tzmap.table ];then
			DPRINTF "copy tzmap.table to /usr/local/config/"
			access_mtd "cp /tmp/new_tzmap.table /usr/local/config/tzmap.table"
		fi
		;;
	
	old_to_new)
		#call by chk_fw_ver
		DPRINTF "timezone f1 -> f2"
		SetTimeZone -t
		SetTimeZone --dump > /tmp/new_tzmap.table
		;;
	
	firmware_upgrade)
		#call by chk_fw_ver
		DPRINTF "timezone f2 -> f3"
		access_mtd "cp /usr/local/config/tzmap.table /tmp"
		SetTimeZone -t
		SetTimeZone --dump > /tmp/new_tzmap.table
		;;
	
	firmware_downgrade)
		#call by upload_firmware
		if [ ! -e /tmp/old_timezone_firmware ];then
			DPRINTF "timezone downgrade to f1"
			touch /tmp/old_timezone_firmware
			access_mtd "rm /usr/local/config/tzmap.table"
			SetTimeZone --olddef -t
			xmldbc -D /etc/NAS_CFG/config.xml
			access_mtd "cp /etc/NAS_CFG/config.xml /usr/local/config"
		fi
		;;
	
	flash_error)
		#call by mtd_check
		DPRINTF "flash error , dump Timezone Table"
		SetTimeZone --dump > /tmp/tzmap.table
		access_mtd "mv /tmp/tzmap.table /usr/local/config"
		;;
	
	lose_file)
		#call by mtd_check
		DPRINTF "lose file , dump Timezone Table"
		SetTimeZone --dump > /tmp/tzmap.table
		access_mtd "mv /tmp/tzmap.table /usr/local/config"
		;;
		
	load_default)
		#call by load_default
		DPRINTF "dump default timezone table"
		SetTimeZone --dump > /tmp/tzmap.table
		mv /tmp/tzmap.table /usr/local/config
		;;
	
	help)
		echo "chk_timezone.sh system_ready"
		echo "chk_timezone.sh old_to_new"
		echo "chk_timezone.sh firmware_upgrade"
		echo "chk_timezone.sh firmware_downgrade"
		echo "chk_timezone.sh flash_error"
		echo "chk_timezone.sh lose_file"
		echo "chk_timezone.sh load_default"
		;;
esac
