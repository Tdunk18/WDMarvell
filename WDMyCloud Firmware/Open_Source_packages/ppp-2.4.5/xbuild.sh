#!/bin/bash

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX}
	make clean
	make

}

xinstall()
{
	echo "install to addon folder"
	#cp -avf pppd/pppd ${ROOT_FS}/usrsbin
	mkdir -p ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/bin
	cp -avf pppd/pppd  ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/bin
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
