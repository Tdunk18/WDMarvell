#!/bin/bash
#
# Communication Manager Watchdog script
#
# Command-line switches
#	--help       Usage information
#	<check_interval>   Watchdog check interval in seconds
#

CM_CTRL_SCRIPT_PATH="/usr/local/orion/communicationmanager/communicationmanagerd"
# Check orion_cm_enabled file for the remote access enabled/disabled state
# may wake up the drive so don't check the file.
CHECK_STATE_FILE=0
# Do not log restarts
LOG_RESTART=0
RESTART_LOG_URL="http://12.204.100.158:41789/cgi-bin/watchdog.pl?"

# Default check interval is 5 mins
CHECK_INTERVAL=300

if [ -f /var/www/Admin/webapp/config/globalconfig.ini ]; then
	# MyBookLive
	ENABLE_STATE_FILE="/CacheVolume/.orion/orion_cm_enabled"
	dyn_tmp=`grep ^DYNAMIC_CONFIG_TMP /var/www/Admin/webapp/config/globalconfig.ini | cut -d'=' -f 2 | cut -d'"' -f 2`
	if [ -f $dyn_tmp ]; then
		DYNAMIC_CONFIG_TMP=$dyn_tmp
	else
		DYNAMIC_CONFIG_TMP="/var/www/Admin/webapp/config/dynamicconfig.ini"
	fi
else
	# Products that are NOT MyBookLive
	ENABLE_STATE_FILE="/CacheVolume/orion_cm_enabled"
	dyn_tmp=`grep ^DYNAMIC_CONFIG_TMP /var/www/rest-api/config/globalconfig.ini | cut -d'=' -f 2 | cut -d'"' -f 2`
	if [ -f $dyn_tmp ]; then
		DYNAMIC_CONFIG_TMP=$dyn_tmp
	else
		DYNAMIC_CONFIG_TMP="/var/www/rest-api/config/dynamicconfig.ini"
	fi
fi
echo "DYNAMIC_CONFIG_TMP = $DYNAMIC_CONFIG_TMP"

usage()
{
	echo "Usage: $0 [--help] [check_interval_in_secs]"
	return 0
}

# If a watchdog script is already running, then exit.
# On some platforms, "-x" is not supported.
# First try pidof without "-x".  Expect that current process
# is listed so if it isn't, then try pidof with "-x".
CM_WD_PROC=`pidof comm_mgr_wd.sh`
retstat=$?
if [ $retstat -ne 0 ]; then
	CM_WD_PROC=`pidof -x comm_mgr_wd.sh`
	retstat=$?
fi
if [ $retstat -eq 0 ]; then
	for runpid in $CM_WD_PROC; do
		if [ "$runpid" != "$$" ]; then
			echo "`date` - comm_mgr_wd.sh : Process is already running with PID $runpid"
			exit 1
		fi
	done
fi

# If the control script does not exist, then exit
if [ ! -x $CM_CTRL_SCRIPT_PATH ]; then
	exit 75
fi

if [ $# -gt 0 ]; then
	if [ "$1" = "--help" ] || [ "$1" = "-help" ] || [ "$1" = "-h" ]; then
		usage
		exit 0
	fi
	CHECK_INTERVAL=$1
fi


while true; do
	cmgr_pid=`pidof communicationmanager`
	getpid_status=$?
	if [ $getpid_status -ne 0 ]; then
		# Communication manager process not running, start it if it's enabled
		if [ $CHECK_STATE_FILE -ne 0 ]; then
			if [ -f "$ENABLE_STATE_FILE" ]; then
				ENABLED=`cat $ENABLE_STATE_FILE`
			else
				ENABLED="0"
			fi
		else
			ENABLED="1"
		fi
		if [ "$ENABLED" = "1" ]; then
			if [ $LOG_RESTART -ne 0 ]; then
				if [ -f $DYNAMIC_CONFIG_TMP ]; then
					log_url_parms=`grep -e DEVICEID -e COMMUNICATION_STATUS $DYNAMIC_CONFIG_TMP | tr "\n" "&" | sed -e 's/ *= */=/g' | sed -e 's/"//g' -e 's/DEVICEID/deviceid/' -e 's/COMMUNICATION_STATUS/status/' -e 's/&/\\&/g' | sed -e 's/\\&$//'`
				else
					log_url_parms="deviceid=NOT_AVAIL"
				fi
				echo "Curl command: curl --connect-timeout 30 --max-time 60 `echo -n ${RESTART_LOG_URL}${log_url_parms}`"
				curl --connect-timeout 30 --max-time 60 `echo -n ${RESTART_LOG_URL}${log_url_parms}` > /dev/null 2> /dev/null
			fi
			$CM_CTRL_SCRIPT_PATH -nowdstart
			touch /CacheVolume/orion_wd_restart
		fi
	fi
	sleep $CHECK_INTERVAL
done

exit 0
