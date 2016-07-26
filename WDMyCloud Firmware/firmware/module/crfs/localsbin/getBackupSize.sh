#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getBackupModTime.sh <backupshare> <backupname> 
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

case ${1} in
"TimeMachine")
	if [ -f /var/local/nas_file_tally/timemachine_tally ]; then
	    size=`cat /var/local/nas_file_tally/timemachine_tally | grep "${2}.sparsebundle" | awk '{print $1}'`
	fi
	;;
"SmartWare")
        if [ -f /var/local/nas_file_tally/smartware_tally ]; then
            size=`cat /var/local/nas_file_tally/smartware_tally | grep -w "${2}" | awk '{print $1}'`
		fi
	;;
*)
	echo "No backup share $1 found"
	exit 1
	;;
esac

if [ "${size}" == "" ]; then
	size=0
fi
echo ${size}

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

