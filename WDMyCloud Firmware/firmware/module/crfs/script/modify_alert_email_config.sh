#!/bin/bash
#
# ? 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modify_alert_email_config.sh
#
# Gets current service startup
#
# Modified By Alpha.Brian
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
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

email_enabled=`xmldbc -g /system_mgr/mail/enable`
min_level_email=`xmldbc -g /system_mgr/mail/alert_mail_priority`
min_level_rss=`xmldbc -g /system_mgr/mail/alert_type`
email_recipient_0=`xmldbc -g /system_mgr/mail/mail_1`
email_recipient_1=`xmldbc -g /system_mgr/mail/mail_2`
email_recipient_2=`xmldbc -g /system_mgr/mail/mail_3`
email_recipient_3=`xmldbc -g /system_mgr/mail/mail_4`
email_recipient_4=`xmldbc -g /system_mgr/mail/mail_5`

if [ $email_enabled == 0 ]; then
	echo -e "email_enabled=\"off\"" > /etc/alert_email.conf
else
	echo -e "email_enabled=\"true\"" > /etc/alert_email.conf
fi

echo -e "\nemail_returnpath=\"nas.alerts@wdc.com\"" >> /etc/alert_email.conf

if [ $min_level_email == 0 ]; then
	echo -e "\nmin_level_email=\"1\"" >> /etc/alert_email.conf
elif [ $min_level_email == 1 ]; then
	echo -e "\nmin_level_email=\"5\"" >> /etc/alert_email.conf
else
	echo -e "\nmin_level_email=\"10\"" >> /etc/alert_email.conf
fi

if [ $min_level_rss == 0 ]; then
	echo -e "\nmin_level_rss=\"1\"" >> /etc/alert_email.conf
elif [ $min_level_rss == 1 ]; then
	echo -e "\nmin_level_rss=\"5\"" >> /etc/alert_email.conf
else
	echo -e "\nmin_level_rss=\"10\"" >> /etc/alert_email.conf
fi

echo -e "\nemail_recipient_0=\"$email_recipient_0\"" >> /etc/alert_email.conf
echo -e "\nemail_recipient_1=\"$email_recipient_1\"" >> /etc/alert_email.conf
echo -e "\nemail_recipient_2=\"$email_recipient_2\"" >> /etc/alert_email.conf
echo -e "\nemail_recipient_3=\"$email_recipient_3\"" >> /etc/alert_email.conf
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
