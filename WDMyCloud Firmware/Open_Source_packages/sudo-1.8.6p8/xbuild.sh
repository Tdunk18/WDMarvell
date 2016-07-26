#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

xbuild()
{
   echo "nothing..."
}

xinstall()
{
	${CROSS_COMPILE}strip -s src/sudo
   ${CROSS_COMPILE}strip -s plugins/sudoers/visudo
   ${CROSS_COMPILE}strip -s plugins/sudoers/.libs/sudoers.so
   
   xcp src/sudo ${ROOT_FS}/bin
   xcp plugins/sudoers/visudo ${ROOT_FS}/bin
   xcp plugins/sudoers/.libs/sudoers.so ${ROOT_FS}/lib
}

xclean()
{
   #make distclean
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
