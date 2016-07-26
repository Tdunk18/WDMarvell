#!/bin/sh

MY_POSITION=${PWD}

xbuild()
{
	unset CFLAGS
	unset LDFLAGS
	unset LIBS

	GPL_PREFIX=${MY_POSITION}/../_xinstall/${PROJECT_NAME}
	mkdir -p ${GPL_PREFIX}

	#build util-linux
	cd ${MY_POSITION}/../util-linux-2.22/
	./xbuild.sh clean
	./xbuild.sh build	
	if [ $? != 0 ] ; then
		echo "util-linux configure failed!!!!"
		exit 1
	fi
	mkdir -p ${GPL_PREFIX}/include/blkid/
	cp -avf libblkid/src/blkid.h ${GPL_PREFIX}/include/blkid/
	mkdir -p ${GPL_PREFIX}/lib/
	cp -avf .libs/libblkid.so* ${GPL_PREFIX}/lib/
	cp -avf .libs/libuuid.so* ${GPL_PREFIX}/lib/
	cd $MY_POSITION	

	#build lzo-2.06
	cd ${MY_POSITION}/../lzo-2.06/	
	./xbuild.sh clean
	./configure --host=${TARGET_HOST} \
	--prefix=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME}) --enable-shared	
	make
	make install	
	if [ $? != 0 ] ; then
		echo "lzo configure failed!!!!"
		exit 1
	fi
	cd $MY_POSITION
	
	./autogen.sh
	
	export CFLAGS="$CFLAGS -g -I${GPL_PREFIX}/include -I${XINC_DIR}"
	export LDFLAGS="$LDFLAGS -L${GPL_PREFIX}/lib -L${XLIB_DIR}"
	export EXT2FS_CFLAGS=${CFLAGS}
	export EXT2FS_LIBS=${LDFLAGS}
	export BLKID_CFLAGS="${CFLAGS} -I${GPL_PREFIX}/include/blkid"
	export BLKID_LIBS=" -lblkid -luuid"
	export UUID_CFLAGS=${CFLAGS}
	export UUID_LIBS=" -lblkid -luuid"
	export ZLIB_CFLAGS="${CFLAGS} -I${GPL_PREFIX}/include/lzo"
	export ZLIB_LIBS=" -L${GPL_PREFIX}/lib -lz -llzo2"
	./configure --host=${TARGET_HOST} --prefix=${GPL_PREFIX} --disable-convert --disable-documentation --disable-backtrace
	make
}

xinstall()
{			
	cp -vf ${MY_POSITION}/../lzo-2.06/src/.libs/liblzo2.so.2.0.0 ${ROOT_FS}/lib/
	cd ${ROOT_FS}/lib	
	ln -sf liblzo2.so.2.0.0 liblzo2.so.2
	ln -sf liblzo2.so.2.0.0 liblzo2.so
	cd ${MY_POSITION}/
	cp -vf ${MY_POSITION}/mkfs.btrfs ${ROOT_FS}/sbin/
	cp -vf ${MY_POSITION}/btrfs ${ROOT_FS}/sbin/
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
