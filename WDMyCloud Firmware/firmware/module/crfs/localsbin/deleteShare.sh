#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# deleteShare.sh <shareName>
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


lowerCaseShare=`echo $shareName | tr '[:upper:]' '[:lower:]'`
if [ $lowerCaseShare == "public" ]; then
  echo "Cannot delete Public share"
  exit 1
fi

# check share in trustees.conf
# cat $trustees | grep -q "/shares/$shareName:"
#if [ $? == 1 ]; then
#  echo "Share $shareName does not exist"
#  exit 1
#fi

# inform notifier of share removal
[ -f $NOTIFIER_TRIGGER/.$shareName ] && rm -f $NOTIFIER_TRIGGER/.$shareName

# remove directory bookkeeping
rm -rf $fileTally/$shareName 

# remove from remote access/mionet
currentState=`getShareMediaServing.sh $shareName`
if [ $currentState != "none" ]; then
	modShareMediaServing.sh $shareName none
fi
modShareRemoteAccess.sh $shareName none

# If TimeMachine quota is installed
if [ -f /etc/nas/timeMachine.conf ]; then
    . /etc/nas/timeMachine.conf

    lowerCaseTimeMachineShare=`echo $backupShare | tr '[:upper:]' '[:lower:]'`

    # if backup share is defined and it matches share being deleted,
    if ([ ! -z "$backupShare" ] && [ "$lowerCaseTimeMachineShare" = $lowerCaseShare ]); then
        #
        # Matrix of behavior based on internal/removable share and TimeMachine enabled/disabled
        #
        # If an internal TimeMachine share is deleted, the user should have no expectation that
        # TimeMachine would continue to work.  It also make little sense that if the user recreated
        # a share with the exact same name that TimeMacine would work again without user configuring
        # it.  On the other hand when a user removes USB TimeMachine share and reinserts it, it is
        # resonable for them to expect TimeMachine to function.
        #
        # NOTE:  Sharename is removed in internal case to prevent case of share being
        #        recreated and partially configured for TimeMachine support.
        #
        #          | Internal                          | Removable
        #          |                                   |
        #----------|-----------------------------------|----------------------------
        #          | Implicit disable of TimeMachine   | Restart mDNSResponder to 
        # enabled  | backupEnabled -> false            | cause TimeMachine service 
        #          | Remove share name from config     | to stop being advertising
        #          |                                   |
        #----------|-----------------------------------|-----------------------------
        #          | Remove share name from config     | Do nothing
        # disabled |                                   |
        #----------|-----------------------------------|-----------------------------
        grep "/shares/$shareName:" $trustees | grep -q "^\[$dataVolumeDevice\]"
        if [ $? -eq 0 ]; then
            if [ "$backupEnabled" = "true" ]; then
                # Deleting the internal share that TimeMachine uses is an implicit disable of TimeMachine.
                logger  -p local2.debug "$0: DEBUG: Implicit disable of TimeMachine on internal share $shareName"
                setTimeMachineConfig.sh "false" "" ""
            fi
            
            # Remove share name because if it were to re-appear, it would not be expected to be TimeMachine
            logger  -p local2.debug "$0: DEBUG: Remove $shareName from timeMachine.conf"
            sed -i -e 's/backupShare=.*/backupShare=""/' /etc/nas/timeMachine.conf
        else
            if [ "$backupEnabled" = "true" ]; then
                # Removing ("Deleting") the removable share TimeMachine uses does not disable TimeMachine.
                # It just casuses us to stop advertising TimeMachine service.  TimeMachine remains enabled and when
                # the removable share is re-inserted, we advertise again.
                logger  -p local2.debug "$0: DEBUG: Stop advertising TimeMachine on USB share $shareName"
                /etc/init.d/mDNSResponder restart &
            else
                logger  -p local2.debug "$0: DEBUG: USB share $shareName not enabled so doing nothing"
            fi
        fi
    fi
fi

# remove from trustees
cat $trustees | grep -v "/shares/$shareName:" > $trustees-new
mv -f $trustees-new $trustees

#remove from samba overall_share
cat $sambaOverallShare | sed "/## BEGIN ## sharename = $shareName #/,/## END ##/ d" > $sambaOverallShare-new 
mv -f $sambaOverallShare-new $sambaOverallShare


# reload
setTrustees.sh 2> /dev/null
/etc/init.d/samba reload > /dev/null

# remove from AppleVolumes
genAppleVolumes.sh &

# regenerate apache share access rules
genApacheAccessRules.sh
apache2ctl -k graceful &

# now that there are no users, remove directory
rm -rf /shares/$shareName

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

