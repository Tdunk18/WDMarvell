#!/bin/sh

case $1 in
build)
	make PREFIX=/ LDFLAGS="${LDFLAGS} -liconv" || exit 1
	make PREFIX=/ DESTDIR=$PWD/xinst install || exit 1
	;;
install)
	cd xinst/sbin/ || exit 1
	$STRIP -s fatlabel
	$STRIP -s fsck.fat
	$STRIP -s mkfs.fat

	cp -av dosfsck $ROOT_FS/sbin/
	cp -av dosfslabel $ROOT_FS/sbin/
	cp -av fatlabel $ROOT_FS/sbin/
	cp -av fsck.fat $ROOT_FS/sbin/
	cp -av fsck.msdos $ROOT_FS/sbin/
	cp -av fsck.vfat $ROOT_FS/sbin/
	cp -av mkdosfs $ROOT_FS/sbin/
	cp -av mkfs.fat $ROOT_FS/sbin/
	cp -av mkfs.msdos $ROOT_FS/sbin/
	cp -av mkfs.vfat $ROOT_FS/sbin/
	;;
clean)
	make clean
	rm -rf xinst
	;;
*)
	echo "ERROR: unknown options"
	echo "$0 build/install/clean"
	exit 1
	;;
esac
