#!/bin/sh
# $1: mode
# $2: [ restart ]

ETH0=egiga0
ETH1=egiga1

PARMS="miimon=500 use_carrier=1 downdelay=1000 updelay=1000"
case $1 in
	"0")	# balance-rr
		PARMS="$PARMS "
		;;
	"1")	# active-backup
		#PARMS="$PARMS primary=$ETH0"
		;;
	"2")	# balance-xor
		PARMS="$PARMS "
		;;
	"3")	# broadcast
		PARMS="$PARMS "
		;;
	"4")	# 802.3ad
		PARMS="$PARMS lacp_rate=slow"
		;;
	"5")	# balance-tlb
		PARMS="$PARMS "
		;;
	"6")	# balance-alb
		PARMS="$PARMS updelay=5000"
		;;
	"stop")	# 
		BOND0=`ifconfig | grep bond0 | grep -v grep`
		if [ "$BOND0" != "" ]; then
			ifenslave -d bond0 $ETH0 $ETH1	#detach
			ifconfig bond0 down
		fi
		rmmod bonding 2> /dev/null
		
		ifconfig $ETH0 up
		ifconfig $ETH1 up

		#/etc/rc.d/rc.init.sh 0
		#/etc/rc.d/rc.init.sh 1
		exit 1
		;;

	"")		# Null
		echo "Usage: $0 {0~6} [restart]"
		exit 1
		;;
	*)		# bad
		echo "Usage: $0 {0~6} [restart]"
		exit 1
		;;
esac
#echo "mode=$1" $PARMS

IP=`xmldbc -g /network_mgr/lan0/ip`
NETMASK=`xmldbc -g /network_mgr/lan0/netmask`

if [ "$2" == "restart" ]; then
	echo "bonding starting ..."
	BOND0=`ifconfig | grep bond0 | grep -v grep`
	if [ "$BOND0" != "" ]; then
		ifenslave -d bond0 $ETH0 $ETH1	#detach
	fi
	rmmod bonding 2> /dev/null
	sleep 1

	echo "insmod /usr/local/modules/driver/bonding.ko mode=$1 $PARMS"
	insmod /usr/local/modules/driver/bonding.ko mode=$1 $PARMS
	sleep 1
	#Bing fixed dhcp bug. In this level, we only need to up the bond0 interface. We don't set the ip
	#into the interface.
#	ifconfig bond0 $IP netmask $NETMASK up
	ifconfig bond0 up
	sleep 1
	ifenslave  bond0 $ETH0 $ETH1

	# ipv6
	IPV6_MODE=$(xmldbc -g "/network_mgr/lan0/ipv6/mode")
	if [ "$IPV6_MODE" != "off" ]; then
		ipv6.sh 0 start
	fi

fi

# add gateway
#kill -9 `pidof udhcpc` 2>/dev/null
#kill -9 `pidof zcip` 2>/dev/null
DHCP_ENABLE=`xmldbc -g /network_mgr/lan0/dhcp_enable`
if [ "$DHCP_ENABLE" == "0" ]; then
	kill -9 `pidof udhcpc` 2>/dev/null
	kill -9 `pidof zcip` 2>/dev/null

	while ip -f inet addr del dev bond0; do
		: 
	done
	ifconfig bond0 $IP netmask $NETMASK up

	GATEWAY=`xmldbc -g /network_mgr/lan0/gateway`
	DEFAULT_GATEWAY=`xmldbc -g /network_mgr/default_gw`
	if [ "$GATEWAY" != "" ]; then
		route add default gw $GATEWAY dev bond0
	else
		route add default dev bond0 metric 99
	fi
else
	# don't restart udhcpc to avoid restart smb (ITR#101171)
	DHCP_PROCESS=`pidof udhcpc`
	if [ "x$DHCP_PROCESS" == "x" ]; then
#		kill -9 `pidof udhcpc` 2>/dev/null
		kill -9 `pidof zcip` 2>/dev/null
		MODEL=$(xmldbc -g "/system_mgr/samba/netbios_name")
		/sbin/udhcpc -R -r $IP -i bond0 -x hostname:$MODEL -p /var/run/udhcpc0.pid -s /usr/share/udhcpc/default.script -b &
	else
		kill -SIGUSR1 `pidof udhcpc`
	fi
fi

# set multicast
route add -net 224.0.0.0 netmask 240.0.0.0 dev bond0
