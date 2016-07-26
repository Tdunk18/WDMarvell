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
	apxs -i -a -c mod_auth_token.c
}

xinstall()
{
	$STRIP .libs/mod_auth_token.so
	xcp .libs/mod_auth_token.so ${ROOT_FS}/lib/apache_modules
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
