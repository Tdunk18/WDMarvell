#!/bin/sh

source /usr/local/modules/files/project_features

PROG_NAME=`basename $0`

XMLDB_SOCK_SYSINFO=/var/run/xmldb_sock_sysinfo

# getopt
RM_CFG=0
if [ "$1" = "--remove-config" ] ; then
	RM_CFG=1
	shift
fi

if [ -z "$1" ] ; then
	echo "Usage: ${PROG_NAME} Volume_1 or ${PROG_NAME} /mnt/HD/HD_a2"
	exit 1
fi

echo "$PROG_NAME $1..." > /dev/kmsg

VOL_LABEL=""
VOL_DEV=""
VOL_MNT=""
VOL_UUID=""

if [ "$1" = "all" ] ; then
	VOL_MNT="all"
else
	VOL_CNT=`xmldbc -S ${XMLDB_SOCK_SYSINFO} -g /vols/vol#`
	VOL_ID=1
	while [ ${VOL_ID} -le ${VOL_CNT} ] ; do
		VOL_LABEL=`xmldbc -S ${XMLDB_SOCK_SYSINFO} -g /vols/vol:${VOL_ID}/label`
		VOL_MNT=`xmldbc -S ${XMLDB_SOCK_SYSINFO} -g /vols/vol:${VOL_ID}/mnt`
		VOL_UUID=`xmldbc -S ${XMLDB_SOCK_SYSINFO} -g /vols/vol:${VOL_ID}/uuid`
		if [ "$1" = "${VOL_LABEL}" -o "$1" = "${VOL_MNT}" ] ; then
			break
		fi
		VOL_ID=`expr ${VOL_ID} + 1`
	done

	if [ ${VOL_ID} -gt ${VOL_CNT} ] ; then
		echo "Usage: ${PROG_NAME} $1: unable to find in xmldb"
		exit 1
	fi
fi

# remove config and stop
# umount iso share +20140724.VODKA
if [ ${RM_CFG} = 1 ] ; then
	if [ "${VOL_MNT}" = "all" ] ; then
		smbcmd -f all
		ftp kill_xml
	else
		if [ "$PROJECT_FEATURE_ISCSI" = "1" ] ; then
			iscsictl --rm_uuid -u ${VOL_UUID}
		fi
		iso_mount -t ${VOL_MNT}
		smbcmd -f ${VOL_UUID}
	fi
else
	if [ "${VOL_MNT}" = "all" ] ; then
		echo ""
	else
		if [ "$PROJECT_FEATURE_ISCSI" = "1" ] ; then
			iscsictl --stop_uuid -u ${VOL_UUID}
		fi
		iso_mount -s ${VOL_MNT}
	fi
fi

# kill process
kill_process.sh ${VOL_MNT}

# reload nfs conf to avoid blocking umount process.
nfs_config -r ${VOL_MNT}

# sleep 1 second to avoid unmount failed
sleep 1

echo "$PROG_NAME done." > /dev/kmsg

exit 0

