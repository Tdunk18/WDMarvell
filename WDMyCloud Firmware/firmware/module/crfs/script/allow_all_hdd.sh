#!/bin/sh
str="<allowed>0<\/allowed>"
rep="<allowed>1<\/allowed>"
sed -i "s/${str}/${rep}/g" /var/www/xml/current_hd_info.xml

SOCK_FILE=/var/run/xmldb_sock_sysinfo
DISK_IDX=1
DISK_SLOT=`xmldbc -S ${SOCK_FILE} -g /disks/disk#`
while [ ${DISK_IDX} -le ${DISK_SLOT} ] ; do
	DISK_NAME=`xmldbc -S ${SOCK_FILE} -g /disks/disk:${DISK_IDX}/name`
	if [ -n "${DISK_NAME}" ] ; then
		xmldbc -S /var/run/xmldb_sock_sysinfo -s /disks/disk:${DISK_IDX}/allowed 1
	fi
	DISK_IDX=`expr ${DISK_IDX} + 1`
done

