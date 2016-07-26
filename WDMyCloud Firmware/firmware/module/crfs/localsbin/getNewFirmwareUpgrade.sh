#!/bin/sh
#
# getNewFirmwareUpgrade.sh <immediate> <send_alert>
#
# returns:
#  "<name>"
#  "<version>"
#  "<description>"
#  "<linktoimage>"
# -OR-
# "no upgrade"
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

fw_upgrade="/tmp/fw_upgrade_info"
send_alert=0

if [ "${2}" == "send_alert" ]; then
	send_alert=1
fi

# clear old files from aborted update attempts
rm -f /tmp/fw_upgrade_link

# check the file to make sure 
if [ "$1" != "immediate" ]; then
    if [ -f ${fw_upgrade} ]; then
        cat ${fw_upgrade}
    else
        echo "\"no upgrade\""
    fi
    exit 0
fi

auto_fw -c ${send_alert} > /dev/null 2>&1	# check version and create $fw_upgrade file

cat ${fw_upgrade}
