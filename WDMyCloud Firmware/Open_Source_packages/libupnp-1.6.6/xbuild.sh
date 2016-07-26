#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

xbuild()
{
	./configure --host=${TARGET_HOST} --disable-client 
	make clean
	make
}

xinstall()
{
	${CROSS_COMPILE}strip -s ./ixml/.libs/libixml.so.2
	${CROSS_COMPILE}strip -s ./threadutil/.libs/libthreadutil.so.2
	${CROSS_COMPILE}strip -s ./upnp/.libs/libupnp.so.3
	${CROSS_COMPILE}strip -s ./upnp/sample/.libs/upnp_nas_device

	xcp ./ixml/.libs/libixml.so.2 ${ROOT_FS}/lib
	xcp ./threadutil/.libs/libthreadutil.so.2 ${ROOT_FS}/lib
	xcp ./upnp/.libs/libupnp.so.3 ${ROOT_FS}/lib
	xcp ./upnp/sample/.libs/upnp_nas_device ${ROOT_FS}/bin
}

xclean()
{
	if [ -e Makefile ]; then
		make clean
	else
		echo "can not find Makefile"
	fi

	make distclean
}

if [ "$1" = "build" ]; then
	xbuild
elif [ "$1" = "install" ]; then
	xinstall
elif [ "$1" = "clean" ]; then
	xclean
else
	echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
fi
