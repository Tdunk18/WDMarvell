#!/bin/bash
#
# Modified by Alpha_Vodka
#
# addUserVendor.sh <name> <is_admin=0/1> [new_username=] [password=""] [full_name=""]
#
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh

#---------------------
# Begin Script
#---------------------
doBeforeExit(){
	CP_Config_To_MTD
	/usr/sbin/account			# generate /var/www/xml/account.xml
}

if [ $# -lt 1 ]; then
	echo "usage: modifyUserVendor.sh <name> <is_admin=0/1> [new_username=] [password=\"\"] [full_name=\"\"]"
	exit 1
fi
username=${1}
new_username=""

shift
while [ "$1" != "" ]; do
	par=`echo ${1} | cut -d = -f 1`
	val=`echo ${1} | cut -d = -f 2`
	case $par in
			is_admin )
                              if [ "$val" == "1" ] || [ "$val" == "0" ]; then
                                is_admin="$val"
                              else
                                echo "error: is_admin format wrong!"
                              fi                              
                              ;;
			new_username )    
                              if [ -n "$val" ]; then
                                #new name is not empty
								new_username="$val"
								################################################################
								# need not to reset Quota, because uid/gid wouldn't be changed #
								################################################################
								# if admin, don't change user name
								#admin_name=`getOwner.sh`
								#admin_name="admin"
								#if [ "$username" != "$admin_name" ];then
								#	modSambaUSername "$username" "$new_username"
								#fi

								FTP_Mod_User "$username" "$new_username"
								ModWebdavPasswd "$username" "$new_username"
								isoMountIf -t "$username" -i "$new_username"
								# copy ftp config to hidden
								WEB_START_FTP > /dev/null 2>&1 &
								#call smbif to rename  +20150831.VODKA: For recycle_bin folder rename
								smbif -o "$username" -n "$new_username" -y
                              else
                                echo "error: new_username is empty!"
                              fi                              
                              ;;
			password )    
                              password="$val" 
							  if [ -n "$new_username" ]; then	
								htpasswd -mb /etc/passwd.webdav "${new_username}" "${password}" >/dev/null
							  else
								htpasswd -mb /etc/passwd.webdav "${username}" "${password}" >/dev/null
							  fi
							  
							  if [ -e /tmp/system_ready ]; then
								 access_mtd "cp -f /etc/passwd.webdav /usr/local/config/" > /dev/null 2>&1 &
							  fi							  
                              ;;	
			full_name )    
                              full_name="$val"                         
                              ;;							  
      * )                     echo "usage: modifyUserVendor.sh <name> <is_admin=0/1> [new_username=] [password=\"\"] [full_name=\"\"]"
                              ;;      
	esac
	shift
done
#echo -name=${username}- -new=${new_username}- -pwd=${password}- -fn=${full_name}-

# update account.xml
account > /dev/null 2>&1 &
exit 0
#---------------------
# End Script
#---------------------
