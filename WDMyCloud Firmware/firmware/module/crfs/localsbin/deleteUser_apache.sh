#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# deleteUser_apache.sh <userId> <userName>
#
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/config/apache-php-webdav.conf 2>/dev/null

if [ $# -lt 2 ]; then
    echo "usage: deleteUser_apache.sh <action> <userName> [userId]"
    exit 1
fi

# Note: when deleting a "deviceUser" or an "OS user" only pass in the <userName> parameter
# when changing the username (OS users only) then pass the ID also

ACTION=${1}
USR_NAME=${2}
USR_ID=${3:-""}


#echo "delete/modify user = ${USR_NAME} USR_ID=${3}" >> ${SYSTEM_SCRIPTS_LOG}

if [ ! ${APACHE_USERLIST_FILE_PATH} ]; then
    # just return if no userlist file
    echo "..no apache_userlist file, exiting."
    exit 0
fi

# check for username change - this operation is only valid for OS users.
oldUserName=""
passwd='false'
if [ "${ACTION}" == 'change_name' ]; then
    if [ ${USR_ID} != "" ]; then
        oldUserName=`/usr/local/sbin/getUserNameFromId.sh ${USR_ID}`
    fi
    # patch the htpasswd file with the new username
    echo "action=${ACTION} olduser=${oldUserName} newuser=${USR_NAME}" 
    if [ "${oldUserName}" != "" ]; then
        rm -f /tmp/htpasswd_new
        touch /tmp/htpasswd_new
        
        while read userline; do
            newline=""
            newline=$(echo "${userline}" | awk -v newuser=${USR_NAME} -v olduser=${oldUserName} 'BEGIN{FS=":";OFS=":";}
            {
                if (olduser == $1) {print newuser,$2,$3}
            }')
            echo "${newline}" 
            if [ -n "${newline}" ]; then
                echo "${newline}" >> /tmp/htpasswd_new
            else
                echo "${userline}" >> /tmp/htpasswd_new
            fi
        done < ${APACHE_PASSWD_FILE_PATH}
        
        mv -f /tmp/htpasswd_new ${APACHE_PASSWD_FILE_PATH}
        chmod 775 ${APACHE_PASSWD_FILE_PATH}
        chown :www-data ${APACHE_PASSWD_FILE_PATH}
    else
        echo "no change in username detected for user = ${USR_NAME}"
        ACTION='none'
    fi
elif [ "${ACTION}" == 'delete_dev_user' ] || [ "${ACTION}" == 'delete_os_user' ] || [ "${ACTION}" == 'delete_pwd' ]; then  
        # delete the user in the htpasswd file 
        echo "- deleting apache user ${USR_NAME} in ${APACHE_PASSWD_FILE_PATH}"
        # a bogus password still works here to delete..
        htpasswd -bD "${APACHE_PASSWD_FILE_PATH}" ${USR_NAME} 'password'
fi

# update the apache user list file
rm -f /tmp/ul_new
awk -v action=${ACTION} -v user=${USR_NAME} -v userid=${USR_ID} -v oldname=${oldUserName} 'BEGIN{FS=" ";OFS=" ";}
{
    if (action == "delete_pwd") {
        if (user == $2 && userid == $1) {print $1,$2,"no"}
        else {print $1,$2,$3}
    }
    else if (action == "set_pwd") {
        if (user == $2 && userid == $1) {print $1,$2,"yes"}
        else {print $1,$2,$3}
    }
    else if ( action == "delete_dev_user" ) {
        if (user != $2 ) {print $1,$2,$3}
    }
    else if ( action == "delete_os_user" ) {
        if (userid != $1 ) {print $1,$2,$3}
    }
    else if ( action == "change_name" ) {
        if (oldname == $2 && userid == $1 ) {print $1,user,$3}
        else {print $1,$2,$3}
    }
    else {print $1,$2,$3}
}' ${APACHE_USERLIST_FILE_PATH} >> /tmp/ul_new

if [ -f "/tmp/ul_new" ]; then
    mv -f /tmp/ul_new "${APACHE_USERLIST_FILE_PATH}"
    chown :www-data "${APACHE_USERLIST_FILE_PATH}"
    chmod 775 "${APACHE_USERLIST_FILE_PATH}"
fi

# regenerate apache group access file
genApacheGroupsFile.sh

exit 0

