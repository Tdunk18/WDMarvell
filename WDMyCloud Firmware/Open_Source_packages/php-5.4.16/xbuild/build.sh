#!/bin/bash
make clean;make distclean

unset CFLAGS
unset LDFLAGS
unset LIBS

XPATH=${PWD}/../../gd_cluster/xinst/bin
export PKG_CONFIG_PATH=${PWD}/../../gd_cluster/xinst/pkgconfig
export PATH=$XPATH:$PATH

#export CFLAGS="-march=armv5te -I${PWD}/../../sqlite-autoconf-3071601/xinst/usr/local/include"
#export CFLAGS="-D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE"
#export CXXFLAGS="-D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE"
#export CXX=$CC
export LDFLAGS="-L${PWD}/../../gd_cluster/xinst/lib -L${PWD}/../../openssl-1.0.1c/xinst/usr/lib -ldl -lssl -lcrypto -lfontconfig -lxml2 -lz -liconv -lfreetype -L${PWD}/../../bzip2-1.0.6/xinst/lib -L${PWD}/../../libedit-20121213-3.0/xbuild/xinst/lib"
#-ldl -L/home/tim/final/unic-gpl/libedit-20121213-3.0/xbuild/xinst/lib -L${PWD}/../../sqlite-autoconf-3071601/xinst/usr/local/lib -lsqlite3"
#ORG
#../configure  --host=arm-linux --prefix=${PWD}/.install --without-pear --with-config-file-path=/etc/php/ --with-libxml-dir=${PWD}/../../gd_cluster/xinst --with-gd=${PWD}/../../gd_cluster/xinst --with-jpeg-dir=${PWD}/../../gd_cluster/xinst --with-png-dir=${PWD}/../../gd_cluster/xinst --with-zlib-dir=${PWD}/../../gd_cluster/xinst --with-freetype-dir=${PWD}/../../gd_cluster/xinst --enable-mbstring --with-curl=${PWD}/../../gd_cluster/xinst --with-curlwrappers --with-iconv=${PWD}/../../gd_cluster/xinst --enable-exif --with-openssl=${PWD}/../../openssl-1.0.1c/xinst/usr --with-mcrypt=${PWD}/../../gd_cluster/xinst --with-mhash=${PWD}/../../gd_cluster/xinst --with-curlwrappers --enable-pdo --with-pdo-sqlite --with-sqlite3 #  --with-sqlite3=${PWD}/../../sqlite-autoconf-3071601/xinst/usr/local --with-pdo-sqlite=${PWD}/../../sqlite-autoconf-3071601/xinst/usr/local #--with-apxs2=/home/tim/final/httpd-2.4.4/xbuild/xinst/bin/apxs APXS_MPM=prefork

#WITH WD CONFIG.
#../configure  --host=arm-linux --prefix=/usr/local --without-pear --with-config-file-path=/etc/php/ --with-libxml-dir=${PWD}/../../gd_cluster/xinst --with-gd=${PWD}/../../gd_cluster/xinst --with-jpeg-dir=${PWD}/../../gd_cluster/xinst --with-png-dir=${PWD}/../../gd_cluster/xinst --with-zlib-dir=${PWD}/../../gd_cluster/xinst --with-freetype-dir=${PWD}/../../gd_cluster/xinst --enable-mbstring --with-iconv=${PWD}/../../gd_cluster/xinst --enable-exif --with-openssl=${PWD}/../../openssl-1.0.1c/xinst/usr --with-mcrypt=${PWD}/../../gd_cluster/xinst --with-mhash=${PWD}/../../gd_cluster/xinst --enable-pdo --with-pdo-sqlite --with-sqlite3 --enable-bcmath --enable-ctype --enable-dom --enable-fileinfo --enable-filter --enable-hash --enable-json --enable-libxml --enable-xmlreader --enable-xmlwriter --enable-cli --with-libedit=/home/tim/final/unic-gpl/libedit-20121213-3.0/xbuild/xinst --with-bz2=/home/tim/final/unic-gpl/bzip2-1.0.6/xinst --with-pcre-regex --enable-fpm --with-curl=${PWD}/../../gd_cluster/xinst --with-curlwrappers --with-mysql=${PWD}/../../gd_cluster/libmysql/usr --with-fpm-user=root --with-fpm-group=root --sysconfdir=/etc/php/
../configure  --host=arm-linux --prefix=${PWD}/xinst --with-config-file-path=/etc/php/ --with-libxml-dir=${PWD}/../../gd_cluster/xinst --with-gd=${PWD}/../../gd_cluster/xinst --with-jpeg-dir=${PWD}/../../gd_cluster/xinst --with-png-dir=${PWD}/../../gd_cluster/xinst --with-zlib-dir=${PWD}/../../gd_cluster/xinst --with-freetype-dir=${PWD}/../../gd_cluster/xinst --enable-mbstring --with-iconv=${PWD}/../../gd_cluster/xinst --enable-exif --with-openssl=${PWD}/../../openssl-1.0.1c/xinst/usr --with-mcrypt=${PWD}/../../gd_cluster/xinst --with-mhash=${PWD}/../../gd_cluster/xinst --enable-pdo --with-pdo-sqlite --with-sqlite3 --enable-bcmath --enable-ctype --enable-dom --enable-fileinfo --enable-filter --enable-hash --enable-json --enable-libxml --enable-xmlreader --enable-xmlwriter --enable-cli --with-libedit=${PWD}/../../libedit-20121213-3.0/xbuild/xinst --with-bz2=${PWD}/../../bzip2-1.0.6/xinst --with-pcre-regex --enable-fpm --with-curl=${PWD}/../../gd_cluster/xinst --with-curlwrappers --with-mysql=${PWD}/../../gd_cluster/libmysql/usr --with-fpm-user=root --with-fpm-group=root --sysconfdir=/etc/php/ --with-gettext=${PWD}/../../gettext-0.18.3.1/xinst/usr/local

# Says our gcc _DO_ have that builtin
#sed -i -e 's,\/\* #undef HAVE_BUILTIN_ATOMIC \*\/,#define HAVE_BUILTIN_ATOMIC 1,' main/php_config.h

# Force to link with libgcc_s and libgcc to support atomic operation:
# __sync_bool_compare_and_swap_4
#sed -i -e '/^EXTRA_LIBS =/ s/$/ -lgcc_s -lgcc/' Makefile

#make
