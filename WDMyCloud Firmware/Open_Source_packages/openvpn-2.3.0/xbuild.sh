#!/bin/sh
# Due to the GCC 4.3.2 gc_malloc problem , 
# if any problem , please change the GCC 4.4.7 
# toolchain to cross-compile .

export IFCONFIG=/sbin/ifconfig
export ROUTE=/sbin/route

xbuild()
{
	if [ ! -e $(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/lib/liblzo2.a ]; then
		echo "We need the lzo library to complete build."
		exit 1	
	fi

	make clean
	make distclean

	CFLAGS="$CFLAGS -I$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/include -O2" \
	LDFLAGS="$LDFLAGS -L$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})/lib -lz" \
	./configure --host=${TARGET_HOST} --enable-password-save \
	--enable-crypto --enable-ssl --enable-debug \
	--disable-plugin-auth-pam
	
	make
}

xinstall()
{
	${CROSS_COMPILE}strip -s src/openvpn/openvpn
	
	cp src/openvpn/openvpn ${ROOT_FS}/sbin/openvpn
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
	echo "Usage: xbuild.sh {build|install|clean}"
fi
