#!/bin/sh
#
# © 2010 Western Digital Technologies, Inc. All rights reserved.
#
# clearAlerts.sh <alert code> 
#
# - Remove all instances of a specific alert from the alert log
# 
# Note: alert codes /etc/alert-param.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#. /etc/nas/alert-param.sh
if [ $# -lt 1 ]; then
    echo "Usage: clearAlerts.sh <alert code> "
    exit 1
fi

alertCode=$1
alertdb="/CacheVolume/.wd-alert/wd-alert.db"

locale=`sed -e 's/language //g' /etc/language.conf`

if [ ! -z "$locale" ]; then
    exist=`cat /etc/nas/strings/$locale/alertmessages.txt | grep "^$alertCode = "`
    if [ -z "$exist" ]; then
	echo "Usage: clearAlerts.sh <alert code> "
        exit 1
    fi
else
    echo "Usage: clearAlerts.sh <alert code> "
    exit 1
fi

exceedAlert=`sqlite3 "${alertdb}" "SELECT id FROM AlertHistory WHERE alert_code = ${alertCode};"`
for i in $exceedAlert; do
	#fireAlert -a $i -x
	/usr/sbin/remove_alert -a $i -r
	sqlite3 "${alertdb}" "update AlertHistory set acknowledged=1 where id=${i};"
done

#fireAlert -a $1 -x

[ "$?" == "0" ] && incUpdateCount.pm alert &
