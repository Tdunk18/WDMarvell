#!/bin/sh

if [ -z "$1" ]; then
	echo "Please input correct image path"
	exit 0
fi

if [ ! -e "$1" ]; then
	echo "Can not find image file"
	exit 0
fi

echo "burn in image.cfs ...."
flash_eraseall /dev/mtd3
nandwrite -m -p /dev/mtd3 $1
