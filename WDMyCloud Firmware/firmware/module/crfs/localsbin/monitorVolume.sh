#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# monitorVolume.sh 
#  Note: this is called by cron
#
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh
. /etc/nas/alert-param.sh
. /etc/system.conf
[ -f /usr/local/sbin/ledConfig.sh ] && . /usr/local/sbin/ledConfig.sh

MAX_USAGE_THRESH=95
MIN_USAGE_THRESH=93
lockFile="/tmp/monitorVolume"

# exit if in standby, or factory restore in progress
if [ -f /tmp/standby ] || [ -f ${reformatDataVolume} ]; then
	exit 0;
fi
# exit if system with no internal drives
if [ "${DVC_DRIVE_COUNT}" == "0" ]; then
	exit 0
fi
# exit if already another instance of script is in progress
lockfile-create --retry 0 "${lockFile}" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    exit 0
fi

# If script were to take longer than 5 minutes
lockfile-touch ${lockFile} &
pid="$!"

df | grep -q ${dataVolumeDevice}
if [ $? -ne 0 ] || [ -f /tmp/tst_volume ]; then
	if [ ! -f /tmp/volume_failed ]; then
		sendAlert.sh "${volumeFailure}"
	fi
        ledCtrl.sh LED_EV_VOLUME LED_STAT_ERR
	touch /tmp/volume_failed

    # clean up mutual exclusion
    kill "${pid}" >/dev/null 2>&1
    lockfile-remove ${lockFile} >/dev/null 2>&1

	exit 0
else
	rm -f /tmp/volume_failed
fi

# check DataVolume percent used
percentUsed=`getDataVolumePercentUsed.sh`
if [ -f /tmp/tst_freespace ] || [ "${percentUsed}" -gt "${MAX_USAGE_THRESH}" ]; then
	if [ ! -f ${diskWarningThresholdReached} ]; then
		sendAlert.sh "${diskNearCapacity}"
	fi
	if [ ! -f ${diskWarningThresholdReached} ]; then
		touch ${diskWarningThresholdReached}
	fi
else
	if [ "${percentUsed}" -le "${MIN_USAGE_THRESH}" ]; then
		if [ -f ${diskWarningThresholdReached} ]; then
			rm -f ${diskWarningThresholdReached}
		fi
	fi
fi

# clean up mutual exclusion
kill "${pid}" >/dev/null 2>&1
lockfile-remove ${lockFile} >/dev/null 2>&1
