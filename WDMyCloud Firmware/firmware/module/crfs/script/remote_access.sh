#!/bin/sh


remoteAccess=`cat /usr/local/config/dynamicconfig_config.ini | grep REMOTEACCES | sed 's/"//g' | sed 's/REMOTEACCESS=//'`

if [ $remoteAccess == "TRUE" ]; then
	rm -f /tmp/WDMCDispatcher.pipe
	/etc/init.d/wdmcserverd start
	sleep 1 
	/etc/init.d/wdphotodbmergerd start
	sleep 1 
	# restart communicationmanager for WD
	/usr/local/orion/communicationmanager/communicationmanagerd stop 
	sleep 5 
	/usr/local/orion/communicationmanager/communicationmanagerd start
	
elif [ $remoteAccess == "FALSE" ]; then
	/etc/init.d/wdphotodbmergerd stop
	/etc/init.d/wdmcserverd stop
	/usr/local/orion/communicationmanager/communicationmanagerd stop 
fi

