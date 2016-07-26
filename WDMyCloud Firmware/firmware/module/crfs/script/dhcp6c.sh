#!/bin/sh
# $1 : interface ( "0" or "1" ) (unused)
# $2 : start or stop

source /usr/local/modules/files/project_features

Usage()
{
	echo "usage: dhcp6c.sh interface# {start | stop}"
	echo "    where options are :"
	echo "      interface#:    0 or 1"
	exit 1
}

MakeConfFile()
{
# $1 : original interface name (egiga0, egiga1 or bond0)
# $2 : $IFACE (new interface name)

	cat /etc/wide-dhcpv6/dhcp6c.conf | \
	  sed -e "s/interface $1/interface $2/g" | \
	  > /etc/wide-dhcpv6/dhcp6c.conf.tmp

	mv  /etc/wide-dhcpv6/dhcp6c.conf.tmp /etc/wide-dhcpv6/dhcp6c.conf
}

#if [ "$1" != "0" -a "$1" != "1" ]; then
#	Usage
#fi

IPV6_MODE0=`xmldbc -g /network_mgr/lan0/ipv6/mode`
IPV6_MODE1=`xmldbc -g /network_mgr/lan1/ipv6/mode`

BOND_ENABLE=`xmldbc -g /network_mgr/bonding/enable`
VLAN_ENABLE0=$(xmldbc -g "/network_mgr/lan0/vlan_enable")
VLAN_ENABLE1=$(xmldbc -g "/network_mgr/lan1/vlan_enable")
VID0=$(xmldbc -g "/network_mgr/lan0/vlan_id")
VID1=$(xmldbc -g "/network_mgr/lan1/vlan_id")

MODEL=`xmldbc -g /hw_ver`

if [ "$PROJECT_FEATURE_BONDING" != "1" ]; then
	IPV6_MODE1=
	BOND_ENABLE=
	VLAN_ENABLE0=
	VLAN_ENABLE1=
fi

# modify config file
if [ "$BOND_ENABLE" == "1" ]; then
	#if [ "$IPV6_MODE0" == "dhcp" ]; then
		cp /usr/local/config/dhcp6c.conf.bond0 /etc/wide-dhcpv6/dhcp6c.conf
		if [ "$VLAN_ENABLE0" == "1" ]; then
			IFACE=bond0.$VID0
			MakeConfFile bond0 $IFACE
		else
			IFACE=bond0
		fi
	#fi
else
	if [ "$IPV6_MODE0" == "dhcp" ]; then
		cp /usr/local/config/dhcp6c.conf.egiga0 /etc/wide-dhcpv6/dhcp6c.conf
		if [ "$VLAN_ENABLE0" == "1" ]; then
			IFACE=egiga0.$VID0
			MakeConfFile egiga0 $IFACE
		else
			IFACE=egiga0
		fi
		cp /etc/wide-dhcpv6/dhcp6c.conf /etc/wide-dhcpv6/dhcp6c.conf.egiga0
	fi
	if [ "$IPV6_MODE1" == "dhcp" ]; then
		cp /usr/local/config/dhcp6c.conf.egiga1 /etc/wide-dhcpv6/dhcp6c.conf
		if [ "$VLAN_ENABLE1" == "1" ]; then
			IFACE=egiga1.$VID1
			MakeConfFile egiga1 $IFACE
		else
			IFACE=egiga1
		fi
		cp /etc/wide-dhcpv6/dhcp6c.conf /etc/wide-dhcpv6/dhcp6c.conf.egiga1
	fi

	if [ "$IPV6_MODE0" == "dhcp" -a "$IPV6_MODE1" == "dhcp"  ]; then
		if [ "$VLAN_ENABLE0" == "1" ]; then
			IFACE=egiga0.$VID0
		else
			IFACE=egiga0
		fi
		if [ "$VLAN_ENABLE1" == "1" ]; then
			IFACE="$IFACE egiga1.$VID0"
		else
			IFACE="$IFACE egiga1"
		fi
		cp  /etc/wide-dhcpv6/dhcp6c.conf.egiga0    /etc/wide-dhcpv6/dhcp6c.conf
		cat /etc/wide-dhcpv6/dhcp6c.conf.egiga1 >> /etc/wide-dhcpv6/dhcp6c.conf
	fi
fi

case $2 in
	start)
		#EXIST=`ps | grep dhcp6c | grep -v grep | grep -v dhcp6c.sh`
		#if [ "$EXIST" == "" ]; then
		#	sleep 1
		#	dhcp6c -c /etc/wide-dhcpv6/dhcp6c.conf -p /var/run/dhcp6c.pid $IFACE
		#else
		#	dhcp6ctl start interface $IFACE
		#fi
		DHCP6C=$(awk '{print $1}' /var/run/dhcp6c.pid) 2>/dev/null
		OLD_IFACE=`cat /tmp/dhcp6c.iface`
		IFACE_EXIST=`grep "$IFACE" /tmp/dhcp6c.iface`
		EXIST=`ps | grep dhcp6c | grep -v grep | grep -v dhcp6c.sh`
		#echo "OLD_IFACE=$OLD_IFACE;IFACE_EXIST=$IFACE_EXIST;DHCP6C=$DHCP6C" > /tmp/dhcp6c.txt
		if [ "$EXIST" == "" ]; then
			sleep 2
			dhcp6c -c /etc/wide-dhcpv6/dhcp6c.conf -p /var/run/dhcp6c.pid $IFACE
			echo "$IFACE" > /tmp/dhcp6c.iface
		elif [ "$IFACE_EXIST" == "" -a "$DHCP6C" != "" ]; then
			IF=$(awk '{print $1}' /tmp/dhcp6c.iface)
			dhcp6ctl stop  interface $IF
			IF=$(awk '{print $2}' /tmp/dhcp6c.iface)
			if [ "$IF" != "" ]; then
				dhcp6ctl stop  interface $IF
			fi
			sleep 2
			kill $DHCP6C 2>/dev/null
			sleep 2
			kill -9 $DHCP6C 2>/dev/null
			dhcp6c  -c /etc/wide-dhcpv6/dhcp6c.conf -p /var/run/dhcp6c.pid $IFACE
			echo "$IFACE" > /tmp/dhcp6c.iface
		else
			kill $DHCP6C 2>/dev/null
			sleep 2
			kill -9 $DHCP6C 2>/dev/null
			dhcp6c  -c /etc/wide-dhcpv6/dhcp6c.conf -p /var/run/dhcp6c.pid $IFACE
		fi
		;;

	stop)
		if [ "$PROJECT_FEATURE_BONDING" = "1" -a "$BOND_ENABLE" != "1" ]; then
			if [ "$IPV6_MODE0" == "dhcp" -o "$IPV6_MODE1" == "dhcp" ]; then
				echo "one of dhcp enabled"
				dhcp6ctl reload
				exit 1
			fi
		fi

		EXIST=`ps | grep dhcp6c | grep -v grep | grep -v dhcp6c.sh`
		if [ "$EXIST" != "" ]; then
#			dhcp6ctl stop  interface $IFACE
			IF=$(awk '{print $1}' /tmp/dhcp6c.iface)
			dhcp6ctl stop  interface $IF
			IF=$(awk '{print $2}' /tmp/dhcp6c.iface)
			if [ "$IF" != "" ]; then
				dhcp6ctl stop  interface $IF
			fi
		fi
		;;

	"")
		Usage
		;;
	*)
		Usage
		;;
esac
