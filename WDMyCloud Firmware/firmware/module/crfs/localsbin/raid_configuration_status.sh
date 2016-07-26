#!/bin/sh

SOCK_FILE=/var/run/xmldb_sock_sysinfo

SOCK_FILE_RAID_INIT=/var/run/xmldb_sock_raid_init
PID_FILE_RAID_INIT=${SOCK_FILE_RAID_INIT}_config.pid

if [ ! -f ${PID_FILE_RAID_INIT} ] ; then
	echo "idle"
	exit 0
fi

STAGE=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /stage`
STATUS=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /status`
if [ -z "${STAGE}" ] ; then
	echo "idle"
	exit 0
fi

case ${STAGE} in
	"complete")
		echo "${STAGE} ${STATUS}"
		;;
	"preparing" | "configuring")
		START_TIME=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /start_time`
		NOW=`date +%s`
		TIME=`expr ${NOW} - ${START_TIME}`
		PERCENT=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /percent`
		echo "${STAGE} ${STATUS} ${PERCENT}% ${TIME}"
		;;
esac
