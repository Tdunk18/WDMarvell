#!/bin/sh

[ -z "$1" ] && exit 1
MOUNT_PATH=$1

mount | grep -q ${MOUNT_PATH}
[ $? -ne 0 ] && exit 0

RET=2
RETRY_CNT=10
while [ ${RETRY_CNT} -gt 0 ] ; do
	fuser -mk ${MOUNT_PATH}
	umount ${MOUNT_PATH}
	if [ $? -eq 0 ] ; then
		RET=0
		break
	fi
	RETRY_CNT=`expr $RETRY_CNT - 1`
done

exit ${RET}
