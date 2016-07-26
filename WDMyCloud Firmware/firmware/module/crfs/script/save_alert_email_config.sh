#!/bin/bash
. /etc/alert_email.conf

if [ "$email_enabled" == "off" ]; then
    xmldbc -s /system_mgr/mail/enable 0
elif [ "$email_enabled" == "true" ]; then
	xmldbc -s /system_mgr/mail/enable 1
fi

if [ "$min_level_email" == 1 ]; then
	xmldbc -s /system_mgr/mail/alert_mail_priority 0
elif [ "$min_level_email" == 5 ]; then
	xmldbc -s /system_mgr/mail/alert_mail_priority 1
elif [ "$min_level_email" == 10 ]; then
	xmldbc -s /system_mgr/mail/alert_mail_priority 2
fi

xmldbc -s /system_mgr/mail/mail_1 "$email_recipient_0"

xmldbc -s /system_mgr/mail/mail_2 "$email_recipient_1"

xmldbc -s /system_mgr/mail/mail_3 "$email_recipient_2"

xmldbc -s /system_mgr/mail/mail_4 "$email_recipient_3"

xmldbc -s /system_mgr/mail/mail_5 "$email_recipient_4"

xmldbc -D /etc/NAS_CFG/config.xml
access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/config.xml"

