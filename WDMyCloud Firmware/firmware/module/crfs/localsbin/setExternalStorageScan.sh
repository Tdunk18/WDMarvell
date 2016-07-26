#!/bin/sh

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

if [ $# -lt 0 ]; then
        echo "usage: setStorageScan.sh <0/1>"
        exit 1
fi

case "$1" in
        0 )
			    xmldbc -s storage_scan 0
			    ;;
        1 )
				xmldbc -s storage_scan 1
                ;;
        * )
                echo "usage: setStorageScan.sh <0/1>"
                ;;
esac

xmldbc -D /etc/NAS_CFG/config.xml
access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/"
