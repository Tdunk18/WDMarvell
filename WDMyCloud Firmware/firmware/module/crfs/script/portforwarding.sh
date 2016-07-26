#!/bin/sh

if [ "$1" == "del" ]; then
	count=$(xmldbc -g "/network_mgr/portforwarding/count")

	while [ "0$count" -ne 0 ];
	do
		enable=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/enable")
		protocl=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/protocol")
		e_port=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/e_port")
		p_port=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/p_port")

		if [ "$enable" == "1" ]; then
	        upnp_igdctrl -D -t $protocl -e $e_port -p $p_port -n 1
	    fi
        count=`expr $count - 1`
	done

	count=$(xmldbc -g "/network_mgr/portforwarding_scan/count")

	while [ "0$count" -ne 0 ];
	do
		enable=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/enable")
		protocl=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/protocol")
		e_port=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/e_port")
		p_port=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/p_port")

		if [ "$enable" == "1" ]; then
	        upnp_igdctrl -D -t $protocl -e $e_port -p $p_port -n 1
	    fi
	    count=`expr $count - 1`
	done
fi

if [ "$1" == "add" ]; then
sleep 5

	count=$(xmldbc -g "/network_mgr/portforwarding/count")

	while [ "0$count" -ne 0 ];
	do
	    enable=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/enable")
	    protocl=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/protocol")
	    e_port=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/e_port")
	    p_port=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/p_port")
	    s=$(xmldbc -g "/network_mgr/portforwarding/item:"+$count+"/service")

	    if [ "$enable" == "1" ]; then
	        upnp_igdctrl -A -t $protocl -e $e_port -p $p_port -d $s -n 1
	    fi
	    count=`expr $count - 1`
	done

	count=$(xmldbc -g "/network_mgr/portforwarding_scan/count")

	while [ "0$count" -ne 0 ];
	do
	    enable=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/enable")
	    protocl=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/protocol")
	    e_port=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/e_port")
	    p_port=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/p_port")
	    s=$(xmldbc -g "/network_mgr/portforwarding_scan/item:"+$count+"/service")

	    if [ "$enable" == "1" ]; then
	        upnp_igdctrl -A -t $protocl -e $e_port -p $p_port -d $s -n 1
	        #echo "upnp_igdctrl -A -t" $protocl "-e" $e_port  "-p" $p_port  "-n 1 "
	    fi
	    count=`expr $count - 1`
	done
fi
