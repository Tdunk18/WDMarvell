#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# saveConfiguration.sh 
#
# Modified By Alpha.Hwalock

#---------------------



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
ConfigFile=/tmp/backup.tgz
tmpConfigFile=/tmp/backup
newConfigFile=/CacheVolume/backup.tgz

config_set -b > /dev/null 2>&1

rm -rf $tmpConfigFile

if [ ! -f $ConfigFile ]; then
	exit 1
fi

cp -f $ConfigFile $newConfigFile

echo $newConfigFile

exit 0

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
