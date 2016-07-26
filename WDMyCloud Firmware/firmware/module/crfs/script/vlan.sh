#!/bin/sh


set_ipv6_addr()
{
	#$1: lan0 or lan1
	#$2: lan interface name
	#$3: vlan interface name

	LAN=$1
	IFACE=$2
	VIFACE=$3
	IPV6_MODE=$(xmldbc -g "/network_mgr/$LAN/ipv6/mode")

	IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/local_ipv6address")
	PREFIX_LENGTH=$(xmldbc -g "/network_mgr/$LAN/ipv6/local_prefix_length")
	ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE

	case $IPV6_MODE in
		off)
			;;
		auto)
			# Global address
			#-PORTNUM=$(echo $1 | sed 's/lan//g')
			#-getIPv6Address.sh $PORTNUM	# it will get address of new interface (none)
			COUNT=$(xmldbc -g "/network_mgr/$LAN/ipv6/count")
			index=1
			while [ "$index" -le "$COUNT" ];
			do
				IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/item:$index/ipv6address")
				PREFIX_LENGTH=$(xmldbc -g "/network_mgr/$LAN/ipv6/item:$index/prefix_length")
				ip -6 addr  add $IPV6_ADDR/$PREFIX_LENGTH dev $VIFACE
				ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE
				index=`expr $index + 1`
			done

			# 
			COUNT=`ifconfig -a $IFACE | grep inet6 | grep Scope:Global | sed -e 's/^.*addr: //' -e 's/ .*$//' | wc -l`
			#echo COUNT=$COUNT
			index=1
			while [ "$index" -le "$COUNT" ];
			do
				PREFIX=`ifconfig -a $IFACE | grep inet6 | grep Scope:Global | sed -e 's/^.*addr: //' -e 's/ .*$//' | awk NR==1`
					#echo PREFIX:$PREFIX
				PREFIX_LENGTH=`echo $PREFIX | awk '{FS="/"} {print $2}'`
					#echo PREFIX_LENGTH:$PREFIX_LENGTH
				IPV6_ADDR=`echo $PREFIX | awk '{FS="/"} {print $1}'`
					#echo IPV6_ADDR:$IPV6_ADDR

				ip -6 addr  add $IPV6_ADDR/$PREFIX_LENGTH dev $VIFACE
				ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE
				index=`expr $index + 1`
			done

			# Site-Local address
			COUNT=`ifconfig -a $IFACE | grep inet6 | grep Scope:Site | sed -e 's/^.*addr: //' -e 's/ .*$//' | wc -l`
			#echo COUNT=$COUNT
			index=1
			while [ "$index" -le "$COUNT" ];
			do
				PREFIX=`ifconfig -a $IFACE | grep inet6 | grep Scope:Site | sed -e 's/^.*addr: //' -e 's/ .*$//' | awk NR==1`
					#echo PREFIX:$PREFIX
				PREFIX_LENGTH=`echo $PREFIX | awk '{FS="/"} {print $2}'`
					#echo PREFIX_LENGTH:$PREFIX_LENGTH
				IPV6_ADDR=`echo $PREFIX | awk '{FS="/"} {print $1}'`
					#echo IPV6_ADDR:$IPV6_ADDR

				ip -6 addr  add $IPV6_ADDR/$PREFIX_LENGTH dev $VIFACE
				ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE
				index=`expr $index + 1`
			done

			;;
		dhcp)
			IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/dhcp_ipv6address")
			PREFIX_LENGTH=$(xmldbc -g "/network_mgr/$LAN/ipv6/dhcp_prefix_length")
			if [ "$IPV6_ADDR" != "" ]; then
				ip -6 addr  add $IPV6_ADDR/$PREFIX_LENGTH dev $VIFACE
				ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE
			fi
			;;
		static)
			IPV6_ADDR=$(xmldbc -g "/network_mgr/$LAN/ipv6/item:1/ipv6address")
			PREFIX_LENGTH=$(xmldbc -g "/network_mgr/$LAN/ipv6/item:1/prefix_length")
			if [ "$IPV6_ADDR" != "" ]; then
				ip -6 addr  add $IPV6_ADDR/$PREFIX_LENGTH dev $VIFACE
				ip -6 addr  del $IPV6_ADDR/$PREFIX_LENGTH dev $IFACE
			fi
			;;
	esac
}

