#!/bin/sh
# $1 : start or stop

Usage()
{
	echo "usage: twonky_analytics.sh {start | stop}"
	exit 1
}

STATUS=`twonky.sh status | awk '{print $3}'`
#	echo STATUS=$STATUS
if [ "x$STATUS" != "xIS" ]; then
	return 1
fi

case $1 in
	start)
		wget http://127.0.0.1:9000/rpc/set_option?enablereporting=15 -o /dev/null -O /dev/null
#		wget http://127.0.0.1:9000/rpc/set_option?mediastatisticsenabled=1 -o /dev/null -O /dev/null
#		wget http://127.0.0.1:9000/rpc/set_option?remoteaccessmytwonky=2 -o /dev/null -O /dev/null
#               Kernel comment out this. It shouldn't call by us. Because wizard UI already show this.
#		fireAlert -a 1035 -f
		;;

	stop)
		wget http://127.0.0.1:9000/rpc/set_option?enablereporting=0 -o /dev/null -O /dev/null
#		wget http://127.0.0.1:9000/rpc/set_option?mediastatisticsenabled=0 -o /dev/null -O /dev/null
#		wget http://127.0.0.1:9000/rpc/set_option?remoteaccessmytwonky=0 -o /dev/null -O /dev/null
		;;

	"")
		Usage
		;;

	*)
		Usage
		;;
esac

#wget http://127.0.0.1:9000/rpc/get_option?enablereporting -o /dev/null -O /tmp/twonky_analytics.txt
#cat /tmp/twonky_analytics.txt
#echo 
#grep enablereporting /mnt/HD_a4/twonkymedia/twonkyserver.ini 
#
#wget http://127.0.0.1:9000/rpc/report_statistics_now -O /tmp/report_statistics_now.txt -o /dev/null
#cat /tmp/report_statistics_now.txt
##cat /mnt/HD_a4/twonkymedia/last_report.xml 
##cat /mnt/HD_a4/twonkymedia/last_device_report.xml 
