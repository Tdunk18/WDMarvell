#!/bin/sh
#Plese make sure where is the phpize , exec it .

# Replace the toolchain to toolchain/arm-sddnd-linux-gnueabi if it is arm-mv5sft-linux-gnueabi
if [ "$CROSS_COMPILE" = "arm-mv5sft-linux-gnueabi-" ]; then
			cat <<-EOF
WARNING: Your "CROSS_COMPILE" is set to arm-mv5sft-linux-gnueabi-.

	   arm-mv5sft-linux-gnueabi-gcc is known as a broken toolchain,
	   it generates malformed optimization of code.
	   
Using the toolchain/arm-sddnd-linux-gnueabi

EOF

	if [ ! -e $PWD/../toolchain/arm-sddnd-linux-gnueabi ]; then
		echo "ERROR: the toolchain/arm-sddnd-linux-gnueabi not exist!"
		exit 1
	fi
	
	export TOOLCHAIN_PATH="$PWD/../toolchain/arm-sddnd-linux-gnueabi/bin"
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

source ../xcp.sh

TMPINST=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})

CFLAGS="-O2"
if [ "$PROJECT_NAME" = "Aurora" -o "$PROJECT_NAME" = "Sprite" ]; then
	CFLAGS="$CFLAGS -march=atom -mtune=atom"
fi
if [ "$SUPPORT_BIG_FILE" -ne "0" ]; then
	export CFLAGS="$CFLAGS -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64"
fi

xbuild()
{
	if [ ! -e ${TMPINST}/bin/phpize ]; then
		echo "We need phpize from php"
		echo "Please run xbuild/xbuild.sh in php"
		exit 1
	fi
	
	if [ ! -e ${TMPINST}/bin/php-config ]; then
		echo "We need php-config from php"
		echo "Please run xbuild/xbuild.sh in php"
		exit 1
	fi	
	
	${TMPINST}/bin/phpize

	if [ ! -e configure ]; then
		echo "Please find the PHP install root and use bin/phpize to complete setting ."
		exit 1
	fi

	./configure --host=${TARGET_HOST} --prefix=${PWD}/xinst --with-php-config=${TMPINST}/bin/php-config
	make
	make install
}

xinstall()
{
	$STRIP .libs/xdebug.so
	xcp .libs/xdebug.so ${ROOT_FS}/lib/php_extension/
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
