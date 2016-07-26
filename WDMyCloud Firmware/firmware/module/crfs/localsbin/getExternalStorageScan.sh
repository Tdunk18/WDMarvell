#!/bin/sh
# 2014 Alpha by Vodka
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

enable=`xmldbc -g storage_scan`

case "$enable" in
	0 )
		echo "0"
		;;
	1 )
		echo "1"
		;;
	*)
		echo "0"
		xmldbc -s storage_scan 0
		xmldbc -D /etc/NAS_CFG/config.xml
		access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/"
		;;
esac

