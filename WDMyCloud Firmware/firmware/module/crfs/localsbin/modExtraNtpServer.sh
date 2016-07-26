#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modExtraNtpServer.sh <ntpServer> 
#  Note: entering no argument removes extra ntp server
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
#
# Modified By Alpha.Hwalock
#---------------------
# Begin Script
#---------------------


server=${1}

if [ $# -gt 1 ]; then
	echo "usage: modExtraNtpServer.sh <ntpServer>"
	exit "1"
fi

# reject strings with spaces
echo $server | grep -q [[:space:]]
if [ $? == 0 ]; then
	echo "space detected in <ntpserver>"
	exit 1
fi

# set config
if [ -z "${server}" ]; then
	xmldbc -s '/system_mgr/time/ntp_server' ''
else
	xmldbc -s '/system_mgr/time/ntp_server' ${server}
fi

xmldbc -D /etc/NAS_CFG/config.xml
cp -f /etc/NAS_CFG/config.xml /usr/local/config/


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