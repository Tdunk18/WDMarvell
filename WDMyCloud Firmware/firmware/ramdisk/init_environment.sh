#!/bin/bash

MNTDIR="$1"
SUDO=""

if [ $UID != 0 ]; then
	SUDO="sudo"
fi

#### dev folder ####
if [ ! -d ${MNTDIR}/dev ]; then
   ${SUDO} mkdir ${MNTDIR}/dev
   ${SUDO} mknod -m 777 ${MNTDIR}/dev/null c 1 3
   ${SUDO} mknod -m 777 ${MNTDIR}/dev/console c 5 1
fi

#### home folder ####
if [ ! -d ${MNTDIR}/home ]; then
   ${SUDO} mkdir -p ${MNTDIR}/home/root
   ${SUDO} mkdir -p ${MNTDIR}/home/squeezecenter
fi

#### mnt folder ####
if [ ! -d ${MNTDIR}/mnt ]; then
   ${SUDO} mkdir ${MNTDIR}/mnt
fi

if [ ! -d ${MNTDIR}/mnt/HD ]; then
   ${SUDO} mkdir ${MNTDIR}/mnt/HD
fi

if [ ! -d ${MNTDIR}/mnt/isoMount ]; then
   ${SUDO} mkdir ${MNTDIR}/mnt/isoMount
fi

if [ ! -d ${MNTDIR}/mnt/USB ]; then
   ${SUDO} mkdir ${MNTDIR}/mnt/USB
fi

if [ ! -d ${MNTDIR}/proc ]; then
   ${SUDO} mkdir ${MNTDIR}/proc
fi

#### root folder ####
if [ ! -d ${MNTDIR}/root ]; then
   ${SUDO} mkdir ${MNTDIR}/root
fi
   
#### sys folder ####
if [ ! -d ${MNTDIR}/sys ]; then
   ${SUDO} mkdir ${MNTDIR}/sys
fi

#### tmp folder ####
if [ ! -d ${MNTDIR}/tmp ]; then
   ${SUDO} mkdir ${MNTDIR}/tmp
fi

#### sys folder ####
if [ ! -d ${MNTDIR}/var ]; then
   ${SUDO} mkdir ${MNTDIR}/var
   ${SUDO} mkdir ${MNTDIR}/var/empty
   ${SUDO} mkdir ${MNTDIR}/var/lock
   ${SUDO} mkdir ${MNTDIR}/var/lock/samba
   ${SUDO} mkdir ${MNTDIR}/var/log
   ${SUDO} mkdir ${MNTDIR}/var/log/samba
   ${SUDO} mkdir ${MNTDIR}/var/run
   ${SUDO} mkdir ${MNTDIR}/var/run/samba
   ${SUDO} mkdir ${MNTDIR}/var/spool
   ${SUDO} mkdir ${MNTDIR}/var/spool/at
   ${SUDO} mkdir ${MNTDIR}/var/spool/cron
   ${SUDO} mkdir ${MNTDIR}/var/spool/cron/crontabs
   ${SUDO} mkdir ${MNTDIR}/var/state
   ${SUDO} mkdir ${MNTDIR}/var/state/ups
   ${SUDO} mkdir ${MNTDIR}/var/www
   ${SUDO} mkdir ${MNTDIR}/var/www/cgi-bin
   ${SUDO} mkdir ${MNTDIR}/var/www/imodule
   ${SUDO} mkdir ${MNTDIR}/var/www/xml
fi

if [ ! -d ${MNTDIR}/usr/local ]; then
   ${SUDO} mkdir ${MNTDIR}/usr/local
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/LPRng/bin
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/LPRng/etc
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/LPRng/sbin
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/ups/bin
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/ups/etc
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/modules
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/share
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/ssl
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/tmp
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/config
   ${SUDO} mkdir -p ${MNTDIR}/usr/local/lib
fi

if [ ! -d ${MNTDIR}/usr/share/udhcpc ]; then
   ${SUDO} mkdir -p ${MNTDIR}/usr/share/udhcpc
fi

if [ ! -d ${MNTDIR}/etc/lighttpd ]; then
   ${SUDO} mkdir ${MNTDIR}/etc/lighttpd
fi

if [ ! -d ${MNTDIR}/etc/samba ]; then
   ${SUDO} mkdir ${MNTDIR}/etc/samba
   ${SUDO} mkdir ${MNTDIR}/etc/samba/var
fi

if [ ! -d ${MNTDIR}/etc/ssl ]; then
   ${SUDO} mkdir ${MNTDIR}/etc/ssl
fi

if [ ! -d ${MNTDIR}/etc/NAS_CFG ]; then
   ${SUDO} mkdir ${MNTDIR}/etc/NAS_CFG
fi

if [ ! -d ${MNTDIR}/etc/rc.d ]; then
   ${SUDO} mkdir ${MNTDIR}/etc/rc.d
fi

if [ "$(has_feature CUSTOM_WD)" = "Yes" ]; then
	${SUDO} rm ${MNTDIR}/sbin/halt
fi
