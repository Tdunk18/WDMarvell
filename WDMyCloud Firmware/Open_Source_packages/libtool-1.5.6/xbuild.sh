#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}

xbuild()
{
   make clean
   ./configure --host=${TARGET_HOST} --prefix=${GPL_PREFIX}
   make
   make install
}

xinstall()
{
   ${CROSS_COMPILE}strip -s ./libltdl/.libs/libltdl.so.3
   ${CROSS_COMPILE}strip -s ./libltdl/.libs/libltdl.so
   
   xcp ./libltdl/.libs/libltdl.so.3 ${ROOT_FS}/lib
   xcp ./libltdl/.libs/libltdl.so ${XLIB_DIR}
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
