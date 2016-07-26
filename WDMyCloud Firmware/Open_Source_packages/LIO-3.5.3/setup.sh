#~/bin/bash

if [ ! $1 ]; then
	echo "usage: setup.sh <lio-core.git dir>"
	exit 1
fi

LIO_CORE_SRC=$1

if [ ! -d $LIO_CORE_SRC/drivers/target ]; then
	echo "Unable to locate $LIO_CORE_SRC/drivers/target"
	exit 1
fi

if [ ! -d $LIO_CORE_SRC/include/target ]; then
	echo "Unable to locate $LIO_CORE_SRC/include/target"
	exit 1
fi

if [ ! -d $LIO_CORE_SRC/drivers/lio-core ]; then
	echo "Unable to locate $LIO_CORE_SRC/drivers/lio-core"
	exit 1
fi

PWD=`pwd`

mkdir -p $PWD/kernel/drivers/target
cp -R $LIO_CORE_SRC/drivers/target $PWD/kernel/drivers/
mkdir -p $PWD/kernel/include/target
cp -R $LIO_CORE_SRC/include/target $PWD/kernel/include/
mkdir -p $PWD/kernel/drivers/lio-core
cp -R $LIO_CORE_SRC/drivers/lio-core $PWD/kernel/drivers/
