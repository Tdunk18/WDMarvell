#!/bin/bash
#From git://gitorious.org/procps/procps.git

xbuild()
{

	make clean
	make distclean
	export PATH=${PWD}/../../_xinstall/${PROJECT_NAME}/bin:$PATH
	autoreconf -v -f -i
	LDFLAGS="-L${XLIB_DIR}" 
	LIBS="-lncurses"
	./configure --host=${TARGET_HOST} ac_cv_func_malloc_0_nonnull=yes ac_cv_func_realloc_0_nonnull=yes
	make
}

xinstall()
{
	make DESTDIR=${PWD}/xinst install
	${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/usr/bin/pkill
	cp -avf ${PWD}/xinst/usr/local/usr/bin/pkill ${ROOT_FS}/bin/
	${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/bin/ps
	cp -avf ${PWD}/xinst/usr/local/bin/ps ${ROOT_FS}/localbin/ps
	${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/usr/bin/top
	cp -avf ${PWD}/xinst/usr/local/usr/bin/top ${ROOT_FS}/localbin/top
	${CROSS_COMPILE}strip ${PWD}/xinst/usr/local/lib/libprocps.so*
	cp -avf ${PWD}/xinst/usr/local/lib/libprocps.so* ${ROOT_FS}/lib
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
