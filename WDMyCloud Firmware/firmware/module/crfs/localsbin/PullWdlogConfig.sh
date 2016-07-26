#!/bin/bash

### set -x

#
# (c) 2015 Western Digital Technologies, Inc. All rights reserved.
# 
# PullWdlogConfig.sh
# This script inquires Central Server for analytics setting of device and update wdlog.conf setting accordingly
# 

PATH=/sbin:/bin/:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /etc/system.conf 2>/dev/null

CONF_FILE="/usr/local/config/wdlog.conf"
FILTER_FILE="/usr/local/config/wdlog.filters"
DYNAMIC_CONFIG_INI="/var/www/rest-api/config/dynamicconfig.ini"
TMP_FILE=$(mktemp)
TMP_FILEB=$(mktemp)

PIP_STATUS="false"

# Inquiry status of Central Server.
check_cs_status()
{
	cs_base_url=`awk -F= '{if ($1=="SERVER_BASE_URL") {gsub("\"","",$2); print $2}}' ${DYNAMIC_CONFIG_INI} 2>/dev/null`
    if [ $? -ne 0 ]; then
		echo SERVER_BASE_URL not located.
		exit 1
	fi
	cs_status_url=""${cs_base_url}/api/1.0/rest/remote_access_status""
	http_response=$(curl -s -w %{http_code} ${cs_status_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		wdlog -s PullWdLogConfig -l WARN -m PullWdlogConfig error:string="cs:remote_access_status failed" url:string="${cs_status_url}" code:int=$http_response 2>/dev/null
		echo cs:remote_access_status failed url=\"${cs_status_url}\" code:$http_response
		cs_status="unknown"
	fi

	v_action=$( grep -o '<action>.*</action>' ${TMP_FILE} | sed 's/\(<action>\|<\/action>\)//g')
	v_wait_time=$( grep -o '<wait_time>.*</wait_time>' ${TMP_FILE} | sed 's/\(<wait_time>\|<\/wait_time>\)//g')

	case $v_action in
   	   	proceed)
   	   		cs_status="online"
   	   		;;
   	   	wait)
			sleep $v_wait_time
   	   		cs_status="waited"
   	   		;;
   	   	*)
   	   		cs_status="unknown"
			wdlog -s PullWdLogConfig -l WARN -m PullWdlogConfig error:string="remote_access_status: unknown" 2>/dev/null
			echo remote_access_status: unknown
   	    	;;
	esac
}


