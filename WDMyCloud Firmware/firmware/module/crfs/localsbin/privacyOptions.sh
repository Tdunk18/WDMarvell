#!/bin/bash
#
# (c) 2015 Western Digital Technologies, Inc. All rights reserved.
#
# privacyOptions.sh
#   returns true | false
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

if [ "$1" == "create" ]; then
    xmldbc -s /analytics 1
elif [ "$1" == "delete" ]; then
    xmldbc -s /analytics 0
else
    if [ `xmldbc -g /analytics` -eq 1 ]; then
         echo "send_serial_number=true"
    else
         echo "send_serial_number=false"
    fi
fi
