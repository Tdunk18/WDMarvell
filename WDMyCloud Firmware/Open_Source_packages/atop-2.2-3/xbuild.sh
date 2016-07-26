#!/bin/sh

case $PROJECT_NAME in
Sprite|Aurora)
	PROJECT_NAME=Sprite;;
KingsCanyon|Glacier|GrandTeton|Magneto|Yellowstone|Yosemite)
	PROJECT_NAME=KingsCanyon;;
LIGHTNING-4A)
	PROJECT_NAME=LIGHTNING-4A;; # Of course :<
Sequoia64k)
	PROJECT_NAME=Sequoia64k;;
*)
	echo "ERROR: unsupported(yet) project, try add it in"
	echo
	exit 1
	;;
esac

if [ "$CROSS_COMPILE" == "arm-mv5sft-linux-gnueabi-" ]; then
	echo "ERROR: This \"arm-mv5sft-linux-gnueabi\" toolchain is known too old and broken"
	echo "ERROR: It lacks ethtool_cmd_speed() in linux/ethtool.h"
	echo
	echo "Try using [arm-sddnd-linux-gnueabi] toolchain instead,"
	echo "otherwise compiling will fail"
	echo
	exit 1
fi

export CFLAGS="-Irfs/$PROJECT_NAME/include"
export LDFLAGS="-Lrfs/$PROJECT_NAME/lib"

make || exit 1

$STRIP -s atop
$STRIP -s atopacctd

echo; echo;
echo "Done."

if [ "$PROJECT_NAME" == "Sequoia64k" ]; then
	echo "Creating Debian package"
	tmpdir=`mktemp -d`
	mkdir -p $tmpdir/usr/bin
	cp -a atop $tmpdir/usr/bin
	cp -a atopsar $tmpdir/usr/bin
	cp -a atopacctd $tmpdir/usr/bin
	cp -a DEBIAN $tmpdir/
	dpkg-deb -Zxz -z1 --build $tmpdir .
	mv atop_2.2-3_armhf.deb atop_2.2-3_armhf-64k.deb 
	#rm -rf $tmpdir
else
	echo "Copying atop, atopacctd, atopsar to \$ROOT_FS"
	cp -a atop $ROOT_FS/bin/
	cp -a atopacctd $ROOT_FS/bin/
	cp -a atopsar $ROOT_FS/bin/
fi
