#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# wipefactoryRestore.sh - Kick off factory restore with wipe
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

blockSize=100M
totalBlocks=`df -B ${blockSize} | grep ${dataVolumeDevice} | awk '{print $2}'`
onePercentBlocks=`expr ${totalBlocks} / 100`

# stop all processes
/etc/init.d/cron stop > /dev/null 2> /dev/null
/usr/local/sbin/cmdMediaServer.sh stop /dev/null 2> /dev/null
/etc/init.d/itunes stop > /dev/null 2> /dev/null
/etc/init.d/netatalk stop > /dev/null 2> /dev/null
///etc/init.d/mionet stop > /dev/null 2> /dev/null
/etc/init.d/samba stop > /dev/null 2> /dev/null
/etc/init.d/vsftpd stop > /dev/null 2> /dev/null
/etc/init.d/nfs-kernel-server stop > /dev/null 2> /dev/null

# unmount DataVolume
umount /CacheVolume  > /dev/null 2> /dev/null
umount /nfs > /dev/null 2> /dev/null
umount /shares > /dev/null 2> /dev/null
umount /DataVolume > /dev/null 2> /dev/null

factoryRestore.sh

blockCount=0
percentCount=0
percent=1
echo "inprogress $percent" > /tmp/wipe-status
while [ "${blockCount}" -lt "${totalBlocks}" ]
do
	dd bs=${blockSize} seek=${blockCount} count=1 if=/dev/zero of=/dev/md3 2> /dev/null
	if [ "${percentCount}" -gt "${onePercentBlocks}" ]; then
		percentCount=0
		percent=`expr $percent + 1`
		echo "inprogress $percent" > /tmp/wipe-status
	fi
	blockCount=`expr $blockCount + 1`
	percentCount=`expr $percentCount + 1`
done
sg_sync
sync
echo "complete" > /tmp/wipe-status

# force reboot
reboot

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

