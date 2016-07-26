
source ../xcp.sh

# Replace the toolchain to toolchain/arm-sddnd-linux-gnueabi if it is arm-mv5sft-linux-gnueabi
if [ "$CROSS_COMPILE" = "arm-mv5sft-linux-gnueabi-" ]; then
			cat <<-EOF
WARNING: Your "CROSS_COMPILE" is set to arm-mv5sft-linux-gnueabi-.

	   arm-mv5sft-linux-gnueabi-gcc is known as a broken toolchain,
	   it generates malformed optimization of code.
	   
Using the toolchain/arm-sddnd-linux-gnueabi

EOF

	if [ ! -e $PWD/../toolchain/arm-sddnd-linux-gnueabi ]; then
		echo "ERROR: the toolchain/arm-sddnd-linux-gnueabi not exist!"
		exit 1
	fi
	
	export TOOLCHAIN_PATH="$PWD/../toolchain/arm-sddnd-linux-gnueabi/bin"
	export PATH="$TOOLCHAIN_PATH:$PATH"
	export ARCH=arm
	export CROSS_COMPILE="arm-sddnd-linux-gnueabi-"
	export CC=${CROSS_COMPILE}gcc
	export CXX=${CROSS_COMPILE}g++
	export AS=${CROSS_COMPILE}as
	export AR=${CROSS_COMPILE}ar
	export LD=${CROSS_COMPILE}ld
	export NM=${CROSS_COMPILE}nm
	export RANLIB=${CROSS_COMPILE}ranlib
	export STRIP=${CROSS_COMPILE}strip
	export TARGET_HOST=${CROSS_COMPILE%-}
	
fi

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}
mkdir -p ${GPL_PREFIX}

xbuild()
{
	find ./ * | xargs touch -d `date -d 'today' +%y%m%d`
	if [ ! -e configure ] || [ ! -e install-sh ]; then
		./autogen.sh
	fi
	export ac_cv_func_malloc_0_nonnull=yes
	export ac_cv_func_realloc_0_nonnull=yes
	./configure --with-pic --host=${TARGET_HOST} --prefix=${GPL_PREFIX}
	make
	make install
}

xinstall()
{
	[ -e ${GPL_PREFIX}/include/json-c ] || { echo Please run \"sh xbuild.sh build\" first; exit 1;}

	${STRIP} ${GPL_PREFIX}/lib/libjson-c.so.2.0.1
	
	# install to dropnas
	xcp ${GPL_PREFIX}/lib/libjson-c.so.2 ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/Dropbox/lib
	
	# install to rootfs
	rm -f ${ROOT_FS}/lib/libjson-c.so.2
	xcp ${GPL_PREFIX}/lib/libjson-c.so.2 ${ROOT_FS}/lib
	ln -srf ${ROOT_FS}/lib/libjson-c.so.2 ${ROOT_FS}/lib/libjson-c.so
	
	# install to xlib
	rm -f ${XLIB_DIR}/libjson-c.so.2
	xcp ${GPL_PREFIX}/lib/libjson-c.so.2 ${XLIB_DIR}
	ln -srf ${XLIB_DIR}/libjson-c.so.2 ${XLIB_DIR}/libjson-c.so
	
	if [ -e ${XINC_DIR}/json-c ]; then
		rm -rf ${XINC_DIR}/json-c
	fi
	cp -dvrf ${GPL_PREFIX}/include/json-c ${XINC_DIR}
}

xclean()
{
	make distclean
}


COMMAND=$1

case $COMMAND in

	build)
		xbuild
	;;

	install)
		xinstall
	;;

	installtmp)
		xinstall tmp
	;;

	clean)
		xclean
	;;

    *)
		echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
	;;

esac


