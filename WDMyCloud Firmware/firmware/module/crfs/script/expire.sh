#!/bin/bash

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
USERCONF=/tmp/user.conf
SHADOW=/etc/shadow
PASSWDWEBDAV=/etc/passwd.webdav

ACCOUNT_LOCK(){
	user=$1
	#cat $PASSWDWEBDAV | grep -w $user | sed 's/^$user/#$user/g' $PASSWDWEBDAV
	#WEBDAV user
	last_word=`cat $PASSWDWEBDAV | grep "^$user:"`
	chk_word=`echo ${last_word: -1}	`
	if [ "$chk_word" != "!" ] ;then
	   sed -i "/^$user:/ s/$/!/g" $PASSWDWEBDAV
	else
	   echo "webdav: account locked"
	fi

	#SMB user
	smbpasswd -d "$user"
	#SYS user
	usermod -L "$user"
}
ACCOUNT_UNLOCK(){
	user=$1
	#WEBDAV user
	#sed -i "s/^#$user/$user/g" $PASSWDWEBDAV
	last_word=`cat $PASSWDWEBDAV | grep "^$user:"`
	chk_word=`echo ${last_word: -1}	`
	if [ "$chk_word" == "!" ] ;then
	   sed -i "/^$user:/ s/.\{1\}$//g" $PASSWDWEBDAV
	else
	   echo "webdav: account unlocked"
	fi	
	
	#SMB user
	smbpasswd -e "$user"
	#SYS user
	usermod -U "$user"
}
CAL_ZONE_TIME(){
	zone=`date +%z`
	op=`echo $zone | cut -c 1`
	HR_10=`echo $zone | cut -c 2`
	HR_1=`echo $zone | cut -c 3`
	MIN_10=`echo $zone | cut -c 4`
	MIN_1=`echo $zone | cut -c 5`
	#echo $op $HR_10 $HR_1 $MIN_10 $MIN_1
	TIME=`expr $HR_10 \* 36000 \+ $HR_1 \* 3600 \+ $MIN_10 \* 600 \+ $MIN_1 \* 60` 
	#echo $TIME
	SYS_TIME=`date +%s`
	#echo $SYS_TIME
	if [ $op == "+" ] ;then
		echo `expr $SYS_TIME \+ $TIME`
	elif [ $op == "-" ] ;then
		echo `expr $SYS_TIME \- $TIME`
	fi
}
#Ignore ADS user 20140408.VODKA
#/usr/local/sbin/getUsers.sh > $USERCONF
awk -F: '($4 >= 502 && $4 <= 65000) && ($3==500 ||($3 >= 1001 && $3 <= 65000)) {print $1}' /etc/passwd > $USERCONF
totalaccounts=`cat $USERCONF | wc -l`
#cat $SHADOW

for((i=1; i<=$totalaccounts; i++ ))
do
	if [ ! -f $USERCONF ] ;then
		break
	fi
	username=`head -n $i $USERCONF | tail -n 1`
	#echo "************"
	echo "ID:"$username
	userexp=`cat $SHADOW | grep -w $username | awk -F: '{print $8}'`
	#userexp=`cat $SHADOW | awk -F':' '{print $username; if($1 == $username){print $8}}'`
	#userexp=`awk -F ':' '{if($1==$username){print $8}}' $SHADOW`
	#echo "$userexp"

	passwd=`cat $SHADOW | grep -w $username | awk -F: '{print $2}'`
	#echo "PASSWD:"$passwd
	if [ "`echo $passwd | grep '!'`" != "" ] ;then
		lock=true
	else
		lock=false
	fi
	
	if [ "$userexp" == "" -a "$lock" == "true" ] ;then
		echo "STATUS:not expired time and lock"
		ACCOUNT_UNLOCK $username
		continue
	elif [ "$userexp" == "" ] ;then
		continue
	fi
	
	userexpireinseconds=`expr $userexp \* 86400`
	#echo "userexpireinseconds:"$userexpireinseconds
	#todaystime=`date +%s`
	todaystime=`CAL_ZONE_TIME`
	#echo "todaystime:"$todaystime
	if [ $userexpireinseconds -lt $todaystime ] ;then
		echo "LOCK:"$lock
		if [ "$lock" == "true" ] ;then
			echo "STATUS:expired and lock"
		else
			echo "STATUS:expired and unlock"
			ACCOUNT_LOCK $username
		fi
	else
		#echo "The user account $username not expired"
		echo "LOCK:"$lock
		if [ "$lock" == "true" ] ;then
			echo "STATUS:not expired and lock"
			ACCOUNT_UNLOCK $username
		else
			echo "STATUS:not expired and unlock"
		fi	
	fi
done
rm -rf $USERCONF
