#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# rescanItunes.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin


#---------------------
# Begin Script
#---------------------

# restart itunes service and don't wait
ITUNE=`xmldbc -g '/app_mgr/itunesserver/enable'`
if [ $ITUNE = "1" ]; then
	/usr/sbin/itunes.sh restart 2>/dev/null >/dev/null & 
fi

#---------------------
# End Script
#---------------------

