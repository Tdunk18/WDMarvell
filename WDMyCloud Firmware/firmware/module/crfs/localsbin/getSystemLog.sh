#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getSystemLog.sh  <option>
#
#  option - "dlna" : add dlna db to log
#
# returns: 
#   Path to  system log file.
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf
. /usr/local/sbin/drive_helper.sh


{
option=${1}
date_stamp=`date +%s`
serial_num=`getSerialNumber.sh`
logname="systemLog_${serial_num}_${date_stamp}"
logfiledir=/CacheVolume
logfile=${logfiledir}/${logname}.zip
logpath=/tmp/${logname}.zip

# collect log information
zip_system_log.sh ${logname}
mv ${logpath} ${logfile}

# dump all stdout and stderr so that it does not interfere with the filepath echo below..
} > /dev/null 2> /dev/null

echo ${logfile}

