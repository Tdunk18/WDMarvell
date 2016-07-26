#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getSmartStatus.sh 
# 
# 
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

ResSMART="good"

for sdx in 0 1 2 3; do
	HDDLoc="/sys/class/scsi_host/host${sdx}/device/target${sdx}:0:0/${sdx}:0:0:0/block"
	if [ -d $HDDLoc ]; then								# if hd-block existed
		HDDindex=`ls ${HDDLoc}`
		smartctl -H /dev/${HDDindex} | grep -q "PASSED"
		if [ $? -ne 0 ]; then							# at least one SMART not OK
			ResSMART="bad"
		fi
	fi
done

echo $ResSMART

# if [ -f /tmp/smart_fail ]; then
	# echo "bad"
# else
	# echo "good"
# fi
