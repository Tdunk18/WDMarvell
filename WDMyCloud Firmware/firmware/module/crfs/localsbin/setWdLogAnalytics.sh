#!/bin/bash
# setWdLogAnalytics
#
# this script will enable/disable daily log upload
# to the Log Analytics provider
#

PATH=/sbin:/bin/:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

CONF_FILE="/usr/local/config/wdlog.conf"

set_status()
{
    grep "STATUS=" ${CONF_FILE} > /dev/null
    if [ $? != 0 ]; then
        echo -e "\nSTATUS=${my_status}" >> ${CONF_FILE}
    else
        #echo "replacing"
        sed -i.bak "s/STATUS=[^ ]*/STATUS=${my_status}/g" ${CONF_FILE}
        #[ $? != 0 ] && wdlog -s setWdLogAnalytics -l WARN -m setLogAnalytics status:string=failed
        if [ $? == 0 ]; then
            echo "${my_status}"
        else
            wdlog -s setWdLogAnalytics -l WARN -m setLogAnalytics action:string=${1} status:string=failed
            echo "failed"
            exit 1
        fi
    fi
}

get_status()
{
    my_status=$(grep "STATUS=" ${CONF_FILE} | awk -F"=" '{print $2}' | cut -d '"' -f2)
    echo "${my_status}"
    if [[ "${my_status}" != "enabled" && "${my_status}" != "disabled" ]]; then 
        echo "failed"
        exit 1
    fi
}

case $1 in
    start)
        my_status="enabled"
        set_status
        ;;
    stop)
        my_status="disabled"
        set_status
        ;;
    status)
        get_status
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        exit 2
        ;;
esac
