#!/bin/sh

unset APPS
unset SCRIPTS
unset LDFLAGS
unset CFLAGS

source ../xcp.sh

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

xbuild()
{
	#unset CROSS_COMPILE
	#export CFLAGS="-DALPHA_CUSTOMIZE -O2 -pipe"
	#export CC AR RANLIB RC
	
	CC=gcc
	AR=ar
	NM=nm
	RANLIB=ranlib
	
	THIS_ROOT=$(readlink -f $PWD)

	# Optimazation parameters from debian
	CFLAGS="$CFLAGS -O2 -fstack-protector --param=ssp-buffer-size=4 -D_FORTIFY_SOURCE=2 -Wl,-z,relro -Wa,--noexecstack"
	
	# Always enable cryptodev support
	if [ "$(has_feature CRYPTO_MV_CESA)" = "Yes" ]; then
		CFLAGS="$CFLAGS -DHAVE_CRYPTODEV"
	else
		CFLAGS="$CFLAGS -DHAVE_CRYPTODEV -DUSE_CRYPTODEV_DIGESTS"
	fi
	
	if [ "$(has_feature CRYPTODEV_OCF)" = "Yes" ]; then
		rm -rf include/crypto
		cp -rvf cryptodev/ocf/* .
	else
		rm -rf include/crypto
		cp -rvf cryptodev/cryptodev-linux/* .
	fi
	
	# We need zlib
	if [ ! -e ../zlib-1.2.3/libz.so.1 ]; then
		cat <<-EOF
	
		ERROR: "../zlib-1.2.3/libz.so.1" does not exist!
		Please build it first.
	
		$ cd ../zlib-1.2.3
		$ ./xbuild build
	
		EOF
	
		exit 1
	fi
	CFLAGS="$CFLAGS -I${THIS_ROOT}/../zlib-1.2.3"
	export LDFLAGS="-L${THIS_ROOT}/../zlib-1.2.3"


	CTARGET=linux-generic32
	case "$ARCH" in
	arm)
		CTARGET=linux-armv4
		;;
	x86_64)
		CTARGET=linux-x86_64
		;;
	esac

	./Configure ${CTARGET} \
		--prefix=/usr \
		--openssldir=/etc/ssl \
		--libdir=/lib \
		threads \
		shared \
		enable-camellia \
		no-mdc2 \
		enable-tlsext \
		no-idea \
		no-rc5 \
		no-ssl2 \
		no-ssl3 \
		zlib
	
	
	CFLAG=$(grep ^CFLAG= Makefile | LC_ALL=C sed \
		-e 's:^CFLAG=::' \
		-e 's:-fomit-frame-pointer ::g' \
		-e 's:-O[0-9] ::g' \
		-e 's:-march=[-a-z0-9]* ::g' \
		-e 's:-mcpu=[-a-z0-9]* ::g' \
		-e 's:-m[a-z0-9]* ::g' \
		)
	
	sed -i \
		-e "/^CFLAG/s|=.*|=${CFLAG} ${CFLAGS}|" \
		-e "/^SHARED_LDFLAGS=/s|$| ${LDFLAGS}|" \
		Makefile
	
	# Dirty workaround, I do not waste my time to find out why.
	sed -i -e 's:.bad:.so:' engines/Makefile
	sed -i -e 's:.bad:.so:' engines/ccgost/Makefile
	
	make -j1 depend
	make all build-shared || exit 1
	
	# rehash is needed to prep the certs/ dir; do this
	# separately to avoid parallel build issues.
	#make rehash
	
	make INSTALL_PREFIX=${THIS_ROOT}/xinst install || exit 1
	make INSTALL_PREFIX=$(readlink -f ${THIS_ROOT}/../_xinstall/${PROJECT_NAME}) install || exit 1
	
	chmod +w xinst/usr/lib/libssl.so.1.0.0
	chmod +w xinst/usr/lib/libcrypto.so.1.0.0
	
	$STRIP -s xinst/usr/lib/libssl.so.1.0.0
	$STRIP -s xinst/usr/lib/libcrypto.so.1.0.0
	$STRIP -s xinst/usr/bin/openssl
	
	#cp -a include ../_xinstall/${PROJECT_NAME}/include/openssl-1.0.1c  # nelson remove it since it generates dead link of headers
	if [ ! -e ../_xinstall/${PROJECT_NAME}/include/openssl ]; then
        mkdir ../_xinstall/${PROJECT_NAME}/include/openssl
	fi
	cp -rvf xinst/usr/include/openssl ../_xinstall/${PROJECT_NAME}/include/
	
	cp -af xinst/usr/lib/* ../_xinstall/${PROJECT_NAME}/lib/
	
#	cat <<EOF
	
#	Compile successfully!
	
#	Now you should copy what you need to your rootfs.
	
#	e.g.
	
#	  $ cp xinst/usr/lib/libssl.so.1.0.0 \$ROOT_FS/lib/
#	  $ cp xinst/usr/lib/libcrypto.so.1.0.0 \$ROOT_FS/lib/
	
#	  $ cp xinst/usr/lib/libssl.so.1.0.0 \$ROOT_FS/sbin
	
	#EOF
}

xinstall()
{
	xcp xinst/usr/lib/libssl.so.1.0.0 $XLIB_DIR
	xcp xinst/usr/lib/libcrypto.so.1.0.0 $XLIB_DIR
	xcp xinst/usr/lib/libssl.so.1.0.0 $ROOT_FS/lib/
	xcp xinst/usr/lib/libcrypto.so.1.0.0 $ROOT_FS/lib/
	xcp xinst/usr/bin/openssl $ROOT_FS/sbin/
	
	cp -rf xinst/usr/* ../_xinstall/${PROJECT_NAME}/

}

xclean()
{
	git clean -dfx
	git checkout -- .
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
