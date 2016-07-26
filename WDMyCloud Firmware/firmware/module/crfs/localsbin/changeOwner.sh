#!/bin/bash
#
# Modified by Alpha_Hwalock, for LT4A
#
# changeOwner.sh <owner_name>
# 
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /usr/local/sbin/shareFunc.sh

#---------------------
# Begin Script
#---------------------



new_owner=$1

if [ $# != 1 ]; then
	echo "usage: changeOwner.sh <new_ownername>"
	exit 1
fi

modUserName.sh `getOwner.sh` ${new_owner}

# reload has done in modUserName.sh



#---------------------
# End Script
#---------------------
