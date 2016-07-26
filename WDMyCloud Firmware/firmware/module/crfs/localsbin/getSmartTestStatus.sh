#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getSmartTestStatus.sh 
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf
. /usr/local/sbin/drive_helper.sh

if [ $DVC_DRIVE_COUNT -gt 1 ]; then
	. /usr/local/sbin/data-volume-config_helper.sh
fi

#Echos to stdout smart status
#$1=device path example: /dev/sda
#
#good
#inprogress <0-100>
#aborted
#bad
smartTestStatus() 
{

    smartctl -s on -c "${1}" | grep "Self-test execution status" | awk '
BEGIN {
	FS="(";
}
{
	code=int(substr($2, 2, 3));
	if (code == 0) {
		print "good"
	}
	else if (code >= 240 && code < 250) {
		percent = (10-(code - 240)) * 10;
		printf("inprogress %i\n",percent);
	}
	else if (code == 25) {
		print "aborted"
	}
	else {
		print "bad"
	}
}
'

}

#cabinet is not labeled on 3g
declare -F cabinetLabel >/dev/null
isCabinetLabelUnAvailable=$?

connectors=( `SATAConnectors`)

#It is unfortunate that 3g still has 2 connectors when only one is used
#Delete unused one in 3g case
if [ $DVC_DRIVE_COUNT -gt 1 ]; then :
else
    for SATALoc in "${connectors[@]}"
    do
        device=`SATADevice $SATALoc`
        if [ -z "${device}" ]; then
            unset connectors[$SATALoc]
        fi
    done
fi

for SATALoc in "${connectors[@]}"
do
#VODKA
#echo ---SATALoc:$SATALoc
    #Initialize labeled location
    if [ $isCabinetLabelUnAvailable -ne 0 ]; then
        loc[$SATALoc]="UNDEFINED"
    else
        loc[$SATALoc]=`cabinetLabel $SATALoc`
    fi

    #Initialize to bad so missing drive will be marked bad
    status[$SATALoc]="bad"
    
    #Get device path of present drives(Missing drives are empty)
    device[$SATALoc]=`SATADevice $SATALoc`
done

#Update status of present drives
for SATALoc in "${connectors[@]}"
do
    if [ -n "${device[$SATALoc]}" ]; then
        smartTestResult=( `smartTestStatus "${device[$SATALoc]}"` )
        status[$SATALoc]=${smartTestResult[0]}
        if [ "${status[$SATALoc]}" =  "inprogress" ]; then
            percent[$SATALoc]=${smartTestResult[1]}
        fi
    fi
#VODKA
#echo ---device:${device[$SATALoc]} status:${status[$SATALoc]}
done

#Report results
if [ "$1" = "DRIVE_SPECIFIC" ]; then
    #Report individual drives
    for SATALoc in "${connectors[@]}"
    do
        echo "${loc[$SATALoc]}:${status[$SATALoc]}:${percent[$SATALoc]}"
    done
else
    #Report summary - Only of drives that actually ran test
    #If all the drives have completed test( bad, aborted, or good ) report giving
    #precedence in this order otherwise report lowest progress.
    #NOTE:  This else clause is here to maintain previous behavior.
    reportIndex=

    #Search for lowest in progress
    for SATALoc in "${connectors[@]}"
    do
        #Only consider drives that ran the test
        if [ -n "${device[$SATALoc]}" ]; then
            if [ "${status[$SATALoc]}" =  "inprogress" ]; then
                if [ -z "$reportIndex" ]; then
                    reportIndex=$SATALoc
                    continue
                fi
                #Check if current is lower than already found
                if [ "${percent[$SATALoc]}" -lt "${percent[$reportIndex]}" ]; then
                    reportIndex=$SATALoc
                fi
            fi
        fi
    done

    #If none are in progress, search for bad, aborted, or good in that order
    if [ -z "$reportIndex" ]; then
        for SATALoc in "${connectors[@]}"
        do
            #Only consider drives that ran the test
            if [ -n "${device[$SATALoc]}" ]; then
                if [ -z "$reportIndex" ]; then
                    reportIndex=$SATALoc
                    continue
                fi
                #Find highest precedence in reporting
                case "${status[$SATALoc]}" in 
                    bad)
                        #bad is highest precedence do just take this one
                        reportIndex=$SATALoc
                        ;;

                    aborted)
                        if [ "${status[$reportIndex]}" = "good" ]; then
                            reportIndex=$SATALoc
                        fi
                        ;;
                    good)
                        #good is lowest precedence, so no need to check against current
                        ;;
                esac
            fi
        done
    fi

    if [ -z "$reportIndex" ]; then
        #No drives ran the test
        exit 1
    else
        echo "${status[$reportIndex]} ${percent[$reportIndex]}"
    fi
fi
exit 0
