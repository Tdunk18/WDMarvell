#!/bin/bash
#
# . 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setNetworkStatic.sh
#
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
PID=`pidof udhcpc`
if [ "$1" == "renew" ]; then
  kill -SIGUSR1 $PID
fi
