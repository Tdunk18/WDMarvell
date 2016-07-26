#!/bin/sh
# $1 : start, stop or restart

Usage()
{
	echo "usage: upnpnas.sh {start | stop | restart}"
	exit 1
}

# to avoid to be executed concurrently
count=1
while [ "$count" -le "10" ];
do
	if [ ! -e /tmp/enable_upnp_in_progress ]; then
		touch /tmp/enable_upnp_in_progress
		break
	fi

	echo upnpnas waiting...
	sleep 1
	count=`expr $count + 1`
done

case $1 in
	start)
		upnp_nas_xml
		upnp_nas_device -webdir /etc/upnp &
		;;

	stop)
		kill `pidof upnp_nas_device` 2>/dev/null
		sleep 1
		kill -9 `pidof upnp_nas_device` 2>/dev/null
		;;

	restart)
		kill `pidof upnp_nas_device` 2>/dev/null
		sleep 1
		kill -9 `pidof upnp_nas_device` 2>/dev/null
		sleep 2

		upnp_nas_xml
		upnp_nas_device -webdir /etc/upnp &
		;;

	"")
		Usage
		;;
	*)
		Usage
		;;
esac

rm /tmp/enable_upnp_in_progress
