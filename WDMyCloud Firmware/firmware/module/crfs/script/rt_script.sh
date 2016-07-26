#!/bin/bash

# exit with error if file path is not supplied or invalid
if [ -z ${1} ] || [[ ${1} != /var/log/* ]]; then
	echo "Usage: $0 /path/to/file/to/be/rotated"
	exit 2
fi


# It looks like sky-2050 need the parameter
#rt_line=${2}

if [ "${1}" = "/var/log/user.log" ];then
	POSTFIX="old"
else
	POSTFIX="1"
fi
#echo "Start rotate................" > /dev/console
mv ${1}.tmp ${1}.${POSTFIX} > /dev/null 2>&1
touch ${1}
access_mtd "cp ${1} ${1}.${POSTFIX} /usr/local/config/"

nohup nice -n 19 /usr/local/sbin/wdLogUploader.sh -f ${1} -t 1 >/dev/null 2>&1 &
