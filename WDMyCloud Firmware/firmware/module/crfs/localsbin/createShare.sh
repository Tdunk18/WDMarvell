#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# createShare.sh <shareName> <shareDesc>
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/nas/config/wd-nas.conf 2>/dev/null
. /etc/system.conf

#SYSTEM_SCRIPTS_LOG=${SYSTEM_SCRIPTS_LOG:-"/dev/null"}
## Output script log start info
#{ 
#echo "Start: `basename $0` `date`"
#echo "Param: $@" 
#} >> ${SYSTEM_SCRIPTS_LOG}
##
#{
#---------------------
# Begin Script
#---------------------

shareName=$1
shareDesc=$2

# TimeMachine has always been implicitly reserved via being in trustees.conf file.
# Now it is possible for a user to create a share named TimeMachine, but this would be
# incompatible with advertising TimeMachine as share in AppleVolumes.shares.

# Don't allow creation of share named TimeMachine
if [ "`echo "$shareName" | tr [:upper:] [:lower:]`" =  "timemachine" ]; then
  echo "Share $shareName not allowed"
  exit 1
fi

# add share to trustees.conf
grep "/$shareName:" $trustees
if [ $? == 0 ]; then
  echo "Share $shareName already exists"
  exit 1
fi

# add to trustees
# check if symlink already added, this means that this is a removable drive
mnt_pt=`readlink /shares/${shareName}`
if [ "${mnt_pt}" != "" ]; then
	device=`mount | awk -v mntpt="$mnt_pt" '$0 ~ mntpt {print $1}'`
	# check if device is a valid parition block device before adding to trustees
	# if FUSE device, only add to samba, etc
	part_name=`basename $device`
	valid=`awk -v part_name="$part_name" '$0 ~ part_name {print "yes"}' /proc/partitions`
	if [ "$valid" == "yes" ]; then
		echo "#usb[$device]/shares/${shareName}:*:RWBEX:*:CU" >> $trustees
	else
		echo "#fuse[$device]/shares/${shareName}:*:RWBEX:*:CU" >> $trustees
	fi

    # If TimeMachine quota is installed
    if [ -f /etc/nas/timeMachine.conf ]; then
        . /etc/nas/timeMachine.conf

        lCbackupShare=`echo "$backupShare" | tr '[:upper:]' '[:lower:]'`
        lCshareName=`echo "$shareName" | tr '[:upper:]' '[:lower:]'`

        # If backup share is defined and it matches USB share being created, set it as TimeMachine backup
        if ([ ! -z "$backupShare" ] && [ $backupEnabled = "true" ]  && [ "$lCbackupShare" = "$lCshareName" ]); then
            # Note:  If user deleted TimeMachine directory, the TimeMachine service will not be advertised.
            logger  -p local2.debug "$0: DEBUG: Start advertising TimeMachine on USB share $backupShare"
            setTimeMachineConfig.sh "" "" ""
        fi
    fi

else
	mkdir -p /shares/$shareName
	chgrp share /shares/$shareName 
	chmod 775 /shares/$shareName
	echo "[$dataVolumeDevice]/shares/${shareName}:*:RWBEX:*:CU" >> $trustees
    # inform notifier of internal share creation
    [ -d $NOTIFIER_TRIGGER ] && touch $NOTIFIER_TRIGGER/.$shareName
fi

# add to samba overall_share, public share by default
echo "## BEGIN ## sharename = $shareName #" >> $sambaOverallShare
echo "[$shareName]" >> $sambaOverallShare
echo "  path = /shares/$shareName" >> $sambaOverallShare
echo "  comment = $shareDesc" >> $sambaOverallShare
echo "  public = yes" >> $sambaOverallShare
echo "  browseable = yes" >> $sambaOverallShare
echo "  writable = yes" >> $sambaOverallShare
echo "  guest ok = yes" >> $sambaOverallShare
echo "  map read only = no" >> $sambaOverallShare
echo "## END ##" >> $sambaOverallShare


# reload
setTrustees.sh 2> /dev/null
/etc/init.d/samba reload > /dev/null

# add to AppleVolumes file
genAppleVolumes.sh &

if [ -d $fileTally ]; then
	# add file tally folders
	mkdir $fileTally/$shareName
	echo "50" > $fileTally/$shareName/total_size & 
	echo "10" > $fileTally/$shareName/photos_size &
	echo "10" > $fileTally/$shareName/music_size &
	echo "30" > $fileTally/$shareName/video_size &
fi


# indicate that a change has been made to a share
incUpdateCount.pm "share" &

#---------------------
# End Script
#---------------------
## Copy stdout to script log also
#} # | tee -a ${SYSTEM_SCRIPTS_LOG}
## Output script log end info
#{ 
#echo "End:$?: `basename $0` `date`" 
#echo ""
#} >> ${SYSTEM_SCRIPTS_LOG}

