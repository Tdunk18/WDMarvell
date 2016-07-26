#!/bin/bash

###set -x

#
# (c) 2015 Western Digital Technologies, Inc. All rights reserved.
# 
# deleteDeviceInfo.sh
# This script deletes device info from the central server
# 

PATH=/sbin:/bin/:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
TMP_FILE=$(mktemp)

# Inquiry status of Central Server.
check_cs_status()
{
	cs_status_url=""http://wd2go.com/api/1.0/rest/remote_access_status""
	http_response=$(curl -s -w %{http_code} ${cs_status_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		wdlog -s ${0} -l WARN -m ${0} error:string="cs:remote_access_status failed" code:int=$http_response
		cs_status = "unknown"
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
			wdlog -s ${0} -l WARN -m ${0} error:string="remote_access_status: unknown"
   	    	;;
	esac
}


# delete device info on Central Server
delete_device_info()
{
    # Inquiry device ID and authorization token
	dev_id_url="http://localhost/api/2.1/rest/config?format=xml&rest_method=get&config_id=dynamicconfig&module=config&params=DEVICEID"
	http_response=$(curl -s -w %{http_code} ${dev_id_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		wdlog -s ${0} -l WARN -m ${0} error:string="get DEVICEID failed" code:int=$http_response
		return 1
	fi
	v_dev_id=$(grep -o '<value>.*</value>' ${TMP_FILE} | sed 's/\(<value>\|<\/value>\)//g')
			
	dev_token_url="http://localhost/api/2.1/rest/config?format=xml&rest_method=get&config_id=dynamicconfig&module=config&params=DEVICEAUTH"
	http_response=$(curl -s -w %{http_code} ${dev_token_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		wdlog -s ${0} -l WARN -m ${0} error:string="get DEVICEAUTH failed" code:int=$http_response
		return 1
	fi
	v_dev_token=$( grep -o '<value>.*</value>' ${TMP_FILE} | sed 's/\(<value>\|<\/value>\)//g')

	dev_token_url="http://localhost/api/2.1/rest/config?format=xml&rest_method=get&config_id=dynamicconfig&module=config&params=SERVER_BASE_URL"
	http_response=$(curl -s -w %{http_code} ${dev_token_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		wdlog -s ${0} -l WARN -m ${0} error:string="get DEVICEAUTH failed" code:int=$http_response
		return 1
	fi
	v_dev_server=$( grep -o '<value>.*</value>' ${TMP_FILE} | sed 's/\(<value>\|<\/value>\)//g')
    # delete device info from Central Server
	cs_dev_config_url="${v_dev_server}/api/2.0/rest/device/${v_dev_id}?device_auth=${v_dev_token}"
	http_response=$(curl -s -w %{http_code} -X DELETE ${cs_dev_config_url} -o ${TMP_FILE})
	if [ ${http_response} != 200 ]; then
		return 1
	fi
	return 0
}


# remove temp. file
remove_tmp_file()
{
	rm -f $TMP_FILE
}


# main()

# Check the status of Central Server
check_cs_status
		
case $cs_status in
	waited)
		# Check CS status again, exit if CS still isn't available to avoid busy waiting.
		check_cs_status
		if [ "$cs_status" != "online" ]; then
			remove_tmp_file
			exit 1
		fi
		##echo "Wait completed, Central Server is available"
		;;
	online)
		##echo "Central Server is available"
		;;
	*)
		##echo "Central Server status is unknown"
		remove_tmp_file
		exit 1
		;;
esac

delete_device_info
return=$?

# remove temp. file
remove_tmp_file	
exit $return
