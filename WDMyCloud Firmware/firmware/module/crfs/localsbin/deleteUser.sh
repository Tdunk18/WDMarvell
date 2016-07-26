#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# deleteUser.sh <user> 
#
# Delete user
#

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh
# . /etc/system.conf



#---------------------
# Begin Script
#---------------------

Cal_Disk_Size(){
	disk_loc=$1
	totalSize=`df | grep $disk_loc | awk '{print $2}'`
	echo $totalSize
}

Set_User_Quota_To_Zero(){
	diskSize=$(Cal_Disk_Size "$1")
	
	# disk is existed
	[ ! -z $diskSize ] && setquota -u "$2" 0 0 0 0 $1
	
}




if [ $# != 1 ]; then
	echo "usage: deleteUser.sh <username>"
	exit 1
fi

username=$1

# user password xml file
# USRPW_Del $username
# access_mtd 'cp '$USR_PW_XML' /usr/local/config'

# LIB_WEB_STOP_FTP()
ftp stop >/dev/null

# delete user
account -d -u "$username"
delSambaUSername "$username"
# quota reset
for dsk in a2 b2 c2 d2; do
	Set_User_Quota_To_Zero "/mnt/HD/HD_$dsk" "$username"
done

# ftp del == LIB_FTP_Del_User(username)
FTP_Del_User "$username"

# delete  isomount user
ISO_DEL_USER "$username"

# LIB_WEB_START_FTP()
WEB_START_FTP

# restart_service()
restart_service

# LIB_CP_Config_To_MTD(SAVE_PASSWD | SAVE_SHADOW | SAVE_SMBPW | SAVE_GROUP | SAVE_FTP_MAGIC_NUM | SAVE_WEBDAV)
CP_Config_To_MTD

# webdav
[ -s /tmp/set_webdav_note ] && makedav start &>/dev/null

/usr/sbin/account			# generate /var/www/xml/account.xml

exit 0

#---------------------
# End Script
#---------------------