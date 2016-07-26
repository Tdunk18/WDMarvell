#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# modAcl.sh <share> <user> <RW/RO/NA> 
#
# Modifies ACL for a given user and share.  If the share is currently public, it will be changed to private.
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh

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
username=$2
type=$3

if [ $# != 3 ]; then
	echo "usage: modAcl.sh <share> <username> <RW/RO/NA>"
	exit 1
fi

if [ $shareName == "Public" ]; then
	echo "Cannot modify ACL for Public share"
	exit 1
fi

## check if share and user exists first
#getShares.sh all | grep -q -x $shareName
#if [ $? == 1 ]; then
#	echo "Share not found"
#	exit 1
#fi
#getUsers.sh | grep -q -x $username
#if [ $? == 1 ]; then
#	echo "User not found"
#	exit 1
#fi

# For backwards compatibility, accept "none" as "NA"
[ $type == "none" ] && type="NA"

if [ $type != "RW" ] && [ $type != "RO" ] && [ $type != "NA" ]; then
	echo "Must designate RW, RO, or NA for ACL"
	exit 1
fi

if [ $type == "RO" ]; then
  wd_compinit -z add $shareName $username read_only
elif [ $type == "RW" ]; then
  wd_compinit -z add $shareName $username read_write
elif [ $type == "NA" ]; then
  wd_compinit -z delete $shareName $username
fi