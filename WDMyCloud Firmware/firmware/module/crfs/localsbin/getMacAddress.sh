#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# © 2010 Western Digital Technologies, Inc. All rights reserved.
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

bond=`xmldbc -g /network_mgr/bonding/enable`

#enhance get one mac address which is connected with network +20150313.VODKA
if [ "$bond" == "1" ]; then
  mac="bond0"
  ifconfig | grep "$mac" | awk '{ print $5 }'
elif [ "$bond" == "0" ]; then
  port=("egiga0" "egiga1")
  
  #only return one port with network cable
  for i in "${port[@]}"; do
     connect=`ethtool $i | grep Link | grep yes`
	 if [ ! -z "$connect" ]; then
	    mac=`ifconfig | grep "$i" | awk '{ print $5 }'`
		echo "$mac"
		exit
	 fi
  done
  #if no network cable connect
  for i in "${port[@]}"; do
	mac=`ifconfig | grep "$i" | awk '{ print $5 }'`
	#only return one port with network cable
	if [ ! -z "${mac}" ]; then
	  echo "$mac"
	  exit
	fi
  done  
fi



# but two network interface?
