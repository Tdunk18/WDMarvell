#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setSharePublic.sh <share>
#
# Sets the listed share to be public access.
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
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

if [ $# != 1 ]; then
	echo "usage: setSharePublic.sh <share>"
	exit 1
fi

# check if share and user exists first
#getShares.sh private | grep -q -x $shareName
#if [ $? == 1 ]; then
#	echo "Private share $shareName not found"
#	exit 1
#fi

# Convert private share to public

# save share desc
shareDesc=`getShareDescription.sh $shareName`

# remove share from overall share file
cat $sambaOverallShare | sed "/## BEGIN ## sharename = $shareName #/,/## END ##/ d" > $sambaOverallShare-new

# add to samba overall_share, public share by default
# add to samba overall_share, public share by default
echo "## BEGIN ## sharename = $shareName #" >> $sambaOverallShare-new
echo "[$shareName]" >> $sambaOverallShare-new
echo "  path = /shares/$shareName" >> $sambaOverallShare-new
echo "  comment = $shareDesc" >> $sambaOverallShare-new
echo "  public = yes" >> $sambaOverallShare-new
echo "  browseable = yes" >> $sambaOverallShare-new
echo "  writable = yes" >> $sambaOverallShare-new
echo "  guest ok = yes" >> $sambaOverallShare-new
echo "  map read only = no" >> $sambaOverallShare-new
echo "## END ##" >> $sambaOverallShare-new

sed -i -e "s#\(.*/shares/$shareName:\)\(.*\)#\1\*:RWBEX:\*:CU#" $trustees

mv -v $sambaOverallShare-new $sambaOverallShare

# reload
setTrustees.sh 2> /dev/null
/etc/init.d/samba reload > /dev/null

genAppleVolumes.sh &

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