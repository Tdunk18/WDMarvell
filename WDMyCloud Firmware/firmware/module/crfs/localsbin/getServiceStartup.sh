#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getServiceStartup.sh <servicename>
#
# Gets current service startup
#
# Modified By Alpha.Vodka
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
#. /usr/local/sbin/share-param.sh
#. /etc/system.conf

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

serviceName=$1

if [ $# != 1 ]; then
	echo "usage: getServiceStartup.sh <servicename>"
	exit 1
fi

# convert generic DLNA server to specific instance

case $serviceName in
	"dlna_server")
		dlnaName=`/usr/local/sbin/getDlnaServer.sh`
		if [ -n "$dlnaName" ]; then
			serviceName=$dlnaName
		fi
		twonky_status=`xmldbc -g /app_mgr/upnpavserver/enable`
		if [ $twonky_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi		
		;;
	"ssh")
		serviceName="ssh"
		ssh_status=`xmldbc -g /network_mgr/ssh/enable`
		if [ $ssh_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi
		;;
	"ntpdate")
		# serviceName="ntpdate"
		ntp_status=`xmldbc -g '/system_mgr/time/ntp_enable'`
		if [ $ntp_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi
		;;
	"status-led")
		# serviceName="status-led"
		led_status=`xmldbc -g '/system_mgr/power_management/led_enable'`
		if [ $led_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi
		;;
		#if [ ! -e /etc/nas/service_startup/$serviceName ]; then
		#	if [ "volume_normal" == `xmldbc -i -g /runtime/power_led_status` ]; then
		#		echo enabled > /etc/nas/service_startup/$serviceName
		#	fi
		#fi
	"vsftpd")
		ftp_status=`xmldbc -g /app_mgr/ftp/setting/state`
		if [ $ftp_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi		
		;;
	"itunes")
		itunes_status=`xmldbc -g /app_mgr/itunesserver/enable`
		if [ $itunes_status == "0" ]; then
			echo disabled > /etc/nas/service_startup/$serviceName
		else
			echo enabled > /etc/nas/service_startup/$serviceName
		fi				
		;;
esac


if [ ! -f /etc/nas/service_startup/$serviceName ]; then
	echo "service ${serviceName} not found"
	exit 1
fi

cat /etc/nas/service_startup/$serviceName

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
