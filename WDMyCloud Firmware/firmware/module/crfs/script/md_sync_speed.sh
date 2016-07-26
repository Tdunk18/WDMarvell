#!/bin/sh

[ ! -e /tmp/speed_limit_min ] && cp -f /proc/sys/dev/raid/speed_limit_min /tmp/speed_limit_min
[ ! -e /tmp/speed_limit_max ] && cp -f /proc/sys/dev/raid/speed_limit_max /tmp/speed_limit_max

if [ -n "$1" ] ; then
	SPEED_VALUE=$1
	if [ "${SPEED_VALUE}" = "min" ] ; then
		SPEED_VALUE=`cat /tmp/speed_limit_min`
	elif [ "${SPEED_VALUE}" = "max" ] ; then
		SPEED_VALUE=`cat /tmp/speed_limit_max`
	fi
	#echo "${SPEED_VALUE}" > /proc/sys/dev/raid/speed_limit_max 
	sysctl -w dev.raid.speed_limit_max=${SPEED_VALUE}
else
	sysctl dev.raid.speed_limit_max
fi

#echo "speed_limit_max=$(cat /proc/sys/dev/raid/speed_limit_max)" > /dev/console

