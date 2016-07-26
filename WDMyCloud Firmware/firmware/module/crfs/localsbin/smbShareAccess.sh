#!/bin/sh
#
#alpha by Vodka
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

operate=`echo $1 | tr "[:upper:]" "[:lower:]"`
#Filter "\" char +20150728.VODKA JIRA-3572
sharename=`echo "$2" | tr -d '\\'`
username="$3"
rw=`echo $4 | tr "[:upper:]" "[:lower:]"`

if [ $# != 4 ] && [ "$operate" == "add" ];then
      echo "usage: smbShareAcess.sh <operate> <share_name> <username> <read_only|read_write>"
      exit 1
elif [ $# != 4 ] && [ "$operate" == "update" ];then
      echo "usage: smbShareAcess.sh <operate> <share_name> <username> <read_only|read_write>"
      exit 1
elif [ $# != 3 ] && [ "$operate" == "delete" ];then
      echo "usage: smbShareAcess.sh <operate> <share_name> <username>"
      exit 1
fi

if [ "$rw" != "read_only" ] && [ "$rw" != "read_write" ] && [ "$operate" == "add" ]; then
	 echo "Must designate read_write, read_only"
	 exit 1
elif [ "$rw" != "read_only" ] && [ "$rw" != "read_write" ] && [ "$operate" == "update" ]; then
	 echo "Must designate read_write, read_only"
	 exit 1	 
fi


if [ "$1" != "delete" ];then
  wd_compinit -z $operate "$sharename" "$username" $rw
else
  wd_compinit -z $operate "$sharename" "$username"
fi
