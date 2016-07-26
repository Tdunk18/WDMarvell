#!/bin/sh

PS_FILE=/tmp/ps_${RANDOM}
ps > ${PS_FILE}

LAZYINIT=0
cat ${PS_FILE} | grep -q "ext4lazyinit"
[ $? -eq 0 ] && LAZYINIT=1

unlink ${PS_FILE}

if [ -z "$1" ] ; then
	echo "ext4lazyinit=${LAZYINIT}"
	exit ${LAZYINIT}
fi

MNT_OPT=""
if [ "$1" = "on" ] ; then
	[ ${LAZYINIT} -eq 0 ] && MNT_OPT="init_itable=10"
elif [ "$1" = "off" ] ; then
	[ ${LAZYINIT} -eq 1 ] && MNT_OPT="noinit_itable"
else
	echo "EX: $0 on/off"
	exit 2
fi

[ -z "${MNT_OPT}" ] && exit 0

ls -1 /mnt/HD/ | while read LINE ; do
	MNT_PATH=/mnt/HD/${LINE}
	mount | grep -q ${MNT_PATH}
	[ $? -eq 0 ] && mount -o remount,${MNT_OPT} ${MNT_PATH}
done

exit 0
