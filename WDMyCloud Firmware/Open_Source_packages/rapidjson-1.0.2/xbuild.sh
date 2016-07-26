#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh
MY_PREFIX=$PWD/../_xinstall/${PROJECT_NAME}
xbuild()
{
    # Just copy the header files
    cp -rf ./include/rapidjson ${MY_PREFIX}/include/
}

xinstall()
{
    # Copy headers to XINC_DIR for wdic module to use
    cp -rf ./include/rapidjson ${XINC_DIR}
}

xclean()
{
    # Nothing to do here
    true
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   xinstall
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
fi
