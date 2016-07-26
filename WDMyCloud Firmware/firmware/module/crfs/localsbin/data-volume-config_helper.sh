#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#

. /etc/nas/config/data-volume-config.conf 2>/dev/null
. /usr/local/sbin/drive_helper.sh
. /etc/system.conf

#Set category of RAID conversion
raidConversionCategory() {
    local category

    category="$1"

    case "$category" in
        1) categoryTxt="PREPARING_SYSTEM" ;;
        2) categoryTxt="CONVERTING" ;;
        3) categoryTxt="RESTORING_SYSTEM" ;;
        *) categoryTxt=
           logger  -p local2.notice "$0: raidConversionCategory Invalid category:$1:"            
           ;;
    esac
    if [ -n "$categoryTxt" ]; then
        echo "$categoryTxt" >$raidConversionCategoryFile
    fi
}

#Progress function approximates method used in resize2fs
progress() {
    local step="$1"
    local percent="$2"
    local xs=''
    local count
    local outPut
    local progress
    local bs40=''

    #Create progress file if it does not exist
    if [ ! -e $raidConversionProgressFile ]; then
        echo "Raid conversion progress" > $raidConversionProgressFile
    fi

    if [ "$percent" -eq 100 ]; then
        count=40
    else
        count=`expr $percent \* 40`
        count=`expr $count / 100`
    fi

    for (( i=1; i<=$count; i++ ))
    do
        xs=${xs}X
    done

    progress=" ----------------------------------------${bs40}${xs}"

#Remove step if it is last line and append current step and progress
sed -i -e '$ {
    /^'"$step"'/s/.*//
    a\
'"$step $progress"'
}' $raidConversionProgressFile

}

#Returns block size of file system passed in device
##Returns 'ERROR' string on error
fsBlockSize() {
    local md
    local cmd
    local dumpe2fsStdOut
    local result
    local fileSystemBlockSize

    md=$1

    #Get file system block size
    cmd="dumpe2fs -h /dev/${md}"
    dumpe2fsStdOut=`$cmd`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: $cmd returned $result"
        echo "ERROR"
    else	
        fileSystemBlockSize=`echo "$dumpe2fsStdOut" | sed -n -e '/^Block size:/ s/Block size:[ ]*\([0-9][0-9]*\)/\1/p'`
        echo $fileSystemBlockSize
    fi
}

#Print estimate of minimum size of the filesystem in file system blocks
##Returns 'ERROR' string on error
minimumFileSystemInFSBlocks() {
    local md
    local cmd
    local stdOut
    local result
    local estimateMinFileSystemSize
    local fileSystemBlockSize
    local oneHundredBGInFSBlocks
    local ONE_HUNDRED_GB=106325606400

    md=$1

    fileSystemBlockSize=`fsBlockSize $md`
    if [ "$fileSystemBlockSize" = "ERROR" ]; then
        logger  -p local2.notice "$0: Failed to get block size"
        echo "ERROR"
        exit 1
    fi

    oneHundredBGInFSBlocks=`expr $ONE_HUNDRED_GB / $fileSystemBlockSize`

    cmd="df -B${fileSystemBlockSize} /dev/${md}"
    stdOut=`$cmd`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: $cmd returned $result"
        echo "ERROR"
    else
         estimateMinFileSystemSize=`echo "$stdOut" | sed -n -e '/^\/dev\/md3/s#/dev/md.[ \t]*[0-9][0-9]*[ \t]*\([0-9][0-9]*\).*#\1#p'`

         #resize2fs -fP does not update estimate until umount so use df and give yourself 100GB of head room
         estimateMinFileSystemSize=`expr $estimateMinFileSystemSize + $oneHundredBGInFSBlocks`
         echo $estimateMinFileSystemSize
    fi
}

