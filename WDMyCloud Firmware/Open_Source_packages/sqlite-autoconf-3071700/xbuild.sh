#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

xbuild()
{
	if [ ! -e $(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/lib/libreadline.so.6.2 ]; then
		echo "We need readline library."
		exit 1
	fi

	CFLAGS=-I$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/include \
	LDFLAGS="-L$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/lib -lreadline -lncurses" \
	./configure --host=${TARGET_HOST} --enable-dynamic-extensions --enable-readline=yes 
	
	make
}

xinstall()
{
	${CROSS_COMPILE}strip .libs/libsqlite3.so.0
	${CROSS_COMPILE}strip .libs/sqlite3
	xcp .libs/libsqlite3.so.0 ${ROOT_FS}/lib/libsqlite3.so.0
	xcp .libs/libsqlite3.so.0 ${XLIB_DIR}/libsqlite3.so
	xcp .libs/sqlite3 ${ROOT_FS}/sbin/
}	

xclean()
{
  make clean ; make distclean
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
