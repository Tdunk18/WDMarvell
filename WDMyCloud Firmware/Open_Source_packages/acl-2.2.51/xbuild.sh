#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
   #build attr first
	if [ ! -e $MY_PREFIX/lib/libattr.so.1 ]; then
	cat <<-EOF

	ERROR: "$MY_PREFIX/lib/libattr.so.1" does not exist!
	Please build it first.

	EOF

	exit 1
	fi
	
	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX} --enable-shared=yes --enable-gettext=no
	make
	make install install-lib install-dev
}

xinstall()
{
   ${CROSS_COMPILE}strip -s libacl/.libs/libacl.so.1
   
   xcp libacl/.libs/libacl.so.1 ${ROOT_FS}/lib
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
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi




if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   xinstall
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi
