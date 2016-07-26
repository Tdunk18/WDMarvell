#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setServiceStartup.sh <servicename> <enabled/disabled>
#
# Enables or disables the given service in the startup list
#
# Modified By Alpha.Vodka
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
#. /etc/system.conf
. /usr/local/sbin/ledConfig.sh

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

ntp_get_time(){
	local timeServer=${1}
	
	killall -9 sntp 2>/dev/null
	rm -f /tmp/sntp_ok
	
	if [ -z "$timeServer" ]; then
		timeServer=`xmldbc -g '/system_mgr/time/ntp_server'`
	fi
	(sntp -r ${timeServer} >/dev/null) &
	
	
	local retry=0
	while [ $retry -lt 5 ]; do
		sleep 1
		if [ -e /tmp/sntp_ok ]; then
			/usr/sbin/rtc -w >/dev/null
			killall -9 crond
			crond&
			wto -r		# reset wto
			return 0
		fi
		retry=`expr $retry + 1`
	done
	
	killall -9 sntp 2>/dev/null
	return 1
}

save_config(){
	xmldbc -D /etc/NAS_CFG/config.xml
	access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/config.xml"	
}

serviceName=$1
newstate=$2

if [ $# != 2 ]; then
	echo "usage: setServiceStartup.sh <servicename> <enabled/disabled>"
	exit 1
fi
if [ $newstate != "enabled" ] && [ $newstate != "disabled" ]; then
	echo "usage: setServiceStartup.sh <servicename> <enabled/disabled>"
	exit 1
fi

# convert generic DLNA server to specific instance
if [ "$serviceName" == "dlna_server" ]; then
	dlnaName=`/usr/local/sbin/getDlnaServer.sh`
	if [ -n "$dlnaName" ]; then
            serviceName=$dlnaName
	fi
fi

currentstate=`getServiceStartup.sh ${serviceName}`
if [ $? == 1 ]; then
	exit 1
fi

if [ $currentstate == $newstate ]; then
	echo "Service $serviceName already $newstate"
	exit 0
fi
# update /etc/nas/service_startup status
if [ $newstate == "enabled" ]; then
	echo $newstate > /etc/nas/service_startup/$serviceName
	action="start"
	do="true"
else
	echo $newstate > /etc/nas/service_startup/$serviceName
	action="stop"
	if [ $serviceName != "ntpdate" ]; then
		do="true"
	else
		xmldbc -s '/system_mgr/time/ntp_enable' 0
		save_config		
	fi
fi

# set service 
if [ "$do" == "true" ]; then	
    case $serviceName in
		"twonky")
			[ -f /usr/sbin/twonky.sh ] && /usr/sbin/twonky.sh $action &>/dev/null 
			if [ $action == "start" ]; then
				xmldbc -s /app_mgr/upnpavserver/enable 1
			elif [ $action == "stop" ]; then
				xmldbc -s /app_mgr/upnpavserver/enable 0
			fi
			save_config			
			;;
		"ssh")
			if [ $action == "start" ]; then
				ssh_daemon -s &
				xmldbc -s /network_mgr/ssh/enable 1
			elif [ $action == "stop" ]; then
				ssh_daemon -p &
				xmldbc -s /network_mgr/ssh/enable 0
			fi
			save_config
			;;
		"hostapd")
			/etc/init.d/dnsmasq $action &
			;;
		"ntpdate")
			# absolutely "start"
			xmldbc -s '/system_mgr/time/ntp_enable' 1
			
			extraNtp=`/usr/local/sbin/getExtraNtpServer.sh`
			test -n ${extraNtp} && ntp_get_time ${extraNtp}
			if [ ! -e /tmp/sntp_ok ]; then
				if ! ntp_get_time "time.windows.com"; then
					ntp_get_time "pool.ntp.org"
				fi
			fi
			(operate_auth -c >/dev/null 2>&1) &
			schedule_poweron -s
			expire.sh >/dev/null	
			save_config			
			;;
		"status-led")
			#[ $action == "start" ] && led power blue on || led power blue off
			if [ $action == "start" ]; then
				led sleep off &
				xmldbc -s '/system_mgr/power_management/led_enable' 1
			else
				led sleep on &
				xmldbc -s '/system_mgr/power_management/led_enable' 0
			fi
		
			led_sleep=`xmldbc -g '/system_mgr/power_management/led_sleep'`
			xmldbc -s '/system_mgr/power_management/led_sleep' ${led_sleep}
			save_config		
			;;
		"vsftpd")
			if [ $action == "start" ]; then
				ftp start > /dev/null 2>&1
				xmldbc -s /app_mgr/ftp/setting/state 1
			elif [ $action == "stop" ]; then
				ftp stop > /dev/null 2>&1
				xmldbc -s /app_mgr/ftp/setting/state 0
			fi			
			save_config
			;;
		"itunes")
			if [ $action == "start" ]; then
				itunes.sh start > /dev/null
				xmldbc -s /app_mgr/itunesserver/enable 1
			elif [ $action == "stop" ]; then
				itunes.sh stop > /dev/null
				xmldbc -s /app_mgr/itunesserver/enable 0
			fi			
			save_config		
			;;
	esac
fi


# reload mDNSResponder to check services
## Note: this is really only needed for itunes, however, the cost of reloading mDNSResponder is very low, 
## and didn't want to make a special case for it, since service setting changes are done so infrequently.
#/etc/init.d/mDNSResponder reload >/dev/null &

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