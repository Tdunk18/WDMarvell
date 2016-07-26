#!/bin/sh
mkdir -p /etc/iet/
mkdir -p /etc/rc.d/init.d/
cp -s /mnt/tmp3/zoe/iscsi/iet/ietd.conf /etc/iet/ 2>/dev/null
cp -f /mnt/tmp3/zoe/iscsi/iet/initiators.allow /etc/iet/ 2>/dev/null
cp -f /mnt/tmp3/zoe/iscsi/iet/targets.allow /etc/iet/ 2>/dev/null
ln -s /mnt/tmp3/zoe/iscsi/iscsi_trgt.ko /usr/local/modules/iscsi/iscsi_trgt.ko
ln -s /mnt/tmp3/zoe/iscsi/rc.d/init.d/iscsi-target /etc/rc.d/init.d/iscsi-target
ln -s /mnt/tmp3/zoe/iscsi/ietd /usr/sbin/ietd
ln -s /mnt/tmp3/zoe/iscsi/ietadm /usr/sbin/ietadm
