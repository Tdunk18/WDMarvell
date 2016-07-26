#!/bin/sh
make clean; make distclean
./configure --host=arm-gnu-linux --prefix=${PWD}/../gd_cluster/xinst --enable-extra-encodings
make
make install
