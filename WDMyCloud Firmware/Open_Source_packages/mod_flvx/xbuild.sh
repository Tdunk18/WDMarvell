#/bin/sh
unset CFLAGS
unset LDFLAGS
unset LIBS
source ../../xcp.sh

TMPINST=$(readlink -f $PWD/../../_xinstall/${PROJECT_NAME})

XPATH=$TMPINST/bin
PATH=$XPATH:$PATH

xbuild()
{
	apxs -i -a -c mod_flvx.c
}

xinstall()
{
	$STRIP .libs/mod_flvx.so
	xcp .libs/mod_flvx.so ${ROOT_FS}/lib/apache_modules
}

xclean()
{
	git clean -dfx .
	git checkout -- .
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
