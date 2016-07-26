#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}
mkdir -p ${GPL_PREFIX}

build()
{
	./configure --host=${TARGET_HOST} --prefix=${GPL_PREFIX} \
		--disable-readline --disable-selinux ac_cv_func_malloc_0_nonnull=yes ac_cv_func_realloc_0_nonnull=yes
	if [ $? != 0 ]; then
		echo ""
		echo -e "***************************"
		echo -e "configure failed"
		echo ""
		exit 1
	fi

	make clean
	make libdm
	if [ $? != 0 ]; then
		echo ""
		echo -e "***************************"
		echo -e "make failed"
		echo ""
		exit 1
	fi

	
	cp -af tools/dmsetup ${GPL_PREFIX}/sbin/
	cp -af libdm/ioctl/libdevmapper.so* ${GPL_PREFIX}/lib/
}

install()
{
	${CROSS_COMPILE}strip -s ${GPL_PREFIX}/sbin/dmsetup
	${CROSS_COMPILE}strip -s ${GPL_PREFIX}/lib/libdevmapper.so.1.02
	
	cp -avf ${GPL_PREFIX}/sbin/dmsetup ${ROOT_FS}/sbin
	cp -avf ${GPL_PREFIX}/lib/libdevmapper.so* ${ROOT_FS}/lib
}

clean()
{
	make clean
}

if [ "$1" = "build" ]; then
	build
elif [ "$1" = "install" ]; then
	install
elif [ "$1" = "clean" ]; then
	clean
else
	echo "Usage : $0 build or $0 install or $0 clean"
fi
