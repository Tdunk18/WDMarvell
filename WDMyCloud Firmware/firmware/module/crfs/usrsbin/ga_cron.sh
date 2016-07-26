#!/bin/bash
SEC_6DAY=518400
SEC_1DAY=86400

quarter_backup(){
	local memory_file="/var/log/GAnalytics.xml"
	local flash_file="/usr/local/config/GAnalytics.xml-backup"
	local diff_res="1"

	diff -q ${memory_file} ${flash_file} > /dev/null
	diff_res="${?}"

	if [ "${diff_res}" != "0" ]; then
		access_mtd "cp -f ${memory_file} ${flash_file}"
	fi
	# echo "save to FALSH"
}

daily_backup(){
	if [ ! -e /usr/local/config/ga_default_flag ]; then
		/usr/sbin/ganalytics --send-default
	fi
	
	local newest_file="/var/log/GAnalytics.xml"
	#local newest_time=`/usr/sbin/ganalytics --get-ctime ${newest_file}`
	local newest_time=`date +%s`
	local oldest_file=`/usr/sbin/ganalytics --get-oldest-xml`
	local oldest_time=`/usr/sbin/ganalytics --get-oldest-time`	

	if [ ! -e /usr/local/config/ganalytics ]; then
		mkdir -p /usr/local/config/ganalytics
	fi

	media_analytics.sh > /dev/null
	/usr/sbin/ganalytics --fw-version
	
	access_mtd "mv -f ${newest_file} ${oldest_file}"
	
	[ "${oldest_time}" = "" ] && exit 0

	local diff_time=`expr ${newest_time} - ${oldest_time}`
	
	if [ ${diff_time} -gt ${SEC_6DAY} ]; then
		ping -W 1 -c 2 www.google-analytics.com > /dev/null
		if [ "$?" == "0" ]; then
			/usr/sbin/ganalytics --send-7day
		fi
	fi

}

now_backup(){
	local memory_file="/var/log/GAnalytics.xml"
	local flash_file="/usr/local/config/GAnalytics.xml-backup"
	local diff_res="1"

	access_mtd "cp -f ${memory_file} ${flash_file}"
}

recovery_backup(){
	local memory_file="/var/log/GAnalytics.xml"
	local flash_file="/usr/local/config/GAnalytics.xml-backup"
	local diff_res="1"

	access_mtd "cp -f ${flash_file} ${memory_file}"
}


TYPE=${1}


ANL_ENABLED=`xmldbc -g /analytics`
if [ "${ANL_ENABLED}" = "0" ]; then
	exit 0
fi


if [ "$TYPE" = "quarter" ]; then
	quarter_backup
elif [ "$TYPE" = "daily" ]; then
	daily_backup
elif [ "$TYPE" = "now" ]; then
	now_backup
elif [ "$TYPE" = "recovery" ]; then
	recovery_backup
else
	echo "unknown type"
fi
