#!/bin/sh

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}

xbuild()
{
	if [ -z "${LINUX_SRC}" ] ; then
		echo "You need to export LINUX_SRC first"
		echo "	export LINUX_SRC=~/wdic-lsp/linux-3.xx.xx_PROJECT"
		exit 1
	fi

	if [ ! -e ${XLIB_DIR}/libcrypto.so ]; then
		echo ""
		echo "*ERROR*: You need to build libcrypto first."
		echo ""
		exit 1
	fi
	
	export CFLAGS="$CFLAGS -I${GPL_PREFIX}/include"

	KSRC=${LINUX_SRC} make user
	if [ $? != 0 ] ; then
		echo "make failed!!!!"
		exit 1
	fi
	LINUX_VERSION=`basename ${LINUX_SRC}`
	LINUX_MAJOR_VERION=`expr substr "${LINUX_VERSION}" 7 1`
	if [ "${LINUX_MAJOR_VERION}" = "2" ] ; then
		KSRC=${LINUX_SRC} make kernel
		if [ $? != 0 ] ; then
			echo "make failed!!!!"
			exit 1
		fi
	fi
}

xinstall()
{
	cp -avf usr/iscsid ${ROOT_FS}/usrsbin/
	cp -avf usr/iscsiadm ${ROOT_FS}/usrsbin/
	#cp -avf usr/iscsistart ${ROOT_FS}/usrsbin

	LINUX_VERSION=`basename ${LINUX_SRC}`
	LINUX_MAJOR_VERION=`expr substr "${LINUX_VERSION}" 7 1`
	if [ "${LINUX_MAJOR_VERION}" = "2" ] ; then
		mkdir -p ${ROOT_FS}/driver
		cp -avf kernel/iscsi_tcp.ko   ${ROOT_FS}/driver/
		cp -avf kernel/libiscsi.ko  ${ROOT_FS}/driver/
		cp -avf kernel/libiscsi_tcp.ko  ${ROOT_FS}/driver/
		cp -avf kernel/scsi_transport_iscsi.ko  ${ROOT_FS}/driver/
	fi
}

xclean()
{
	KSRC=${LINUX_SRC} make clean
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   xinstall
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi
