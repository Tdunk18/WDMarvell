#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# storage_transfer_start_now.sh
#
# Used to manually initiate a Storage Transfer process
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

if [ "${1}" == "copy" ] || [ "${1}" == "move" ]; then
	/usr/local/sbin/StorageTrans.py --enable --ini /usr/local/config/StorageSet.ini --transfer_mode "${1}" "${2}" "${3}" 
elif [ "${1}" == "-h" ]; then
    echo "storage_transfer_start_now.sh \"{move/copy/""}\" /shares/DataTraveler2_0-1/ /shares/Public/"
else
	/usr/local/sbin/StorageTrans.py --enable --ini /usr/local/config/StorageSet.ini "${1}" "${2}"
fi


exit 0


