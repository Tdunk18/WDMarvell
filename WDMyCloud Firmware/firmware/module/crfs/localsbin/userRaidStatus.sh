#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script prints status of RAID

#The amount to RAID status available is dependent on the RAID style.  RAID1 can
#report failed drive and rebuilding.  LINEAR can't report much in the way of 
#status.

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/data-volume-config_helper.sh

md=`userDataMD`

#Check for rebuilding drive
    #Example)Rebuild has 'recovery'
    #md1 : active raid1 sdb4[2] sda4[0]
    #      97268 blocks super 1.0 [2/1] [U_]
    #      [>....................]  recovery =  1.5% (1664/97268) finish=0.9min speed=1664K/sec
status=`sed -n -e '/'$md' :/,/^[ \t]*$/ {
                                     s/.*recovery[ \t]*=[ \t]*\([0-9][0-9]*\)\.*.*/REBUILDING-\1/p
                                    }' /proc/mdstat`
if [ -n "$status" ]; then
    echo ${status%-?*}
    echo ${status##?*-}
    exit 0
fi

partitionStatus=`userRaidPartitionsStatus.sh -R`

echo "$partitionStatus" | grep FAILED >/dev/null 2>&1
if [ $? -eq 0 ]; then
    #Atleast one drive failed
    raidType=`echo "$partitionStatus" | sed -n -e '/^RAID_TYPE:/ s/RAID_TYPE:\(.*\)/\1/p'`
    if [ "$raidType" = "linear" ]; then
        status=FAILED
    elif [ "$raidType" = "raid1" ]; then
        status=FAILED_DRIVE
    fi
else
    #No drive known to have failed so check to see if it is stopped.
    #If MD is not running, return STOPPED
    grep $md /proc/mdstat 1>/dev/null
    if [ $? -ne 0 ]; then
        status=STOPPED
    else
        #Didn't find anything wrong
        status=GOOD
    fi
fi

echo $status
exit 0