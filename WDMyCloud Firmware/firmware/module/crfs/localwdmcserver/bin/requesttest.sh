#!/bin/sh

INSTALL_PATH=/usr/local/wdmcserver
export LD_LIBRARY_PATH=$INSTALL_PATH/lib:$INSTALL_PATH/bin
cd $INSTALL_PATH/bin
./requesttest $1
