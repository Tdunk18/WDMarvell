#!/bin/sh

CONF_FILE=/etc/raid_drives_info.conf
SOCK_FILE=/var/run/xmldb_sock_sysinfo

_exit_with_status()
{
	echo "$1"
	exit 0	
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

DISK_CNT=0
DISKS_HOTPLUG=0
UNSUPPORTED_DISKS=""
CHECK_DISK_SIZE=""
DISK_SIZE_IS_EQUAL=1

# check for hotplug first
#ls -1 /tmp/hotplug.* 1>/dev/null 2>/dev/null
#if [ $? = 0 ] ; then
#	_exit_with_status "busy"
#fi

DISK_IN_ORDER=1
PREV_DISK_NAME="none"

DISK_IDX=1
DISK_SLOT=`xmldbc -S ${SOCK_FILE} -g /disks/disk#`
while [ ${DISK_IDX} -le ${DISK_SLOT} ] ; do
	DISK_HOTPLUG_ADD=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_add`
	DISK_HOTPLUG_REMOVE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/hotplug_remove`
	if [ -n "${DISK_HOTPLUG_ADD}" -o -n "${DISK_HOTPLUG_REMOVE}" ] ; then
		DISKS_HOTPLUG=`expr ${DISKS_HOTPLUG} + 1`
	fi

	DISK_NAME=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/name`
	if [ -n "${DISK_NAME}" ] ; then
		DISK_CNT=`expr ${DISK_CNT} + 1`

		DISK_ALLOWED=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/allowed`
		if [ "${DISK_ALLOWED}" = "1" ] ; then

			if [ ${DISK_SIZE_IS_EQUAL} -eq 1 ] ; then
				DISK_SIZE=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/size`
				DISK_SIZE=`expr ${DISK_SIZE} / 1024 / 1024 / 1024` # change B to GiB
				
				#echo "check_size=${CHECK_DISK_SIZE}, disk_size=${DISK_SIZE}"
				if [ -z "${CHECK_DISK_SIZE}" ] ; then
					CHECK_DISK_SIZE=${DISK_SIZE}
				else
					DELTA=0
					if [ ${DISK_SIZE} -gt ${CHECK_DISK_SIZE} ] ; then
						DELTA=`expr ${DISK_SIZE} - ${CHECK_DISK_SIZE}`
					else
						DELTA=`expr ${CHECK_DISK_SIZE} - ${DISK_SIZE}`
					fi
					# set equal flag to false when delta of size is bigger than 2GB
					if [ ${DELTA} -gt 2 ] ; then
						DISK_SIZE_IS_EQUAL=0
					fi
				fi
			fi
		else
			if [ -z "${UNSUPPORTED_DISKS}" ] ; then
				UNSUPPORTED_DISKS="${DISK_IDX}"
			else
				UNSUPPORTED_DISKS="${UNSUPPORTED_DISKS},${DISK_IDX}"
			fi
		fi

		if [ -z "${PREV_DISK_NAME}" ] ; then
			DISK_IN_ORDER=0
		fi
	fi
	PREV_DISK_NAME=${DISK_NAME}
	DISK_IDX=`expr ${DISK_IDX} + 1`
done

# check disks
if [ "${DISKS_HOTPLUG}" != "0" ] ; then
	_exit_with_status "busy"
fi

if [ "${DISK_CNT}" = "0" ] ; then
	_exit_with_status "no_drives_found"
fi

if [ -n "${UNSUPPORTED_DISKS}" ] ; then
#	_exit_with_status "restricted_drives_found ${UNSUPPORTED_DISKS}"
	_exit_with_status "restricted_drives_found"
fi

if [ "${DISK_IN_ORDER}" != "1" ] ; then
	_exit_with_status "incorrect_drive_order"
fi

# check RAID configuration
SOCK_FILE_RAID_INIT=/var/run/xmldb_sock_raid_init
PID_FILE_RAID_INIT=${SOCK_FILE_RAID_INIT}_config.pid
STAGE=""
STATUS=""
if [ -f ${PID_FILE_RAID_INIT} ] ; then
	STAGE=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /stage`
	STATUS=`xmldbc -S ${SOCK_FILE_RAID_INIT} -g /status`
	if [ "${STAGE}" != "complete" ] ; then
		_exit_with_status "rebuilding"
	fi
	# now, ${STAGE} is equal to "complete"
	if [ ${STATUS} = "fail" ] ; then
		_exit_with_status "failed_drive_raid_mode"
	fi
fi

# set default RAID level to set
DEFAULT_RAID_LEVEL=""
case ${DISK_CNT} in
	"1")
		DEFAULT_RAID_LEVEL="standard"
		;;
	"2")
		DEFAULT_RAID_LEVEL="raid1"
		;;
	*)
		DEFAULT_RAID_LEVEL="raid5"
		;;
esac

STATUS_ELSE_FLAG=0
# check default RAID level existing
VOL_IDX=1
while [ 1 ] ; do
	VOL_LABEL=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/label`
	if [ -z "${VOL_LABEL}" ] ; then
		break
	fi
	VOL_NUM=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/vol_num`
	VOL_UUID=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/raid_uuid`
#	RAID_IDX=`query_raid ${VOL_UUID}`
#	echo "VOL${VOL_IDX}: UUID=${VOL_UUID}, RAID_IDX=${RAID_IDX}"

	RAID_LEVEL=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/raid_level`
	RAID_STATE=`xmldbc -S ${SOCK_FILE} -g /vols/vol:${VOL_IDX}/raid_state`
	
  # 20150316, Brian add to fix ITR 102909, check all volumes status
  if [ "${RAID_STATE}" = "degraded" ] ; then
    # 20150318, Brian modify to fix ITR 94128, return failed_drive_raid_mode when degrade
    _exit_with_status "failed_drive_raid_mode"
  elif [ "${RAID_STATE}" != "clean" ] ; then
    STATUS_ELSE_FLAG=1
  fi
#	if [ "${DEFAULT_RAID_LEVEL}" = "${RAID_LEVEL}" ] ; then
#		# found a volume that RAID level is default RAID level
#		if [ "${RAID_STATE}" = "clean" ] ; then
#			_exit_with_status "drive_raid_already_formatted"
#		elif [ "${RAID_STATE}" = "degraded" ] ; then
#			_exit_with_status "drive_raid_incompatible_configuration"
#		else
#			_exit_with_status "drive_raid_ready"
#		fi

	VOL_IDX=`expr ${VOL_IDX} + 1`
done

# to fix ITR 97583
if [ ${VOL_IDX} -gt 1 ] ; then
  # 20150316, Brian add to fix ITR 102909, if all volumes is clean, return drive_raid_already_formatted
  if [ ${STATUS_ELSE_FLAG} -eq 1 ] ; then
    _exit_with_status "drive_raid_ready"
  else
    _exit_with_status "drive_raid_already_formatted"
  fi
fi

# no volume is default RAID level
_exit_with_status "drive_raid_incompatible_configuration"

