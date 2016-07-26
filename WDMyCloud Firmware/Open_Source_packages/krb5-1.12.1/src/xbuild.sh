#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../../xcp.sh
MY_PREFIX=$PWD/../../_xinstall/${PROJECT_NAME}

xbuild()
{
	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	find . -name Makefile | xargs rm -vf
	rm linux-cache


	echo ac_cv_func_regcomp=yes > linux-cache
	echo krb5_cv_attr_constructor_destructor=yes >> linux-cache
	echo ac_cv_printf_positional=yes >> linux-cache
	

	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX} CFLAGS=-DUSE_LINKER_FINI_OPTION --cache-file=linux-cache --disable-pkinit
	make 
	make install
}

xinstall()
{
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libcom_err.so.3.0 		-o ${ROOT_FS}/lib/libcom_err.so.3.0
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libgssapi_krb5.so.2.2 	-o ${ROOT_FS}/lib/libgssapi_krb5.so.2.2
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libk5crypto.so.3.1 	    -o ${ROOT_FS}/lib/libk5crypto.so.3.1
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libkrb5.so.3.3 		    -o ${ROOT_FS}/lib/libkrb5.so.3.3
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libkrb5support.so.0.1 	-o ${ROOT_FS}/lib/libkrb5support.so.0.1
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libkadm5srv_mit.so.9 	    -o ${ROOT_FS}/lib/libkadm5srv_mit.so.9
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libkdb5.so.7 				-o ${ROOT_FS}/lib/libkdb5.so.7
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/lib/libgssrpc.so.4 			-o ${ROOT_FS}/lib/libgssrpc.so.4
    ${CROSS_COMPILE}strip -v ${MY_PREFIX}/bin/kinit                     -o ${ROOT_FS}/bin/kinit
}

xclean()
{
	make clean
	make distclean
}

if [ "$1" = "build" ]; then
	xbuild
elif [ "$1" = "install" ]; then
	xinstall
elif [ "$1" = "clean" ]; then
	xclean
else
	echo "Usage : xbuild.sh {build | install | clean}"
fi
