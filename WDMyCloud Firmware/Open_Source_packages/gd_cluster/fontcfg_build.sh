#!/bin/sh
make clean ; make distclean
export PATH=${PWD}/../gd_cluster/xinst/bin:$PATH
export ICONV_LIBS=${PWD}/../gd_cluster/xinst/lib

echo ${PWD}/../gd_cluster/xinst/bin
./configure --host=arm-linux --with-arch=ARM --enable-libxml2 --with-freetype-config=${PWD}/../gd_cluster/xinst/bin/freetype-config --with-expat=${PWD}/../gd_cluster/xinst CFLAGS="-I${PWD}/../gd_cluster/xinst/include/freetype2 -I${PWD}/../gd_cluster/xinst/include" LDFLAGS="-L${PWD}/../gd_cluster/xinst/lib -s" --prefix=${PWD}/../gd_cluster/xinst
make
make install
