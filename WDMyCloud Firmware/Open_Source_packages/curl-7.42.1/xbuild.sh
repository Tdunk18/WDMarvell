#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$(readlink -f ../_xinstall/${PROJECT_NAME})
xbuild()
{
	# We need zlib
	if [ ! -e $MY_PREFIX/lib/libz.so ]; then
		echo ""
		echo "ERROR: zlib library does not exist!"
		echo "Expected libz path: $MY_PREFIX/lib/libz.so"
		echo "Please build zlib first."
		echo ""
		exit 1
	fi
	
	# We need openssl header
	if [ ! -e $MY_PREFIX/include/openssl ]; then
		echo ""
		echo "ERROR: openssl header does not exist!"
		echo "Expected openssl header folder: $MY_PREFIX/include/openssl"
		echo "Please build openssl first."
		echo ""
		exit 1
	fi
	
	#./configure --host=${CC%-*} ac_cv_file___dev_urandom_=yes --with-ssl --with-zlib --prefix='$(shell while [ ! -e "configure" ] ; do cd .. ; done ; echo `pwd` )/../tmp_install/' LDFLAGS="-L`pwd`/../tmp_install/lib" CPPFLAGS="-I`pwd`/../tmp_install/include"
	export CPPFLAGS="-I$MY_PREFIX/include/openssl -I$MY_PREFIX/include -O2"
	export LDFLAGS="-L$MY_PREFIX/lib -lz"
	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX} \
	--enable-ipv6 --enable-optimize \
	--with-random="/dev/urandom" --with-ssl --with-zlib \
	--with-ca-bundle="/etc/ssl/certs/ca-certificates.crt"

	make
	make install

}

xinstall()
{
	$STRIP ${MY_PREFIX}/lib/libcurl.so.4.3.0
	$STRIP ${MY_PREFIX}/bin/curl
	
	#install lib to ${XLIB_DIR}
	xcp ${MY_PREFIX}/lib/libcurl.so.4.3.0 ${XLIB_DIR}
	#create library links on ${XLIB_DIR}
	ln -srf ${XLIB_DIR}/libcurl.so.4.3.0 ${XLIB_DIR}/libcurl.so.4
	ln -srf ${XLIB_DIR}/libcurl.so.4.3.0 ${XLIB_DIR}/libcurl.so
	
	#install to ${ROOT_FS}
	xcp ${MY_PREFIX}/lib/libcurl.so.4.3.0 ${ROOT_FS}/lib
	xcp ${MY_PREFIX}/bin/curl ${ROOT_FS}/bin
	
	#create library links on ${ROOT_FS}
	ln -srf ${ROOT_FS}/lib/libcurl.so.4.3.0 ${ROOT_FS}/lib/libcurl.so.4
	ln -srf ${ROOT_FS}/lib/libcurl.so.4.3.0 ${ROOT_FS}/lib/libcurl.so
}

xclean()
{
	make clean
	git checkout -- .

	rm -rf docs/examples/.deps/
	rm -rf lib/.deps/
	rm -rf src/.deps/
	rm -rf tests/libtest/.deps/
	rm -rf tests/server/.deps/

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
