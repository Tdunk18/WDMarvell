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
export LDFLAGS="-L${TMPINST}/lib"

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

	./configure --prefix=$TMPINST --with-apr=$TMPINST/bin/apr-1-config --with-expat=${TMPINST} --with-iconv=${TMPINST}
	make clean
	make
	make install
}

install()
{
	$STRIP .libs/libaprutil-1.so.0.5.3
	xcp .libs/libaprutil-1.so.0.5.3 ${ROOT_FS}/lib
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

