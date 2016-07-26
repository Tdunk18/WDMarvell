#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
# Modified by Alpha_Hwalock, for LT4A
# 
# shareFunc - share functions
#

. /usr/local/sbin/share-param.sh

modUserTrustees()
{
	awk -v orig_user=$1 -v new_user=$2 '
	BEGIN {
		RS = "\n" ; FS = ":";
	}
	{
		if ( (substr($0,1,1) == "#") ) {
			print $0;
		}
		else if (length($0) > 0  ) {
			printf("%s", $1);
			# search for user, if no match, change
			for (i=2; i <= NF; i=i+2) {
				if ( $i == orig_user ) {
					printf(":%s:%s", new_user, $(i+1));
				}
				else {
					printf(":%s:%s", $i, $(i+1));
				}
			}
			printf ("\n");
		}
	}
	' $trustees > $trustees-new
} 

modUserSamba()
{
	awk -v orig_user=$1 -v new_user=$2 '
	BEGIN {
		RS = "\n" ; FS = " ";
	}
	function change_user_and_print_list(orig, new, list)
	{
		first = 1;
		for ( u in list ) {
			if ( list[u] == orig ) {
				if ( first == 1 )
					printf("%s", new);
				else 
					printf(",%s", new);
				first = 0;
			}
			else {
				if ( first == 1 )
					printf("%s", list[u]);
				else 
					printf(",%s", list[u]);
				first = 0;
			}
		}
		printf("\n");		
	}
	{
		tst_str = " valid users = ";
		idx = match($0, tst_str);
		if (idx == 0) {
			tst_str = " read list = ";
			idx = match($0, tst_str);
		}
		if (idx == 0) {
			tst_str = " write list = ";
			idx = match($0, tst_str);
		}
		if ( idx > 0 ) {
			printf(" %s", tst_str);
			split( substr($0, (idx + RLENGTH)), list, ",");
			change_user_and_print_list(orig_user, new_user, list);
		}
		else {
			print $0;
		}
	}
	' $sambaOverallShare > $sambaOverallShare-new
} 
# delete isomount user 20131120.VODKA
ISO_DEL_USER(){
	local User=$1
	isoMountIf -t "$User" -i ""
}

delSambaUSername(){
	
	local targetUser=$1
	
	smbFilePath=""
	
	for dsk in a4 b4 c4 d4; do
		[ -s /mnt/HD_${dsk}/.systemfile/.smbm.xml ] && smbFilePath=/mnt/HD_${dsk}/.systemfile/.smbm.xml && break
	done
	
	[ -z ${smbFilePath} ] && return
	
	cat ${smbFilePath} | 
	sed s/"#$targetUser#,"//g | 
	sed s/",#$targetUser#"//g |
	sed s/"#$targetUser#"//g >> /tmp/.smbm.xml

	for dsk in a4 b4 c4 d4; do
		if [ -d /mnt/HD_${dsk}/.systemfile ]; then
			cp -f /tmp/.smbm.xml /mnt/HD_${dsk}/.systemfile/.smbm.xml
		fi
	done
	sync
	rm /tmp/.smbm.xml
}

modSambaUSername(){
	local oldUser=${1}
	local newUser=${2}
	
	smbFilePath=""
	for dsk in a4 b4 c4 d4; do
		[ -s /mnt/HD_${dsk}/.systemfile/.smbm.xml ] && smbFilePath=/mnt/HD_${dsk}/.systemfile/.smbm.xml && break
	done
	[ -z ${smbFilePath} ] && return
	
	
	
	#echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > /tmp/.smbm.xml
	cat ${smbFilePath} | 
	sed s/"#$oldUser#"/"#$newUser#"/g >> /tmp/.smbm.xml

	#echo >> /tmp/.smbm.xml
	
	for dsk in a4 b4 c4 d4; do
		if [ -d /mnt/HD_${dsk}/.systemfile ]; then
			cp -f /tmp/.smbm.xml /mnt/HD_${dsk}/.systemfile/.smbm.xml
		fi
	done
	sync
	rm /tmp/.smbm.xml
	
}

ModSambaPasswd(){
	local orig_username=${1}
	local new_username=${2}
	
	awk -F: -v orig=$orig_username -v new=$new_username '
	{
		if ($1 == orig) {
			printf("%s",new);
			for (i=2; i <= NF; i++) {
				printf(":%s",$i);
			}
			printf("\n");
		}
		else {
			print $0;
		}
	}
	' /etc/samba/smbpasswd > /etc/samba/smbpasswd-new
	mv /etc/samba/smbpasswd-new /etc/samba/smbpasswd

}

