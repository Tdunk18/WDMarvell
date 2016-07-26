#!/bin/sh
#
# ?2010 Western Digital Technologies, Inc. All rights reserved.
#
# ackAlert.sh <alert_id> 
#
# - Remove all instances of a specific alert from the alert log
# 
# Note: alert codes /etc/alert-param.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/alert-param.sh

if [ $# -lt 1 ]; then
    echo "Usage: ackAlert.sh <alert_id> "
    exit
fi

timeout=5
inittime=`date +%s`
curtime=${inittime}
success=0
alertdb="/CacheVolume/.wd-alert/wd-alert.db"

if [ -s "${alertdb}" ]; then
    while [ `expr $curtime - $inittime` -lt $timeout ]
    do
        sqlite3 /CacheVolume/.wd-alert/wd-alert.db "UPDATE AlertHistory SET acknowledged = 1 WHERE id = '$1'" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            curtime=`expr $inittime + $timeout + 1`
            success=1
        else
            curtime=`date +%s`
        fi
    done
fi

[ "${success}" != "0" ] && incUpdateCount.pm alert &