#Prints size of MD in 1KB blocks
sizeOfMD1KBBlocks() {
    local md
    local spaceForFileSystem

    md=$1

    spaceForFileSystem=`sed -n -e "/${md} :/,/md. :/ s/[ ]\+\([0-9]\+\).*/\1/p" /proc/mdstat`
    if [ $? -ne 0 ]; then
        logger  -p local2.notice "$0: sed -n -e \"/${md} :/,/md. :/ s/[ ]\+\([0-9]\+\).*/\1/p\" /proc/mdstat returned $result"
        echo "ERROR"
    else
        echo $spaceForFileSystem
    fi
}

#Prints md of user data
userDataMD() {
    echo ${dataVolumeDevice##*/}
}

#Print RAID type
userDataRAIDType() {
    local md
    local raidType
    local result

    md=`userDataMD`
    raidType=`sed -n -e "/^${md}/s/${md} : active \([^ ]*\).*/\1/p" /proc/mdstat`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: sed -n -e /^${md}/s/${md} : active \([^ ]*\).*/\1/p /proc/mdstat returned error $result"
    fi

    #Convert to upper case
    raidType=`echo $raidType | tr '[:lower:]' '[:upper:]'`
    if [ "$raidType" != "RAID1" ] && [ "$raidType" != "LINEAR" ]; then
        raidType="UNKNOWN"
    fi
    echo $raidType
}

#Print location of SATA device (SATA connector number)
#$1 is SATA device /dev/sd[a-z]
#NOTE:  When device is missing, its location is unknown and will be returned as empty string
SATALocation() {
    local fullPath
    local device

    fullPath="$1"
    device=${fullPath##*/}

    #Use device sym link to locate which SATA connector physical drive is connected.
    ls -l /sys/block/"$device" | sed -n -e 's/.*host\([0-9]\).*/\1/p'
}

#Print cabinet label associated with sata connector
#$1 SATA connector number 1 2 ...
cabinetLabel() {
    local connector
    local label

    connector="$1"

    case "$connector" in
        0) label=B ;;
        1) label=A ;;
        *) label=
           logger  -p local2.notice "$0: cabinetLabel Invalid SATA connector number $connector"            
           ;;
    esac
    echo "$label"
}

#Print list of internal devices (/dev/sda /dev/sdb)
internalDrives() {
    local connectors
    local SATALoc
    local device
    local driveList

    connectors=( `SATAConnectors`)
    driveList=

    for SATALoc in "${connectors[@]}"
    do
        device=`SATADevice $SATALoc`
        
        if [ -n "$device" ]; then
            #Drive is present
            driveList=( ${driveList[@]} $device )
        fi
    done

    echo "${driveList[@]}"
}

#Print list of array elements
#$1 is mdX
arrayElements() {
    local cmd
    local mdadmDetail
    local result
    local partitionList
    local md

    md="$1"

    cmd="mdadm --detail /dev/$md"
    mdadmDetail=`$cmd`
    result=$?
    if [ $result -ne 0 ]; then
        logger  -p local2.notice "$0: $cmd returned $result"
        echo "ERROR"
    else
        partitionList=( `echo "$mdadmDetail" | sed -n -e '/^[ ]*Number/,$ s/[^/]*\(\/.*\)/\1/p'` )
        echo "${partitionList[@]}"
    fi
}

#This function calculates and prints the size of RAID1 file system when converting
#from linear in file system blocks.
raid1FileSystemSizeInFSBlocks() {
    local mdSize
    local spaceForFileSystem
    local md
    local fileSystemBlockSize

    md=$1

    fileSystemBlockSize=`fsBlockSize $md`
    if [ "$fileSystemBlockSize" = "ERROR" ]; then
        logger  -p local2.notice "$0: Failed to get block size"
        exit 1
    fi

    mdSize=`sizeOfMD1KBBlocks $md`
    if [ "$mdSize" = "ERROR" ]; then
        logger  -p local2.notice "$0: Failed to get md size"
        echo "ERROR"
    fi

    #Divide MD by 2 because RAID1 is half size of linear
    spaceForFileSystem=`expr $mdSize / 2`

    #Convert to file system block size
    spaceForFileSystem=`expr $spaceForFileSystem \* 1024`
    spaceForFileSystem=`expr $spaceForFileSystem / $fileSystemBlockSize`

    #When converting from linear to mirror, it would be expected that mirror be half
    #size, but 32 file system blocks less has been observed.  Here we shorten mirror
    #by 10 times this much for margin. (1.25M assuming 4k blocks)
    spaceForFileSystem=`expr $spaceForFileSystem - 320`
    echo $spaceForFileSystem
}

