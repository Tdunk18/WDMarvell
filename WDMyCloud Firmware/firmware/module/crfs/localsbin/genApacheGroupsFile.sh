#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# genApacheGroupsFile.sh
#
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/config/apache-php-webdav.conf 2>/dev/null

# exit if apache auth dir is absent (e.g. during build)
[ ! -d "${APACHE_AUTH_DIR}" ] && exit 0

declare -a group
declare -i i=0 grpId=0

getUsers.sh > /tmp/userlist

while read user; do
    grpId=$(getUserInfo.sh "${user}" 'userid')
    #echo "$grpId"
    group[$grpId]=$grpId
done < /tmp/userlist

# remove old file before appending new records
rm -f "${APACHE_GROUP_FILE_PATH}"
touch "${APACHE_GROUP_FILE_PATH}"
chown :www-data "${APACHE_GROUP_FILE_PATH}"
chmod 775 "${APACHE_GROUP_FILE_PATH}"

for grpId in "${!group[@]}"; do
    # create a group for each user in userlist
    grpOwner=$(awk -v id=${grpId} '{ if (id == $1) {print $2; exit} }' "${APACHE_USERLIST_FILE_PATH}")
    if [ ! -z "${grpOwner}" ]; then
        groupname="${grpOwner}:"
        # assign users to their corresponding groups based on userId only if password = 'yes'
        groupLine=$(awk -v group=${grpId} -v g="${groupname}" 'BEGIN{ORS=" "; print g;} { if (group == $1 && "no" != $3) {print $2;} }' "${APACHE_USERLIST_FILE_PATH}")
        echo "${groupLine}" >> "${APACHE_GROUP_FILE_PATH}"
    fi
done

# Update the persisitent user file :/etc/user_list
mv -f /tmp/userlist /etc/user_list
