#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getSmartStatus.sh 
#
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

if [ -f /tmp/temperature_over ]; then
	echo "bad"
else
	echo "good"
fi
