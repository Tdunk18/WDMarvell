#!/bin/sh

./configure --host=arm-linux --prefix="`pwd`/../gd_cluster/xinst" ac_cv_func_malloc_0_nonnull=yes ac_cv_func_realloc_0_nonnull=yes

if [ $? != 0 ] ; 
then echo "configure failed!!!!"
exit 1
fi

make clean
make 

if [ $? != 0 ] ; then
	echo "make failed!!!!"
	exit 1
fi

make install

if [ $? != 0 ] ; then
	echo "make install failed!!!!"
	exit 1
fi

