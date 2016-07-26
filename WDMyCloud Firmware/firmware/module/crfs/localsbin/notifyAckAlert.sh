#!/bin/sh
#
# ?2013 Alpha Networks Inc. All rights reserved.
#
# notifyAckAlert.sh <alert id>
#
# - Remove all instances of a specific alert from the alert log
#
# Note: alert codes /etc/alert-param.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

if [ $# -lt 1 ]; then
    echo "Usage: notifyAckAlert.sh <alert id> "
    exit 1
fi

alertID=$1
alertXML="/var/log/alert.xml"
alertdb="/CacheVolume/.wd-alert/wd-alert.db"

if [ -f "${alertXML}" ]; then
  /usr/sbin/remove_alert -a $alertID -r
  sqlite3 "${alertdb}" "update AlertHistory set acknowledged=1 where id=${alertID};"
  if [ $? -eq 0 ]; then
#    echo "Success"
    exit 0
  else
#    echo "Fail"
    exit 1
  fi
fi

