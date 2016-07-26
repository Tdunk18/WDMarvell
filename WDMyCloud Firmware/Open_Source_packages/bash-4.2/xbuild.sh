#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

xbuild()
{
   ./configure --host=${CC%-*} bash_cv_job_control_missing=present

   # Force to let yacc rebuilding
   rm -f y.tab.c y.tab.h parser-built

   make
}

xinstall()
{
   ${CROSS_COMPILE}strip -s bash
   xcp bash ${ROOT_FS}/bin
}

xclean()
{
   make clean
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
