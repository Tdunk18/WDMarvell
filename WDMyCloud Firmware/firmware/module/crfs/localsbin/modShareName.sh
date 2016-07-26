#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modShareName.sh <share> <newShareName> 
#
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

share=$1
new=$2

if [ $# != 2 ]; then
	echo "usage: modShareName.sh <share> <newShareName>"
	exit 1
fi

# check if share  exists first
#getShares.sh all | grep -q -x $share
#if [ $? == 1 ]; then
#	echo "Share not found"
#	exit 1
#fi

cat $trustees | grep -q -i "/$new:"
if [ $? == 0 ]; then
  echo "Share $new already exists"
  exit 1
fi

# Don't allow rename to TimeMachine
if [ "`echo "$new" | tr [:upper:] [:lower:]`" =  "timemachine" ]; then
  echo "Share $new not allowed"
  exit 1
fi

media_serving=`getShareMediaServing.sh ${share}`
modShareMediaServing.sh ${share} none

# mod samba file
awk -v share=${share} -v new=${new} '
BEGIN { 
    RS = "\n" ; FS = " ";
	sharebanner = sprintf("## BEGIN ## sharename = %s #", share);
	new_sharebanner = sprintf("## BEGIN ## sharename = %s #", new);
	samba_name = sprintf("[%s]", share);
	new_samba_name = sprintf("[%s]", new);
	path_name = sprintf("  path = /shares/%s", share);
	new_path_name = sprintf("  path = /shares/%s", new);
}
{
	if ($0 == sharebanner) {
		print new_sharebanner
	}
	else if ($0 == samba_name) {
		print new_samba_name
	}
	else if ($0 == path_name) {
		print new_path_name
	}
	else {
		print $0
	}
}
' $sambaOverallShare > $sambaOverallShare-new

# mod trustees file
awk -v share=${share} -v new=${new} -v disk=$dataVolumeDevice '
BEGIN {
	RS = "\n" ; FS = ":";
	sharepath = sprintf("[%s]/shares/%s",disk, share);
	newsharepath = sprintf("[%s]/shares/%s",disk, new);
}
{
	if ( $1 == sharepath ) {
		printf("%s", newsharepath);
		for (i=2; i <= NF; i=i+1) {
			printf(":%s", $i);
		}
		printf("\n");
	}
	else {
		print $0;
	}
}
' $trustees > $trustees-new

# rename the notifier share trigger file as well
if [ -f $NOTIFIER_TRIGGER/.$share ]; then
    mv $NOTIFIER_TRIGGER/.$share $NOTIFIER_TRIGGER/.$new
fi

mv -v /shares/${share} /shares/${new}

if [ -d $fileTally ]; then
	mv -v $fileTally/${share} $fileTally/${new} 
fi

mv -v $sambaOverallShare-new $sambaOverallShare
mv -v $trustees-new $trustees


# reload
# reload
setTrustees.sh
/etc/init.d/samba reload

# mod AppleVolumes file
if [ ! -f /etc/nas/timeMachine.conf ]; then
    genAppleVolumes.sh &
else
    # Quota support is installed
    . /etc/nas/timeMachine.conf
    # If Time Machine share's name is changing, update configuration.
    if [ "${share}" = "$backupShare" ]; then
        # NOTE: genAppleVolumes.sh done in setTimeMachineConfig.sh
        setTimeMachineConfig.sh "" "${new}" "" "true"
    else
        genAppleVolumes.sh &        
    fi
fi

modShareMediaServing.sh ${new} ${media_serving}

# regenerate apache share access rules
genApacheAccessRules.sh
apache2ctl -k graceful &

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
