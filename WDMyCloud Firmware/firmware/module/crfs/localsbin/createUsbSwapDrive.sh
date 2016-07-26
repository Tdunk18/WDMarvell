#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# createUsbSwapDrive.sh <device>
#
# Utility script to create an attached USB drive for swap space
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

PARTED_CMDS='mklabel msdos mkpart primary 1M -1M'
echo -n "NOTE: THIS WILL DESTROY ALL DATA ON DRIVE $1.  DO YOU WANT TO PROCEED? (Y/N): "
read input
echo ""
if [ "$input" == "Y" ] && [ -b ${1} ]; then
	echo "Formatting drive $1 for swap"
	parted ${1} --align optimal <<EOP
$PARTED_CMDS
quit
EOP
	sync
	mkswap ${1}1
	swapon ${1}1
else
	echo "Failed"
fi
