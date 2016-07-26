#!/bin/sh
source ../xcp.sh

xbuild()
{
  unset CFLAGS
  unset LDFLAGS
  unset LIBS

   export CPPFLAGS=-I$XINC_DIR LDFLAGS="-L$XLIB_DIR"
   ./configure --host=${TARGET_HOST} --without-ncurses --disable-login --disable-su --prefix=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})
   make clean
   make
   
   if [ ${PROJECT_NAME} != "LIGHTNING_4A" ]; then
     cp -avf .libs/libuuid.so* ../_xinstall/${PROJECT_NAME}/lib/
     mkdir ../_xinstall/${PROJECT_NAME}
     mkdir ../_xinstall/${PROJECT_NAME}/include/
     mkdir ../_xinstall/${PROJECT_NAME}/include/uuid/
     cp -avf libuuid/src/uuid.h ../_xinstall/${PROJECT_NAME}/include/uuid/
   fi
}

xinstall()
{
   ${CROSS_COMPILE}strip -s disk-utils/blockdev
   #${CROSS_COMPILE}strip -s mount/mount
   #${CROSS_COMPILE}strip -s mount/umount
   ${CROSS_COMPILE}strip -s dmesg
   ${CROSS_COMPILE}strip -s .libs/libuuid.so.1.3.0
   ${CROSS_COMPILE}strip -s .libs/libblkid.so.1.1.0
   ${CROSS_COMPILE}strip -s .libs/blkid
   
   #xcp mount/mount ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin
   #xcp mount/umount ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin
   #xcp disk-utils/blockdev ${ROOT_FS}/bin
   xcp dmesg ${ROOT_FS}/bin

   cp -avf libuuid/src/uuid.h ${XINC_DIR}/uuid/
   
   if [ "${PROJECT_NAME}" = "Aurora" -o  "${PROJECT_NAME}" = "Sprite" ]; then
     echo "Intel Platform"
     cp -avf .libs/blkid ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin/
     rm ${ROOTDIR}/ramdisk/${PROJECT_NAME}/lib/libblkid.so*
     cp -avf .libs/libblkid.so* ${ROOTDIR}/ramdisk/${PROJECT_NAME}/lib
     cp -avf .libs/libuuid.so* ${XLIB_DIR}/
     cp -avf .libs/libuuid.so* ${ROOTDIR}/ramdisk/${PROJECT_NAME}/lib
   else
     echo "Marvel Platform"
     cp -avf .libs/blkid ${ROOT_FS}/bin/
     rm ${ROOT_FS}/lib/libblkid.so*
     cp -avf .libs/libblkid.so* ${ROOT_FS}/lib/
     cp -avf .libs/libuuid.so* ${XLIB_DIR}/
     cp -avf .libs/libuuid.so* ${ROOT_FS}/lib/
   fi
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
