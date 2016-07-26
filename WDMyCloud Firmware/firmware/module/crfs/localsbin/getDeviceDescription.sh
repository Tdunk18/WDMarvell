#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getDeviceDescription.sh <share>

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
# . /usr/local/sbin/share-param.sh
# . /etc/system.conf

#---------------------
# Begin Script
#---------------------
smbConfig=/etc/samba/smb.conf

awk '
BEGIN { 
    RS = "\n" ; FS = " = ";
}
{
	if (match($1, "server string")) { print $2; exit 0; }
}
' $smbConfig

#---------------------
# End Script
#---------------------