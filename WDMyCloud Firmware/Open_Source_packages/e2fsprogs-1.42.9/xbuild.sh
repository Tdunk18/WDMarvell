#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

GPL_PREFIX=${PWD}/../_xinstall/${PROJECT_NAME}
mkdir -p ${GPL_PREFIX}

build()
{
	CFLAGS="$CFLAGS -g -I${XINC_DIR}" \
	LDFLAGS="$LDFLAGS -L${XLIB_DIR} -luuid" \
	./configure --host=${TARGET_HOST} --prefix=${GPL_PREFIX} \
		--disable-testio-debug --disable-tls --enable-elf-shlibs \
		--disable-libuuid --disable-uuidd --disable-defrag
	if [ $? != 0 ]; then
		echo ""
		echo -e "***************************"
		echo -e "configure failed"
		echo ""
		exit 1
	fi

	# Ignore building docs
	rm -rf doc

	make clean
	make
	if [ $? != 0 ]; then
		echo ""
		echo -e "***************************"
		echo -e "make failed"
		echo ""
		exit 1
	fi
	make install
	
	if [ ${PROJECT_NAME} != "LIGHTNING_4A" ]; then
    mkdir ${GPL_PREFIX}
    mkdir ${GPL_PREFIX}/include
	  mkdir ${GPL_PREFIX}/include/blkid/
	  cp -avf lib/blkid/blkid.h ${GPL_PREFIX}/include/blkid/
	  cp -avf lib/blkid/blkid_types.h ${GPL_PREFIX}/include/blkid/
	fi

}

install()
{
	E2FSPROGS=`basename $PWD`
	rm -rf ${XINC_DIR}/${E2FSPROGS}
	mkdir -p ${XINC_DIR}/${E2FSPROGS}
	find . -name '*.h' -exec cp -af --parents {} ${XINC_DIR}/${E2FSPROGS}/ \;

	${STRIP} ${GPL_PREFIX}/sbin/badblocks
	#${STRIP} ${GPL_PREFIX}/sbin/blkid
	${STRIP} ${GPL_PREFIX}/sbin/dumpe2fs
	${STRIP} ${GPL_PREFIX}/sbin/e2fsck
	${STRIP} ${GPL_PREFIX}/sbin/mke2fs
	${STRIP} ${GPL_PREFIX}/sbin/resize2fs
	${STRIP} ${GPL_PREFIX}/sbin/tune2fs

	#${STRIP} ${GPL_PREFIX}/lib/libblkid.so.1.0
	${STRIP} ${GPL_PREFIX}/lib/libcom_err.so.2.1
	${STRIP} ${GPL_PREFIX}/lib/libe2p.so.2.3
	${STRIP} ${GPL_PREFIX}/lib/libext2fs.so.2.4
	${STRIP} ${GPL_PREFIX}/lib/libss.so.2.0

	mkdir -p ${ROOT_FS}/bin ${ROOT_FS}/lib
	cp -avf ${GPL_PREFIX}/sbin/badblocks ${GPL_PREFIX}/sbin/dumpe2fs ${GPL_PREFIX}/sbin/mke2fs ${GPL_PREFIX}/sbin/resize2fs ${GPL_PREFIX}/sbin/tune2fs ${ROOT_FS}/bin/
	if [ ${ARCH} = "x86_64" ] ; then
		cp -avf ${GPL_PREFIX}/sbin/e2fsck ${ROOTDIR}/ramdisk/${PROJECT_NAME}/bin/
		cp -avf ${GPL_PREFIX}/lib/libcom_err.so* ${GPL_PREFIX}/lib/libe2p.so* ${GPL_PREFIX}/lib/libext2fs.so* ${GPL_PREFIX}/lib/libss.so* ${ROOTDIR}/ramdisk/${PROJECT_NAME}/lib/
	else
		cp -avf ${GPL_PREFIX}/sbin/e2fsck ${ROOT_FS}/bin/ 
		cp -avf ${GPL_PREFIX}/lib/libcom_err.so* ${GPL_PREFIX}/lib/libe2p.so* ${GPL_PREFIX}/lib/libext2fs.so* ${GPL_PREFIX}/lib/libss.so* ${ROOT_FS}/lib/
	fi
	cp -avf ${GPL_PREFIX}/lib/libcom_err.so* ${GPL_PREFIX}/lib/libe2p.so* ${GPL_PREFIX}/lib/libext2fs.so* ${GPL_PREFIX}/lib/libss.so* ${XLIB_DIR}/
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
