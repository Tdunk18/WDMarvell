#!/bin/bash
#
# © 2011 Western Digital Technologies, Inc. All rights reserved.
#
#This script is multistep process to convert RAID

. /etc/system.conf
. /etc/nas/config/data-volume-config.conf 2>/dev/null
. /usr/local/sbin/data-volume-config_helper.sh

setConvertingStatus() {
    #Valid parameters CONVERTING, CONVERSION_SUCCESS, CONVERSION_FAILURE
    echo "$1" >$raidConversionStatusFile
}

#Parse inputs
while getopts ":d:t:" opt; do
    case $opt in
        d ) md=$OPTARG ;;
        t ) raid=$OPTARG ;;
        ? ) logger  -p local2.notice "$0: invalid option"
            exit 1 ;;
    esac
done

shift $(($OPTIND - 1))

if [ -z "$md" ]; then
    logger  -p local2.notice "$0: Need to specify full path to md device ex. $0 -d /dev/mdX"
    setConvertingStatus CONVERSION_FAILURE
    exit 1
fi

logger  -p local2.notice "$0: md:$md: raidConversionProgressFile:$raidConversionProgressFile:"

#Stop process using using data volume
#Coppied out of wipeFactoryRestore.sh 
#!!!Until we get run levels
# stop all processes
cmd="/etc/init.d/monitorio stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/orion stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/cron stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/access stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/usr/local/sbin/cmdMediaServer.sh stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/itunes stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/netatalk stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

#///etc/init.d/mionet stop 2>&1`
cmd="/etc/init.d/samba stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/vsftpd stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

cmd="/etc/init.d/nfs-kernel-server stop"
stdOut=`$cmd 2>&1`
logger  -p local2.notice "$0: $cmd returned $?"

#ftp service has been stopped, but there maybe an ftp transfer in progress so kill them
#NOTE:  Now that we have a USB port, this could be more friendly and allow USB ftp transfers to 
#continue.
killall vsftpd >/dev/null 2>/dev/null

progress "Stopping Services " 10

sync
sleep 10

progress "Stopping Services " 50

#unmount DataVolume
umountList=(
/CacheVolume
/nfs
/shares
/DataVolume
)

for fileSystem in "${umountList[@]}"
do
    cmd="umount $fileSystem"
    stdOut=`$cmd 2>&1`
    result=$?
    logger  -p local2.notice "$0: $cmd returned $result"

    if [ "$result" -ne 0 ]; then
        #Find any process that is using filesystem
        cmd="fuser -m $fileSystem"
        stdOut=( `$cmd` )
        logger  -p local2.notice "$0: ${stdOut[@]}"

        for process in "${stdOut[@]}"
        do
            logger  -p local2.notice "task: $(ps  -auxw | grep $process)"
            #Kill process that failed to stop
            kill -9 $process >/dev/null 2>/dev/null
        done
        #wait and try again
        sleep 10
        cmd="umount $fileSystem"
        stdOut=`$cmd 2>&1`
        result=$?
        logger  -p local2.notice "$0: RETRY: $cmd returned $result"
    fi
done

progress "Stopping Services " 60

sleep 10

progress "Stopping Services " 100

logger -s -p local2.notice  "$0: mount: $( mount )"

raidConversionCategory 2

#Mark conversion in progress
touch /tmp/raidConversionInProgresss >/dev/null 2>&1

#If monitor is in progress
if [ -f /tmp/monitorUserRaidInProgress ]; then
    #Delay much longer than monitor takes to guarantee no over lap
    sleep 60
fi

if [ "$raid" = 'RAID1' ]; then
    logger  -p local2.notice "$0: Converting to RAID1 $md"
    raidMigrateLinearToRAID1.sh -d $md &
else
    logger  -p local2.notice "$0: Converting to linear"
    raidMigrateRAID1ToLinear.sh -d $md &
fi

#Wait for above to complete
wait $!

#Save off result of conversion
if [ $? -ne 0 ]; then
    conversionResult=FAIL
else
    conversionResult=PASS
fi

#Clean up exclusion flag
rm /tmp/raidConversionInProgresss >/dev/null 2>&1

raidConversionCategory 3

#Mount file system
progress "Starting Services " 0

#mount /DataVolume
mount -o noatime ${dataVolumeDevice} /DataVolume > /dev/null 2> /dev/null
mount --bind /DataVolume/shares /shares > /dev/null 2> /dev/null
mount --bind /DataVolume/shares /nfs > /dev/null 2> /dev/null
mount --bind /DataVolume/cache /CacheVolume > /dev/null 2> /dev/null
progress "Starting Services " 10

#Start process that were stopped
progress "Starting Services " 50

# start all processes
/etc/init.d/nfs-kernel-server start > /dev/null 2> /dev/null
/etc/init.d/vsftpd start > /dev/null 2> /dev/null
/etc/init.d/samba start > /dev/null 2> /dev/null
#///etc/init.d/mionet start > /dev/null 2> /dev/null
/etc/init.d/netatalk start > /dev/null 2> /dev/null
/etc/init.d/itunes start > /dev/null 2> /dev/null
/usr/local/sbin/cmdMediaServer.sh start  > /dev/null 2> /dev/null
/etc/init.d/access start > /dev/null 2> /dev/null
/etc/init.d/cron start > /dev/null 2> /dev/null
/etc/init.d/orion start > /dev/null 2> /dev/null
/etc/init.d/monitorio start > /dev/null 2> /dev/null

progress "Starting Services " 100

#Set pass/fail
if [ "$conversionResult" = "FAIL" ]; then
    setConvertingStatus CONVERSION_FAILURE
else
    setConvertingStatus CONVERSION_SUCCESS
fi

exit 0
