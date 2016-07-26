#!/bin/bash
TzStr=""
if [ -z $1 ];then
	TzStr="UTC"
else
	TzStr="${1}"
fi

sed -i "s:^date.timezone.*$:date.timezone = ${TzStr}:g" /etc/php/php.ini 
#/usr/sbin/access_mtd "cp -f /etc/php/php.ini /usr/local/config/php.ini"

/usr/sbin/apache restart
#killall -9 php-fpm 2>/dev/null
#php-fpm -R
