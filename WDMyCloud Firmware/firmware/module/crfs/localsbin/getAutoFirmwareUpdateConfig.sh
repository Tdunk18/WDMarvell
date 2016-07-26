#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getAutoFirmwareUpdateConfig.sh
# RETURNS:
# <enable/disable> <install_day> <install_hour> 
#
#
#---------------------
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#---------------------
# Begin Script
#---------------------

AutoFwSchConf="/tmp/fw_auto_sch"


curl -s http://127.0.0.1/cgi-bin/system_mgr.cgi?cmd=get_auto_fw_sch -o $AutoFwSchConf

if [ "$?" != "0" ]; then						# connect to server fail
	exit 1
else
	if [ ! -s $AutoFwSchConf ]; then			# no reply or empty
		scheStr="disable 0 0"					# no configure => default value
	else
		sch_en=`cat ${AutoFwSchConf} |  grep enable | sed 's/<enable>//g' | sed 's/<\/enable>//g'`
		sch_wk=`cat ${AutoFwSchConf} |  grep week | sed 's/<week>//g' | sed 's/<\/week>//g'`
		sch_hr=`cat ${AutoFwSchConf} |  grep hour | sed 's/<hour>//g' | sed 's/<\/hour>//g'`

		if [ "$sch_en" == "1" ]; then
			sch_en='enable'
		else
			sch_en='disable'
		fi
		
		if [ "$sch_wk" == "7" ]; then
			sch_wk='0'
		elif [ "$sch_wk" == "0" ]; then
			sch_wk='7'
		fi
		
		scheStr="$sch_en $sch_wk $sch_hr"
		# echo "$au_enable $au_day $au_hour"
	fi
	
	echo $scheStr
fi
rm -f $AutoFwSchConf
#---------------------
# End Script
#---------------------
## Copy stdout to script log also
#} # | tee -a ${SYSTEM_SCRIPTS_LOG}
## Output script log end info
#{ 
#echo "End:$?: `basename $0` `date`" 
#echo ""
#} >> ${SYSTEM_SCRIPTS_LOG}