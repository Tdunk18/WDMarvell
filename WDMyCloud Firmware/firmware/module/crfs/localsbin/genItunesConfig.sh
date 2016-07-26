#!/bin/sh
#
# © 2010 Western Digital Technologies, Inc. All rights reserved.
#
# genItunesConfig.sh 
#
# Generate itunes config from twonky configuration
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh

contentdir=`cat /etc/contentdir`

# get list of shares to scan 

itunes_scan_list=`echo "contentdir=${contentdir}" | awk '
BEGIN { 
    FS = "="; RS = "\n";
	first = 1;
}
{
	if ($1 == "contentdir") {
		split($2, shareArr, ",");
		for ( share in shareArr ) {
			split(shareArr[share], detail, "|");
			if (detail[1] == "+A" || detail[1] == "+V" || detail[1] == "+M") {
				if (first == 0) {
					printf(",");
				}
				first = 0;
				printf("\"/shares%s\"", detail[2]);
			}
		}
		exit 0;
	}
}
'`


# write forked-daap.conf file (ensure it is not empty, or forked-daapd will crash)
if [ "$itunes_scan_list" == "" ]; then
	itunes_scan_list="\"/var/nothing\""
fi
awk -v itunes_scan_list=$itunes_scan_list '
{
	if ($1 == "directories") {
		printf("        directories = { %s }\n", itunes_scan_list);
	}
	else {
		print $0;
	}
} 
' /etc/forked-daapd.conf.orig > /etc/forked-daapd.conf

