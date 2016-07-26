#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setNetworkDhcp.sh
#
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/disk-param.sh

tmp_conf=/etc/.tmp_netconf
iface=`echo ${1} | grep 'ifname='`
#check bonding
bond=`xmldbc -g /network_mgr/bonding/enable`
# backward compatibility , check parameter
if [ -z "${iface}" ]; then
	iname="${1}"
else
   iname=`echo ${1} | grep "ifname=" | cut -d'=' -f2`
   if [ "${iname}" != "egiga0" ] && [ "${iname}" != "egiga1" ] && [ "${iname}" != "bond0" ]; then
       exit 1
   fi
fi
shift
# decide iface for lan number
if [ "$bond" == "1" ];then  #bond enable, set lan=0
		lan="0"
elif [ "$bond" == "0" ];then #bond disable, set lan=0/1
	case $iname in
		"egiga0")
			lan="0"
			;;
		"egiga1")
			lan="1"
			;;
		*)
			lan="0"
			;;				
	esac
fi
echo bond:[$bond]
echo iname:[$iname]
echo lan:[$lan]

if [ -z "${lan}" ]; then
	exit 1
fi

#run wd_ip_set for set dhcp
wd_set_ip -d -a "$lan" 