# Inquiryedevice analytics setting on Central Server
get_device_analytic_setting()
{
# Inquiry device ID and authorization token
	v_dev_id=`awk -F= '{if ($1=="DEVICEID") {gsub("\"","",$2); print $2}}' ${DYNAMIC_CONFIG_INI}`
    [ $? -ne 0 ] && exit 1

	v_dev_token=`awk -F= '{if ($1=="DEVICEAUTH") {gsub("\"","",$2); print $2}}' ${DYNAMIC_CONFIG_INI}`
    [ $? -ne 0 ] && exit 1
    

# Inquiry device analytics setting from Central Server
	cs_dev_config_url=""${cs_base_url}/device-command/api/1.0/rest/device_command_config/${v_dev_id}?device_auth=${v_dev_token}""
	http_response=$(curl -s -w %{http_code} ${cs_dev_config_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		# For beta test, command out the following wdlog error log and leave wdlog.conf unchanged.
		# FIXME: uncomment wdlog line when CS device_command_config mechanism is deployed
		wdlog -s PullWdLogConfig -l WARN -m PullWdlogConfig error:string="cs:device_command_config failed" code:int=$http_response
		return 1
	fi

	# split the config to one data pair per line
	cat ${TMP_FILE} | awk -F "{" '{for(i=1;++i<=NF;)print $i}' > ${TMP_FILEB}
	v_log_upload_enabled=$( grep "log_upload_enabled" ${TMP_FILEB} | sed -n -e 's/^.*value\"://p' | tr -d ' ' | sed -n -e 's/}.//p' | tr -d '"' )
	v_collector_url=$( grep "collector_url" ${TMP_FILEB} | sed -n -e 's/^.*value\"://p' | tr -d ' ' | sed -n -e 's/}.//p' )
	v_filter_url=$( grep "filter_url" ${TMP_FILEB} | sed -n -e 's/^.*value\"://p' | tr -d ' ' | sed -n -e 's/}.//p' | tr -d '"' )
	return 0
}


# This function set analytic setting per response from analytics setting on Central Server.
set_device_analytic_setting()
{
	wdlog_setting=$(egrep ^STATUS= ${CONF_FILE} | sed 's/=/ /' | awk '{print $2}')			
	wdlog_url_setting=$(egrep ^HOSTED_COLLECTOR_URL= ${CONF_FILE} | sed 's/=/ /' | awk '{print $2}')			

	rm $FILTER_FILE 2>/dev/null
	# The previous filter URL is not saved; each pull causes this file to be redownloaded.
	if  [ "$v_filter_url" == "" ]; then
		wdlog -s PullWdLogConfig -l ERROR -m PullFilterConfig url:string="" status:int=404 2>/dev/null
		echo No URL to pull filter config!
	else
		http_response=$(curl -s -w %{http_code} ${v_filter_url} -o ${FILTER_FILE})
		if [ ${http_response} != 200 ]; then
			wdlog -s PullWdLogConfig -l ERROR -m PullFilterConfig url:string="${v_filter_url}" status:int=$http_response
			rm $FILTER_FILE 2>/dev/null
		fi
	fi	
	
	# Update WDLog upload setting
	# 
	case $v_log_upload_enabled in
   	   	true|TRUE)
			case $wdlog_setting in
				enabled)
					### echo "WDLog upload is already enabled, no modification is required."
					;;
				*)
					sed -i 's/^STATUS.*/STATUS=enabled/' $CONF_FILE
					### echo "WDlog upload is switched from \"disabled\" to \"enabled\""
					;;
			esac
			;;					
   	   	*) ## anything other than 'true' or 'TRUE' will disable
			case $wdlog_setting in
				disabled)
					### echo "WDLog upload is already disabled, no modification is required."
					;;
				*)
					sed -i 's/^STATUS.*/STATUS=disabled/' $CONF_FILE
					### echo "WDlog upload is switched from \"enabled\" to \"disabled\""
					;;
			esac
			;;
	esac
	
	# Update WDLog upload URL setting
	
	if  [ "$wdlog_url_setting" == "$v_collector_url" ]; then
		echo "URL matched - No collector URL update required"
	else
		echo "URL mismatched - Collector URL update required"
		sed -i "s@HOSTED_COLLECTOR_URL.*@HOSTED_COLLECTOR_URL=${v_collector_url}@" $CONF_FILE
	fi
	return 0
}


# remove temp. file
remove_tmp_file()
{
	rm -f $TMP_FILE
	rm -f $TMP_FILEB
}

check_PIP_status()
{
    # this function needs to be refactored
    # once Taiwan team fixes PIP implementation.
    if [ "${modelNumber}" == "sq" ]; then
        PIP_STATUS=$(bash privacyOptions.sh | awk -F"=" '{print $2}')
    else
        rslt=$(xmldbc -g analytics 2>/dev/null)
        case ${rslt} in
            1)
                PIP_STATUS="true"
                ;;
            0)
                PIP_STATUS="false"
                ;;
        esac
    fi
}

# main()
# check Product Improvement Program status
# do not poll Central Server if PIP is OFF
	check_PIP_status
	if [ "${PIP_STATUS}" != "true" ]; then
		echo "PIP is disabled, exiting."
		exit 0
	fi
    #echo "PIP is enabled, polling Central Server."

# Check the status of Central Server
	check_cs_status

	if [ "$cs_status" == "waited" ]; then
		# one retry
		check_cs_status
	fi

# Inquire device analytics setting on Central Server.
	if [ "$cs_status" == "online" ]; then
		get_device_analytic_setting
		if [ $? != 0 ]; then
			# if we cannot reach server, DISABLE
			v_log_upload_enabled=FALSE
			v_collector_url=
			v_filter_url=
		fi
	else
		# CS not online, DISABLE
		v_log_upload_enabled=FALSE
		v_collector_url=
		v_filter_url=
	fi

# Update device setting per respose from Central Server.
	if [ -f "$CONF_FILE" ] 
	then
		set_device_analytic_setting
		if [ $? != 0 ]; then
			wdlog -s PullWdLogConfig -l ERROR -m SetDeviceAnalyticSetting error:int=$?
			remove_tmp_file
			exit 1
		fi
	else
		wdlog -s PullWdLogConfig -l WARN -m PullWdlogConfig error:string="wdlog.conf not found" 2>/dev/null
		echo wdlog.conf not found
	fi

# remove temp. file
	remove_tmp_file	
	exit 0
