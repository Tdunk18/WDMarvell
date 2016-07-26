#!/bin/bash
#
# � 2011 Western Digital Technologies, Inc. All rights reserved.
#
# getTimeMachine.sh

#---------------------


PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh

timeMachineConfig=/etc/nas/timeMachine.conf
. $timeMachineConfig

if [ $# -ne 0 ]; then
	echo "usage: getTimeMachine.sh"
	exit 1
fi

echo "backupEnabled=$backupEnabled"
echo "backupShare=$backupShare"
echo "backupSizeLimit=$backupSizeLimit"
