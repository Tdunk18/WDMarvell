#!/bin/sh

SIGNAL=WINCH
if [ "$1" = "full" ] ; then
	SIGNAL=USR1
elif [ "$1" = "partial" ] ; then
	SIGNAL=USR2
else
	[ -n "$1" ] && echo "$0: invalid argument $1"
fi

PID=`pidof sysinfod`
if [ -z "${PID}" ] ; then
	echo "restart sysinfod..." > /dev/kmsg
	SIGNAL=WINCH
	sysinfod &
	sleep 3
fi

XMLDB_SOCK_SYSINFO=/var/run/xmldb_sock_sysinfo
[ ! -e ${XMLDB_SOCK_SYSINFO} ] && exit 1

killall -${SIGNAL} sysinfod
TIMEOUT=10
while [ 1 ] ; do
	sleep 1
	UPDATING=`xmldbc -S ${XMLDB_SOCK_SYSINFO} -g /updating`
	[ "${UPDATING}" != "1" ] && break
	TIMEOUT=`expr ${TIMEOUT} - 1`
	if [ ${TIMEOUT} -eq 0 ] ; then
		echo "$0 timeout." > /dev/console
		break
	fi
done

