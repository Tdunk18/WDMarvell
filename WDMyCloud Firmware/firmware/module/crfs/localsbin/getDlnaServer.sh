#!/bin/sh
#
# © 2012 Western Digital Technologies, Inc. All rights reserved.
#
# Modified by Vodka@Alpha

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

# update twonky status
if [ -f /var/run/mediaserver.pid ]; then
	echo enabled > /etc/nas/service_startup/twonky
else 
	echo disabled > /etc/nas/service_startup/twonky
fi

# always return twonky 
echo twonky
# setting=`cat "/etc/nas/service_startup/twonky" | tr "[:upper:]" "[:lower:]"`

# if [ "$setting" == "enabled" ] || [ "$setting" == "disabled" ];then
  # echo twonky
# else
  # echo ""
# fi
