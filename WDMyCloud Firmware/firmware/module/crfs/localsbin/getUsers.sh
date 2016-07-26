#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getUsers.sh
#
# Returns usernames (all non-owner names)
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
# . /usr/local/sbin/share-param.sh
# . /etc/system.conf

#---------------------
# Begin Script
#---------------------

#for ADS  20131104.Vodka
ads_status=`xmldbc -g /system_mgr/samba/ads_enable`

awk -F: '($4 >= 502 && $4 <= 65000) && ($3==500 ||($3 >= 1001 && $3 <= 65000)) {print $1}' /etc/passwd

#ADS user name 20131104.Vodkai
if [ $ads_status -gt 0 ]; then
#  net ads -P user | tr "[:upper:]" "[:lower:]"
#  net ads search -P '(&(objectClass=user)(userAccountControl=66048))' name | sed '1d' | sed 's/name: //g' | sed '/^$/d' | tr "[:upper:]" "[:lower:]"
#66048: Enable 60050: Disable
net ads search -P '(&(objectClass=user)(|(userAccountControl=66048)(userAccountControl=512)))' sAMAccountName | sed '1d' | sed 's/sAMAccountName: //g' | sed '/^$/d' | tr "[:upper:]" "[:lower:]"
fi 
#---------------------
# End Script
#---------------------

