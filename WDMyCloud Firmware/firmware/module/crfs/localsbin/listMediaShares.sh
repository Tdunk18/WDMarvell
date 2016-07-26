#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
# listMediaShares.sh
#
# generate a list of all media-shared shares
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh

contentdir=`cat /etc/contentdir`

# get list of shares to scan 

echo "contentdir=${contentdir}" | awk '
BEGIN { 
    FS = "="; RS = "\n";
}
{
	if ($1 == "contentdir") {
		split($2, shareArr, ",");
		for ( share in shareArr ) {
			split(shareArr[share], detail, "|");
			if (detail[1] == "+A" || detail[1] == "+V" || detail[1] == "+M" || detail[1] == "+P") {
				printf("/shares%s\n", detail[2]);
			}
		}
		exit 0;
	}
}
'
