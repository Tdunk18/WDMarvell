#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# modUserPassword.sh <name> <password> 
#
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh
# . /etc/system.conf


#---------------------
# Begin Script
#---------------------
doBeforeExit(){
	CP_Config_To_MTD
	/usr/sbin/account			# generate /var/www/xml/account.xml
}

if [ $# -lt 1  ]; then
    echo "usage: modUserPassword.sh <name> <parameter> [--fullname] [--admin]"
    echo "       <parameter> is password when no options are given, 'fullname' field when --fullname option is specified, "
    echo "                   isAdmin 1 or 0 when --admin is specified"
    exit 1
fi

username=${1}
param=${2:-""}
opt=${3:-""}
num_args="${#}"


matchedName=`getUsers.sh | grep -w "${username}"`
if [ "${matchedName}" ==  "" ]; then
    echo "user $username not found"
    exit 1
fi


if [ "$opt" == "--fullname" ]; then		# change fullname.
	#covert "+" to " "  Alpha.Vodka
	#fullname=${param}
	fullname=`echo ${param} | sed s/"+"/" "/g`	
	#echo ${fullname} | grep -q ' ' && firstName=`echo ${fullname} | cut -d ' ' -f 1` || firstName=
	#lastName=`echo ${fullname} | cut -d ' ' -f 2-`
	
	# account -m -u "$username" -f "$firstName" -t "$lastName"			# separate into 2 field
	account -m -u "$username" -f "$fullname"
	doBeforeExit
	exit 0
fi


if [ "$opt" == "--admin" ]; then
	if [ "${param}" == "1" ]; then		# add user to admin group
		account -m -u "$username" -l '#administrators#'
	#mark below , it will cause user disappear in group when account rename
	#else 								# remove user from admin group
	#	account -m -u "$username" -l ''
    fi
	doBeforeExit
    exit 0
fi


# change the users password
userfullname=`getUserInfo.sh "$username" fullname`

if [ "$num_args" -eq 1 ]; then
	account -m -u "$username" -p '' -f "$userfullname"
else
	account -m -u "$username" -p "$param" -f "$userfullname"
fi



# changeSambaPassword is changed by "account" binary
doBeforeExit
exit 0   
#---------------------
# End Script
#---------------------
