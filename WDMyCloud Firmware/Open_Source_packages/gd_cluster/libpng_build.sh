#!/bin/sh
unset CFLAGS
unset LDFLAGS
unset LIBS

export LDFLAGS=-L${PWD}/../gd_cluster/xinst/lib
export CFLAGS=-I${PWD}/../gd_cluster/xinst/include
PREFIX=$PWD/../gd_cluster/xinst

HOST="arm-linux-gnueabi"

make clean
make distclean

./configure --host=$HOST --prefix=$PREFIX

make clean
make
make install

