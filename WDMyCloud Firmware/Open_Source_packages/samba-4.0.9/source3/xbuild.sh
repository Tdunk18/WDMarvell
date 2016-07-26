#!/bin/sh

source ../../xcp.sh
MY_PREFIX=$PWD/../../_xinstall/${PROJECT_NAME}

xbuild()
{
	export LDFLAGS="${LDFLAGS} -L${MY_PREFIX}/lib"
	export CFLAGS="${CFLAGS} -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64 -DPROJECT_FEATURE_CUSTOM_WD=1 -DPROJECT_FEATURE_ADS=1"
	export LIBS="${LIBS} -lssl -lcrypto -lz"

	if [ "${PROJECT_NAME}" = "Sprite" -o "${PROJECT_NAME}" = "Aurora" ] ; then
		export CFLAGS="${CFLAGS} -O2"
	fi

	find . -name "*.o" | xargs rm -rf
	find . -name Makefile | xargs rm -rf

	rm linux.cache
	echo samba_cv_CC_NEGATIVE_ENUM_VALUES=yes>linux.cache
	echo samba_cv_HAVE_WRFILE_KEYTAB=yes>>linux.cache
	echo smb_krb5_cv_enctype_to_string_takes_krb5_context_arg=yes>>linux.cache
	echo smb_krb5_cv_enctype_to_string_takes_size_t_arg=yes>>linux.cache
	echo libreplace_cv_HAVE_GETADDRINFO=no>>linux.cache
	echo ac_cv_file__proc_sys_kernel_core_pattern=no>>linux.cache
	echo samba_cv_big_endian=no>>linux.cache
	echo samba_cv_little_endian=yes>>linux.cache
	echo use_ads=yes>>linux.cache
	echo samba_cv_SIZEOF_BLKCNT_T_4=yes>>linux.cache

	./configure \
		--build=i386-linux \
		--host=${TARGET_HOST} \
		--cache-file=linux.cache \
		--prefix=${MY_PREFIX} \
		--localstatedir=/var \
		--with-privatedir=/etc/samba \
		--with-lockdir=/tmp/samba \
		--with-configdir=/etc/samba \
		--libdir=/lib \
		--with-piddir=/var/run/samba \
		--with-logfilebase=/var/log/samba \
		--enable-cups=no \
		--enable-largefile=yes \
		--with-sendfile-support=yes \
		--with-quotas=yes \
		--with-acl-support=yes \
		--disable-static \
		--with-ads=yes \
		--with-winbind=yes \
		--without-libsmbclient \
		--with-included-popt \
		--with-included-iniparser \
		--with-ldap=${MY_PREFIX} \
		--with-pam=yes \
		--with-krb5=${MY_PREFIX} \
		--with-libiconv=${MY_PREFIX}

    #support ACL
    sed -i 's/\/\* #undef HAVE_ACL_LIBACL_H \*\//#define HAVE_ACL_LIBACL_H 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    sed -i 's/\/\* #undef HAVE_SYS_ACL_H \*\//#define HAVE_SYS_ACL_H 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    #support Large file
    sed -i 's/\/\* #undef HAVE_LONGLONG \*\//#define HAVE_LONGLONG 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    sed -i 's/\/\* #undef HAVE_OFF64_T \*\//#define HAVE_OFF64_T 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    sed -i 's/\/\* #undef HAVE_STRUCT_FLOCK64 \*\//#define HAVE_STRUCT_FLOCK64 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    #
    sed -i 's/\/\* #undef USE_SETRESUID \*\//#define USE_SETRESUID 1 \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    sed -i 's/\/\* #undef HAVE_KRB5_ENCTYPE_TO_STRING_WITH_SIZE_T_ARG \*\//#define HAVE_KRB5_ENCTYPE_TO_STRING_WITH_SIZE_T_ARG \/\* ALPHA_CUSTOMIZE \*\//g' ./include/autoconf/config.h
    sed -i 's/#define DEFAULT_DOS_CHARSET "CP850"/#define DEFAULT_DOS_CHARSET "ASCII"/g' ./include/autoconf/config.h





#   make clean
#   make
#   make install
}

xinstall()
{
    echo ${MY_PREFIX}
    xcp bin/libwbclient.so.0 ${ROOT_FS}/lib/libwbclient.so.0
    xcp ../nsswitch/libnss_winbind.so ${ROOT_FS}/lib/libnss_winbind.so
    xcp bin/pam_winbind.so ${ROOT_FS}/lib/security/pam_winbind.so
    xcp bin/recycle.so ${ROOT_FS}/lib/vfs/recycle.so
    xcp bin/streams_xattr.so ${ROOT_FS}/lib/vfs/streams_xattr.so
    xcp bin/smbd ${ROOT_FS}/bin/smbd 
    xcp bin/nmbd ${ROOT_FS}/bin/nmbd
    xcp bin/smbpasswd ${ROOT_FS}/bin/smbpasswd
    xcp bin/smbclient ${ROOT_FS}/bin/smbclient
    xcp bin/nmblookup ${ROOT_FS}/bin/nmblookup
    xcp bin/wbinfo ${ROOT_FS}/bin/wbinfo
    xcp bin/winbindd ${ROOT_FS}/bin/winbindd
    xcp bin/net ${ROOT_FS}/bin/net
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
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi

