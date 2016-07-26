#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
# Modified by Alpha.Vodka

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

if [ -f /tmp/wd_serial.txt ];then
   sn=`cat /tmp/wd_serial.txt`
   #echo $sn
   if [ "$sn" != "" ]; then
   	   cat /tmp/wd_serial.txt;
   else
	   #echo WXF1A61E2119
	   #WX+MAC for serian number +20141017.VODKA
	   mac=`/usr/local/sbin/getMacAddress.sh | sed 's/^...//g' | sed 's/://g'`
	   echo "WX${mac}"
   fi
else
  #echo WXF1A61E2119
  mac=`/usr/local/sbin/getMacAddress.sh | sed 's/^...//g' | sed 's/://g'`
  echo "WX${mac}"
fi
