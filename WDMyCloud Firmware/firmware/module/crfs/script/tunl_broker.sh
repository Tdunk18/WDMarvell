#!/bin/sh
# $1 : interface ( "0" or "1" )
# $2 : start or stop

Usage()
{
	echo "usage: tunl_broker.sh interface# {start | stop}"
	echo "    where options are :"
	echo "      interface#:    0 or 1"
	exit 1
}

if [ "$1" == "0" ]; then
	LAN=lan0
elif [ "$1" == "1" ]; then
	LAN=lan1
else
	Usage
fi

IP=`xmldbc -g /network_mgr/$LAN/ip`

case $2 in
	start)
		rm -f /tmp/tun?.txt	# for UI
		TUNL_ENABLE=$(xmldbc -g "/network_mgr/$LAN/tunnel_broker/enable")
		USERNAME=$(xmldbc -g "/network_mgr/$LAN/tunnel_broker/username")
		PASSWORD=$(xmldbc -g "/network_mgr/$LAN/tunnel_broker/password")
		SERVER=$(xmldbc -g "/network_mgr/$LAN/tunnel_broker/server")
#echo "ENABLE   ($TUNL_ENABLE)"
#echo "USERNAME ($USERNAME)"
#echo "PASSWORD ($PASSWORD)"
#echo "SERVER   ($SERVER)"

		if [ "$SERVER" == "" ]; then
			exit 1
		fi

		cp  /etc/gogoc.conf /etc/gogoc.conf.tmp
		cat /etc/gogoc.conf.tmp | sed -e "s/^server=.*$/server=$SERVER/g" > /etc/gogoc.conf.tmp2
		mv  /etc/gogoc.conf.tmp2 /etc/gogoc.conf.tmp

		if [ "$USERNAME" != "" ]; then
			cat /etc/gogoc.conf.tmp | sed -e "s/^userid=.*$/userid=$USERNAME/g" > /etc/gogoc.conf.tmp2
			mv  /etc/gogoc.conf.tmp2 /etc/gogoc.conf.tmp
		fi

		if [ "$PASSWORD" != "" ]; then
			cat /etc/gogoc.conf.tmp | sed -e "s/^passwd=.*$/passwd=$PASSWORD/g" > /etc/gogoc.conf.tmp2
			mv  /etc/gogoc.conf.tmp2 /etc/gogoc.conf.tmp
		fi

		if [ "$USERNAME" != "" -o "$PASSWORD" != "" ]; then
			cat /etc/gogoc.conf.tmp | sed -e "s/^auth_method=.*$/auth_method=any/g" > /etc/gogoc.conf.tmp2
			mv  /etc/gogoc.conf.tmp2 /etc/gogoc.conf.tmp
		else
			cat /etc/gogoc.conf.tmp | sed -e "s/^auth_method=.*$/auth_method=anonymous/g" > /etc/gogoc.conf.tmp2
			mv  /etc/gogoc.conf.tmp2 /etc/gogoc.conf.tmp
		fi

		mv /etc/gogoc.conf.tmp /etc/gogoc.conf.tun$1

		insmod /usr/local/modules/driver/tun.ko
		sysctl -w net.ipv6.conf.default.disable_ipv6=0
		sysctl -w net.ipv6.conf.tunl0.disable_ipv6=0
		sysctl -w net.ipv6.conf.lo.disable_ipv6=0

		sysctl -w net.ipv6.conf.ip6tnl0.disable_ipv6=0
		sysctl -w net.ipv6.conf.sit0.disable_ipv6=0

		gogoc -f /etc/gogoc.conf.tun$1 -u tun$1 -s $IP &
		sleep 1
		echo `ps | grep gogoc | grep tun$1 | awk '{print $1}'` > /var/run/tun$1.pid
		;;

	stop)
		kill -9 `awk '{print $1}' /var/run/tun$1.pid` 2>/dev/null
		xmldbc -s /network_mgr/$LAN/tunnel_broker/ipv6address ""

		TUNL_ENABLE_0=$(xmldbc -g "/network_mgr/lan0/tunnel_broker/enable")
		TUNL_ENABLE_1=$(xmldbc -g "/network_mgr/lan1/tunnel_broker/enable")
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
			IPV6_ENABLE_1=1
		fi

		if [ "$TUNL_ENABLE_0" == "0" -a "$TUNL_ENABLE_1" == "0" ]; then
			sleep 1
			rmmod tun

			sysctl -w net.ipv6.conf.tunl0.disable_ipv6=1
			sysctl -w net.ipv6.conf.ip6tnl0.disable_ipv6=1
			sysctl -w net.ipv6.conf.sit0.disable_ipv6=1

			if [ "$IPV6_ENABLE_0" == "0" -a "$IPV6_ENABLE_1" == "0" ]; then
				sysctl -w net.ipv6.conf.default.disable_ipv6=1
				sysctl -w net.ipv6.conf.lo.disable_ipv6=1
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
