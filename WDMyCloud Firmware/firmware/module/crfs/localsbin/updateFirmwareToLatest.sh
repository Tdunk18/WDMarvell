#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# updateFirmwareToLatest.sh <url_link> <reboot>
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
# . /usr/local/sbin/share-param.sh
# . /usr/local/sbin/disk-param.sh

# source /etc/system.conf

# OPT_REBOOT=""
OPT_LINK=""
do_reboot=0

if [ "${1}" == "reboot" ]; then		#	reboot	<link>
    # OPT_REBOOT='true'
	do_reboot=1
    OPT_LINK="${2}"
else
    OPT_LINK="${1}"					#	<link>	<reboot>
    if [ "${2}" == "reboot" ]; then
        #OPT_REBOOT='true'
		do_reboot=1
    fi
fi

rm -f /tmp/fw_upgrade_url
if [ ! -z "${OPT_LINK}" ]; then		# hwalock: check /tmp/fw_upgrade_url in update_firmware
    echo -n "${OPT_LINK}" > /tmp/fw_upgrade_url
fi

do_reboot=1
auto_fw -f ${do_reboot}		# check & download fw, and write error msg to /tmp/fw_update_status

status=$?	# fail: -1 	success: 0


rm -f /tmp/fw_upgrade_url
exit $status
