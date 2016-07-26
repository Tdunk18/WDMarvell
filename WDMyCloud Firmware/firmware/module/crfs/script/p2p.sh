#!/bin/sh

counter=1

start() {
	
	
	while [ $counter -le 20 ]; do
		PID=`ps ww | grep transmission-daemon | grep "systemfile" | awk '{ print $1 }'`
	
		if [ -z $PID ]; then
			break
		else
			echo "Force shutting down P2P service"
        	kill -9 $PID	
		fi
		sleep 1
		counter=`expr $counter + 1`
	done
	
	echo "Starting P2P services"
	if [ -z "$1" ]; then
		newp2p >/dev/null &
	else
		newp2p $1 > /dev/null &
	fi


	counter=1
	while [ ! -e /tmp/p2p_done ]; do
		if [ $counter -gt 10 ]; then
			PID=`ps ww | grep transmission-daemon | grep "systemfile" | awk '{ print $1 }'`
			killall -9 newp2p 2> /dev/null
			kill -9 $PID 2> /dev/null
			break
		fi

		sleep 1
		counter=`expr $counter + 1`
	done

	rm -f /tmp/p2p_done
}

stop() {
	PID=`ps ww | grep transmission-daemon | grep "systemfile" | awk '{ print $1 }'`
	echo -n $"Shutting down P2P services: "
	kill -9 $PID 2> /dev/null
	killall -9 newp2p 2> /dev/null
	#p2p_kill
	if [ ! -e /tmp/load_module_start ]; then
		smbcom > /dev/null
		smb restart
		afpcom > /dev/null
		ftp reload
		nfs restart
		makedav start
	fi
	echo
}

restart() {
	stop
	start
}

supervise() {	
	sleep 5
	
	if [ -n "$1" ]; then
		ps | grep -q $1
		[ "$?" -eq 0 ] && kill -9 $1
	fi

	if [ -n "$2" ]; then
		ps | grep -q $2
		[ "$?" -eq 0 ] && kill -9 $2
	fi
}

case "$1" in
  start)
  	start $2
	;;
  stop)
  	stop
	;;
  restart)
  	restart
	;;
  supervise)
	TR_PID=`ps ww | grep transmission-daemon | grep "systemfile" | awk '{ print $1 }'`
	NP_PID=`pidof newp2p`
	supervise $TR_PID $NP_PID
	;;
  *)
	echo $"Usage: $0 {start|stop|restart}"
	exit 1
esac

exit $?
