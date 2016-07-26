#!/bin/sh

case $1 in
build)
	./configure --prefix=/ \
		CFLAGS="-DALPHA_CUSTOMIZE=1 -O2" LDFLAGS="" \
		|| exit 1
	make || exit 1
	;;
install)
	$STRIP -s acpi_listen
	$STRIP -s acpid
	$STRIP -s kacpimon/kacpimon
	cp -v acpi_listen $ROOT_FS/bin/
	cp -v acpid $ROOT_FS/sbin/
	cp -v kacpimon/kacpimon $ROOT_FS/sbin/
	;;
clean)
	make clean || exit 1
	;;
*)
	echo "ERROR: unknown options"
	echo "$0 build/install/clean"
	exit 1
	;;
esac
