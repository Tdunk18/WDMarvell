#! /bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getSystemState.sh
# 	
# get current system state
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin


if [ -f /tmp/system_ready ]; then
	echo "ready"
else
	echo "initializing"
fi





