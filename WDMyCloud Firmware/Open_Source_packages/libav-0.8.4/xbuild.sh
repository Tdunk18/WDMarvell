#!/bin/sh

MY_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}

xbuild()
{
	make clean
	./configure --enable-cross-compile --cross-prefix=${CROSS_COMPILE} --arch=arm --target_os=linux \
	--prefix=${MY_PREFIX} --enable-shared --enable-pthreads \
	--disable-avdevice --disable-avfilter --disable-debug

	make
	make install
}

xinstall()
{
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavcodec.so
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavcodec.so.53
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavformat.so
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavformat.so.53
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavutil.so
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libavutil.so.51
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libswscale.so
	${CROSS_COMPILE}strip ${MY_PREFIX}/lib/libswscale.so.2

	cp ${MY_PREFIX}/lib/libavcodec.so.53 ${ROOT_FS}/lib/libavcodec.so.53
	cp ${MY_PREFIX}/lib/libavformat.so.53 ${ROOT_FS}/lib/libavformat.so.53
	cp ${MY_PREFIX}/lib/libavutil.so.51 ${ROOT_FS}/lib/libavutil.so.51 
	cp ${MY_PREFIX}/lib/libswscale.so.2 ${ROOT_FS}/lib/libswscale.so.2

	cp ${MY_PREFIX}/lib/libavcodec.so ${XLIB_DIR}/libavcodec.so
	cp ${MY_PREFIX}/lib/libavformat.so ${XLIB_DIR}/libavformat.so
	cp ${MY_PREFIX}/lib/libavutil.so ${XLIB_DIR}/libavutil.so
	cp ${MY_PREFIX}/lib/libswscale.so ${XLIB_DIR}/libswscale.so

	cp -r ${MY_PREFIX}/include/* ${XINC_DIR}/
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
