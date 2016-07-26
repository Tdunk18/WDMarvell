#!/bin/sh
if [ -d /opt/perl5 ]; then
	rm /opt/perl5
fi

if [ -e /lib/libperl.so.5.10 ]; then
	rm /lib/libperl.so.5.10
fi

if [ -e /usr/lib/perl ]; then
	rm /usr/lib/perl
fi

if [ -e /usr/share/perl ]; then
	rm /usr/share/perl
fi

if [ -e /usr/bin/perl ]; then
	rm /usr/bin/perl
fi

ln -s /usr/local/modules/perl5/bin/perl /usr/bin/
ln -s /usr/local/modules/perl5/lib/libperl.so.5.10.1 /lib/libperl.so.5.10
ln -s /usr/local/modules/perl5/lib/perl /usr/lib
ln -s /usr/local/modules/perl5/share/perl/ /usr/share
