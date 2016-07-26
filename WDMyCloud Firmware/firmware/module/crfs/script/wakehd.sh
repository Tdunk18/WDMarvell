#!/bin/sh

DISK_COUNT=$(xmldbc -S /var/run/xmldb_sock_sysinfo -g /disks/disk#)

DISK_INDEX=1
while [ ${DISK_INDEX} -le ${DISK_COUNT} ] ; do
	DISK_NAME=$(xmldbc -S /var/run/xmldb_sock_sysinfo -g /disks/disk:${DISK_INDEX}/name)
	if [ -n "${DISK_NAME}" ] ; then
		dd if=/dev/${DISK_NAME} of=/dev/null bs=1M count=1 skip=`expr ${RANDOM} % 1000` >/dev/null 2>&1 & echo $! > /var/run/wakehd_${DISK_NAME}.pid
	fi
	DISK_INDEX=$(expr $DISK_INDEX + 1)
done

TIMEOUT=30
DISK_INDEX=1
while [ ${DISK_INDEX} -le ${DISK_COUNT} ] ; do
	TIMEOUT=$(expr $TIMEOUT - 1)
	DISK_NAME=$(xmldbc -S /var/run/xmldb_sock_sysinfo -g /disks/disk:${DISK_INDEX}/name)
	if [ -n "${DISK_NAME}" ] ; then
		PID=`cat /var/run/wakehd_${DISK_NAME}.pid`
		if [ -n "${PID}" -a -e /proc/${PID} ] ; then
			if [ $TIMEOUT -le 0 ] ; then
				kill -KILL ${PID}
			else
				echo "waiting ${DISK_NAME}, pid=${PID}" > /dev/console
				sleep 1
			fi
			continue
		fi
	fi
	DISK_INDEX=$(expr $DISK_INDEX + 1)
done

rm -f /var/run/wakehd*
