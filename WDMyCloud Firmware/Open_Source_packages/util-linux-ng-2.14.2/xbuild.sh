#!/bin/sh

export CFLAGS="$CFLAGS -O2"
source ../xcp.sh

xbuild()
{
   if [ ${PROJECT_NAME} != "LIGHTNING_4A" ]; then
     export CFLAGS="-s -I${PWD}/../_xinstall/${PROJECT_NAME}/include" LDFLAGS="-s -L${PWD}/../_xinstall/${PROJECT_NAME}/lib -lblkid -luuid"
   fi
   ./configure --host=${TARGET_HOST} --without-ncurses --prefix=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})
   make clean
   make
}

xinstall()
{
   ${CROSS_COMPILE}strip -s disk-utils/blockdev
   ${CROSS_COMPILE}strip -s mount/mount
   ${CROSS_COMPILE}strip -s mount/umount
   
   xcp mount/mount ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin
   xcp mount/umount ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin
   xcp disk-utils/blockdev ${ROOT_FS}/bin
   
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
