#!/bin/sh
/usr/local/sbin/cleanAlert.sh&
access_mtd "cp -rf /CacheVolume /usr/local/config/.&"
# update disk healthy
killall -SIGUSR2 sysinfod
