#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script echos status of last RAID conversion along with step and percent
#complete if currently converting.

. /etc/nas/config/data-volume-config.conf 2>/dev/null

#Get category of RAID conversion
getRaidConversionCategory() {
    local category

    category=

    if [ -e $raidConversionCategoryFile ]; then
        category=`cat $raidConversionCategoryFile`
    fi

    echo "$category"
}


#Initialize response to CONVERSION_SUCCESS.  Another conversion status of 'NONE'
#could be added, but it would only be returned on a new box.
status='CONVERSION_SUCCESS'
category=
step=''
percent=''
elapsedTime=''

#RAID conversion status is read from file
#expected values: CONVERSION_SUCCESS, CONVERSION_FAILURE, CONVERTING
if [ -f $raidConversionStatusFile ]; then
    status=`cat $raidConversionStatusFile`
fi

if [ "$status" = 'CONVERTING' ]; then

    #Get category/phase of converstion
    category=`getRaidConversionCategory`

    #RAID style is currently being converted so get current progress

    #Progress is contained in file with form:
    #<Step> XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX--- 
    #where step is name of current #step of conversion and number of Xs represents progress. 

    #NOTE:  File may contain other lines not representing progress

    #Example:
    # resize2fs 1.41.12 (17-May-2010)
    # Estimated minimum size of the filesystem: 1017974
    # MyBookLiveDuo:~# resize2fs -fp /dev/md1 1017974 
    # resize2fs 1.41.12 (17-May-2010)
    # Resizing the filesystem on /dev/md1 to 1017974 (4k) blocks.

    # Begin pass 2 (max = 32768)
    # Relocating blocks             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---  
    # Begin pass 3 (max = 14870)
    # Scanning inode table          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX--  
    # The filesystem on /dev/md1 is now 1017974 blocks long.

#Lines indicating progress have 40 dashes followed by 40 back spaces and X's representing progress
stepPercent=`awk '/----------------------------------------\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b/ {
    step++
    for (i=1; i<=NF; i++) {
        if ( $i ~ /----------------------------------------\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b/ ) {
            match($i, /X+/)
            break
        }
    }
}
END { 
        XCount=RLENGTH
        if ( XCount == -1 ) XCount=0
        percent=int(XCount*100/40)
        print step":"percent
    }
' $raidConversionProgressFile`

    #Calculate elapsed time in seconds
    if [ -e ${raidConversionStartTimeFile} ]; then
        startTime=`cat ${raidConversionStartTimeFile}`
        elapsedTime=`expr $(date '+%s') - "$startTime"`
    fi
fi

#Print step and % complete
echo "$status"
echo "$category"
echo "${stepPercent%%:*}"
echo "${stepPercent##*:}"
echo "$elapsedTime"

exit 0
