#!/bin/sh

AUTO_CLEAR_ENABLE=`xmldbc -g /recycle_bin/auto_clear`

if [ $AUTO_CLEAR_ENABLE != "1" ] ; then
#	echo "Auto Clear Recycle Bin is disabled!";
	exit 0;
fi

del_file() {
	if [ -d $1 ] ; then
		MIN=`expr $2 \* 1440`
		find $1 -mindepth 2 -cmin +$MIN -exec rm -rf '{}' \;
		find $1 -depth -mindepth 2 -type d -exec rmdir '{}' \;
	fi
}

hd_a2=/mnt/HD/HD_a2/.!@\#\$recycle/
hd_b2=/mnt/HD/HD_b2/.!@\#\$recycle/
hd_c2=/mnt/HD/HD_c2/.!@\#\$recycle/
hd_d2=/mnt/HD/HD_d2/.!@\#\$recycle/

DAYS=$(xmldbc -g /recycle_bin/day)

del_file $hd_a2 $DAYS;
del_file $hd_b2 $DAYS;
del_file $hd_c2 $DAYS;
del_file $hd_d2 $DAYS;
