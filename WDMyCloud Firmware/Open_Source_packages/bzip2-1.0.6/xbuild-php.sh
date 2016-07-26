
unset CFLAGS
unset LDFLAGS
unset LIBS

MY_PREFIX=`readlink -f $PWD/../_xinstall/${PROJECT_NAME}`
source ../xcp.sh

xbuild()
{
	make clean
	if [ ${PROJECT_NAME} == "Sprite" ] || [ ${PROJECT_NAME} == "Aurora" ]; then
		make -f Makefile-staticlib
	fi
	make PREFIX=${MY_PREFIX} install
}

xclean()
{
	make clean
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : xbuild.sh build or xbuild.sh clean"
fi
