#!/bin/sh
# run ssl_cert_job.sh start at foreground
/usr/local/sbin/ssl_cert_job.sh start

# start httpd if it is gone
httpd_pid=""
if [ -e /usr/local/apache2/logs/httpd.pid ]; then
	httpd_pid=`cat /usr/local/apache2/logs/httpd.pid`
fi

if [ ! -z "$httpd_pid" ]; then
	ps_str=`ps | grep "$httpd_pid" | grep -v grep`
	if [ -z "$ps_str" ]; then
		lighty_ssl
	fi
else
	lighty_ssl
fi

#send fw version +20150528.VODKA
/usr/local/sbin/send_info.sh
