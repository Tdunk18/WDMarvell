#!/bin/bash

fatal_error=0
inode_threshold=500
volume_queue=()
declare -A volume_mount_array
e2igrow_path="/usr/sbin/e2igrow"
e2igrow_log="/var/log/e2igrow.log"
log_id="inode_growth"
persist_log_dir="/usr/local/config/"
inode_growth_success_file="/shares/Public/inode_growth_success"
model_support=("LT4A" "KC2A" "BZVM")

to_reboot=1

function notify_early_termination
{
    logger -t "${log_id}" -s "INFO: exiting with no modification to the system"
    exit 1
}

if [[ ! -e /etc/system.conf ]]; then
    logger -t "${log_id}" -s "ERROR: system configuration cannot be found. exiting."
    notify_early_termination
fi

. /etc/system.conf

function mount_volume_queue
{
    
    logger -t "${log_id}" -s "INFO: mounting data volumes"
    for volume in "${volume_queue[@]}"; do
	mount_point="${volume_mount_array[${volume}]}"
	logger -t "${log_id}" -s "INFO: mounting ${volume} to ${mount_point}"
	mount "${volume}" "${mount_point}"
	if [[ "${?}" != "0" ]]; then
	    logger -t "${log_id}" -s "WARN: failed to mount ${volume} to ${mount_point}"
	fi
    done
}

function handle_fatal_error
{
    echo ""
    echo "****************************"
    echo "       F A I L E D"
    echo "****************************"
    echo ""
    logger -t "${log_id}" -s "INFO: Inode growth operation failed. Please contact WD customer support"
    # copy log into persistent location for review
    if [[ -e "${e2igrow_log}" ]]; then
	cp "${e2igrow_log}" "${persist_log_dir}"
	logger -t "${log_id}" -s "INFO: e2igrow utility output log has been copied to ${persist_log_dir}"
    fi
    # reboot system
    if [[ "${to_reboot}" != "0" ]]; then
	logger -t "${log_id}" -s "INFO: rebooting"
	do_reboot
    fi
}

function handle_success
{
    echo ""
    echo "****************************"
    echo "     S U C C E S S"
    echo "****************************"
    echo ""
    touch "${inode_growth_success_file}"
    # reboot system
    if [[ "${to_reboot}" != "0" ]]; then
	logger -t "${log_id}" -s "INFO: rebooting"
	do_reboot
    fi
}

function check_model
{
    logger -t "${log_id}" -s "INFO: checking model number"

    for model in ${model_support[@]}; do
	if [[ "${modelNumber}" == "${model}" ]]; then
	    logger -t "${log_id}" -s "INFO: confirmed supported model: ${model}"
	    return
	fi
    done
    logger -t "${log_id}" -s "ERROR: invalid model number: ${modelNumber}"
    notify_early_termination
}

function download_e2igrow_program
{
    # wget program based on model number

    # wget corresponding md5sum

    # validate md5sum
    if [[ ! -e "${e2igrow_path}" ]]; then
	logger -t "${log_id}" -s "ERROR: unable to find e2igrow utility at ${e2igrow_path}"
	notify_early_termination
    fi

    ${e2igrow_path} > /dev/null 2>&1
    if [[ "${?}" != "0" ]]; then
	logger -t "${log_id}" -s "ERROR: the e2igrow utility cannot be executed on this device: ${e2igrow_path}"
	notify_early_termination
    fi
}

function get_data_volumes
{
    logger -t "${log_id}" -s "INFO: querying list of data volumes"
    # get the list of data volumes
    data_volumes=`df |grep /mnt/HD/HD | awk '{ print $1 }' 2>/dev/null`
    if [[  "$?" != "0"  ]]; then
	logger -t "${log_id}" -s "ERROR: failed to query list of data volumes"
	notify_early_termination
    fi
}


function check_data_volume_inode_count_above_threshold
{
    logger -t "${log_id}" -s "INFO: checking data volumes inode threshold"
    #for each volume, find volumes with inode count above threshold
    for volume in ${data_volumes}; do
	inode_count=`df -i |grep ${volume} | awk '{ print $2 }' 2>/dev/null`
	if [[ "$?" != "0" ]]; then
	    logger -t "${log_id}" -s "ERROR: cannot get inode count for volume: ${volume}"
	    notify_early_termination
	fi
	blocks_count=`df |grep ${volume} | awk '{ print $2}' 2>/dev/null`
	if [[ "$?" != "0" ]]; then
	    logger -t "${log_id}" -s "ERROR: cannot get blocks count for volume: ${volume}"
	    notify_early_termination
	fi
	inode_ratio=`expr ${blocks_count} / ${inode_count} 2>/dev/null`
	if [[ "$?" != "0" ]]; then
	    logger -t "${log_id}" -s "ERROR: failed to calculate inode ratio"
	    notify_early_termination
	fi

	if [[ "${inode_ratio}" -gt "${inode_threshold}" ]]; then
	    volume_queue+=("${volume}")
	    logger -t "${log_id}" -s "INFO: inode growth operation to be performed on: ${volume}"

	    volume_mount=`df |grep /mnt/HD/HD |grep "${volume}" | awk '{ print $6 }' 2>/dev/null`
	    if [[  "$?" != "0"  ]]; then
		logger -t "${log_id}" -s "WARN: failed to query list of data volumes"
	    else
		volume_mount_array[${volume}]="${volume_mount}"
	    fi

	else
	    logger -t "${log_id}" -s "INFO: inode growth operation to be skipped on: ${volume}"
	fi
    done
}

function umount_volumes
{
    logger -t "${log_id}" -s "INFO: unmounting data volumes"
    # kill all processes that may prevent unmount operations
    mcserver_pid=`pidof wdmcserver`
    if [[ "$?" != "0" ]]; then
	logger -t "${log_id}" -s "INFO: mediacrawler is not running"
    else
	kill -9 "${mcserver_pid}"
    fi
    killall mysqld twonkyserver mt-daapd wdphotodbmerger smbd afpd netatalk cnid_metad

    kill -9 `lsof |grep "/mnt/HD/HD" |awk '{ print $2 }'` > /dev/null 2>&1

    for volume in "${volume_queue[@]}"; do
	umount "${volume}"
	if [[ "$?" != "0" ]]; then
	    logger -t "${log_id}" -s "ERROR: failed to unmount volume ${volume}"
	    fatal_error=1
	    return
	fi
    done
}

function perform_e2igrow_on_volumes
{
    logger -t "${log_id}" -s "INFO: performing e2igrow operation"
    for volume in "${volume_queue[@]}"; do
	logger -t "${log_id}" -s "INFO: growing inode on ${volume}"
	${e2igrow_path} "${volume}" >> "${e2igrow_log}"
	if [[ "$?" != "0" ]]; then
	    logger -t "${log_id}" -s "ERROR: failed to perform inode growth operation on volume: ${volume}"
	    fatal_error=1
	    return
	fi
    done
}

#main

check_model
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

download_e2igrow_program
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

get_data_volumes
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

check_data_volume_inode_count_above_threshold
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

if [[ "${#volume_queue[@]}" == "0" ]]; then
    logger -t "${log_id}" -s "INFO: no data volumes need to have inode growth operation performed. exiting."
    exit 0
fi

umount_volumes
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

perform_e2igrow_on_volumes
if [[ "${fatal_error}" != "0" ]]; then
    handle_fatal_error
    exit 1
fi

mount_volume_queue

logger -t "${log_id}" -s "INFO: e2igrow operation has been completed successfully."
handle_success

