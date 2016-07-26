#!/bin/sh

export PATH=${PWD}/../gd_cluster/xinst/bin:$PATH
#export ac_cv_path_FREETYPE_CONFIG=${PWD}/../gd_cluster/xinst/bin/freetype-config

./configure --host=arm-linux --prefix=${PWD}/../gd_cluster/xinst --with-png=${PWD}/../gd_cluster/xinst --with-freetype=${PWD}/../gd_cluster/xinst --with-jpeg=${PWD}/../gd_cluster/xinst --with-fontconfig=${PWD}/../gd_cluster/xinst/include CFLAGS="-I${PWD}/../gd_cluster/xinst/include -I${PWD}/../gd_cluster/xinst/include/freetype2" LDFLAGS="-L${PWD}/../gd_cluster/xinst/lib -lxml2 -liconv -lz"

make
make install
