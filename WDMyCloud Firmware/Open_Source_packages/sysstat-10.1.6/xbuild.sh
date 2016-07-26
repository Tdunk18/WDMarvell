#!/bin/bash

xbuild()
{

make clean
make distclean

export PATH=${PWD}/../../_xinstall/${PROJECT_NAME}/bin:$PATH

./configure --host=${TARGET_HOST} --disable-man-group

make

}

xinstall()
{
	make DESTDIR=${PWD}/xinst install

	if [ -e ${PWD}/xinst/usr/local/lib64/sa/sadc ]; then
		${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/lib64/sa/sadc
		cp ${PWD}/xinst/usr/local/lib64/sa/sadc ${ROOT_FS}/sbin/
	else
		${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/lib/sa/sadc
		cp ${PWD}/xinst/usr/local/lib/sa/sadc ${ROOT_FS}/sbin/
	fi

	${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/bin/*

	cp ${PWD}/xinst/usr/local/bin/iostat ${ROOT_FS}/sbin/
	cp ${PWD}/xinst/usr/local/bin/mpstat ${ROOT_FS}/sbin/
	cp ${PWD}/xinst/usr/local/bin/pidstat ${ROOT_FS}/sbin/
	cp ${PWD}/xinst/usr/local/bin/sar ${ROOT_FS}/sbin/
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
    echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
 fi
