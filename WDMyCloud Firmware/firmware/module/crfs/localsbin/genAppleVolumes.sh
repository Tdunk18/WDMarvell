#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# genAppleVolumes.sh <type>
#   generates apple volumes files from shares list
#PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /usr/local/sbin/share-param.sh
. /etc/system.conf
. /etc/nas/config/afp.conf

[ -f "${AFP_VETO_PATH}" ] && . "${AFP_VETO_PATH}"

if [ -f /etc/nas/timeMachine.conf ]; then
    . /etc/nas/timeMachine.conf
fi

# If backups are disabled, clear the backup share name (which may be set).

if [ "${backupEnabled}" = "false" ]; then
    backupShare=""
fi

backupShareOptions=""
options="ea:sys options:usedots,upriv"
perm="perm:664"

#PUBLIC share list
getShares.sh public > /tmp/public-share-list
while read publicshare; do
	if [ "${backupShare}" = "${publicshare}" ]; then
		backupShareOptions="${options},tm ${perm}"
	fi
	echo "/shares/${publicshare} ${publicshare} ${options} ${perm} ${AFP_VETO}"
done < /tmp/public-share-list > /etc/netatalk/AppleVolumes.shares

#PRIVATE share list
getShares.sh private > /tmp/private-share-list
while read privateshare; do
	rwList=`getAcl.sh ${privateshare} RW | awk '{printf("%s,",$0)}'`
	roList=`getAcl.sh ${privateshare} RO | awk '{printf("%s,",$0)}'`
        accessLists=" allow:${rwList}${roList}"
	if [ "${roList}" != "" ]; then
		accessLists+=" rolist:${roList}"
	fi
	if [ "${rwList}" != "" ]; then
		accessLists+=" rwlist:${rwList}"
	fi

	if [ "${rwList}" != "" ] || [ "${roList}" != "" ]; then
		if [ "${backupShare}" = "${privateshare}" ]; then
			backupShareOptions="${options},tm${accessLists} ${perm}"
		fi
		echo "/shares/${privateshare} ${privateshare} ${options}${accessLists} ${perm} ${AFP_VETO}"
	fi
done < /tmp/private-share-list >> /etc/netatalk/AppleVolumes.shares

cp /etc/netatalk/AppleVolumes.shares /etc/netatalk/AppleVolumes.tm

# If the user specified a backup share that is present (indicated by populated
# backup volume options) and has the required Time Machine directory, use the user
# specified share for Time Machine.  If the user specified a backup size limit, convert it from
# Mib to MB and make sure that it's smaller than the share's size before using.

if [ ! -z "${backupShare}" ] && [ ! -z "${backupShareOptions}" ] && [ -d "/shares/$backupShare/TimeMachine" ]; then
	if [ "$backupSizeLimit" -ne 0 ]; then
	        let "sizeLimitMb = ($backupSizeLimit * 1000000)/1048576"
        	shareSizeMb=`df "/shares/$backupShare" | awk '/^\// {printf("%.0f",$2/1024)}'`
		if [ "$sizeLimitMb" -lt "$shareSizeMb" ]; then
			backupShareOptions+=" volsizelimit:$sizeLimitMb"
		fi
	fi
	echo "/shares/${backupShare}/TimeMachine TimeMachine ${backupShareOptions} ${AFP_VETO}" >> /etc/netatalk/AppleVolumes.tm
fi
