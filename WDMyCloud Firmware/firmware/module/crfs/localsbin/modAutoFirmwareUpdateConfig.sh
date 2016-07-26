#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modAutoFirmwareUpdateConfig.sh <enable/disable> <install_day> <install_hour>
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#---------------------
# Begin Script
#---------------------

sch_en=$1
sch_wk=$2
sch_hr=$3

if [ $# != 3 ] || [ "$sch_wk" -gt 7 ] || [ "$sch_wk" -lt 0 ] || [ "$sch_hr" -gt 23 ] || [ "$sch_hr" -lt 0 ]; then
	echo "usage: modAutoFirmwareUpdateConfig.sh <enable/disable> <install_day> <install_hour>"
	exit 1
fi

if [ "$sch_en" == "enable" ]; then
	sch_en='1'
else
	sch_en='0'
fi

if [ "$sch_wk" == "7" ]; then
	sch_wk='0'
elif [ "$sch_wk" == "0" ]; then
	sch_wk='7'
fi


curl -s -X POST http://127.0.0.1/cgi-bin/system_mgr.cgi -d "cmd=set_auto_fw_sch&enable=${sch_en}&hour=${sch_hr}&week=${sch_wk}"
if [ "$?" != "0" ]; then						# connect to server fail
	exit 1
fi

#---------------------
# End Script
#---------------------
