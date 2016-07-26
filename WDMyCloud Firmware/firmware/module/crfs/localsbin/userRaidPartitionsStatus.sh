#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script prints status and location of each element in array

#In linear case, we can't require MD to be running as array will not start if failed
#and user needs to know what drive to replace.

. /usr/local/sbin/data-volume-config_helper.sh

#NOTE:  It would be easy if we could just report results from mdadm --detail or /proc/mdstat, but
#1) Broken linears will not start
#2) When elements fail, they are not always listed
#3) Physical location needs to be reported not device node name

reportRaidType=

#Parse inputs
while getopts ":R" opt; do
    case $opt in
        R ) reportRaidType=yes ;;
        ? ) logger  -p local2.notice "$0: invalid option"
            exit 1 ;;
    esac
done

shift $(($OPTIND - 1))

md=`userDataMD`
reportUnknown=

#Get missing drives and expected partitions
twoArrays=( `missingDrivesExpectedPartitions $md` )
#No drive detected on connector
listSATAConnectorsWithFailedElems=( `parseMissingDrivesExpectedPartitions MISSING_DRIVES_ON_SATA_CONNECTORS ${twoArrays[@]}` )
#Drive found so make list of array elements to expect
elements=( `parseMissingDrivesExpectedPartitions EXPECTED_PARTITIONS_ON_PRESENT_DRIVES ${twoArrays[@]}` )

cmd="mdadm --detail /dev/$md"
mdadmDetail=`$cmd`
result=$?
if [ $result -ne 0 ]; then
    #User data RAID is not up and running
    #Search super blocks for one that can tell RAID type
    raidType=
    for elem in "${elements[@]}"
    do
        raidType=`raidLevelInSuperBlock $elem`
        if [ "$raidType" = "raid1" ] || [ "$raidLevel" = "linear" ]; then
            break
        fi
    done
    if [ "$raidType" = "raid1" ]; then
        #The best source for RAID1 elements status is mdadm so report UNKNOWN until started.
        reportUnknown=yes
    else
        #A linear with a bad element will not start so we try to find bad element.
        listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $(testSuperBlocks ${elements[@]}) )
    fi
else
    #User data RAID is up and running
    raidType=`echo "$mdadmDetail" | sed -n -e '/^[ \t]*Raid Level :/ s/[ \t]*Raid Level :[ \t]*\(.*\)/\1/p'`
    if [ "$raidType" = "raid1" ]; then
        #Go through expected elements.
        #If they are marked faulty or missing, then they failed.
        for elem in "${elements[@]}"
        do
            stdio=`echo "$mdadmDetail" | grep $elem`
            if [ $? -ne 0 ]; then
                #Element is missing from array, mark location bad
                sataLoc=`SATALocation ${elem%%[0-9]}`
                if [ -n $sataLoc ]; then
                    listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $sataLoc )
                fi
            else
                echo "$stdio" | grep faulty >/dev/null 2>&1
                if [ $? -eq 0 ]; then
                    #Element is faulty, mark location bad
                    sataLoc=`SATALocation ${elem%%[0-9]}`
                    if [ -n $sataLoc ]; then
                        listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $sataLoc )
                    fi
                fi
            fi
        done
    else
        #Test super block
        listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $(testSuperBlocks ${elements[@]}) )
    fi
fi

#Remove duplicates
uniqueSATAConnectorsWithFailedElems=( `uniqueStringArray ${listSATAConnectorsWithFailedElems[@]}` )

#Report RAID type if command to.
if [ "$reportRaidType" = "yes" ]; then
    echo "RAID_TYPE:$raidType"
fi

#Loop over all SATA connectors in md reporting status and location
sataConnectors=( `mdSATAConnectors $md` )
for connector in "${sataConnectors[@]}"
do
    if [ "$reportUnknown" = "yes" ]; then
        #RAID1 so report UNKNOWN unless drive missing
        status=UNKNOWN
    else
        #Default to GOOD
        status=GOOD
    fi

    #If found to be bad, update status
    for bad in "${uniqueSATAConnectorsWithFailedElems[@]}"
    do
        if [ "$bad" = "$connector" ]; then
            status=FAILED
        fi
    done    

    #Map to labeled location
    label=`cabinetLabel $connector`

    #Output
    echo "$status $label"
done

exit 0
