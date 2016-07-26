#! /bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
#Script used to change host name and description.
#Usage:
#  machineName.sh Newname 'A nice description of machine'
#
# NOTE:  Caller to do all input validation
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

#20140421.VODKA

XML_SAB_WORKGROUP="/system_mgr/samba/workgroup"
XML_ITUNES_ENABLE="/app_mgr/itunesserver/enable"

if [ $# != 1 ]; then
	echo "usage: modWorkgroup.sh <workgroupName>"
	exit 1
fi

CP_Config_To_MTD(){ 
	if [ -e /tmp/system_ready ]; then
		# Config
		cp -f /etc/NAS_CFG/config.xml /usr/local/config/
		
	fi
}

iTunesServ_Restart() {
	enabled=`xmldbc -g /app_mgr/itunesserver/enable`
	if [ $enabled="1" ]; then
		(itunes.sh restart >/dev/null 2>&1) &
	fi
	
}

Chk_UPNP() {
	upnp=`xmldbc -g /app_mgr/upnpavserver/enable`
	if [ $enabled="1" ]; then
		(itunes.sh restart >/dev/null 2>&1) &
	fi
	(kill `pidof upnp_NAS`; sleep 2; upnp_NAS 0 >/dev/null) &	
}

group=${1}

# write group name to config
xmldbc -s $XML_SAB_WORKGROUP $group

# save to flash
CP_Config_To_MTD

# restart service
iTunesServ_Restart
Chk_UPNP

afpcom >/dev/null
smbcmd -s >/dev/null
smbcmd -r >/dev/null
avahi-daemon -k >/dev/null
avahi-daemon -D >/dev/null

