#!/bin/sh
#
# © 2010 Western Digital Technologies, Inc. All rights reserved.
#
# sendAlert.sh <alert code> 
#
# Note: alert codes /etc/alert-param.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/alert-param.sh

API_ROOT="/var/www/rest-api/api"
alertdb="/CacheVolume/.wd-alert/wd-alert.db"
alertdescdb="/CacheVolume/.wd-alert/wd-alert-desc.db"

if [ ! -d "/CacheVolume/.wd-alert" ]; then
    mkdir /CacheVolume/.wd-alert
    chmod 775 /CacheVolume/.wd-alert
fi

if [ ! -s "${alertdescdb}" ]; then
    cat $API_ROOT/Alerts/src/Alerts/Alert/Db/schema/wd-alert-desc.sql | sqlite3 ${alertdescdb}
    chmod 775 /CacheVolume/.wd-alert/wd-alert-desc.db
    cat $API_ROOT/Alerts/src/Alerts/Alert/Db/schema/alert-desc.sql | sqlite3 ${alertdescdb}
fi


if [ ! -s "${alertdb}" ]; then
    cat $API_ROOT/Alerts/src/Alerts/Alert/Db/schema/wd-alert.sql | sqlite3 ${alertdb}
    chmod 775 /CacheVolume/.wd-alert/wd-alert.db
fi
