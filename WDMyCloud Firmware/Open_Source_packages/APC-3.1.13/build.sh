#!/bin/sh
#Plese make sure where is the phpize , exec it .

${PWD}/../php-5.4.16/xbuild/xinst/bin/phpize

if [ ! -e configure ]; then
	echo "Please find the PHP install root and use bin/phpize to complete setting ."
	exit 1
fi

./configure --host=arm-linux --prefix=/home/tim/final/unic-gpl/APC-3.1.13/xinst --with-php-config=${PWD}/../php-5.4.16/xbuild/xinst/bin/php-config
