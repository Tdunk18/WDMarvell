#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh


xbuild()
{
   export CPPFLAGS=-I$XINC_DIR/ LDFLAGS="-L$XLIB_DIR -lz" CFLAGS="-O2"
   
   make clean
   make
}

xinstall()
{
   ${CROSS_COMPILE}strip -s setpci
   xcp setpci ${ROOT_FS}/bin
}

xclean()
{
   make clean
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
