#!/bin/sh
# # $1 : interface ( "0" or "1" )

Usage()
{
	echo "usage: getIPv6Address.sh interface#"
	echo "    where options are :"
	echo "      interface#:    0 or 1"
	exit 1
}


getIPv6Address()
{
#
# $1 : interface_name ( "egiga0" or "egiga0.10" or "bond0" )
# $2 : scope_name (Global or Link) or
#      count (count of Global address)
# $3 : index of address (starting from 1)
#
	interface_name=$1
	scope_name=$2
	index=$3

	case $2 in
		count)
#echo			  "ifconfig -a $interface_name | grep inet6 | grep Scope:Global | sed -e 's/^.*addr: //' -e 's/ .*$//' | wc -l"
			COUNT=`ifconfig -a $interface_name | grep inet6 | grep Scope:Global | sed -e 's/^.*addr: //' -e 's/ .*$//' | wc -l`
			;;

		Global|Site)
#echo			   "ifconfig -a $interface_name | grep inet6 | grep Scope:$scope_name | sed -e 's/^.*addr: //' -e 's/ .*$//' | awk NR==$index"
			PREFIX=`ifconfig -a $interface_name | grep inet6 | grep Scope:$scope_name | sed -e 's/^.*addr: //' -e 's/ .*$//' | awk NR==$index`
				#echo PREFIX:$PREFIX
			PREFIX_LENGTH=`echo $PREFIX | awk '{FS="/"} {print $2}'`
				#echo PREFIX_LENGTH:$PREFIX_LENGTH
			IPV6_ADDR=`echo $PREFIX | awk '{FS="/"} {print $1}'`
				#echo IPV6_ADDR:$IPV6_ADDR
			;;

		Link)
			PREFIX=`ifconfig -a $interface_name | grep inet6 | grep Scope:$scope_name | sed -e 's/^.*addr: //' -e 's/ .*$//'`
				#echo PREFIX:$PREFIX
			PREFIX_LENGTH=`echo $PREFIX | awk '{FS="/"} {print $2}'`
				#echo PREFIX_LENGTH:$PREFIX_LENGTH
			IPV6_ADDR=`echo $PREFIX | awk '{FS="/"} {print $1}'`
				#echo IPV6_ADDR:$IPV6_ADDR
			;;
	esac
}

save_ip()
{
# $1 : item number
	xmldbc -s /network_mgr/$LAN/ipv6/item:$1/ipv6address $IPV6_ADDR
	xmldbc -s /network_mgr/$LAN/ipv6/item:$1/prefix_length $PREFIX_LENGTH
	
	#xmldbc -D /etc/NAS_CFG/config.xml
}


if [ "$1" != "0" -a "$1" != "1" ]; then
	Usage
fi

if [ "$1" == "0" ]; then
	LAN=lan0
else
	LAN=lan1
fi

BOND_ENABLE=`xmldbc -g /network_mgr/bonding/enable`
VLAN_ENABLE=$(xmldbc -g "/network_mgr/$LAN/vlan_enable")
VID=$(xmldbc -g "/network_mgr/$LAN/vlan_id")

IPV6_MODE=$(xmldbc -g "/network_mgr/lan0/ipv6/mode")
if [ "$IPV6_MODE" == "off" ]; then
	IPV6_ENABLE_0=0
else
	IPV6_ENABLE_0=1
fi
IPV6_MODE=$(xmldbc -g "/network_mgr/lan1/ipv6/mode")
if [ "$IPV6_MODE" == "off" ]; then
	IPV6_ENABLE_1=0
else
	if [ "$IPV6_MODE" != "" ]; then
		IPV6_ENABLE_1=1
	else
		IPV6_ENABLE_1=0
	fi
fi

if [ "$BOND_ENABLE" == "1" ]; then
	if [ "$1" == "1" ]; then
		echo "only one bonding driver"
		exit 1
	else
		if [ "$VLAN_ENABLE" == "1" ]; then
			IFACE=bond0.$VID
		else
			IFACE=bond0
		fi
	fi
else
	if [ "$VLAN_ENABLE" == "1" ]; then
		IFACE=egiga$1.$VID
	else
		IFACE=egiga$1
	fi
fi

