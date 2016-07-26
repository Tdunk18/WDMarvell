#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# updateFirmwareFromFile.sh <filename> [check_filesize]"
# 
# <return>	 1:	shell script check failure
#			 0: success
#			-1: upload_firmware return fail

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/alert-param.sh

filename=${1}
check_size=${2:-""}
upFwPathPrefix="/usr/local/upload/"

# check params
if [ $# -lt 1 ]; then
    echo "usage: updateFirmwareFromFile.sh <filename> [check_filesize]"
    exit 1
fi
if [ ! -f ${filename} ]; then
    echo "File not found"
    exit 1
fi

# hwalock: check file size
if [ "${check_size}" != "" ]; then
    FileSize=`cat /tmp/fw_upgrade_filesize`
    blocksize_ls=`ls -l ${filename} | awk '{print $5}'`
    if [ "${FileSize}" != "${blocksize_ls}" ]; then
        echo "failed 202 \"failed download file size check\"" | tee /tmp/fw_update_status
		exit 1
    fi
fi


upload_firmware -c auto
cp -f ${filename} /usr/local/upload/newFirmware

touch /tmp/upload_fw
upload_firmware -n newFirmware
status=$?

do_reboot &
#alert_test -a ${rebootRequired} -f&

exit ${status}
