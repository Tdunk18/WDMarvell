#!/bin/bash

#---------------------


PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

# logger -s -t "$(basename $0)" "begin script: $@"
# . /etc/nas/config/wd-nas.conf 2>/dev/null
# . /usr/local/sbin/share-param.sh
# . /etc/system.conf

# accept parameter for skipping reformat (noreformat)

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

LIB_Check_ps(){
	local proc_name=${1}
	for p in `ls -d /proc/[0-9]*`; do
		### get process name from /proc/PID/status
		pn=`test -e ${p} && cat ${p}/status | grep "^Name:" | awk '{print $2}'`	
		if [ "${pn}" == "${proc_name}" ]; then
			return 0
		fi
	done
	return 1
}

isDangerousMoment(){
	local XMLDB_SOCK_SYSINFO=/var/run/xmldb_sock_sysinfo
	
	if LIB_Check_ps "diskmgr" -o LIB_Check_ps "upload_firmware"; then
		return 0
	fi
	
	if [ -e $XMLDB_SOCK_SYSINFO ]; then
		cntVol=`xmldbc -S $XMLDB_SOCK_SYSINFO -g "/vols/vol#"`
		test -z $cntVol && cntVol=0
		
		while [ $cntVol -gt 0 ]; do
			vol_state=`xmldbc -S $XMLDB_SOCK_SYSINFO -g "/vols/vol:${cntVol}/state"`
			[ "$vol_state" == "resize" ] && return 0
			
			raid_state=`xmldbc -S $XMLDB_SOCK_SYSINFO -g "/vols/vol:${cntVol}/raid_state"`
			[ "${raid_state:0:2}" == "re" ] && return 0
			[ "${raid_state}" == "migrate" ] && return 0
			cntVol=`expr $cntVol - 1`
		done
	fi
	return 1
}

CMD=${1}	# noreformat or ""

# if [ "$CMD" == "noreformat" ]; then
	# do something?
# fi

if isDangerousMoment; then
	exit 1
fi

load_default 1 >/dev/null
logger -s -t "SYSTEM" "System has been restored to factory default settings." >/dev/null 2>&1
(/usr/sbin/do_reboot >/dev/null)&
exit 0

##########################################
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# factoryRestore.sh - This script kicks off the factory restore process
##########################################
# echo "$CMD" > ${reformatDataVolume}		#  /etc/.reformat_data_volume

# /usr/bin/touch ${RESTORE_SETTINGS_FROM_DIR_TRIGGER}		#   /etc/.restoreSettingsFromDir

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

