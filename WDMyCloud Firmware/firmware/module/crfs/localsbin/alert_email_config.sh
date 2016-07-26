#!/bin/bash
#
# ? 2010 Western Digital Technologies, Inc. All rights reserved.
#
# alert_email_config.sh <email_enabled> <min_level_email> <email_recipient_0> <email_recipient_1> <email_recipient_2> <email_recipient_3> <email_recipient_4>
#
# Gets current service startup
#
# Modified By Alpha.Brian
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

email_enabled=$1
min_level_email=$2
email_recipient_0=$3
email_recipient_1=$4
email_recipient_2=$5
email_recipient_3=$6
email_recipient_4=$7

if [ $# != 7 ]; then
	echo "usage: alert_email_config.sh <email_enabled> <min_level_email> <email_recipient_0> <email_recipient_1> <email_recipient_2> <email_recipient_3> <email_recipient_4>"
	exit 1
fi

email_enabled=`echo $email_enabled | awk -F= '{print $2}'`
echo -e "email_enabled=\"$email_enabled\"" > /etc/alert_email.conf

echo -e "\nemail_returnpath=\"nas.alerts@wdc.com\"" >> /etc/alert_email.conf

min_level_email=`echo $min_level_email | awk -F= '{print $2}'`
echo -e "\nmin_level_email=\"$min_level_email\"" >> /etc/alert_email.conf

min_level_rss=`xmldbc -g /system_mgr/mail/alert_type`
if [ "$min_level_rss" == 0 ]; then
	echo -e "\nmin_level_rss=\"1\"" >> /etc/alert_email.conf
elif [ "$min_level_rss" == 1 ]; then
	echo -e "\nmin_level_rss=\"5\"" >> /etc/alert_email.conf
elif [ "$min_level_rss" == 2 ]; then
	echo -e "\nmin_level_rss=\"10\"" >> /etc/alert_email.conf
fi

email_recipient_0=`echo $email_recipient_0 | awk -F= '{print $2}'`
echo -e "\nemail_recipient_0=\"$email_recipient_0\"" >> /etc/alert_email.conf

email_recipient_1=`echo $email_recipient_1 | awk -F= '{print $2}'`
echo -e "\nemail_recipient_1=\"$email_recipient_1\"" >> /etc/alert_email.conf

email_recipient_2=`echo $email_recipient_2 | awk -F= '{print $2}'`
echo -e "\nemail_recipient_2=\"$email_recipient_2\"" >> /etc/alert_email.conf

email_recipient_3=`echo $email_recipient_3 | awk -F= '{print $2}'`
echo -e "\nemail_recipient_3=\"$email_recipient_3\"" >> /etc/alert_email.conf

email_recipient_4=`echo $email_recipient_4 | awk -F= '{print $2}'`
echo -e "\nemail_recipient_4=\"$email_recipient_4\"" >> /etc/alert_email.conf

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
