#!/bin/sh

source ../xcp.sh

ZLIB_FOLDER=zlib-1.2.3
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	if [ ! -e ${XLIB_DIR}/libz.so ]; then
		cat <<-EOF
	
		ERROR: "${XLIB_DIR}/libz.so" does not exist!
		Please build it first.
	
		$ cd ../${ZLIB_FOLDER}
		$ ./xbuild.sh clean
		$ ./xbuild.sh build
		$ ./xbuild.sh install
	
		EOF
	
		exit 1
	fi
   
   make clean
   make distclean
   ./configure --host=${TARGET_HOST} --prefix=$MY_PREFIX
   
   echo "./configure --host=${TARGET_HOST} --prefix=$MY_PREFIX"
   make
}

xinstall()
{
   mkdir -p $MY_PREFIX/bin
   make install
   ${CROSS_COMPILE}strip -s $MY_PREFIX/bin/minizip
   
   xcp $MY_PREFIX/bin/minizip  ${ROOT_FS}/bin
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

