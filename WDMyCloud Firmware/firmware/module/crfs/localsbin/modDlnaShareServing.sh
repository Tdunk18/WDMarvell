#!/bin/sh
#
# © 2012 Western Digital Technologies, Inc. All rights reserved.
#
# modDlnaShareServing.sh <share> <none/any/music_only/pictures_only/videos_only>
#
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh

share=$1
setting=$2

RC=0

# remove from Access (if running) active list
/etc/init.d/access status >/dev/null
if [ $? -eq 0 ]; then
	case $setting in
	none)
		/usr/local/dlna-access/writeAccessContent.sh $share remove
		RC=$?
		;;
	any|music_only|pictures_only|videos_only)
		/usr/local/dlna-access/writeAccessContent.sh $share add
		RC=$?
		;;
	*)
		echo "usage: modShareMediaServing.sh <share> <none/any/music_only/pictures_only/videos_only>"
		RC=1
		;;
	esac
fi

exit $RC