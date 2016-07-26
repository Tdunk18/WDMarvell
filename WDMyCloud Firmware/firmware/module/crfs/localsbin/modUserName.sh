#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# modUserName.sh <orig-user> <new-username> 
#
# Modify a username
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh
# . /etc/system.conf

#---------------------
# Begin Script
#---------------------



orig_username=$1
new_username=$2

if [ $# != 2 ]; then
	echo "usage: modUserName.sh <orig_username> <new_username>"
	exit 1
fi

admin_name=`getOwner.sh`
# modify user
usermod -l "$new_username" "$orig_username"			# to be checked: why return 1

/usr/sbin/account			# generate /var/www/xml/account.xml

ftp stop >/dev/null

################################################################
# need not to reset Quota, because uid/gid wouldn't be changed #
################################################################
# if admin, don't change user name
if [ "$orig_username" != "$admin_name" ];then
	modSambaUSername "$orig_username" "$new_username"
fi

FTP_Mod_User "$orig_username" "$new_username"
ModSambaPasswd "$orig_username" "$new_username"
ModWebdavPasswd "$orig_username" "$new_username"
isoMountIf -t "$orig_username" -u "$new_username"

#call smbif to rename 
smbif -o "$orig_username" -n "$new_username" -y

WEB_START_FTP


# restart
restart_service

CP_Config_To_MTD

[ -s /tmp/set_webdav_note ] && makedav start &>/dev/null

exit 0

#---------------------
# End Script
#---------------------