ModWebdavPasswd(){
	local orig_username=${1}
	local new_username=${2}
	
	awk -F: -v orig=$orig_username -v new=$new_username '
	{
		if ($1 == orig) {
			printf("%s",new);
			for (i=2; i <= NF; i++) {
				printf(":%s",$i);
			}
			printf("\n");
		}
		else {
			print $0;
		}
	}
	' /etc/passwd.webdav > /etc/passwd.webdav-new	
	mv /etc/passwd.webdav-new /etc/passwd.webdav
	
	if [ -e /tmp/system_ready ]; then
	  access_mtd "cp -f /etc/passwd.webdav /usr/local/config/" > /dev/null 2>&1 &
	fi
	
}

restart_service(){
	smbcom >/dev/null
	#smb restart >/dev/null
	#smbcmd -l >/dev/null
	afpcom >/dev/null
	#afp restart >/dev/null
	rsync_enable=`xmldbc -g /backup_mgr/rsyncd/enable`
	[ $rsync_enable -eq 1 ] && rsyncom -x >/dev/null
}

restart_alpha_service(){
	#afp
	afpcom >/dev/null
	
	#webdav
	[ -s /tmp/set_webdav_note ] && makedav start &>/dev/null
	
	#ftp
	ftp_state=`xmldbc -g /app_mgr/ftp/setting/state`
	if [ 1 -eq $ftp_state ]; then
		ftp restart >/dev/null
	fi
}

CP_Config_To_MTD(){ 
	# SAVE_PASSWD | SAVE_SHADOW | SAVE_SMBPW |
	# SAVE_GROUP | SAVE_FTP_MAGIC_NUM | SAVE_WEBDAV
	if [ -e /tmp/system_ready ]; then
		
		# SAVE_PASSWD
		cp -f /etc/passwd  /usr/local/config/
		[ -e /tmp/system_ready ] && cp -f /etc/uid /usr/local/config/
		
		# SAVE_SHADOW
		cp -f /etc/shadow /usr/local/config/
		
		# SAVE_SMBPW
		cp -f /etc/samba/smbpasswd /usr/local/config/
		
		# SAVE_GROUP
		cp -f /etc/group /usr/local/config/
		[ -e /etc/gid ] && cp -f /etc/gid /usr/local/config/
		
		# SAVE_FTP_MAGIC_NUM
		# none in LIB_CP_Config_To_MTD(...)
		
		# SAVE_WEBDAV
		cp -f /etc/passwd.webdav /usr/local/config/
		
	fi


}

WEB_START_FTP(){
	# ftp_state=`xmldbc -g /app_mgr/ftp/setting/state`
	# if [ 1 -eq $ftp_state ]; then
		# ftp start >/dev/null
	# fi
	
	for dsk in a4 b4 c4 d4; do
		if [ -d /mnt/HD_$dsk/.systemfile ]; then
			
			ads_status=`xmldbc -g /system_mgr/samba/ads_enable`
			
			if [ $ads_status -le 0 ]; then
				cp -f /etc/NAS_CFG/ftp.xml /mnt/HD_$dsk/.systemfile/ftp.xml
			else
				cp -f /etc/NAS_CFG/ftp.xml /mnt/HD_$dsk/.systemfile/ftp_ads.xml
			fi
			
		fi
	done
	
	sync
}



FTP_Del_User(){
	
	local targetUser=$1
	
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > /tmp/.ftp.xml
	
	tmpFTPxml=`cat $ETC_FTP_XML  | sed 's/>/>\n/g' | grep -v "<?xml"`
	
	for eachNode in $tmpFTPxml; do
		echo $eachNode | grep -q "#$targetUser#"

		if [ $? -eq 0 ]; then
			echo -n $eachNode | 
			sed s/"#$targetUser#,"//g | 
			sed s/",#$targetUser#"//g |
			sed s/"#$targetUser#"//g >> /tmp/.ftp.xml
		else
			echo -n $eachNode >> /tmp/.ftp.xml
		fi
	done
	
	echo >> /tmp/.ftp.xml
	mv /tmp/.ftp.xml $ETC_FTP_XML
}

FTP_Mod_User(){
	local oldUser=$1
	local newUser=$2
	
	[ ! -s $ETC_FTP_XML ] && return
	
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > /tmp/.ftp.xml
	tmpFTPxml=`cat $ETC_FTP_XML  | sed 's/>/>\n/g' | grep -v "<?xml"`
	
	for eachNode in $tmpFTPxml; do
		echo $eachNode | grep -q "#$oldUser#"

		if [ $? -eq 0 ]; then
			echo -n $eachNode | 
			sed s/"#$oldUser#"/"#$newUser#"/g >> /tmp/.ftp.xml
		else
			echo -n $eachNode >> /tmp/.ftp.xml
		fi
	done
	echo >> /tmp/.ftp.xml
	mv /tmp/.ftp.xml $ETC_FTP_XML
}
