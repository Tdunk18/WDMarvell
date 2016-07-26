#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getBackupShareList.sh <backupshare> 
#	Returns:
#			<backupName> <lastModTimestamp> <sizeinMB>
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

if [ $# != 1 ]; then
	echo "usage: getBackupShareList.sh <backupshare>"
	exit 1
fi


# print backup info, given passed in backup set
#backupInfo=`awk '{print $0;}'`
case ${1} in
"TimeMachine")
	if [ -d "/DataVolume/backup/${1}" ]; then
	    ls -1 /DataVolume/backup/${1} | grep ".sparsebundle" > /tmp/backuplist
	    awk '{ sub(".*/","",$0); sub(".sparsebundle","",$0); print $0; }' /tmp/backuplist
	fi        
	;;
"SmartWare")
	if [ -d "/DataVolume/backup/${1}/WD SmartWare.swstor" ]; then
		ls -1 "/DataVolume/backup/${1}/WD SmartWare.swstor"
	fi
	;;
*)
	echo "No backup share $1 found"
	exit 1
	;;
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