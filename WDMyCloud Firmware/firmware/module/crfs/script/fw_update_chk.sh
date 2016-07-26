#!/bin/sh

# [+] For Auto clear RecycleBin function
CHK_FLG=`xmldbc -g /system_mgr/crond/list/name:6`
if [ -z "$CHK_FLG" ] ; then
	xmldbc -s /system_mgr/crond/list/name:6 "recycle_bin_clear"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/count "1"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/method "3"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/1 "0"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/2 "0"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/3 "*"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/4 "*"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/5 "*"
	xmldbc -s /system_mgr/crond/recycle_bin_clear/item:1/run 'auto_clear_recycle_bin.sh &'
	
	xmldbc -s /recycle_bin/auto_clear "0"
	xmldbc -s /recycle_bin/day "30"
	write_config=1
	
fi
# [-] For Auto clear RecycleBin function

data_format=`xmldbc -g /system_mgr/time/date_format`
if [ -z "$data_format" ]; then
  xmldbc -s "/system_mgr/time/date_format" "YYYY-MM-DD"
  write_config=1
fi

time_format=`xmldbc -g /system_mgr/time/time_format`
if [ -z "$time_format" ]; then
  xmldbc -s "/system_mgr/time/time_format" "12"
  write_config=1
fi

if [ "$write_config" = 1 ]; then
  xmldbc -D /etc/NAS_CFG/config.xml
	access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/"
	sync
fi

