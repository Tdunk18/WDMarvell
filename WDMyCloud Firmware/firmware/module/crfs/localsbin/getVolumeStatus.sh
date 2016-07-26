#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getVolumeStatus.sh 
#
# Volume mounted status

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin


cat /etc/shared_name | grep -q -v USB

if [ $? -ne 0 ]; then		
	echo "bad"				# no any Volume mounted except USB
else
	echo "good"
fi

# if [ -f /tmp/volume_failed ]; then
	# echo "bad"
# else
	# echo "good"
# fi
