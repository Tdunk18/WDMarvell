#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# storage_transfer_get_config.sh
#
# Used to retrieve the configured Storage Transfer property set in the device.
#

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
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
if [ ! -f /usr/local/config/StorageSet.ini ]; then
   cp /usr/local/sbin/StorageSet.ini /usr/local/config/StorageSet.ini
fi
sed -i 's/enable = On/enable = true/' /usr/local/config/StorageSet.ini
sed -i 's/enable = Off/enable = false/' /usr/local/config/StorageSet.ini

enableFlag=$(sed -n 's/.*enable *= *\([^ ]*.*\)/\1/p' < /usr/local/config/StorageSet.ini)
TransferMode=$(sed -n 's/.*mode *= *\([^ ]*.*\)/\1/p' < /usr/local/config/StorageSet.ini)

echo ${enableFlag} ${TransferMode}

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

