#!/bin/sh

PREFIX=${PWD}/../gd_cluster/xinst

make clean ; make distclean
./configure LDFLAGS=-s --host=arm-gnu-linux --prefix=$PREFIX
make
make install
