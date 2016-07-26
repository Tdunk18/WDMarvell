#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# restoreUserShareState.sh
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

cp ${trustees}-save ${trustees}
cp ${sambaOverallShare}-save ${sambaOverallShare}

cp ${userConfig}-save ${userConfig}
cp ${passwdConfig}-save ${passwdConfig}
cp ${smbpasswdConfig}-save ${smbpasswdConfig}

cp ${remoteAccessConfig}-save ${remoteAccessConfig}

# reload
setTrustees.sh 2> /dev/null
/etc/init.d/samba reload > /dev/null

genAppleVolumes.sh &

# regenerate apache group access files
genApacheGroupsFile.sh
genApacheAccessRules.sh
apache2ctl -k graceful &
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