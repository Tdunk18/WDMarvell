
unset CFLAGS
unset LDFLAGS
unset LIBS

MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}
source ../xcp.sh

xbuild()
{
	make clean
	if [ ${PROJECT_NAME} == "Sprite" ] || [ ${PROJECT_NAME} == "Aurora" ]; then
		make -f Makefile-libbz2_so
		xinstall
	else	
		make PREFIX=$(readlink -f $PWD/../_xinstall/${PROJECT_NAME}) install
	fi
}

xinstall()
{
	xcp libbz2.so.1.0  ${MY_PREFIX}/lib/libbz2.so
	xcp libbz2.so.1.0.6 ${MY_PREFIX}/lib/.
	xcp libbz2.so.1.0 ${MODULE_DIR}/apkg/addons/common/clamAV/lib/.
	return
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
