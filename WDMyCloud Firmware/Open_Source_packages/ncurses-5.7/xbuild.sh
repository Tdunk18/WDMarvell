#!/bin/bash

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	export CFLAGS="${CFLAGS} -O2 -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	./configure --host=${TARGET_HOST} --prefix=/ --datadir=/usr/share --with-shared

	make
	make DESTDIR=${MY_PREFIX} install
}

xinstall()
{
	echo "install"
	${CROSS_COMPILE}strip -s ./lib/libncurses.so.5.7
        cp -avf ./lib/libncurses.so.5.7 ${ROOT_FS}/lib/
	cp -avf ./lib/libncurses.so ${XLIB_DIR}/
	cp -avf ./lib/libncurses.so.5 ${XLIB_DIR}
	cp -avf ./lib/libncurses.so.5.7 ${XLIB_DIR}
	xcp ./include/curses.h	${XINC_DIR}
	xcp ./include/curses.h  ${XINC_DIR}/ncurses.h
	xcp ./include/ncurses_dll.h ${XINC_DIR}
	xcp ./include/unctrl.h ${XINC_DIR}
	xcp ./include/term.h ${XINC_DIR}
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
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi
