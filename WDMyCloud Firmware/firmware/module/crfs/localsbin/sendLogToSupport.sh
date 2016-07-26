#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# sendLogToSupport.sh 
#
# returns: 
#   Name of file send to support, or server_connection_failed (if failed to send to support)
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/nas/config/wd-nas.conf 2>/dev/null
. /etc/system.conf

#---------------------
# Begin Script
#---------------------
#20140421.VODKA
logFile=`getSystemLog.sh`
fileName=`echo $logFile | awk -F/ '{print $NF}'`

folderName=""
case "${modelNumber}" in

	LT4A )
					#LT4A
					supportFTPLogin="lt4a_user:4lt4a_u!"
					;;
	KC2A )
					#KC2A
					supportFTPLogin="kc2a_user:4kc2a_u!"
					;;
	BZVM )
					#ZION
					supportFTPLogin="bzvm_user:4bzvm_u!"
					;;
	GLCR )
					#Glacier
					supportFTPLogin="glcr_user:4glcr_u!"
					folderName="glcr"
					;;
	BNEZ )
					#Sprite
					supportFTPLogin="bnez_user:4bnez_u!"
					folderName="bnez"
					;;
	BWZE )
					#Yellowstone
					supportFTPLogin="bwze_user:4bwze_u!"
					folderName="bwze"
					;;
	BBAZ )
					#Aurora
					supportFTPLogin="bbaz_user:4bbaz_u!"
					folderName="bbaz"
					;;
	BWAZ )
					#Yosemite
					supportFTPLogin="bwaz_user:4bwaz_u!"
					folderName="bwaz"
					;;	
	BG2Y )
					#BlackIce
					supportFTPLogin="bg2y_user:4bg2y_u!"
					folderName="bg2y"
					;;						
	BAGX )
	                #Mirrorman
					supportFTPLogin="bagx_user:4bagx_u!"
                    folderName="bagx"
					;;
	BWVZ )
	                #GrandTeton
					supportFTPLogin="bwvz_user:4bwvz_u!"
					folderName="bwvz"
					;;
	BVBZ )
	                #Ranger peak
					supportFTPLogin="bvbz_user:4bvbz_u!"
					folderName="bvbz"
					;;
	BNFA )
	                #Black Canyon
					supportFTPLogin="bnfa_user:4bnfa_u!"
					folderName="bnfa"
					;;
	BBCL )
	                #Bryce Canyon
					supportFTPLogin="bbcl_user:4bbcl_u!"
					folderName="bbcl"
					;;
	* )
					#Others
					supportFTPLogin=""
					;;					
esac

curl --silent -4 -T $logFile ftp://ftpext2.wdc.com --user ${supportFTPLogin}

if [ $? != 0 ]; then
	echo "server_connection_failed"
	#Delete log file
	rm $logFile
	exit 0;
fi

rm $logFile

echo "${fileName}"

#---------------------
# End Script
#---------------------

