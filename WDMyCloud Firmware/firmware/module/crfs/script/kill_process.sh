#!/bin/sh

PROG_NAME=`basename $0`

if [ -z "$1" ] ; then
	echo "${PROG_NAME} Usage: ${PROG_NAME} all or ${PROG_NAME} /mnt/HD/HD_a2"
	exit 1
fi

if [ "$1" = "all" ] ; then
	kill_running_process
	exit 0
fi

echo "$PROG_NAME $1..." > /dev/kmsg
MNT=$1

mount | grep -q ${MNT}
if [ $? != 0 ] ; then
	echo "${PROG_NAME}: ${MNT} is not mounted"
	exit 1
fi

FUSER_FILE=/tmp/fuser_${RANDOM}

RETRY_COUNT=10
while [ ${RETRY_COUNT} -gt 0 ] ; do
	fuser -vm ${MNT} 1>${FUSER_FILE} 2>&1

	LINE_COUNT=`cat ${FUSER_FILE} | wc -l`
	[ ${LINE_COUNT} -le 2 ] && break

	echo "${PROG_NAME} ${MNT}: `expr ${LINE_COUNT} - 2` process(es) need to be stopped"

	LINE_NO=0
	cat ${FUSER_FILE} | while read LINE ; do
		# skip first 2 lines
		if [ ${LINE_NO} -ge 2 ] ; then
			PROCESS_ID=""
			PROCESS_NAME=""
			VAR_IDX=0
			for VAR in $LINE ; do
				[ ${VAR_IDX} -eq 1 ] && PROCESS_ID=$VAR
				[ ${VAR_IDX} -eq 3 ] && PROCESS_NAME=$VAR
				VAR_IDX=`expr ${VAR_IDX} + 1`
			done
			echo "${PROG_NAME} ${MNT}: stop ${PROCESS_NAME}(pid=${PROCESS_ID})"
			if [ "${PROCESS_NAME}" = "twonkyserver" ] ; then
				twonky.sh stop
			elif [ "${PROCESS_NAME}" = "docker" ] ; then
				TIMEOUT=60
				docker_daemon.sh stop
				while [ $TIMEOUT -gt 0 -a -e /proc/${PROCESS_ID} ] ; do
					TIMEOUT=`expr $TIMEOUT - 1`
					sleep 1
				done
			elif [ "${PROCESS_NAME}" = "wdphotodbmerger" -o "${PROCESS_NAME}" = "wddispatcherd" -o "${PROCESS_NAME}" = "wdnotifierd" -o "${PROCESS_NAME}" = "wdmcserverd" ] ; then
				/etc/init.d/wddispatcherd stop
				/etc/init.d/wdnotifierd stop
				/etc/init.d/wdphotodbmergerd stop
				/etc/init.d/wdmcserverd stop
				rm -f /tmp/WDMCDispatcher.pipe
			else
				kill -KILL ${PROCESS_ID}
			fi
		fi
		LINE_NO=`expr ${LINE_NO} + 1`
	done
	sleep 1
	RETRY_COUNT=`expr ${RETRY_COUNT} - 1`
done

unlink ${FUSER_FILE}

fuser -vmk ${MNT}

echo "$PROG_NAME done." > /dev/kmsg

exit 0
