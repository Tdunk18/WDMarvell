#!/bin/sh

if [ -z "$1" ] ; then
	echo "no pid"
	exit 1
fi

PID=$1

PPID=`cat /proc/${PID}/stat | awk '{print $4}'`
CMDLINE=`cat /proc/${PPID}/cmdline`
FIRST_3=`expr substr "${CMDLINE}" 1 3`

echo ${FIRST_3} | grep -q sh
if [ $? -eq 0 ] ; then
	PPID=`cat /proc/${PPID}/stat | awk '{print $4}'`
fi

echo "cmd=`cat /proc/${PID}/cmdline`"
echo "parent cmd=`cat /proc/${PPID}/cmdline`"

