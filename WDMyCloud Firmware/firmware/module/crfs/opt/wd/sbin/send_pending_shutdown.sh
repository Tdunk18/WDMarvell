#!/bin/bash

WDTMS_RUNTIME_DIR="/tmp/.wdtms"
WDTMS_PENDING_SHUTDOWN_FILE="${WDTMS_RUNTIME_DIR}/pending_shutdown"
pending_time=0

function set_pending_shutdown
{
    if [ ! -s "${WDTMS_PENDING_SHUTDOWN_FILE}"  ]; then
	# create pending shutdown file
	mkdir -p "${WDTMS_RUNTIME_DIR}"
	date +"%s" > "${WDTMS_PENDING_SHUTDOWN_FILE}"
    fi
}

function check_pending_shutdown
{
    if [ -s "${WDTMS_PENDING_SHUTDOWN_FILE}"  ]; then
	cur_time=`date +"%s"`
	pending_start_time=`cat "${WDTMS_PENDING_SHUTDOWN_FILE}"`
	shutdown_time=$((pending_start_time + pending_time))
	if [ "${cur_time}" -ge  "${shutdown_time}" ]; then
	    immediately_shutdown.sh
	fi
    else
	immediately_shutdown.sh
    fi
}

function clear_pending_shutdown
{
    rm -f "${WDTMS_PENDING_SHUTDOWN_FILE}"
}

while getopts ":s:c" opt; do
    case $opt in
	s)
	    pending_time=$OPTARG
	    set_pending_shutdown
	    check_pending_shutdown
	    ;;
	c)
	    clear_pending_shutdown
	    ;;
	*)
	    echo "Usage: send_pending_shutdown.sh (-c|-s PENDING_TIME_IN_SECONDS)"
	    exit 1
	    ;;
    esac
done
