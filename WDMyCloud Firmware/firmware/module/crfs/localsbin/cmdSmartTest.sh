#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# cmdSmartTest.sh <short/long/abort>
#
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf
. /usr/local/sbin/drive_helper.sh

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

cmd=$1

#Get list of drives +VODKA
driveList=(`internalDrives`)
#driveList=(`internalDrivesAlpha`)
if [ "${#driveList[@]}" -ne "$DVC_DRIVE_COUNT" ]; then
    echo "$0: Expected $DVC_DRIVE_COUNT found ${#driveList[@]}"
    #If no drives, exit with error
    if [ "${#driveList[@]}" -eq 0 ]; then
    	exit 1
    fi
fi

case ${cmd} in
short)
    for drive in "${driveList[@]}"
    do
	    smartctl -s on -t short ${drive} > /dev/null
    done
	;;
long)
    for drive in "${driveList[@]}"
    do
	    smartctl -s on -t long ${drive} > /dev/null
    done
	;;
abort)
    for drive in "${driveList[@]}"
    do
	    smartctl -s on -X ${drive} > /dev/null
    done
	;;
*)
	echo "usage: cmdSmartTest.sh <short/long/abort>"
	exit 1
esac

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
