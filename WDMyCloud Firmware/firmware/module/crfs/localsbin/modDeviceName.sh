#! /bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
# waiting for DLNA done
#
# modDeviceName.sh <device_name> <device_description>


PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

XML_SAB_HOSTNAME=/system_mgr/samba/netbios_name
XML_SAB_STRING=/system_mgr/samba/server_string
config_etc=/etc/NAS_CFG/config.xml
config_mtd=/usr/local/config/config.xml

if [ $# != 2 ]; then
	echo "usage: modDeviceName.sh <device_name> <device_description>"
	exit 1
fi

currentDeviceName=`hostname`
currentDeviceDescription=`getDeviceDescription.sh`

if [ "$1" == "$currentDeviceName" ] && [ "$2" == "$currentDeviceDescription" ]; then
	exit 0
fi

portforwarding.sh del >/dev/null &		# copy from system_mgr.cgi

# What is dhclient? dhcp3-client?
# sed -e '/^send host-name/s/\(send host-name \)\(.*\);/\1'${1}';/' $dhclientConfig > $dhclientConfig-new
# if [ $? != 0 ]; then
    # exit 1
# fi

xmldbc -s $XML_SAB_HOSTNAME "${1}"
xmldbc -s $XML_SAB_STRING "${2}"
xmldbc -D $config_etc
access_mtd "cp $config_etc $config_mtd"


# update /etc/hosts
echo ${1} > /etc/hostname					# for PHP read next time
# ITR 98773, FOR keep server, don't reset /etc/hosts by wd script
#genHostsConfig.sh    #keep ?  20130913 vodka

info.sh & >/dev/null
network -o & >/dev/null					# include config.xml settings

# 20130913 vodka
DHCP=`xmldbc -g '/network_mgr/lan0/dhcp_enable'`
if [ "$DHCP" = "1" ]; then
	ip.sh dhcp 0 & >/dev/null
fi

# Restart upnp 20140305 update again 
upnpnas.sh restart

# Restart services
rescanItunes.sh
UPNPAV=`xmldbc -g '/app_mgr/upnpavserver/enable'`
if [ "$UPNPAV" = "1" ]; then
   (twonky.sh stop; sleep 2; twonky.sh start) &
fi


afpcom >/dev/null
smbcmd -s >/dev/null
smbcmd -r >/dev/null
#afp restart >/dev/null    #20130913 vodka
avahi-daemon -k >/dev/null
avahi-daemon -D >/dev/null

iscsictl --change_hostname >/dev/null &  # 20130913 vodka
portforwarding.sh add > /dev/null &		# copy from system_mgr.cgi

# For Jacky request
lltd.sh restart > /dev/null

#send signal to google server +20140902.Vodka
ganalytics --hostname-changed

# waiting for DLNA done
# if [ -x /usr/local/sbin/modDlnaDeviceName.sh ]; then
    # /usr/local/sbin/modDlnaDeviceName.sh "$@"
# fi
