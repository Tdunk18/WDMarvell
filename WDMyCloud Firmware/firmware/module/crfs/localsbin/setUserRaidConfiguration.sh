#!/bin/bash
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script starts multistep process to convert RAID type
#
#Warning:  Do not expect caller to get anything on standard out as caller
#will not wait for completion.

. /etc/nas/config/data-volume-config.conf 2>/dev/null
. /usr/local/sbin/data-volume-config_helper.sh

#Parse inputs
while getopts ":t:" opt; do
    case $opt in
        t ) raid=$OPTARG ;;
        ? ) logger  -p local2.notice "$0: invalid option"
            exit 1 ;;
    esac
done

shift $(($OPTIND - 1))

#Input validation
if [ "$raid" != "RAID1" ] && [ "$raid" != "LINEAR" ]; then
    logger  -p local2.notice "$0: invalid raid type \"${raid}\""
    exit 1
fi

#Clean up previous converstions
rm "$raidConversionProgressFile" >/dev/null 2>&1

#Start progress indicator
raidConversionCategory 1
progress "Stopping Services " 0
date '+%s' >${raidConversionStartTimeFile}

#Mark as converting
echo "CONVERTING" >$raidConversionStatusFile

md=`userDataMD`
multiStepConvertRAID.sh -d /dev/$md -t $raid &

exit 0
