#!/bin/sh
unset CFLAGS
unset LDFLAGS
unset LIBS

make clean ; make distclean
./configure --shared --prefix=${PWD}/../gd_cluster/xinst
make
make install
