#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# saveUserShareState.sh
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

cp -v ${trustees} ${trustees}-save
cp -v ${sambaOverallShare} ${sambaOverallShare}-save

cp -v ${userConfig} ${userConfig}-save
cp -v ${passwdConfig} ${passwdConfig}-save
cp -v ${smbpasswdConfig} ${smbpasswdConfig}-save

cp -v ${remoteAccessConfig} ${remoteAccessConfig}-save

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
