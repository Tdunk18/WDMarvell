#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh


xbuild()
{	 
	SYSROOT=`${CROSS_COMPILE}gcc --print-sysroot`
	
	./configure --prefix=/usr \
		--host=${TARGET_HOST} --with-sysroot=${SYSROOT} --disable-nftables CC=${CROSS_COMPILE}gcc
	
	make
}

xinstall()
{
	[ -d ./target ] && rm -rf target
	mkdir target
	
	make DESTDIR=`pwd`/target install
	
	${CROSS_COMPILE}strip -s target/usr/sbin/xtables-multi
	
	cp -arvpf target/usr/sbin/* ${ROOT_FS}/usrsbin
	cp -arvpf target/usr/bin/* ${ROOT_FS}/bin
	cp -arvpf target/usr/lib/* ${ROOT_FS}/usrlib
}

xclean()
{
	make clean
    make distclean
	[ -d ./target ] && rm -rf target
    true
}

if [ "$1" = "build" ]; then
	xbuild
elif [ "$1" = "install" ]; then
	xinstall
elif [ "$1" = "clean" ]; then
	xclean
else
	echo "Usage : xbuild.sh {build | install | clean}"
fi