NEED_RELOAD_MODULE=0
LOCAL_IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/local_ipv6address")
if [ "$LOCAL_IPV6_ADDR" == "" ]; then
	getIPv6Address $IFACE Link
					#echo PREFIX:$PREFIX
					#echo PREFIX_LENGTH:$PREFIX_LENGTH
					#echo IPV6_ADDR:$IPV6_ADDR
	
	if [ "$IPV6_ADDR" != "" ]; then
		xmldbc -s /network_mgr/$LAN/ipv6/local_ipv6address $IPV6_ADDR
		xmldbc -s /network_mgr/$LAN/ipv6/local_prefix_length $PREFIX_LENGTH
		xmldbc -D /etc/NAS_CFG/config.xml
		#save_mtd  /etc/NAS_CFG/config.xml
		
		NEED_RELOAD_MODULE=1
	fi
fi


getIPv6Address $IFACE count
#echo COUNT=$COUNT

if [ "$COUNT" == "0" ]; then
	xmldbc -s /network_mgr/$LAN/ipv6/count 0
else
	# Global address
	
	OLD_COUNT=$(xmldbc -g "/network_mgr/$LAN/ipv6/count")
	if [ "$COUNT" != "$OLD_COUNT" ]; then
		NEED_RELOAD_MODULE=1
	fi

	#DHCP_IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/dhcp_ipv6address")
					#echo DHCP_IPV6_ADDR:$DHCP_IPV6_ADDR
	index=1
	item=1
	while [ "$index" -le "$COUNT" ];
	do
#echo index=$index---------
		getIPv6Address $IFACE Global $index
					#echo PREFIX:$PREFIX
					#echo PREFIX_LENGTH:$PREFIX_LENGTH
					#echo IPV6_ADDR:$IPV6_ADDR

		#if [ "$IPV6_ADDR" != "$DHCP_IPV6_ADDR" ]; then
			save_ip $item
        	item=`expr $item + 1`
		#fi
        index=`expr $index + 1`
	done
	xmldbc -s /network_mgr/$LAN/ipv6/count `expr $item - 1`
					
#echo item=$item---------
	while [ "$item" -le "16" ];
	do
		xmldbc -d /network_mgr/$LAN/ipv6/item:$item/ipv6address
		xmldbc -d /network_mgr/$LAN/ipv6/item:$item/prefix_length
		xmldbc -d /network_mgr/$LAN/ipv6/item:$item
        item=`expr $item + 1`
	done

	xmldbc -D  /etc/NAS_CFG/config.xml
	#save_mtd  /etc/NAS_CFG/config.xml
fi


	# Site-Local address
	SITE_COUNT=`ifconfig -a $interface_name | grep inet6 | grep Scope:Site | sed -e 's/^.*addr: //' -e 's/ .*$//' | wc -l`
#echo SITE_COUNT=$SITE_COUNT

	OLD_COUNT=$(xmldbc -i -g "/site/$LAN/ipv6/count")
	if [ "$SITE_COUNT" != "0" -a "$SITE_COUNT" != "$OLD_COUNT" ]; then
		NEED_RELOAD_MODULE=1
	fi

	index=1
	item=1
	while [ "$index" -le "$SITE_COUNT" ];
	do
#echo index=$index---------
		getIPv6Address $IFACE Site $index
					#echo PREFIX:$PREFIX
					#echo PREFIX_LENGTH:$PREFIX_LENGTH
					#echo IPV6_ADDR:$IPV6_ADDR

		xmldbc -i -s /site/$LAN/ipv6/item:$item/ipv6address $IPV6_ADDR
		xmldbc -i -s /site/$LAN/ipv6/item:$item/prefix_length $PREFIX_LENGTH
        item=`expr $item + 1`
        index=`expr $index + 1`
	done
	xmldbc -i -s /site/$LAN/ipv6/count `expr $item - 1`


# default gateway
GATEWAY=`ip -6 route show | grep default | grep $IFACE | grep -v grep | awk '{print $3}' | awk NR==1`
if [ "$GATEWAY" != "" ]; then
	xmldbc -s /network_mgr/$LAN/ipv6/gateway   $GATEWAY
fi

if [ "$NEED_RELOAD_MODULE" == "1" ]; then
	load_module network $1 &
fi
