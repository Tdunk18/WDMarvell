#!/bin/bash

# Simple log rotate script
# wd_rotate.sh [<logfile>] [<count>]

LOG_FILE=${1:-/mnt/HD/HD_a2/Nas_Prog/_docker/docker.log}
CNT=${2:-5}

do_rotate=0

if [ "${CNT}" -lt 1 ]; then
    echo "Log count is less than 1!"
    exit 0
fi

echo "LOG_FILE: $LOG_FILE"
echo "CNT: $CNT"

if [ -f "${LOG_FILE}" ]; then
    # Rotate if log file is more than 1MB
    log_file_size=`stat -c%s ${LOG_FILE}`
    if [ "$log_file_size" -gt "1048576" ]; then
        do_rotate=1
    fi
fi

if [ $do_rotate -eq 1 ]; then
    # Shift rotated files
    num=${CNT}
    while [[ ${num} -gt 0 ]]; do
        if [ -f ${LOG_FILE}.${num} ]; then
            if [ "${num}" -eq "${CNT}" ]; then
                rm ${LOG_FILE}.${num}
                echo "Deleted ${LOG_FILE}.${num}"
            else
                newnum=$((num+1))
                mv ${LOG_FILE}.${num} ${LOG_FILE}.${newnum}
                echo "Moved ${LOG_FILE}.${num} to ${newnum}"
            fi
        fi
        num=$((num-1))
    done
    
    # Rotate the current log (only copy the last 2MB)
    tail -c 2097152 ${LOG_FILE} > ${LOG_FILE}.1
    echo "Rotated ${LOG_FILE} to 1"
    
    # Clear the log file
    cat /dev/null > ${LOG_FILE}
fi