#Print partitions belonging to md for a drive on a particular SATA connector
partitionsForArrayOnDrive() {
    local line
    local record
    local oifs
    local md
    local sataConnector
    local partitions

    md="$1"
    sataConnector="$2"

    #md[01] are rootfs md (mdrootfs)
    if [ "$md" = "md0" ] || [ "$md" = "md1" ]; then
       md="mdrootfs"
    fi

    partitions=()
    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        if [ "${record[1]}" != "$md" ]; then
            IFS=$oifs
            continue
        fi
        # Found md of interest
        IFS=-
        sataConnectorPartitionPairs=( ${record[3]} )
        IFS=$oifs
        for pair in "${sataConnectorPartitionPairs[@]}"
        do
            if [ "${pair%:*}" = "$sataConnector" ]; then
                partitions=( ${partitions[@]} ${pair#*:} )
            fi
        done
    done

    echo "${partitions[@]}"
}

#Print array list
mdArrays() {
    local mdList
    local currentRootDevice
    local line
    local record
    local oifs
    local md
    local sataConnector
    local mdList
    local found

    mdList=()
    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        IFS=$oifs
        if [ "${record[1]}" = "mdrootfs" ]; then
            #Root file system is sometimes md0 and sometimes md1
            #If booted from disk, use md out of /proc/cmdline, else return md0
            currentRootDevice=`cat /proc/cmdline | awk '/root/ { print $1 }' | cut -d= -f2`
            if [ "${currentRootDevice##*/}" == "md1" ]; then
                found="md1"
            else
                found="md0"
            fi
        else
            found="${record[1]}"
        fi
        mdList=( ${mdList[@]} $found )
    done

    echo "${mdList[@]}"
}

#Print UUID of RAID element
getUUID() {
    local device

    device="$1"

    mdadm --examine $device 2>/dev/null | sed -n -e '/\(^[ \t]*Array[ \t]*UUID\)\|\(^[ \t]*UUID\)/s/.*UUID[ \t]*:[ \t]*\([^ \t]*\).*/\1/p'
}

#Print RAID level listed in superblock
raidLevelInSuperBlock() {
    local $device

    device="$1"

    mdadm --examine $device | sed -n -e '/^[ \t]*Raid Level/s/[ \t]*Raid Level[ \t]:[ \t]*\([^ \t]*\).*/\1/p'
}

#Copies partition map from source device($1) to target device($2)
#Prints SUCCESS or Error Message
copyPartitionMap() {
    local source
    local target
    local script
    local endSector
    local willFit
    local targetSize
    local cmd
    local stdOut
    local result
    local expectedPartitions

    source="$1"
    target="$2"

    #Test to see if target is big enough
    #Find biggest end sector and see that it is smaller than drive
    endSector=( `parted ${source} unit s print | sed -n -e '/^[ ]*[0-9][ \t]*/s/^[ ]*[0-9][ \t]*[0-9][0-9]*s[ \t]*\([0-9][0-9]*\)s.*/\1/p' | sort -rn` )
    targetSize=`cat /sys/block/${target##*/}/size`

    willFit=`expr ${endSector[0]} \> $targetSize`
    if [ $willFit -ne 0 ]; then
        #Drive is too small
        logger  -p local2.notice "$0: Drive too small.  Source $source has end sector of $endSector when target $target has size $targetSize"
        echo "DRIVE_TOO_SMALL"
        return
    fi

    #Example partition to be duplicated.
    # MyBookLiveDuo:~# parted /dev/sdb unit s print
    # Model: ATA WDC WD30EZRX-00M (scsi)
    # Disk /dev/sdb: 5860533168s
    # Sector size (logical/physical): 512B/4096B
    # Partition Table: gpt

    # Number  Start     End         Size        File system     Name     Flags
    #  3      30720s    1032191s    1001472s    linux-swap(v1)  primary
    #  1      1032192s  5031935s    3999744s    ext3            primary  raid
    #  2      5031936s  9031679s    3999744s    ext3            primary  raid
    #  4      9031680s  195311615s  186279936s  ext4            primary  raid

    #Strip partition map down to lines with partition information and sort in partition order.
    #Transform lines with 'raid' to:
    #mkpart primary 1032192 503193
    #set 1 raid on

    #Transform lines without 'raid' to:
    #mkpart primary 30720 1032191

    script=`parted "$source" unit s print | sed -n -e '/^[ ]*[0-9][ \t]*/p' | sort -n | 
    sed -n -e '{s/^[ ]*\([0-9]\)[ \t]*\([0-9][0-9]*\)s[ \t]*\([0-9][0-9]*\)s.*\(raid\).*/\mkpart primary \2 \3 set \1 \4 on/p
                s/^[ ]*\([0-9]\)[ \t]*\([0-9][0-9]*\)s[ \t]*\([0-9][0-9]*\)s.*/\mkpart primary \2 \3/p
    }'`

    logger  -p local2.notice "$0: DEBUG parted $target -s mklabel gpt unit s ${script} quit"

    #NOTE: -s is need to prevent needing user input when drive already has partitions
    ##parted "$target" -s mklabel gpt unit s ${script} quit
    cmd="parted $target -s mklabel gpt unit s ${script} quit"
    stdOut=`$cmd`
    result=$?
    logger  -p local2.notice "$0: $cmd returned $result with stdOut:$stdOut:"

    # make the kernel re-read the partition table
    # - sleep needed to prevent possible disk busy condition on sfdisk operation
    sleep 5
    sfdisk -R $target

    #Wait for dev nodes to get populated
    while sleep 2; do
        expectedPartitions=`parted -m $target print | sed -n -e '/^[0-9]\+:/ s#\([0-9]\+\).*#'"$target"'\1#p'`
        ls ${expectedPartitions[@]} >/dev/null 2>&1
        if [ $? -eq 0 ]; then break; fi     
        echo "waiting for "${expectedPartitions[@]}
    done
}


#Print raid level by md#
#$1=md#
raidLevel() {
    local line
    local record
    local oifs
    local md
    local level

    level=

    md="$1"
    #md[01] are rootfs md (mdrootfs)
    if [ "$md" = "md0" ] || [ "$md" = "md1" ]; then
       md="mdrootfs"
    fi

    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        if [ "${record[1]}" != "$md" ]; then
            IFS=$oifs
            continue
        fi
        IFS=$oifs
        level=${record[2]}
    done

    echo "$level"
}

#Print elements of array
#$1=mdX 
mdElements() {
    local line
    local elements
    local record
    local oifs
    local device
    local partition

    md="$1"
    #md[01] are rootfs md (mdrootfs)
    if [ "$md" = "md0" ] || [ "$md" = "md1" ]; then
       md="mdrootfs"
    fi

    elements=()
    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        if [ "${record[1]}" != "$md" ]; then
            IFS=$oifs
            continue
        fi
        # Found md of interest
        IFS=-
        sataConnectorPartitionPairs=( ${record[3]} )
        IFS=$oifs
        for pair in "${sataConnectorPartitionPairs[@]}"
        do
            #Map to sda sdb ... from SATA connector
            device=`SATADevice ${pair%:*}`
            partition=${pair#*:}
            elements=( ${elements[@]} ${device}$partition )
        done
    done

    echo "${elements[@]}"
}

#Prints MISSING_DRIVES_ON_SATA_CONNECTORS [ 0 1 ... ] EXPECTED_PARTITIONS_ON_PRESENT_DRIVES [ sda4 sdb4 ...]
#of passed in md.
#MISSING_DRIVES_ON_SATA_CONNECTORS: List of SATA connectors which by configuration
#should have had partition in this md, but drive is missing
#EXPECTED_PARTITIONS_ON_PRESENT_DRIVES:  List of partitions that are expected to be part of md of present drive.
missingDrivesExpectedPartitions() {
    local md
    local elements=()
    local line
    local oifs
    local record
    local sataConnectorPartitionPairs=()
    local pair
    local device
    local partition
    local listSATAConnectorsWithFailedElems=()
    local uniqueSATAConnectorsWithFailedElems=()

    md="$1"
    #md[01] are rootfs md (mdrootfs)
    if [ "$md" = "md0" ] || [ "$md" = "md1" ]; then
       md="mdrootfs"
    fi

    #Get pairs of SATAConnector:PartitionNumber-...
    elements=()
    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        if [ "${record[1]}" != "$md" ]; then
            IFS=$oifs
            continue
        fi
        # Found md of interest
        IFS=-
        sataConnectorPartitionPairs=( ${record[3]} )
        IFS=$oifs
        for pair in "${sataConnectorPartitionPairs[@]}"
        do
            #Map to sda sdb ... from SATA connector
            device=`SATADevice ${pair%:*}`
            partition=${pair#*:}
            if [ -z "$device" ]; then
                #No drive detected on connector
                listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} ${pair%:*})
            else
                #Drive found so make list of expected partitions
                elements=( ${elements[@]} ${device}$partition )
            fi
        done
    done
    
    #Remove duplicate SATA connectors
    uniqueSATAConnectorsWithFailedElems=( `uniqueStringArray ${listSATAConnectorsWithFailedElems[@]}` )

    echo "MISSING_DRIVES_ON_SATA_CONNECTORS ${uniqueSATAConnectorsWithFailedElems[@]} EXPECTED_PARTITIONS_ON_PRESENT_DRIVES ${elements[@]}"
}

#Helper function to parse results from missingDrivesExpectedPartitions()
parseMissingDrivesExpectedPartitions() {
    local arrayHeader
    local inArray=()
    local outArray=()
    local tst
    local copy=

    arrayHeader="$1"
    shift

    inArray=( "${@}" )
    outArray=()

    #Search for start
    for tst in "${inArray[@]}"
    do
        if [ "$tst" = "$arrayHeader" ]; then
            #Skip everything up to and including the header
            copy=yes
            continue
        fi

        if [ "$tst" = "EXPECTED_PARTITIONS_ON_PRESENT_DRIVES" ]; then
            #Stop at second array unless it was found as header above
            copy=
            continue
        fi

        if [ "$copy" = "yes" ]; then
            outArray=( ${outArray[@]} $tst )
        fi
    done

    echo ${outArray[@]}
}

#Returns unique string entries found in passed in array
#NOTE:  This only works on array entries without internal field separators ($IFS)
uniqueStringArray() {
    local duplicates=()
    local uniqueElements=()
    local testElem
    local found
    local uniqueElem

    duplicates=( "${@}" )

    #Remove duplicates
    uniqueElements=()
    for testElem in "${duplicates[@]}"
    do
        found=
        for uniqueElem in "${uniqueElements[@]}"
        do
            if [ "$uniqueElem" = "$testElem" ]; then
                found=yes
                break
            fi
        done
        #Only put in list one time
        if [ "$found" != "yes" ]; then
            uniqueElements=( ${uniqueElements[@]} $testElem )
        fi
    done

    #Print unique entries
    echo ${uniqueElements[@]}
}

#Prints locations of drives from passed in list of partitions with missing super blocks
testSuperBlocks() {
    local elements=()
    local elem
    local cmd
    local stdout
    local result
    local sataLoc
    local listSATAConnectorsWithFailedElems=()

    elements=( "${@}" )

    for elem in "${elements[@]}"
    do
        cmd="mdadm --examine ${elem}"
        stdout=`$cmd 2>&1`
        result=$?
        if [ $result -ne 0 ];then
            #Super block not found
            logger  -p local2.notice "$0: Checking super block $cmd returned $result with $stdout"
            sataLoc=`SATALocation ${elem%%[0-9]}`
            #It is possible that drive failed and driver unload between now and
            #when 'expected partitions' where found.  If this happens, we'll report 
            #failure next time.
            if [ -n $sataLoc ]; then
                listSATAConnectorsWithFailedElems=( ${listSATAConnectorsWithFailedElems[@]} $sataLoc )
            fi
         fi
    done

    echo "${listSATAConnectorsWithFailedElems[@]}"
}

#Print SATA connectors used in md
#$1=mdX 
mdSATAConnectors() {
    local line
    local elements
    local record
    local oifs
    local device
    local partition
    local connectorList=()


    md="$1"
    #md[01] are rootfs md (mdrootfs)
    if [ "$md" = "md0" ] || [ "$md" = "md1" ]; then
       md="mdrootfs"
    fi

    elements=()
    connectorList=()
    for line in "${DVC_MDS[@]}"
    do
        oifs=$IFS
        IFS='_'
        record=( $line )
        if [ "${record[1]}" != "$md" ]; then
            IFS=$oifs
            continue
        fi
        # Found md of interest
        IFS=-
        sataConnectorPartitionPairs=( ${record[3]} )
        IFS=$oifs
        for pair in "${sataConnectorPartitionPairs[@]}"
        do
            #Get SATA connector
            connectorList=( ${connectorList[@]} ${pair%:*} )
        done
    done

    echo "${connectorList[@]}"
}

#Prints IN_WHITE_LIST or NOT_IN_WHITE_LIST depending if supported drive
whiteListCheck() {
    #The below is an example drive white list file.
    #
    #   <Model description="Desktop Caviar">^WDC WD200[0-9].{3}S$</Model> 
    #          |
    #          Description of matching rule
    #                                       |
    #                                       Regular expression or exact model string
    # etype defaults to regular expression.
    #
    # <?xml version="1.0" encoding="utf-8" ?> 
    # <!--   This is an example whitelist for WD drives.
    
    #   --> 
    # <WhiteList>
    #   <Model description="Desktop Caviar">^WDC WD200[0-9].{3}S$</Model> 
    #   <Model description="Specific Enterprise RE" etype="constant">WDC WD10EADS</Model> 
    #   <Model description="Misc." etype="re">^WDC WD15[0-9]{2}.*$</Model> 
    #   <Model description="ALL">^WDC WD.*$</Model> 
    # </WhiteList>

    local drive
    local modelString
    local OLDIFS
    local whiteListModels
    local modelString
    local found
    local wlentry
    local etype
    local expression

    drive="$1"

    OLDIFS="$IFS"
    IFS=$'\n'

    #Filter XML down to [constant | re]_<modelString>
    whiteListModels=(`sed -n -e '/[ \t]*<WhiteList>/,/[ \t]*<\/WhiteList>/ {
      /[ \t]*<Model[ \t]/ {
                            s/.*etype[ \t]*=[ \t]*"\(.*\)">\(.*\)<.*/\1_\2/p                                               
                            s/.*>\(.*\)<.*/re_\1/p
                          }
    }' /etc/data-volume-config/whitelist.xml`)
    
    IFS="$OLDIFS"

    modelString=`cat /sys/block/"${drive##*/}"/device/model`
    logger  -p local2.notice "$0 whiteListCheck Drive:$drive Model:$modelString WhiteList: ${whiteListModels[@]}"

    found=
    for wlentry in "${whiteListModels[@]}"
    do
        etype=${wlentry%%_*}
        expression=${wlentry#*_}
        if [ "$etype" = constant ]; then
            #Check to see if model string is exact match
            if [ "$modelString" = "$expression" ]; then
                #Match
                found=TRUE
                break
            fi
        else
            #Check to see if model string matches regular expression 
            echo "$modelString" | grep -E "$expression" >/dev/null
            if [ $? -eq 0 ]; then
                #Match
                found=TRUE
                break
            fi
        fi
    done

    #Check if match occurred
    if [ "$found" = "TRUE" ]; then
        echo "IN_WHITE_LIST"
    else
        echo "NOT_IN_WHITE_LIST"
    fi
}
