export CFLAGS
export LDFLAGS="-L$(readlink -f $PWD/../_xinstall/$PROJECT_NAME/lib) -lz"

./configure --prefix='$(shell while [ ! -e "configure" ] ; do cd .. ; done ; echo `pwd` )/../gd_cluster/xinst' --host=arm-linux \
	ac_cv_file___dev_urandom_=yes \
	--with-ssl=$(readlink -f $PWD/../openssl-1.0.1c/xinst/usr) \
	--with-zlib=$(readlink -f $PWD/../_xinstall/$PROJECT_NAME) \
	--enable-optimize \
	--enable-http --enable-ftp \
	--enable-file \
	--enable-proxy \
	--disable-manual \
	--enable-ipv6 \
	--enable-nonblocking \
	--enable-cookies \
	--disable-ldap

#./configure --host=arm-mv5sft-linux-gnueabi ac_cv_file___dev_urandom_=yes --prefix='$(shell while [ ! -e "configure" ] ; do cd .. ; done ; echo `pwd` )/../gd_cluster/xinst' LDFLAGS="-L`pwd`/../gd_cluster/xinst/lib" CPPFLAGS="-I`pwd`/../gd_cluster/xinst/include"

make 
make install
