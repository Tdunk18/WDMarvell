#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# addUser_apache.sh <userId> <userName>
#
#
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/config/apache-php-webdav.conf 2>/dev/null

if [ $# -lt 1 ]; then
    echo "usage: addUser_apache.sh <userName> [password]"
    exit 1
fi

USERNAME="${1}"
PASSWORD="${2}"
USER_ID="${3}"

#echo "USERNAME=${1}"
#echo "PASSWORD=${2}"
#echo "USER_ID=${3}"

IS_PASSWORD="no"

# update the apache user htdigest file 
if [ -n "${PASSWORD}" ]; then
    # (echo -n "user:realm:" && echo -n "user:realm:testing" | md5sum) > outfile
    line="$(echo -n "${USERNAME}:DeviceUser:${PASSWORD}" | md5sum | awk '{print $1}')"
    if [ -n $line ]; then
        line="${USERNAME}:DeviceUser:$line"
        if [ ! -f "${APACHE_PASSWD_FILE_PATH}" ]; then
            echo "- - creating new htpasswd file.."  
            echo "$line" > "${APACHE_PASSWD_FILE_PATH}"
        else
            echo "- - appending to existing htpasswd file.."  
            echo "$line" >> "${APACHE_PASSWD_FILE_PATH}"
        fi
        IS_PASSWORD="yes"
    fi
fi

# update the apache user_list file
rm -f /tmp/ul_new
# add the user to the user_list file or modify it if user is already present
USER_FOUND="NO"
while read userlist; do
    echo "$userlist" |  cut -s -d ' ' -f 2 | grep -x -q "${USERNAME}"
    if [ $? -eq 0 ]; then
        USER_FOUND="YES"
    fi
done < ${APACHE_USERLIST_FILE_PATH}

if [ "${USER_FOUND}" != "YES" ]; then
    echo "${USER_ID} ${USERNAME} ${IS_PASSWORD}" >> ${APACHE_USERLIST_FILE_PATH}
else
    awk -v user=${USERNAME} -v userid=${USER_ID} -v passwd=${IS_PASSWORD} 'BEGIN{FS=" ";OFS=" ";}
    {
        if (user == $1) {print $1,passwd,$3}
        else {print $1,$2,$3}
    }' ${APACHE_USERLIST_FILE_PATH} >> /tmp/ul_new
fi

if [ -f "/tmp/ul_new" ]; then
    mv -f /tmp/ul_new "${APACHE_USERLIST_FILE_PATH}"
    chown :www-data "${APACHE_USERLIST_FILE_PATH}"
    chmod 775 "${APACHE_USERLIST_FILE_PATH}"
fi

# regenerate apache group access config files
genApacheGroupsFile.sh


exit 0

