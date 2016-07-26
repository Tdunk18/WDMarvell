#! /bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modHddStanbyConfig.sh <enabled/disabled> <time>
#
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

#SYSTEM_SCRIPTS_LOG=${SYSTEM_SCRIPTS_LOG:-"/dev/null"}
## Output script log start info
#{ 
#echo "Start: `basename $0` `date`"
#echo "Param: $@" 
#} >> ${SYSTEM_SCRIPTS_LOG}
##
#{
#---------------------
# Begin Script
#---------------------

if [ $# != 2 ]; then
	echo "usage: modHddStanbyConfig.sh <enabled/disabled> <time>"
	exit 1
fi

standby_status=`xmldbc -g /system_mgr/power_management/hdd_hibernation_enable`
newstate=$1

if [ "${newstate}" == "enabled" ]; then
	new_state="1"
	if [ "${standby_status}" != "${new_state}" ]; then
	   wd_compinit -b 1
	fi	
elif [ "${newstate}" == "disabled" ]; then
    new_state="0"
	if [ "${standby_status}" != "${new_state}" ]; then
	   wd_compinit -b 0
	fi	
fi

echo "standby_enable=$1" > /etc/standby.conf
echo "standby_time=$2" >> /etc/standby.conf

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

exit 0







