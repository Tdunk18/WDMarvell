#!/bin/bash
#
# Modified by Alpha_Vodka
#
# deleteUser.sh <user> 
#
# Delete user
#

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh



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

#---------------------
# Begin Script
#---------------------
if [ $# -lt 1 ]; then
	echo "usage: deleteUserVendor.sh <name>"
	exit 1
fi

username=${1}

# quota reset
for dsk in a2 b2 c2 d2; do
	Set_User_Quota_To_Zero "/mnt/HD/HD_$dsk" "$username"
done

# delete webdav user
htpasswd -D /etc/passwd.webdav "$username" > /dev/null

# delete samba user in hdd
delSambaUSername "$username"

[ -e /tmp/system_ready ] && access_mtd "cp -f /etc/passwd.webdav /usr/local/config/"

# ftp del == LIB_FTP_Del_User(username)
FTP_Del_User "$username"

# delete  isomount user
ISO_DEL_USER "$username"

# LIB_WEB_START_FTP()
WEB_START_FTP

#restart_alpha_service

# update account.xml
account > /dev/null 2>&1 &

exit 0

#---------------------
# End Script
#---------------------
