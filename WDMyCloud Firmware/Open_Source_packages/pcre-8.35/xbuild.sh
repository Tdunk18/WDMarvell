#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=`readlink -f $PWD/../_xinstall/${PROJECT_NAME}`

xbuild()
{	
	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX} --enable-utf8
	make
	make install
}

xinstall()
{
	$STRIP .libs/libpcre.so.1.2.3
	xcp .libs/libpcre.so.1.2.3 ${ROOT_FS}/lib/.
}

xclean()
{
   make clean
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
