#!/bin/sh

# Replace the toolchain to toolchain/arm-sddnd-linux-gnueabi if it is arm-mv5sft-linux-gnueabi
if [ "$CROSS_COMPILE" = "arm-mv5sft-linux-gnueabi-" ]; then
			cat <<-EOF
WARNING: Your "CROSS_COMPILE" is set to arm-mv5sft-linux-gnueabi-.

	   arm-mv5sft-linux-gnueabi-gcc is known as a broken toolchain,
	   it generates malformed optimization of code.
	   
Using the toolchain/arm-sddnd-linux-gnueabi

EOF

	if [ ! -e $PWD/../../toolchain/arm-sddnd-linux-gnueabi ]; then
		echo "ERROR: the toolchain/arm-sddnd-linux-gnueabi not exist!"
		exit 1
	fi
	
	export TOOLCHAIN_PATH="$PWD/../../toolchain/arm-sddnd-linux-gnueabi/bin"
	export PATH="$TOOLCHAIN_PATH:$PATH"
	export ARCH=arm
	export CROSS_COMPILE="arm-sddnd-linux-gnueabi-"
	export CC=${CROSS_COMPILE}gcc
	export CXX=${CROSS_COMPILE}g++
	export AS=${CROSS_COMPILE}as
	export AR=${CROSS_COMPILE}ar
	export LD=${CROSS_COMPILE}ld
	export NM=${CROSS_COMPILE}nm
	export RANLIB=${CROSS_COMPILE}ranlib
	export STRIP=${CROSS_COMPILE}strip
	export TARGET_HOST=${CROSS_COMPILE%-}
	
fi

SUPPORT_BIG_FILE=0
if echo $CFLAGS | grep -q LARGEFILE64_SOURCE ; then
	SUPPORT_BIG_FILE=1
fi

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../../xcp.sh

TMPINST=$(readlink -f $PWD/../../_xinstall/${PROJECT_NAME})

XPATH=$TMPINST/bin

export PATH=$XPATH:$PATH

CFLAGS="-O2"
if [ "$PROJECT_NAME" = "Aurora" -o "$PROJECT_NAME" = "Sprite" ]; then
	CFLAGS="$CFLAGS -march=atom -mtune=atom"
fi
if [ "$SUPPORT_BIG_FILE" -ne "0" ]; then
	export CFLAGS="$CFLAGS -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64"
fi

export LDFLAGS="-L${TMPINST}/lib -L${TMPINST}/usr/lib -ldl -lssl -lcrypto -lfontconfig -lxml2 -lz -liconv -lfreetype"

xbuild()
{
	make clean

	make distclean

	if [ ! -e ${TMPINST}/lib/libxml2.so.2.7.4 ]; then
		echo "We need libxml2 library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libz.so.1.2.3 ]; then
		echo "We need zlib library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/usr/lib/libssl.so.1.0.0 ]; then
		echo "We need openSSL library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/usr/lib/libcrypto.so.1.0.0 ]; then
		echo "We need openSSL library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libiconv.so.2.2.0 ]; then
		echo "We need libiconv library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libfreetype.so.6.3.20 ]; then
		echo "We need freetype library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libfontconfig.so.1.4.4 ]; then
		echo "We need fontconfig library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/lib/libjpeg.so.7 ]; then
		echo "We need jpeg library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libpng.so.3 ]; then
		echo "We need libpng library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libexpat.so.1 ]; then
		echo "We need expat library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libncurses.so.5 ]; then
		echo "We need ncurses library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/lib/libldap-2.4.so.2 ]; then
		echo "We need libldap library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libcurl.so.4 ]; then
		echo "We need CURL library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libgd.so.2 ]; then
		echo "We need GD library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libmcrypt.so.4 ]; then
		echo "We need libmcrypt library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libmhash.so.2 ]; then
		echo "We need mhash library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libbz2.a ]; then
		echo "We need bzip2 library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libedit.so.0 ]; then
		echo "We need libedit library."
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/lib/libmysqlclient.so ]; then
		echo "We need MySQL library."
		exit 1
	fi

	if [ ! -e ${TMPINST}/bin/apxs ]; then
		echo "We need apxs from Apache httpd."
		exit 1
	fi

	../configure  --host=${TARGET_HOST} --prefix=${TMPINST} --with-config-file-path=/etc/php/ \
	--with-libxml-dir=${TMPINST} --with-gd=${TMPINST} --with-jpeg-dir=${TMPINST} \
	--with-png-dir=${TMPINST} --with-zlib-dir=${TMPINST} --with-freetype-dir=${TMPINST} \
	--enable-mbstring --with-iconv=${TMPINST} --enable-exif --with-openssl=${TMPINST}/usr \
   	--with-mcrypt=${TMPINST} --with-mhash=${TMPINST} --enable-pdo --with-pdo-sqlite \
	--with-sqlite3 --enable-bcmath --enable-ctype --enable-dom --enable-fileinfo \
	--enable-filter --enable-hash --enable-json --enable-libxml --enable-xmlreader \
	--enable-xmlwriter --enable-cli --with-libedit=${TMPINST} \
	--with-bz2=${TMPINST} --with-pcre-regex --enable-fpm \
	--with-curl=${TMPINST} --with-curlwrappers --with-mysql=${TMPINST} \
	--with-fpm-user=root --with-fpm-group=root --sysconfdir=/etc/php/ \
	--with-gettext=${TMPINST} --with-apxs2=${TMPINST}/bin/apxs --disable-phar

	make
	make install-sapi install-binaries install-build install-headers install-programs
}

xinstall()
{
	$STRIP sapi/cli/php
	xcp sapi/cli/php ${ROOT_FS}/bin/
	
	$STRIP sapi/cgi/php-cgi
	xcp sapi/cgi/php-cgi ${ROOT_FS}/bin/
	
	$STRIP sapi/fpm/php-fpm
	xcp sapi/fpm/php-fpm ${ROOT_FS}/bin/

	$STRIP ${TMPINST}/modules/libphp5.so
	xcp ${TMPINST}/modules/libphp5.so ${ROOT_FS}/lib/apache_modules/
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
