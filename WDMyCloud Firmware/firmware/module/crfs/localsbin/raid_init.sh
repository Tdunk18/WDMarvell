#!/bin/sh

SOCK_FILE=/var/run/xmldb_sock_sysinfo

SOCK_FILE_RAID_INIT=/var/run/xmldb_sock_raid_init
PID_FILE_RAID_INIT=${SOCK_FILE_RAID_INIT}_config.pid

_exit()
{
	exit $1
}

_fail()
{
	echo "fail"
	_exit 1
}

# cannot accept arguments
if [ -n "$1" ] ; then
	_fail
fi

# check inserted disks and set default RAID level to set
#RAID_LEVEL_TO_SET=$1
RAID_LEVEL_TO_SET=""

DISK_IDX=1
DISK_CNT=0
DISKS_HOTPLUG=0
DISK_SLOT=`xmldbc -S ${SOCK_FILE} -g /disks/disk#`
ALL_DISKS=""
UNSUPPORTED_DISKS=""
NON_HEALTHY_DISKS=""
while [ ${DISK_IDX} -le ${DISK_SLOT} ] ; do
	DISK_HOTPLUG_ADD=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_add`
	DISK_HOTPLUG_REMOVE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_remove`
	if [ -n "${DISK_HOTPLUG_ADD}" -o -n "${DISK_HOTPLUG_REMOVE}" ] ; then
		DISKS_HOTPLUG=`expr ${DISKS_HOTPLUG} + 1`
	fi

	DISK_NAME=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/name`
	if [ -n "${DISK_NAME}" ] ; then
		DISK_ALLOWED=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/allowed`
		if [ "${DISK_ALLOWED}" = "1" ] ; then
			if [ -z "${ALL_DISKS}" ] ; then
				ALL_DISKS="${DISK_NAME}"
			else
				ALL_DISKS="${ALL_DISKS} ${DISK_NAME}"
			fi
		else
			if [ -z "${UNSUPPORTED_DISKS}" ] ; then
				UNSUPPORTED_DISKS="${DISK_IDX}"
			else
				UNSUPPORTED_DISKS="${UNSUPPORTED_DISKS},${DISK_IDX}"
			fi
		fi

		DISK_HEALTHY=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/healthy`
		if [ "${DISK_HEALTHY}" != "1" ] ; then
			if [ -z "${NON_HEALTHY_DISKS}" ] ; then
				NON_HEALTHY_DISKS="${DISK_IDX}"
			else
				NON_HEALTHY_DISKS="${NON_HEALTHY_DISKS},${DISK_IDX}"
			fi
		fi

		DISK_CNT=`expr ${DISK_CNT} + 1`
	fi
	DISK_IDX=`expr ${DISK_IDX} + 1`
done

# file if processing hotplug
if [ "${DISKS_HOTPLUG}" != "0" ] ; then
	_fail
fi

# fail if no disks
if [ "${DISK_CNT}" = "0" ] ; then
	_fail
fi

# fail if found any unsupported disks
if [ -n "${UNSUPPORTED_DISKS}" ] ; then
	_fail
fi

# fail if found any non-healthy disks
if [ -n "${NON_HEALTHY_DISKS}" ] ; then
	_fail
fi

# set default RAID level to set
if [ -z "${RAID_LEVEL_TO_SET}" ] ; then
	case ${DISK_CNT} in
		"1")
			RAID_LEVEL_TO_SET="standard"
			;;
		"2")
			RAID_LEVEL_TO_SET="raid1"
			;;
		*)
			RAID_LEVEL_TO_SET="raid5"
			;;
	esac
fi

# check any volumes' RAID_LEVEL is equal to RAID_LEVEL_TO_SET?
VOL_IDX=1
RAID_FOUND=0
while [ 1 ] ; do
	VOL_LABEL=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/label`
	if [ -z "${VOL_LABEL}" ] ; then
		break
	fi
	RAID_LEVEL=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/raid_level`
	RAID_STATE=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/raid_state`
	if [ "${RAID_LEVEL}" = "${RAID_LEVEL_TO_SET}" -a "${RAID_STATE}" = "clean" ] ; then
		RAID_FOUND=1
		break
	fi
	VOL_IDX=`expr ${VOL_IDX} + 1`
done

# fail if one or more RAID found
if [ "${RAID_FOUND}" = "1" ] ; then
	_fail
fi

# check raid_init.sh is in progress?
if [ -f ${PID_FILE_RAID_INIT} ] ; then
	STAGE=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /stage`
	if [ "${STAGE}" != "complete" ] ; then
		_fail
	fi
fi

#echo "disk_cnt=${DISK_CNT}, raid_mode=${RAID_LEVEL_TO_SET}, used_dev=${USED_DEV}"

#xmldbc -S ${SOCK_FILE_RAID_INIT} -D /dev/console

# error checks done, start to configure RAID now
USED_DEV=""
for DISK_NAME in ${ALL_DISKS} ; do
	USED_DEV="${USED_DEV}${DISK_NAME}"
done

# change RAID_LEVEL to RAID_MODE
ASSUME_CLEAN=1
RAID_MODE_TO_SET=""
case ${RAID_LEVEL_TO_SET} in
	"standard")
		RAID_MODE_TO_SET=1
		;;
	"jbod")
		RAID_MODE_TO_SET=2
		;;
	"raid0")
		RAID_MODE_TO_SET=3
		;;
	"raid1")
		RAID_MODE_TO_SET=4
		;;
	"raid5")
		RAID_MODE_TO_SET=5
		disk_chk -a ${USED_DEV}
		[ $? -ne 0 ] && ASSUME_CLEAN=0
		;;
	"raid10")
		RAID_MODE_TO_SET=6
		;;
esac

# raid-mode
# standard: 1
# linear: 2
# raid0: 3
# raid1: 4
# raid5: 5
# raid10: 6
# STD: diskmgr --vol-num 1 --raid-mode 1 --file-type 3 --used-dev sda --new
# JBOD: diskmgr --vol-num 1 --raid-mode 2 --file-type 3 --used-dev sdasdb --new
# RAID0: diskmgr --vol-num 1 --raid-mode 3 --file-type 3 --used-dev sdasdb --new
# RAID1: diskmgr --vol-num 1 --raid-mode 4 --file-type 3 --used-dev sdasdb --new
# RAID10: diskmgr --vol-num 1 --raid-mode 6 --file-type 3 --used-dev sdasdbsdcsdd --new
# RAID5: diskmgr --vol-num 1 --raid-mode 5 --file-type 3 --used-dev sdasdbsdc --new

diskmgr --vol-num 1 --raid-mode ${RAID_MODE_TO_SET} --file-type 3 --used-dev ${USED_DEV} --kill_running_process --load_module --assume-clean ${ASSUME_CLEAN} --new 1>/dev/null 2>/dev/null &
sleep 1

echo "success"
