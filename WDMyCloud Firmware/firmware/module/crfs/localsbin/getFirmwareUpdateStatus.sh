#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getFirmwareUpdateStatus.sh
#
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#---------------------
# Begin Script
#---------------------

#if [ -e /tmp/upload_fw ]; then	# upgrading
#	fw_percent=`xmldbc -i -g /runtime/firmware_percentage`
#	if [ $fw_percent -ge 0 ]; then
#		percent_str="upgrading ${fw_percent}"
#		echo "$percent_str"
#	fi
#else
	fwErrCode=`xmldbc -i -g /runtime/firmware_percentage`
	if [ -n "$fwErrCode" ]; then
		if [ $fwErrCode -ge 0 ]; then	
			echo "upgrading $fwErrCode"
		else
			case $fwErrCode in
				-1) 		echo "failed 201 \"not enough space on device for upgrade\"";;
				-2|-3|-6)	echo "failed 200 \"invalid firmware package\"";;
				-4) 		echo "failed 203 \"upgrade unpack failure\"";;
				-5) 		echo "failed 204 \"upgrade copy failure\"";;
				*)			echo "failed 205 \"all drives must be present to upgrade firmware\"";;
			esac
		fi
	elif [ -e /tmp/fw_update_status ]; then # 202 or success
		dlErrMsg=`cat /tmp/fw_update_status | grep "failed"`
		
		if [ -n "$dlErrMsg" ]; then
			echo $dlErrMsg
		else
			echo "downloading 100"
		fi
	elif [ -e /tmp/fw_download_status ]; then   # download percentage
		echo "downloading `cat /tmp/fw_download_status`"
	else
		echo "idle";
	fi
#fi
exit 0
#---------------------
# End Script
#---------------------
