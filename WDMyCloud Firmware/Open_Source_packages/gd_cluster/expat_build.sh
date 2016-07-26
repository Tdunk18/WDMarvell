#!/bin/sh
./configure --host=arm-linux-gnueabi --prefix='$(shell while [ ! -e "configure" ] ; do cd .. ; done ; echo `pwd` )/../gd_cluster/xinst'
make
make install
