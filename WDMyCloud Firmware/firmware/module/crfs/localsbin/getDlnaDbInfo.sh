#!/bin/bash
#
# (c) 2014 Western Digital Technologies, Inc. All rights reserved.
#
# getDlnaDbInfo.sh
#
# A sample output from the script is shown below. The order of writing the
# values out is important; any other order will confuse the upper layers.
#
# ["version \"7.2.2-RC6\"","music_tracks \"1\"","pictures \"4\"","videos \"11\"","time_db_update \"1366415400\"","scan_in_progress \"false\""]
#
# This script is used by the WebUI Media screen.

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

# 20140421.VODKA
TWONKY_IP="127.0.0.1:9000"
info_status=/tmp/twonky_info

twonky_rpc_get_info() {
        # Get info_status option from Twonky.
        #port=`getMediaServerPort.sh`

        curl -m 5 "http://${TWONKY_IP}/rpc/info_status" > ${info_status} 2>/dev/null
        if [ $? != 0 ]; then
                echo "twonky_rpc_get_info() failed twonky get"
                exit 1
        fi

        awk '
        BEGIN {
                FS = "|"; RS = "\n";
        }
        {
                if ($1 == "version") version = $2
                if ($1 == "musictracks") music_tracks = $2
                if ($1 == "pictures") pictures = $2
                if ($1 == "videos") videos = $2
                if ($1 == "dbupdate") time_db_update = $2		
        }
        END {
                # print output
                printf("version \"%s\"\n", version);
                printf("music_tracks \"%s\"\n", music_tracks);
                printf("pictures \"%s\"\n", pictures);
                printf("videos \"%s\"\n", videos);
                gsub("<br>","",time_db_update);
                gsub("<b>","",time_db_update);
                gsub("</b>","",time_db_update);
                printf("time_db_update ");
				system("sec=`date -d " "\"" time_db_update "\"" " +%s`" ";echo \\\"$sec\\\"");
                if ( match(time_db_update, "In Progress") == 0 )
                        print "scan_in_progress \"false\"";
                else
                        print "scan_in_progress \"true\"";
        }
        ' ${info_status}
}

twonky_rpc_get_info