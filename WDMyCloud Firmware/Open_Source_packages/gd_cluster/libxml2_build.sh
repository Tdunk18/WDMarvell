#!/bin/sh
make clean;make distclean
./configure --host=arm-linux --with-python=no --prefix=${PWD}/../gd_cluster/xinst
make clean;make

make install
