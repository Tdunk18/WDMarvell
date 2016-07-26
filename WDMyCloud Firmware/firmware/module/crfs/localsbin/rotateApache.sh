#!/bin/bash
# rotateApache.sh 
#
# this script will upload the Apache access logs to 
# to the Log Analytics provider's hosted collector URL
# by invoking the appropriate uploader script

APACHE_LOG1=/var/log/apache2/access.log
APACHE_LOG2=/var/log/apache2/access.log.1
ARG1=$1
ROTATED_FILE=$2
APACHE_LOG_LIVE=${APACHE_LOG1} # default value

if [ ! -f ${APACHE_LOG1} ] && [ ! -f ${APACHE_LOG2} ]; then
	#echo "No apache log available!" >> /tmp/raj_debug.txt
	exit 0
fi

#echo "Got args ${ARG1} and ${ROTATED_FILE}" >> /tmp/raj_debug.txt

# check if we are called from rotatelogs or cron
# by checking the args list
UPLOAD_NOW=0
if [ $# -eq 2 ]; then
	# Upload the rotated file as it went past 200k in size
	APACHE_LOG_LIVE=${ROTATED_FILE}
	#echo "Uploading ${APACHE_LOG_LIVE} as size limit (200k) has reached" >> /tmp/raj_debug.txt
	UPLOAD_NOW=1
elif [ "$1" = "daily" ]; then
	# Invoked from crond or daily_log_upload.sh, upload log immediately
	lm_time1=0
	lm_time2=0
	
	[ -f ${APACHE_LOG1} ] && lm_time1=`stat -c %Y "${APACHE_LOG1}"`
	[ -f ${APACHE_LOG2} ] && lm_time2=`stat -c %Y "${APACHE_LOG2}"`
	
	APACHE_LOG_LIVE=${APACHE_LOG1}

	# Find the current apache access live log (toggles between
	# access.log and access.log.1)
	if [ ${lm_time2} -gt ${lm_time1} ]; then
		APACHE_LOG_LIVE=${APACHE_LOG2}
	fi
	
	# remove deprecated file from flash
	APACHE_LOG_LMTIME="/usr/local/config/access_lm.log"
	if [ -f ${APACHE_LOG_LMTIME} ]; then
		rm ${APACHE_LOG_LMTIME}
	fi

	UPLOAD_NOW=1
	#echo "Uploading ${APACHE_LOG_LIVE} as requested from crond" >> /tmp/raj_debug.txt
	APACHE_ACCESS_LOG_TMP=${APACHE_LOG_LIVE}.daily
	cp -f ${APACHE_LOG_LIVE} ${APACHE_ACCESS_LOG_TMP}
	# remove or move access.log to access.log.1 to prevent uploading duplicate logs
	# Desc:If APACHE_LOG_LIVE=access.log.1, the access.log is old and full.
	#      The restarted apache will be set to write log to access.log; 
	#      when the new log comes, it write the first record to access.log, 
	#      and then rotate and upload access.log.
	#      This makes the collector recevied some logs that are already submitted.
	#      To prevent this, always remove the access.log.
	if [ "$APACHE_LOG_LIVE" != "$APACHE_LOG1" ]; then
		mv -f ${APACHE_LOG1} ${APACHE_LOG_LIVE}
	else
		rm -f ${APACHE_LOG_LIVE}
	fi
	APACHE_LOG_LIVE=${APACHE_ACCESS_LOG_TMP}
	# Restart apache
	/usr/local/modules/script/apache restart web
elif [ $# -eq 1 ]; then
	# nothing needs to be done, first time an access log is being created
	#echo "Creating ${ARG1} first time" >> /tmp/raj_debug.txt
	UPLOAD_NOW=0
else
	#echo "Call rotateApache without argument!" >> /tmp/raj_debug.txt
	UPLOAD_NOW=0
fi

# Run the uploader script, if required
if [ ${UPLOAD_NOW} -eq 1 ]; then
	[ -f /usr/local/sbin/wdLogUploader.sh ] &&
		nohup nice -n 19 /usr/local/sbin/wdLogUploader.sh -f ${APACHE_LOG_LIVE} -t 1 -a 1 > /dev/null 2>&1 &
fi

