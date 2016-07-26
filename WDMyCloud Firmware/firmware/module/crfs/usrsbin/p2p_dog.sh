#!/bin/bash
P2P_ENABLE=`xmldbc -g "/download_mgr/p2p/enable"`
PID_DISKMGR=`pidof diskmgr`

if [ "$P2P_ENABLE" == "1" -a "${PID_DISKMGR}" == "" -a -e /tmp/load_module_finished ]; then
	
	NP2P_PID=`ps ww | grep newp2p | grep -v grep | awk '{print $1}'`
	TR_PID=`ps ww | grep transmission-daemon | grep "systemfile" | awk '{ print $1 }'`
	
	if [ -z $NP2P_PID ] || [ -z $TR_PID ]; then
		p2p.sh restart
	fi
fi
