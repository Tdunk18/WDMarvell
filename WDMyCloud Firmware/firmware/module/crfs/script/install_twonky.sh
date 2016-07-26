#!/bin/sh

MODEL=`xmldbc -g /hw_ver`

TWONKY=/usr/local/modules/twonky
DEVICEDESCRIPTION=$TWONKY/resources/devicedescription-$MODEL.txt

if [ ! -d /usr/local/twonky ]; then
#	echo mkdir /usr/local/twonky
	mkdir -p /usr/local/twonky
fi

ln -s $TWONKY/* /usr/local/twonky

rm -rf /usr/local/twonky/resources
if [ ! -d /usr/local/twonky/resources ]; then
#	echo mkdir /usr/local/twonky/resources
	mkdir -p /usr/local/twonky/resources
fi

ln -s $TWONKY/resources/* /usr/local/twonky/resources

rm -rf /usr/local/twonky/resources/devicedescription-custom-settings.txt
cp $DEVICEDESCRIPTION /usr/local/twonky/resources/devicedescription-custom-settings.txt
