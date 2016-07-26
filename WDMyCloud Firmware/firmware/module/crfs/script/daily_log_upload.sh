#!/bin/bash

#For SKY-6287 Alpha devices needs to update logs daily
rotate_file="/usr/local/modules/files/syslog_rotate.conf"

if [ -f $rotate_file ]
then
	exec < $rotate_file

	while read log_file_name
	do
		if [ -f /var/log/$log_file_name ]
		then
			mv /var/log/$log_file_name /var/log/$log_file_name.tmp
			rt_script.sh /var/log/$log_file_name 800
		fi
	done

	kill -s SIGHUP `pidof syslogd`
fi

#For SKY-6287, the apache log also need to update log daily
/usr/local/sbin/rotateApache.sh daily
