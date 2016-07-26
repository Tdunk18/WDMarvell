#!/bin/sh
##########################################
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# createDataVolume - create default data volume directories
##########################################
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/system.conf

echo "<===== Create Data Volume =====>"
logger -p local0.info "createDataVolume: mount data volume"

mkdir -p /DataVolume
mount -t ext4 -o noatime,nodiratime,auto_da_alloc $dataVolumeDevice /DataVolume

mkdir -p /DataVolume/cache/upgrade
mkdir -p /DataVolume/shares

if [ "${internalShares}" != "false" ]; then
	mkdir -p /DataVolume/cache/transcodingcache

	mkdir -p "/DataVolume/shares/Public/Shared Music"
	mkdir -p "/DataVolume/shares/Public/Shared Videos"
	mkdir -p "/DataVolume/shares/Public/Shared Pictures"
fi

chmod -R 775 /DataVolume/shares
chgrp -R share /DataVolume/shares
chown -R nobody /DataVolume/shares/Public

if [ "${internalShares}" != "false" ]; then
	# create hidden backup shares
	mkdir -p /DataVolume/backup
	chmod -R 775 /DataVolume/backup
	chgrp -R share /DataVolume/backup
fi