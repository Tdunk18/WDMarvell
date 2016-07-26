## Set URL Params
LOCALPARAMS="format=xml"
#echo "Params: $LOCALPARAMS"

#check wd-alert-desc.db fine or corrupted.
AlertDescDB=/CacheVolume/.wd-alert/wd-alert-desc.db
if [ -f "$AlertDescDB" ]; then
    fsize=$(stat -c%s "${AlertDescDB}")
    if [ "$fsize" -gt 0 ] && [ "$fsize" -le 15360 ]; then
       migration=1
    fi
    corrupt=`sqlite3 ${AlertDescDB} ".schema" 2>&1|grep "^Error:"`
    if [ ! -z "${corrupt}" ] || [ "${migration}" == "1" ]; then
       rm -f ${AlertDescDB}
       createAlertDb.sh
    fi
fi

## POST to REST API URL
emailAlerts=`wget -T 5 -t 3 -o /dev/null -O /tmp/confstatus.xml --post-data $LOCALPARAMS 'http://localhost/api/1.0/rest/alert_notify'`
## Check it worked
ALERTSUCCESS=`cat /tmp/confstatus.xml | grep 'Success'` 
if [ "$ALERTSUCCESS" = '' ]
then
	`logger -p user.error "WD NAS: Email alerts REST API failed to return Success"`
else
	`logger -p user.info "WD NAS: Email alerts sent OK"`
	
fi

