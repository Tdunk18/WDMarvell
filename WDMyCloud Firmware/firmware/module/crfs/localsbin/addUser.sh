#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# addUser.sh addUser.sh <name> <isadmin> [fullname]
#
# 
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh
# . /etc/system.conf

SAMBA_PATH=/etc/samba/smb.conf

#---------------------
# Begin Script
#---------------------
if [ $# -lt 2 ]; then
	echo "usage: addUser.sh <name> <isadmin> [fullname]"
	exit 1
fi

doCheckShare(){
	share="$1"
	for i in `ls /shares`; do
		if [ "${share}" == "$i" ]; then
		  echo 1
		  break
		fi
	done	
	echo 0
}

doCreateShare(){
	share="$1"
	path=`cat /etc/shared_name | awk 'NR==1 {print $3}'`
	echo $path $share
	if [ -n $path ]; then
	   echo "[ $share ]" >> $SAMBA_PATH
	   echo "path = /mnt/HD/$path/$share" >> $SAMBA_PATH
	   echo "public = yes" >> $SAMBA_PATH
	   smbShare.sh "add" "$share" "media_serving=false"
	   crud_share_db.sh create "$share" /etc/samba/smb.conf "false"
	fi
}
username=${1}
isadmin=${2}
#covert "+" to " "  Alpha.Vodka
#fullname=${3}
#let username for first name at first +20140711.VODKA
fullname=${username}" "`echo ${3} | sed s/"+"/" "/g`

#echo ${fullname} | grep -q ' ' && firstName=`echo ${fullname} | cut -d ' ' -f 1` || firstName=
#lastName=`echo ${fullname} | cut -d ' ' -f 2-`

if [ "$isadmin" = "1" ]; then
	#account -m -u "$username" -f "$firstName" -t "$lastName" -l '#administrators#' -p '' -e '' -h ''		# separate into 2 field
	account -a -u "$username" -f "$fullname" -l '#administrators#' -p '' -e '' -h ''
else
	#account -a -u "$username" -f "$firstName" -t "$lastName" -l ''  -p '' -h '' -e ''						# separate into 2 field
	account -a -u "$username" -f "$fullname" -l '' -p '' -e '' -h ''
fi

#Create share for user +20140711.VODKA
dup_name="${username}"
inc=1
while [ 1 ]
do
   echo $dup_name
   ret=`doCheckShare "$dup_name"`
   if [ "$ret" = "0" ]; then
      #create share
	  doCreateShare "$dup_name"
	  break
   fi
   #name increase
   inc=`expr $inc + 1`
   dup_name="${username}""$inc"
done

# LIB_CP_Config_To_MTD(SAVE_PASSWD | SAVE_SHADOW | SAVE_SMBPW | SAVE_GROUP | SAVE_FTP_MAGIC_NUM | SAVE_WEBDAV)
CP_Config_To_MTD

/usr/sbin/account			# generate /var/www/xml/account.xml

# restart_service()
restart_service

exit 0



#---------------------
# End Script
#---------------------
