#!/bin/sh

LAN=lan$1
LANIF=egiga$1

UDHCPC=$(awk '{print $1}' /var/run/udhcpc$1.pid)
kill -9 $UDHCPC 2>/dev/null
kill -9 $(pidof zcip) 2>/dev/null
DHCP_ENABLE=$(xmldbc -g "/network_mgr/$LAN/dhcp_enable")
if [ $DHCP_ENABLE == "1" ]; then
	IP=$(xmldbc -g "/network_mgr/$LAN/ip")
	
	#MODEL=$(xmldbc -g "/hw_ver")
	MODEL=$(xmldbc -g "/system_mgr/samba/netbios_name")
	#echo $IP
	busybox_version=`busybox | grep -r "v1.11"`
	if [ -n "$busybox_version" ]; then
		#busybox v1.11
		/sbin/udhcpc -r $IP -i $LANIF -H $MODEL -p /var/run/udhcpc$1.pid -s /usr/share/udhcpc/default.script -b
	else
		#busybox v1.20 later
		/sbin/udhcpc -R -r $IP -i $LANIF -x hostname:$MODEL -p /var/run/udhcpc$1.pid -s /usr/share/udhcpc/default.script -b
	fi
	
else
	while ip -f inet addr del dev $LANIF; do
    	: 
  	done
	IP=$(xmldbc -g "/network_mgr/$LAN/ip")
	NETMASK=$(xmldbc -g "/network_mgr/$LAN/netmask")
	/sbin/ifconfig $LANIF $IP netmask $NETMASK
	GATEWAY=$(xmldbc -g "/network_mgr/$LAN/gateway")
	#echo $GATEWAY

	DEFAULT_GATEWAY=$(xmldbc -g "/network_mgr/default_gw")
	if [ "$DEFAULT_GATEWAY" == $LAN ]; then
		while route del default gw 0.0.0.0 dev $LANIF ; do
			:
		done
		if [ "$GATEWAY" != "" ]; then
			route add default gw $GATEWAY dev $LANIF
		else
			route add default dev $LANIF metric 99
		fi	
	fi
fi
# set multicast
route add -net 224.0.0.0 netmask 240.0.0.0 dev $LANIF
