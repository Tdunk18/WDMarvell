#!/bin/sh

xbuild()
{
	make clean
	make distclean

	./configure --host=${TARGET_HOST} \
	--prefix=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME})
	
	make
	make install
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
