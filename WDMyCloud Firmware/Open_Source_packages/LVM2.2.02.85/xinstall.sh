#!/bin/sh
cp -avf libdm/ioctl/libdevmapper.so.1.02 ${XLIB_DIR}
ln -sf libdevmapper.so.1.02 ${XLIB_DIR}/libdevmapper.so
#cp -avf libdm/libdevmapper.h ${XINC_DIR}

cp -avf libdm/ioctl/libdevmapper.so.1.02 ${ROOT_FS}/lib/
