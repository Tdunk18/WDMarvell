#!/bin/sh

if [ -z "$1" -o -z "$2" ] ; then
	echo "$0: need both old and new UUID."
	exit 1
fi

OLD_UUID=$1
NEW_UUID=$2

echo -e "UUID changed: \"${OLD_UUID}\" to \"${NEW_UUID}\"\n"


XMLDB_SYSINFO=/var/run/xmldb_sock_sysinfo
RAID_LEVEL=""
VOL_CNT=`xmldbc -S ${XMLDB_SYSINFO} -g /vols/vol#`
VOL_IDX=1

while [ $VOL_IDX -le $VOL_CNT ] ; do
	VOL_UUID=`xmldbc -S ${XMLDB_SYSINFO} -g /vols/vol:${VOL_IDX}/uuid`
	if [ "${VOL_UUID}" = "${NEW_UUID}" ] ; then
		RAID_LEVEL=`xmldbc -S ${XMLDB_SYSINFO} -g /vols/vol:${VOL_IDX}/raid_level`
		break
	fi
	VOL_IDX=`expr ${VOL_IDX} + 1`
done

RAID_MODE=""
case ${RAID_LEVEL} in
	"standard")
		RAID_MODE=1
		;;
	"jbod")
		RAID_MODE=2
		;;
	"raid0")
		RAID_MODE=3
		;;
	"raid1")
		RAID_MODE=4
		;;
	"raid5")
		RAID_MODE=5
		;;
	"raid10")
		RAID_MODE=6
		;;
	"raid6")
		RAID_MODE=8
		;;
	*)
		echo "Unable to get RAID level of volume(UUID=${VOL_UUID})"
		;;
esac

echo -e "Old UUID: ${OLD_UUID}\nNew UUID: ${NEW_UUID}" > /tmp/volume_uuid_change.iscsi

#for samba
smbcmd -u "${RAID_MODE}" -o ${OLD_UUID} -n ${NEW_UUID}

