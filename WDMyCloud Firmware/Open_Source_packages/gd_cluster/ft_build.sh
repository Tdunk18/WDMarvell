#!/bin/sh
make clean ; make distclean
./configure LDFLAGS=-s --host=arm-gnu-linux --prefix=${PWD}/../gd_cluster/xinst
make
make install
