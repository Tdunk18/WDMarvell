#!/bin/sh

xbuild()
{
	if [ -z "${LINUX_SRC}" ] ; then
		echo "You need to export LINUX_SRC first"
		echo "	export LINUX_SRC=/opt/DNS-345_LSP/linux-2.6.31.8"
		exit 1
	fi

	ALPHA_CUSTOMIZE=1 IQN_VENDOR="iqn.2013-03.com.wdc" ISCSI_VENDOR="Western Digital Corporation" \
		make
	if [ $? != 0 ] ; then
		echo "make failed!!!!"
		exit 1
	fi
}

xinstall()
{
	mkdir -p ${ROOT_FS}/driver/
	cp -avf kernel/drivers/target/target_core_mod.ko ${ROOT_FS}/driver/
	cp -avf kernel/drivers/lio-core/iscsi_target_mod.ko ${ROOT_FS}/driver/
}

xclean()
{
	make clean
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   xinstall
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : [xbuild.sh build] or [xbuild.sh install] or [xbuild.sh clean]"
fi
