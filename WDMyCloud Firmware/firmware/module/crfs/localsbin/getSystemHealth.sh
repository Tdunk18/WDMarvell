#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getSystemHealth.sh 
#
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh
. /etc/system.conf

if [ "`getVolumeStatus.sh`" == "bad" ] || [ "`getTemperatureStatus.sh`" == "bad" ] || [ "`getSmartStatus.sh`" == "bad" ]; then
	echo "bad"
else
	echo "good"
fi
