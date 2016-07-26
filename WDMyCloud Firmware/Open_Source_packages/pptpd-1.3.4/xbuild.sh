#!/bin/bash

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
#MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	make clean
	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include -D${PROJECT_NAME}"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	./configure --host=${TARGET_HOST} --prefix=/usr
	make

}

xinstall()
{
	echo "install to addon folder"
	mkdir -p ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/bin
	cp -avf pptpd  ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/bin
	cp -avf pptpctrl ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/bin

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
