#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getNetworkConfig.sh
#
#


PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/disk-param.sh


# Backward compatibility to support no iface argument (default to wired eth0)
iname=eth0

# 20140421.VODKA
if [ $# -gt 0 ]; then
	iname=$1
fi
#	dhcp=`awk -v name="$iname" '{ if ($1 == "iface" && $2 == name) { print $4; exit 0; } }' ${networkConfig}`
#hw_ver=`xmldbc -g hw_ver`

#if [ $hw_ver == "WDMyCloudEX4" ]; then  		#LT4A
	bond=`xmldbc -g /network_mgr/bonding/enable`
#else		
    #KC2A,MIRROR,Glacier didn't have bonding
#	bond="0"
#fi

if [ "$bond" == "1" ];then
	    case $iname in
		    "bond0")
				ifname[0]="lan0"
				;;
			"egiga0")
				ifname[0]="lan1"
				;;
			*)
				ifname[0]="lan0"
				#ifname[1]="lan1"
				;;
		esac
elif [ "$bond" == "0" ];then
	    case $iname in
			"egiga0")
				ifname[0]="lan0"
				;;
			"egiga1")
				ifname[0]="lan1"
				;;
			*)
				ifname[0]="lan0"
				ifname[1]="lan1"
				;;
		esac
fi

for lan in "${ifname[@]}"
do
    dhcp=`xmldbc -g /network_mgr/$lan/dhcp_enable`
	if [ "$dhcp" == "1" ]; then
		echo "dhcp"
	else
		echo "static"	
	fi
	address=`xmldbc -g /network_mgr/$lan/ip`
	netmask=`xmldbc -g /network_mgr/$lan/netmask`
	gateway=`xmldbc -g /network_mgr/$lan/gateway`

	echo "address" $address
	echo "netmask" $netmask
	echo "gateway" $gateway
	
	cat $dnsConfig | awk '{if ($1 == "nameserver" && $2 != "") printf("nameserver %s\n",$2)}'
done

