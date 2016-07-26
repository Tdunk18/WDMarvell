#!/bin/sh

./configure --host=arm-linux-gnueabi ac_cv_file___dev_urandom_=yes LDFLAGS="-L`pwd`/../gd_cluster/xinst/lib" CPPFLAGS="-I`pwd`/../gd_cluster/xinst/include"  --with-libmcrypt-prefix="`pwd`/../gd_cluster/xinst"

if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean
make 

if [ $? != 0 ] ; then
	echo "make failed!!!!"
	exit 1
fi

make install

${CROSS_COMPILE}strip -v src/mcrypt -o `pwd`/../gd_cluster/xinst/bin/mcrypt

