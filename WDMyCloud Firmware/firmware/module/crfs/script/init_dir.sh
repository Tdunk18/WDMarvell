#!/bin/bash

MNTDIR=""
[ -n "$1" ] && MNTDIR=$1

#### home folder ####
mkdir -p \
	${MNTDIR}/home/root \
	${MNTDIR}/home/squeezecenter

#### mnt folder ####
mkdir -p \
	${MNTDIR}/mnt/HD \
	${MNTDIR}/mnt/isoMount \
	${MNTDIR}/mnt/USB

if [ ! -d ${MNTDIR}/proc ]; then
   mkdir -p ${MNTDIR}/proc
fi

#### root folder ####
if [ ! -d ${MNTDIR}/root ]; then
   mkdir -p ${MNTDIR}/root
fi
   
#### sys folder ####
if [ ! -d ${MNTDIR}/sys ]; then
   mkdir -p ${MNTDIR}/sys
fi

#### tmp folder ####
mkdir -p ${MNTDIR}/tmp

#### sys folder ####
mkdir -p \
	${MNTDIR}/var \
	${MNTDIR}/var/empty \
	${MNTDIR}/var/lock \
	${MNTDIR}/var/lock/samba \
	${MNTDIR}/var/log \
	${MNTDIR}/var/run \
	${MNTDIR}/var/run/samba \
	${MNTDIR}/var/spool \
	${MNTDIR}/var/spool/at \
	${MNTDIR}/var/spool/cron \
	${MNTDIR}/var/spool/cron/crontabs \
	${MNTDIR}/var/state \
	${MNTDIR}/var/state/ups \
	${MNTDIR}/var/www \
	${MNTDIR}/var/www/cgi-bin \
	${MNTDIR}/var/www/imodule \
	${MNTDIR}/var/www/xml

mkdir -p \
	${MNTDIR}/usr/local \
	${MNTDIR}/usr/local/LPRng/bin \
	${MNTDIR}/usr/local/LPRng/etc \
	${MNTDIR}/usr/local/LPRng/sbin \
	${MNTDIR}/usr/local/ups/bin \
	${MNTDIR}/usr/local/ups/etc \
	${MNTDIR}/usr/local/modules \
	${MNTDIR}/usr/local/share \
	${MNTDIR}/usr/local/ssl \
	${MNTDIR}/usr/local/tmp \
	${MNTDIR}/usr/local/config \
	${MNTDIR}/usr/local/lib

mkdir -p ${MNTDIR}/usr/share/udhcpc

mkdir -p \
	${MNTDIR}/etc/lighttpd \
	${MNTDIR}/etc/samba \
	${MNTDIR}/etc/samba/var \
	${MNTDIR}/etc/ssl \
	${MNTDIR}/etc/NAS_CFG \
	${MNTDIR}/etc/rc.d