LAN=lan$1
LANIF=egiga$1

BOND_ENABLE=$(xmldbc -g "/network_mgr/bonding/enable")
if [ "$BOND_ENABLE" == "1" ]; then
	LANIF=bond0
fi

VLAN_ENABLE=$(xmldbc -g "/network_mgr/$LAN/vlan_enable")
if [ $2 == "stop" ]; then
	VLAN_ENABLE=0
fi

UDHCPC=$(awk '{print $1}' /var/run/udhcpc$1.pid)
kill -9 $UDHCPC 2>/dev/null
kill -9 $(pidof zcip) 2>/dev/null
if [ $VLAN_ENABLE == "1" ]; then
	#echo "**VLAN ENABLE****"
	DHCP_ENABLE=$(xmldbc -g "/network_mgr/$LAN/dhcp_enable")
	VID=$(xmldbc -g "/network_mgr/$LAN/vlan_id")
	VLAN=$LANIF.${VID}
	#echo "VLAN= $VLAN"
	vconfig add $LANIF $VID

	if [ $DHCP_ENABLE == "1" ]; then
		echo "VLAN DHCP IP"
		/sbin/ifconfig $VLAN 0.0.0.0
		VIP=$(xmldbc -g "/network_mgr/$LAN/ip")
		
		#MODEL=$(xmldbc -g "/hw_ver")
		MODEL=$(xmldbc -g "/system_mgr/samba/netbios_name")
		busybox_version=`busybox | grep -r "v1.11"`
		if [ -n "$busybox_version" ]; then
			#busybox v1.11
			/sbin/udhcpc -r $VIP -i $VLAN -H $MODEL -p /var/run/udhcpc$1.pid -s /usr/share/udhcpc/default.script -b
		else
			#busybox v1.20 later
			/sbin/udhcpc -R -r $VIP -i $VLAN -x hostname:$MODEL -p /var/run/udhcpc$1.pid -s /usr/share/udhcpc/default.script -b
		fi
		
	else
		echo "VLAN STATIC IP"
		while ip -f inet addr del dev $VLAN; do
    	: 
  		done
  		
		VIP=$(xmldbc -g "/network_mgr/$LAN/ip")
		VNETMASK=$(xmldbc -g "/network_mgr/$LAN/netmask")
		/sbin/ifconfig $VLAN $VIP netmask $VNETMASK
		
		DEFAULT_GATEWAY=$(xmldbc -g "/network_mgr/default_gw")
		if [ "$DEFAULT_GATEWAY" == $LAN ]; then
			while route del default gw 0.0.0.0 dev $VLAN ; do
			:
			done
			GATEWAY=$(xmldbc -g "/network_mgr/$LAN/gateway")
			if [ "$GATEWAY" != "" ]; then
				route add default gw $GATEWAY dev $VLAN
			else
				route add default dev $VLAN metric 99
			fi
		fi
	fi
	
	/sbin/ifconfig $LANIF 0.0.0.0
	
	route add -net 224.0.0.0 netmask 240.0.0.0 dev $VLAN

	set_ipv6_addr $LAN $LANIF $VLAN
else
	echo "**VLAN DISABLE****"
	grep "$LANIF" /proc/net/vlan/config | awk '{print $1}' > ./tcfg$1
	sed 's/^/vconfig rem /' ./tcfg$1 > ./delcfg$1
	chmod +x ./delcfg$1
	./delcfg$1
	rm -f ./tcfg$1
	rm -f ./delcfg$1
fi
