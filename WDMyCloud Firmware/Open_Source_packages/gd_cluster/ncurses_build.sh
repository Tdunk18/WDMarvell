#!/bin/sh

make clean
make distclean
./configure --host=arm-none-linux --prefix=${PWD}/../gd_cluster/xinst --with-shared
make
make install
