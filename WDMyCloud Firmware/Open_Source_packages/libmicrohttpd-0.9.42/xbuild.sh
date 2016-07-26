
unset CFLAGS
unset LDFLAGS
unset LIBS

MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}
source ../xcp.sh
BUILD_DIR=$PWD/build

xbuild()
{
    mkdir -p ${BUILD_DIR}
    cd ${BUILD_DIR}
    make clean
    ../configure --host=${CC%-*} --prefix=${MY_PREFIX}    
	make
	make install
    cd -
}

xinstall()
{
    if [ -d "${MY_PREFIX}" ]; then
        cp -avf ${MY_PREFIX}/include/microhttpd.h \
            ${XINC_DIR}
        cp -avf ${MY_PREFIX}/lib/libmicrohttpd.* \
            ${XLIB_DIR}
        # Install to rootfs
        cp -avf ${MY_PREFIX}/lib/libmicrohttpd.so* \
            ${ROOT_FS}/lib
    fi
}

xclean()
{
	[ -d "${BUILD_DIR}" ] && rm -rf ${BUILD_DIR}
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
