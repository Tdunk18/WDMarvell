#!/bin/sh

SOCK_FILE=/var/run/xmldb_sock_sysinfo
CONF_FILE=/etc/raid_drives_info.conf
CONF_FILE_ORIGINAL=/tmp/raid_drives_info.conf
PROCESS_LOCK=/tmp/run_raid_get_drives_info

_exit()
{
	exit $1
}

query_disk()
{
	NAME=$1

	DISK_IDX=1
	DISK_SLOT=`xmldbc -S ${SOCK_FILE} -g /disks/disk#`
	DISK_NAME=""
	while [ ${DISK_IDX} -le ${DISK_SLOT} ] ; do
		DISK_NAME=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/name`
		if [ -n "${DISK_NAME}" -a "${NAME}" = "${DISK_NAME}" ] ; then
			break
		fi
		DISK_IDX=`expr ${DISK_IDX} + 1`
	done
	if [ ${DISK_IDX} -gt ${DISK_SLOT} ] ; then
		DISK_IDX=0
	fi
	echo "${DISK_IDX}"
}

query_raid()
{
	UUID=$1

	RAID_IDX=1
	RAID_ID=""
	RAID_UUID=""
	while [ 1 ] ; do
		RAID_ID=`xmldbc -S ${SOCK_FILE} -g /raids/raid:${RAID_IDX}/id`
		if [ -z "${RAID_ID}" ] ; then
			RAID_IDX=0
			break
		fi
		RAID_UUID=`xmldbc -S ${SOCK_FILE} -g /raids/raid:${RAID_IDX}/uuid`
		if [ "${UUID}" = "${RAID_UUID}" ] ; then
			break
		fi
		RAID_IDX=`expr ${RAID_IDX} + 1`
	done
	echo "${RAID_IDX}"
}

get_mnt()
{
	DEV_OR_MNT=$1
	MNT=`mount | grep ${DEV_OR_MNT} | awk '{print $3}'`
	echo "${MNT}"
}

get_raid_level_of_disk()
{
	RET_STR=""
	DISK_NAME=$1
	# check disk is used to create RAID before?
	# 1st partition: 512MiB or 1024MiB, for swap
	# 4th partition: 1024MiB, for system
	# 2nd partition: for RAID
	
	while [ 1 ] ; do
		if [ ! -e /dev/${DISK_NAME}1 -o ! -e /dev/${DISK_NAME}2 -o ! -e /dev/${DISK_NAME}4 ] ; then
			break
		fi
		# check 1st partition
		PART1_SIZE=`blockdev --getsize64 /dev/${DISK_NAME}1`
		if [ $? != 0 ] ; then
			break
		fi
		PART1_SIZE=`expr ${PART1_SIZE} / 1024 / 1024`
		# check swap partition is 512MB or 2048MiB
		if [ "${PART1_SIZE}" != "512" -a "${PART1_SIZE}" != "2048" ] ; then
			break
		fi

		# check 4th partition
		PART4_SIZE=`blockdev --getsize64 /dev/${DISK_NAME}4`
		if [ $? != 0 ] ; then
			break
		fi
		PART4_SIZE=`expr ${PART4_SIZE} / 1024 / 1024`
		# check hidden partition is 1024MB
		if [ "${PART4_SIZE}" != "1024" ] ; then
			break
		fi

		# check 2nd partition
		INFO_FILE=/tmp/raid_level_of_${DISK_NAME}2
		if [ -f ${INFO_FILE} ] ; then
			RET_STR=`cat ${INFO_FILE}`
		else
			mdadm --examine /dev/${DISK_NAME}2 > /dev/null 2>/dev/null
			if [ $? = 0 ] ; then
				RET_STR=`mdadm --examine /dev/${DISK_NAME}2 | grep "Raid Level" | awk '{print $4}'`
			else
				RET_STR="standard"
			fi
			echo ${RET_STR} > ${INFO_FILE}
		fi
		break
	done
	echo "${RET_STR}"
}

# when raid_init is in progress, a backup config file is generated
if [ -e ${CONF_FILE_ORIGINAL} ] ; then
	cp -af ${CONF_FILE_ORIGINAL} ${CONF_FILE}
	echo "${CONF_FILE}"
	_exit 0
fi

VOL_IDX=1
VOL_NUM=""
VOL_UUID=""

while [ -f ${PROCESS_LOCK} ] ; do
	sleep `expr $RANDOM % 10 + 1`
done
touch ${PROCESS_LOCK}

rm -f ${CONF_FILE}

while [ 1 ] ; do
	VOL_LABEL=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/label`
	if [ -z "${VOL_LABEL}" ] ; then
		break
	fi
	VOL_UUID=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/uuid`

	echo "[raid_partition_${VOL_IDX}]" >> ${CONF_FILE}
	echo "partition_uuid=${VOL_UUID}" >> ${CONF_FILE}
	echo "" >> ${CONF_FILE}

	VOL_IDX=`expr ${VOL_IDX} + 1`
done

DISK_IDX=1
DISK_SLOT=`xmldbc -S ${SOCK_FILE} -g /disks/disk#`
while [ ${DISK_IDX} -le ${DISK_SLOT} ] ; do
	DISK_HOTPLUG="false"
	DISK_HOTPLUG_ADD=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_add`
	DISK_HOTPLUG_REMOVE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_remove`
	if [ -n "${DISK_HOTPLUG_ADD}" -o -n "${DISK_HOTPLUG_REMOVE}" ] ; then
		DISK_HOTPLUG="true"
	fi

	echo "[location_${DISK_IDX}]" >> ${CONF_FILE}
	echo "busy=${DISK_HOTPLUG}" >> ${CONF_FILE}

	if [ "${DISK_HOTPLUG}" = "false" ] ; then
		DISK_NAME=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/name`
		if [ -n "${DISK_NAME}" ] ; then
			DISK_MODEL=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/model`
			DISK_SN=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/sn`
			DISK_SIZE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/size`
			DISK_ALLOWED=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/allowed`
			DISK_SMART_TEST=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/smart_test`
			if [ "${DISK_ALLOWED}" = "1" ] ; then
				DISK_ALLOWED="allowed"
			else
				DISK_ALLOWED="restricted"
			fi
			DISK_REMOVABLE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/removable`
			if [ "${DISK_REMOVABLE}" = "1" ] ; then
				DISK_REMOVABLE="true"
			else
				DISK_REMOVABLE="false"
			fi
	
			RAID_LEVEL=`get_raid_level_of_disk ${DISK_NAME}`
	
			RAID_MODE=""
			case ${RAID_LEVEL} in
				"standard")
					RAID_MODE=11
					;;
				"linear")
					RAID_MODE=12
					;;
				"raid0")
					RAID_MODE=0
					;;
				"raid1")
					RAID_MODE=1
					;;
				"raid5")
					RAID_MODE=5
					;;
				"raid10")
					RAID_MODE=10
					;;
				*)
					;;
			esac
			
			echo "model=${DISK_MODEL}" >> ${CONF_FILE}
			echo "serial_number=${DISK_SN}" >> ${CONF_FILE}
			echo "drive_size=${DISK_SIZE}" >> ${CONF_FILE}
			echo "valid_drive_list=${DISK_ALLOWED}" >> ${CONF_FILE}
			echo "smart_status=${DISK_SMART_TEST}" >> ${CONF_FILE}
			echo "raid_mode=${RAID_MODE}" >> ${CONF_FILE}
			echo "removable=${DISK_REMOVABLE}" >> ${CONF_FILE}
		fi
	fi

	echo "" >> ${CONF_FILE}

	DISK_IDX=`expr ${DISK_IDX} + 1`
done

echo "${CONF_FILE}"
rm -f ${PROCESS_LOCK}
_exit 0
