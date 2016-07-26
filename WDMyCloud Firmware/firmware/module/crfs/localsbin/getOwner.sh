#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getOwner.sh
#
# Returns owner name
#
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh	# $ownerUid

#---------------------
# Begin Script
#---------------------

awk -F: -v uid=$ownerUid '
{
    if ($3 == uid) {
        print $1
    }
}
' /etc/passwd

#---------------------
# End Script
#---------------------
