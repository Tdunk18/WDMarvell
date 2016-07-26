#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	xcp ${MY_PREFIX}/include/ncurses/curses.h ${MY_PREFIX}/include/
	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX}

	make
	make install
	rm -f ${MY_PREFIX}/include/curses.h
}

xinstall()
{
	${CROSS_COMPILE}strip -s ${MY_PREFIX}/bin/nano
	xcp ${MY_PREFIX}/bin/nano ${ROOT_FS}/bin
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
