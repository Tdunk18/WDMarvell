#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# getUserInfo.sh <name>
#
# Returns Full name of user
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
# . /etc/system.conf

#---------------------
# Begin Script
#---------------------


if [ $# -lt 1 ]; then
	echo "usage: getUserInfo.sh <username> [fieldname]"
	exit 1
fi
username=${1}
fieldname=${2:-"fullname"}


if [ "${fieldname}" = "fullname" ]; then
	awk -F: -v usrn=$1 '{ if($1==usrn){print $5}}' /etc/passwd | awk -F, '{print $1}'
fi

# what is userid means?
if [ "${fieldname}" == "userid" ]; then
    # awk -F: -v user=${1} '{if (user == $1) {print $5}}' /etc/passwd | grep -q ','
    # if [ $? -ne 0 ]; then
        # awk -F: -v user=${1} '{if (user == $1) {print $5}}' /etc/passwd
    # else
        # awk -F: -v user=${1} '{if (user == $1) {print $5}}' /etc/passwd | cut -d ',' -f 2
    # fi
	exit 1
fi
exit 0
#---------------------
# End Script
#---------------------