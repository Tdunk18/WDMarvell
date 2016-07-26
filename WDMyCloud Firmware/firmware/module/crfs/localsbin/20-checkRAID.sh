#!/bin/sh
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
# check/repair RAID array
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /etc/system.conf
. /usr/local/sbin/drive_helper.sh

# if single drive system, then bypass restore raid on boot up.  This keeps system from slowing down due to extra disk-io following an upgrade.
if [ "$1" == "reboot" -a "$DVC_DRIVE_COUNT" == "1" ]; then exit 0; fi
# if an install/update has been started, or has not been cleaned up, do not touch the RAID
if [ -e /tmp/fw_upgrade_status -o -e /etc/.updateInProgress ]; then exit 0; fi

currentRootDevice=`cat /proc/cmdline | sed -n -e 's#\(.*\)\(root=\)\([/0-9A-Za-z]*\)\(.*\)#\3#p'`
if [ -z "$currentRootDevice" ]; then
    logger "no current root device specified"
    exit 1
fi

# check/restore the RAID set
restoreRaid

exit 0
