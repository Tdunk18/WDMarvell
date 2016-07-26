#!/bin/bash
#
# Modified by Alpha_Vodka
#
# addUserVendor.sh <name> <is_admin> [password=""] [full_name=""]
#
# 
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh

WebDAV_PATH="/etc/passwd.webdav"
#---------------------
# Begin Script
#---------------------
if [ $# -lt 1 ]; then
	echo "usage: addUserVendor.sh <username> <is_admin> [password=\"\"] [full_name=\"\"]"
	exit 1
fi
ignore_pw=1

username=${1}
shift
is_admin=${1}
shift
while [ "$1" != "" ]; do
	par=`echo ${1} | cut -d = -f 1`
	val=`echo ${1} | cut -d = -f 2`
	case $par in
			password )
							  password=$val
							  ignore_pw=0
                              if [ -e "${WebDAV_PATH}" ];then
								#echo webdav exist
								htpasswd -mb /etc/passwd.webdav "${username}" "${password}" > /dev/null 2>&1
							  else
								#echo webdav not exist
								htpasswd -mbc /etc/passwd.webdav "${username}" "${password}" > /dev/null 2>&1
							  fi                             
                              ;;
			full_name )
                              full_name="$val"                              
                              ;;					  
      * )                     echo "usage: addUserVendor.sh <username> <is_admin=0/1> [new_username=] [password=\"\"] [full_name=\"\"]"
                              ;;      
	esac
	shift
done 

if [ 1 == "$ignore_pw" ];then
  if [ -e "${WebDAV_PATH}" ];then
	htpasswd -mb /etc/passwd.webdav "${username}" "" >/dev/null 2>&1
  else
	htpasswd -mbc /etc/passwd.webdav "${username}" "" >/dev/null 2>&1
  fi 
fi

#add user to "invalid user" for all private shares
#run smbif in foreground , because smbcom will parser alpha database to rebuild smb.conf
touch /tmp/no_reload
smbif -q "${username}" > /dev/null 2>&1

if [ -e /tmp/system_ready ]; then
 access_mtd "cp -f /etc/passwd.webdav /usr/local/config/" > /dev/null 2>&1 &
fi

# update account.xml
account > /dev/null 2>&1 &
exit 0

#---------------------
# End Script
#---------------------
