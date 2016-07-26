#!/bin/sh
#
# 2013 Alpha by Vodka 
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /etc/nas/timeMachine.conf

operate=`echo $1 | tr "[:upper:]" "[:lower:]"`
#Filter "\" char +20150728.VODKA JIRA-3572
sharename=`echo "$2" | tr -d '\\'`
checkShareName=`echo "$2" | tr "[:upper:]" "[:lower:]"`
#media=`echo $3 | tr "[:upper:]" "[:lower:]"`
#new_sharename="$4"

failout(){
#  smbcom
  exit 1
}

if [ $# -ne 3 ] && [ "$operate" == "add" ];then
	  echo "usage: smbShare.sh <operate> <share_name> <media_serving=true/false>"
	  failout	
elif [ $# -nt 3 ] && [ "$operate" == "update" ];then
	  echo "usage: smbShare.sh <operate> <share_name> <media_serving=true/false>"
	  failout
elif [ $# -nt 3 ] && [ "$operate" == "rename" ];then
	  echo "usage: smbShare.sh <operate> <share_name> <new_share_name>"
	  failout			  		
elif [ $# -ne 2 ] && [ "$operate" == "delete" ];then
	  echo "usage: smbShare.sh <operate> <share_name>"
	  failout	
fi

if [ "$checkShareName" == "volume_1" ] || [ "$checkShareName" == "volume_2" ] || [ "$checkShareName" == "volume_3" ] || [ "$checkShareName" == "volume_4" ];then
    echo "Error: share name is invalid"
    failout
fi

if [ "$operate" == "add" ] || [ "$operate" == "update" ];then
		media=`echo $3 | tr "[:upper:]" "[:lower:]"`
elif [ "$operate" == "rename" ];then
		new_sharename="$3"
		checkNewShareName=`echo "$3" | tr "[:upper:]" "[:lower:]"`
fi

set=`echo $media | awk -F '='  '{ print $2 }'`
media_tag=`echo $media | awk -F '='  '{ print $1 }'`

if [ "$operate" == "add" ] || [ "$operate" == "update" ];then

	if [ "$media_tag" != "media_serving" ] ; then
		 echo "<media_serving=true/false>"
		 failout	
	fi
	
	if [ "$set" != "true" ] && [ "$set" != "false" ] ; then
		 echo "Must designate true, false"
		 failout	
	fi
  wd_compinit -y $operate "$sharename" $media
elif [ "$operate" == "rename" ];then
	if [ "$checkNewShareName" == "volume_1" ] || [ "$checkNewShareName" == "volume_2" ] || [ "$checkNewShareName" == "volume_3" ] || [ "$checkNewShareName" == "volume_4" ];then
	    echo "Error: new share name is invalid"
	    failout
	fi
	wd_compinit -y $operate "$sharename" "$new_sharename"
	# To modify TimeMachine config 2014.07.28 Brian
#	if [ "$sharename" == "$backupShare" ];then
#		setTimeMachineConfig.sh $backupEnabled $new_sharename $backupSizeLimit false
#	fi
elif [ "$operate" == "delete" ];then
  wd_compinit -y $operate "$sharename"
fi

