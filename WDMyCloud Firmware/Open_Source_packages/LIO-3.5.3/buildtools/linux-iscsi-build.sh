#/bin/sh

KVER=`uname -r`
XEN=$( echo $KVER | awk 'BEGIN{ FS="xen" } { print $1 }' ) # command substitution

if [ ! $XEN ]; then
	echo "Kernel Version: $KVER";
else
	echo "Xen Kernel: $KVER";
	echo "Kernel: $XEN";
fi

if [ ! $1 ]; then
	DIST=el5
fi

ARCH=`uname -i`

echo "Removing old builds"

rm -rf /usr/src/redhat/RPMS/$ARCH/iscsi-target*
rm -rf /usr/src/redhat/RPMS/$ARCH/sbe-mibs*

echo "Starting build"

KERNEL_DIR=/lib/modules/$KVER/build/ KERNEL_INCLUDE_DIR=/lib/modules/$KVER/source/include/ KERNEL_SOURCE_DIR=/lib/modules/$KVER/source/ RELEASE=$KVER make kernel
RET=$?

if [ $RET != 0 ]; then
	"Echo unable to build";
	exit 1;
fi

if [ $XEN ]; then
	KERNEL_DIR=/lib/modules/$XEN/build/ KERNEL_INCLUDE_DIR=/lib/modules/$XEN/source/include/ KERNEL_SOURCE_DIR=/lib/modules/$XEN/source/ RELEASE=$XEN make kernel

	RET=$?
	if [ $RET != 0 ]; then
		"Echo unable to build";
		exit 1;
	fi
fi

make user
RET=$?
if [ $RET != 0 ]; then
	"Echo unable to build";
	exit 1
fi

ls -la /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/iscsi-target*.rpm
rm -rf /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/iscsi-target*.rpm
rm -rf /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/sbe-mibs*.rpm

echo "Generated /usr/src/redhat/RPMS/$ARCH/";

cp -v /usr/src/redhat/RPMS/$ARCH/iscsi-target* /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/
cp -v /usr/src/redhat/RPMS/$ARCH/sbe-mibs* /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/

cd /mnt/linux-iscsi.org/BUILDS/$DIST/$ARCH/ ; md5sum *.rpm > md5sum.txt 
