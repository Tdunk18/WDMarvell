#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

xbuild()
{
	make clean ; make distclean

	XINST_DIR=$(readlink -f $PWD/xinst)

	./configure --prefix=${XINST_DIR} --host=${TARGET_HOST}
	make
	make install
}

#arm-gnu-linux-gnu/.libs/libffi.so.6.0.1
#arm-gnu-linux-gnu/.libs/libffi.so.6
#arm-gnu-linux-gnu/.libs/libffi.so

xinstall()
{
	${CROSS_COMPILE}strip -s arm-gnu-linux-gnu/.libs/libffi.so.6
#	xcp arm-gnu-linux-gnu/.libs/libffi.so.6 ${ROOT_FS}/lib
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
	echo "Usage : xbuild.sh {build | install | clean}"
fi
