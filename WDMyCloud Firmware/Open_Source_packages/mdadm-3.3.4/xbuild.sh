#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}
mkdir -p ${GPL_PREFIX}/lib

build()
{
	
	CXFLAGS="-DALPHA_CUSTOMIZE" make
	if [ $? != 0 ]; then
		echo ""
		echo -e "***************************"
		echo -e "make failed"
		echo ""
		exit 1
	fi
}

install()
{
	cp -af libmdadm.so ${XLIB_DIR}

	PROGS=`basename $PWD`
	INC_DIR=${XINC_DIR}/${PROGS}
	rm -rf ${INC_DIR}
	mkdir -p ${INC_DIR}
	find . -name '*.h' -exec cp -af --parents {} ${INC_DIR}/ \;

	${CROSS_COMPILE}strip -s libmdadm.so
	${CROSS_COMPILE}strip -s mdadm

	cp -avf mdadm ${ROOT_FS}/bin/
	cp -avf libmdadm.so ${ROOT_FS}/lib/
	cp -avf libmdadm.so ${XLIB_DIR}/
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
