#!/bin/sh
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
# cmdMediaServer.sh <rebuild/reset_defaults/rescan>
#
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh

#20140421.VODKA
TWONKY_IP="127.0.0.1:9000"

cmd=$1
exit_code=0

case ${cmd} in
reset_defaults)
        # Wait up to 5 seconds for Twonky to receive reset request.
        curl -m 5 "http://${TWONKY_IP}/rpc/reset -o /dev/null"
        exit_code=`echo $?`
        ;;

rebuild)
        # Wait up to 5 seconds for Twonky to receive rebuild request.
        curl -m 5 -s "http://${TWONKY_IP}/rpc/rebuild -O /tmp/cgi_dlna.log -o /dev/null &"
		echo $?
		if [ -f /tmp/cgi_dlna.log ]; then
			rm /tmp/cgi_dlna.log
		fi
        exit_code=`echo $?`
        ;;

rescan)
        # Wait up to 5 seconds for Twonky to receive rescan request.
        curl -m 5 "http://${TWONKY_IP}/rpc/rescan -o /dev/null &"
		echo $?
        exit_code=`echo $?`
        ;;

*)
        echo "usage: cmdMediaServer.sh <rebuild/reset_defaults/rescan>"
        exit 1
esac

# Check if requested command could not be executed against Twonky.
if [ $exit_code != 0 ]; then
        logger -p local5.err "cmdDlnaServer.sh: Could not execute requested DLNA server command ${cmd}, exit code $exit_code."
        exit 1
fi
