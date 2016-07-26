#!/bin/sh

unset CFLAGS
unset LDFLAGS
source ../xcp.sh

GPL_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

case "${PROJECT_NAME}" in
Sprite|Aurora)
	CURL_BIT="-I${XINC_DIR}/curl-64bit"
	;;
*)
	CURL_BIT="-I${XINC_DIR}/curl-32bit"
	;;
esac

xbuild()
{
   make clean
   make distclean

	LDFLAGS="-L${XLIB_DIR} -L${GPL_PREFIX}/lib -liconv" CFLAGS="${CFLAGS} -I${XINC_DIR} -I${GPL_PREFIX}/include -O2" \
	LIBEVENT_CFLAGS="-I${GPL_PREFIX}" LIBEVENT_LIBS="-levent" \
	OPENSSL_CFLAGS="-I${XINC_DIR}/openssl-1.0.1c -I${GPL_PREFIX} " OPENSSL_LIBS="-lssl -lcrypto" \
	LIBCURL_CFLAGS="${CURL_BIT} -I${GPL_PREFIX}" LIBCURL_LIBS="-lcurl" \
	./configure --host=${TARGET_HOST} --prefix=${PWD}/xinst --without-gtk
	if [ $? != 0 ] ; then
		echo "configure failed."
		exit 1
	fi


   make
}

xinstall()
{
   make install
   ${CROSS_COMPILE}strip -s ${PWD}/xinst/bin/*
   
   xcp ${PWD}/xinst/bin/transmission-daemon ${ROOT_FS}/sbin
   xcp ${PWD}/xinst/bin/transmission-remote ${ROOT_FS}/sbin
}

xinstaddon()
{
   make install
   ${CROSS_COMPILE}strip -s ${PWD}/xinst/bin/*
   
   ADDON_MOD_DIR="${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/Transmission"
   ADDON_COM_DIR="${MODULE_DIR}/apkg/addons/common/Transmission"

   mkdir -p ${ADDON_MOD_DIR}/sbin
   xcp ${PWD}/xinst/bin/transmission-daemon ${ADDON_MOD_DIR}/sbin/transmission-daemon-addon
   xcp ${PWD}/xinst/bin/transmission-remote ${ADDON_MOD_DIR}/sbin/transmission-remote-addon

   rm -rf ${ADDON_COM_DIR}/web_transmission
   cp -af xinst/share/transmission/web ${ADDON_COM_DIR}/web_transmission
}

xclean()
{
   make clean
   make distclean
   if [ -d ${PWD}/xinst ]; then
       rm -rf ${PWD}/xinst
   fi
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   if [ "$2" = "addon" ]; then
      xinstaddon
   elif [ "$2" = "buildin" ]; then
      xinstall
   else
	  echo "Usage : $0 $1 [addon/buildin]"
   fi
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
fi

