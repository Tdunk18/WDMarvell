#!/bin/sh


source ../xcp.sh


TMPINST=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})

xbuild()
{
	if [ ! -e ${TMPINST}/lib/libz.so.1.2.3 ]; then
		echo "We need the zlib library to complete build."
		exit 1	
	fi
	
	if [ ! -e ${TMPINST}/lib/libiconv.so.2.2.0 ]; then
		echo "We need the libiconv library to complete build."
		exit 1	
	fi
	
	if [ -e ${TMPINST}/lib/libglib-2.0.la ]; then
		rm ${TMPINST}/lib/libglib-2.0.la
	fi

	make clean
	make distclean

	CFLAGS="-I${XINC_DIR} -I${TMPINST}/include" \
	LDFLAGS="-L${XLIB_DIR} -L${TMPINST}/lib -liconv -lz" \
	./configure --host=arm-linux --disable-java --disable-native-java \
	--prefix=${TMPINST}
	
	make
}

xinstall()
{
	echo ""
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
