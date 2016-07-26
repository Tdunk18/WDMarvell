#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}

xbuild()
{
	find . -name "*.o" | xargs rm -rf
	find . -name "*.lo" | xargs rm -rf
	find . -name Makefile | xargs rm -rf

	export CFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export CPPFLAGS="${CFLAGS} -I${MY_PREFIX}/include"
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib -lz -ldb-4.7"

	./configure --host=${TARGET_HOST} --prefix=${MY_PREFIX} --with-yielding-select=manual --without-cyrus-sasl --enable-bdb --enable-overlays --sysconfdir="/etc" --with-tls=openssl
	sed -i 's/#define NEED_MEMCMP_REPLACEMENT 1/\/\* #undef NEED_MEMCMP_REPLACEMENT \*\/ \/\* ALPHA_CUSTOMIZE \*\//g' ./include/portable.h
	make depend
	make 
	make install
}

xinstall()
{
	${CROSS_COMPILE}strip -v ./libraries/liblber/.libs/liblber-2.4.so.2.10.2 -o ${ROOT_FS}/lib/liblber-2.4.so.2.10.2
	cp -afv ./libraries/liblber/.libs/liblber-2.4.so.2 ${ROOT_FS}/lib/liblber-2.4.so.2

	${CROSS_COMPILE}strip -v ./libraries/libldap/.libs/libldap-2.4.so.2.10.2 -o ${ROOT_FS}/lib/libldap-2.4.so.2.10.2
	cp -afv ./libraries/libldap/.libs/libldap-2.4.so.2 ${ROOT_FS}/lib/libldap-2.4.so.2

	#For 2.5, LDAP Server
	#${CROSS_COMPILE}strip -v ./servers/slapd/slapd -o ${ROOT_FS}/bin/slapd
	#cd ./servers/slapd/
	#cp -afv slapacl slapadd slapauth slapcat slapdn slapindex slappasswd slapschema slaptest ${ROOT_FS}/bin/
	#cd -

	#For 2.5, LDAP Client
	#${CROSS_COMPILE}strip -v clients/tools/ldapsearch -o ${ROOT_FS}/bin/ldapsearch
	#${CROSS_COMPILE}strip -v clients/tools/ldapdelete -o ${ROOT_FS}/bin/ldapdelete
	#${CROSS_COMPILE}strip -v clients/tools/ldapmodify -o ${ROOT_FS}/bin/ldapmodify
	#cd clients/tools
	#ln -fs ldapmodify ldapadd
	#cd -
	#cp -avf clients/tools/ldapadd ${ROOT_FS}/bin/
	#${CROSS_COMPILE}strip -v clients/tools/ldappasswd -o ${ROOT_FS}/bin/ldappasswd
	#${CROSS_COMPILE}strip -v clients/tools/ldapwhoami -o ${ROOT_FS}/bin/ldapwhoami
	#${CROSS_COMPILE}strip -v clients/tools/ldapurl -o ${ROOT_FS}/bin/ldapurl
	#${CROSS_COMPILE}strip -v libraries/libldap_r/.libs/libldap_r-2.4.so.2.10.2 -o ${ROOT_FS}/lib/libldap_r-2.4.so.2
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
