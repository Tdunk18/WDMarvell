#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setNetworkStatic.sh
#
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/disk-param.sh


tmp_conf=/etc/.tmp_netconf

if [ $# -lt 2 ]; then
	echo "usage: setNetworkStatic.sh [ifname=interface_name] <ip> <netmask> <gateway> <dns0> <dns1> <dns2>"
	echo "       Note, <gateway> <dns0> <dns1> <dns2> are optional"
	exit 1
fi

##########################################################
# dot_to_hex()
# Input : $1 = dot-decimal ip address 
# Output: hex string 
##########################################################

function dot_to_hex {
   for i in $(echo $1 | sed -e "s/\./ /g"); do  
      printf '%02x' $i
   done
}
##########################################################
# get_network_num()
# Input : $1 = dot-decimal ip address 
#         $2 = dot-decimal mask
# Output: Network number in decimal 
##########################################################

function get_network_num() {
   iphex=`dot_to_hex $1`
   maskhex=`dot_to_hex $2` 
   echo iphex:$iphex
   echo maskhex:$maskhex
   network=$(($((0X$iphex)) & $((0X$maskhex))))
   echo ${network}
}

#bond=`xmldbc -g /network_mgr/bonding/enable`
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

otherif=eth0
if [ "${iname}" == "eth0" ]; then
   otherif=ath0
fi
ip=${1}
netmask=${2}
gateway=${3}
dns0=${4}
dns1=${5}
dns2=${6}

wd_set_ip -s -a "${lan}" -i "${ip}" -m "${netmask}" -g "${gateway}" -x "${dns0}" -y "${dns1}" -z "${dns2}"


