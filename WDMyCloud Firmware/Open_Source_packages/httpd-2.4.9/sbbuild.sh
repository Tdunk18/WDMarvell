#!/bin/sh

export TMPINST=`readlink -f ../../_xinstall/${PROJECT_NAME}`

SUPPORT_BIG_FILE=0
if echo $CFLAGS | grep -q LARGEFILE64_SOURCE ; then
	SUPPORT_BIG_FILE=1
fi

unset CFLAGS
unset LDFLAGS
source ../../xcp.sh

if [ "$SUPPORT_BIG_FILE" -ne "0" ]; then
	CFLAGS=" -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64"
fi

export CFLAGS="$CFLAGS -DNO_LINGCLOSE -DSO_LINGER -O2"

# test if this is running under scratchbox2 env
if ! echo $PATH | grep -q sb2 ;then 
	echo "This script must be running under scratchbox2 env!"
	exit 1
fi;

build()
{
	if [ ! -e ${TMPINST}/lib/libuuid.so ]; then
		echo "We need libuuid library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/lib/libexpat.so ]; then
		echo "We need expat library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/lib/libz.so ]; then
		echo "We need zlib library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/usr/lib/libssl.so ]; then
		echo "We need openSSL library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/usr/lib/libcrypto.so ]; then
		echo "We need openSSL library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/lib/libpcrecpp.so ]; then
		echo "We need pcre library."
		exit 1
	fi
	
	export LD_LIBRARY_PATH=${TMPINST}/lib:${TMPINST}/usr/lib
	export CFLAGS="$CFLAGS -DBIG_SECURITY_HOLE -I${TMPINST}/include"
	export LDFLAGS="-lz -lpthread -ldl -L${TMPINST}/lib"
	./configure --prefix=${TMPINST} --with-apr=${TMPINST}/bin/apr-1-config --with-apr-util=${TMPINST}/bin/apu-1-config --with-z=${TMPINST} --with-pcre=${TMPINST} --with-mpm=prefork --enable-dav --enable-dav-fs --enable-deflate --enable-rewrite --enable-ssl --with-ssl=${TMPINST}/usr --enable-modules=all --enable-mods-shared=all --enable-so
	if [ "$?" -ne "0" ];then
		echo "Configure failed!"
		exit 1
	fi
	make clean
	make
	make install
}

install()
{
	$STRIP ${TMPINST}/modules/*.so
	cp -rvf ${TMPINST}/modules/* ${ROOT_FS}/lib/apache_modules/
	
	$STRIP ${TMPINST}/bin/httpd
	xcp ${TMPINST}/bin/httpd ${ROOT_FS}/sbin/\
	
	$STRIP ${TMPINST}/bin/htpasswd
	xcp ${TMPINST}/bin/htpasswd ${ROOT_FS}/sbin/
}

clean()
{
	make clean
}


if [ "$1" = "build" ]; then
   build
elif [ "$1" = "install" ]; then
   install
elif [ "$1" = "clean" ]; then
   clean
else
   echo "Usage : sbbuild.sh build or sbbuild.sh install or sbbuild.sh clean"
fi

