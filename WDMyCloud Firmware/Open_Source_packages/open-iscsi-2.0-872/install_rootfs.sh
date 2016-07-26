#!/bin/sh

${CROSS_COMPILE}strip -v usr/iscsid -o ${ROOT_FS}/usrsbin/iscsid
${CROSS_COMPILE}strip -v usr/iscsiadm -o ${ROOT_FS}/usrsbin/iscsiadm
#${CROSS_COMPILE}strip -v usr/iscsistart -o ${ROOT_FS}/usr/bin/iscsistart

#TODO start
mkdir -p ${ROOT_FS}/usrlib/modules
cp -v kernel/iscsi_tcp.ko   ${ROOT_FS}/usrlib/modules/
cp -v kernel/libiscsi.ko  ${ROOT_FS}/usrlib/modules/
cp -v kernel/libiscsi_tcp.ko  ${ROOT_FS}/usrlib/modules/
cp -v kernel/scsi_transport_iscsi.ko  ${ROOT_FS}/usrlib/modules/
#TODO end
