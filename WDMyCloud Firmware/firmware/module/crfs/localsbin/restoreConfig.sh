#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# restoreConfig.sh <config_file_path> 
#
# Modified By Alpha.Hwalock

#---------------------

# possible echo status
#	status="110:full restore"
#	status="111:partial restore, network not restored"
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
#. /usr/local/sbin/share-param.sh
#. /etc/system.conf

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
	echo "usage: restoreConfig.sh <config_file_path>"
	exit 1
fi

configFile=$1
tmpBackup=/tmp/backup.tgz
status=0

cp -f ${configFile} ${tmpBackup} > /dev/null 2>&1

config_set -r 1 -s > /dev/null 2>&1

[ -e /tmp/backupfile_error ] && status=1

rm -f ${tmpBackup} >/dev/null

exit $status
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


