#!/bin/sh

xbuild(){
	make -f unix/Makefile clean

	make -f unix/Makefile generic CC=${CC} LOCAL_ZIP="-DLARGE_FILE_SUPPORT -DZIP64_SUPPORT"
}

xclean(){
	make -f unix/Makefile clean
}

xinstall(){
	${CROSS_COMPILE}strip -s zip
	cp -vf zip ${ROOT_FS}/bin/zip
}


case $1 in
	"build")
		xbuild
		;;
	"clean")
		xclean
		;;
	"install")
		xinstall
		;;
	*)
		echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
		;;
esac
