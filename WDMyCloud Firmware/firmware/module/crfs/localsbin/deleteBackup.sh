#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# deleteBackup.sh <backupshare> <backupname>
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
	echo "usage: deleteBackup.sh <backupshare> <backupname>"
	exit 1
fi


case ${1} in
"TimeMachine")
	rm -rf "/DataVolume/backup/TimeMachine/${2}.sparsebundle"
	;;
"SmartWare")
	rm -rf "/DataVolume/backup/SmartWare/WD SmartWare.swstor/${2}"
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