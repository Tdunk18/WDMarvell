#!/bin/sh

MODEL_NAME=`xmldbc -g /hw_ver`
MODEL_NUMBER=`xmldbc -g /model_number`

if [ -n "${MODEL_NUMBER}" ] ; then
	# MODEL_NUMBER has been set in new products, e.g. Bryce/Black Canyon
	MODEL_NAME="${MODEL_NUMBER}"
elif [ "${MODEL_NAME}" = "MyCloudEX2Ultra" ]; then
	# for Ranger Peak, change to model number
	MODEL_NAME="BVBZ"
fi

URL="http://download.wdc.com/nas/${MODEL_NAME}_HDD_Blacklist.xml"
[ -f /usr/local/modules/files/url_black_list ] && URL=`cat /usr/local/modules/files/url_black_list`

TEMP_FILE=/tmp/temp_list.xml

RETRY_CNT=1
while [ $RETRY_CNT -gt 0 ] ; do
	wget --timeout=2 --tries=1 -O ${TEMP_FILE} "${URL}"
	if [ $? -eq 0 ] ; then
		cp -f ${TEMP_FILE} /tmp/hdd_white_list.xml
		diff -rq /tmp/hdd_white_list.xml /usr/local/config/hdd_white_list.xml
		[ $? -ne 0 ] && access_mtd "cp -f /tmp/hdd_white_list.xml /usr/local/config"
		break
	fi
	RETRY_CNT=`expr ${RETRY_CNT} - 1`
done
rm -f ${TEMP_FILE}
