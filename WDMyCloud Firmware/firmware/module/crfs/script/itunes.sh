#!/bin/sh

CONF=/etc/mt-daapd.conf

count=1

add(){
	echo $1
	mt-daapd -A $1

	restart
}

del(){
	echo $1
	mt-daapd -R $1

	restart
}

check_compatible(){
    if [ -s "${CONF}" ]; then
        code=`sed -n "/mp3_tag_codepage\s*=/p" "${CONF}"`
        if [ ! -z "${code}" ]; then
            isutf8=`echo "${code}"|grep "UTF-8"`
            if [ -z "${isutf8}" ]; then 
                sed -i "s/mp3_tag_codepage.\+/mp3_tag_codepage = UTF-8/" "${CONF}"
                dbpath=`grep db_parms "${CONF}"|sed "s/.\+=\s*//"`
                if [ ! -z "${dbpath}" ] && [ -d "${dbpath}" ]; then
                    rm -f "${dbpath}/songs3.db"
                fi
            fi
        fi
    fi
}


start() {
	echo "$(date) `pidof mt-daapd`" >> /tmp/itunes.log	# testing how many times starting in booting
	lock
	while [ $count -le 5 ]; do
		if [ -z `pidof mt-daapd` ]; then
			break
		else
			echo "`pidof mt-daapd`"
		fi
		sleep 1
		count=`expr $count + 1`
	done

	kill -9 `pidof mt-daapd`
	sleep 1
	new_db_path=`ls -d /mnt/HD_?4 2>/dev/null | head -n 1`
	if [ ! -z $new_db_path ]
	then
#		org_db_path=/mnt/HD_[a-z]
#		org_db_path=$(echo $org_db_path | sed "s/\//\\\\\//g")
#		new_db_path=$(echo $new_db_path | sed "s/\//\\\\\//g")
#
#	sed -ie "s/${org_db_path}4/$new_db_path/g" /etc/mt-daapd.conf

	mt-daapd -P /var/run/mt-daapd_daemon.pid 1>/dev/console 2>&1

	echo "mt-daapd started....."
	else
		echo "mt-daapd db path no found ....."
	fi
	unlock
}

stop() {
        if [ -f "/var/run/mt-daapd_daemon.pid" ]; then
            P=`cat "/var/run/mt-daapd_daemon.pid"`
            mt-daapd -P /var/run/mt-daapd_daemon.pid -k
            if [ ! -z "$P" ]; then
                c=1
		while [ $c -le 5 ]
                do
                    pids=`pidof mt-daapd|grep $P`
                    if [ -z "${pids}" ]; then break; fi
                    sleep 1
                    c=`expr $c + 1`
                done
                
            fi
            rm -f /var/run/mt-daapd_daemon.pid
        fi
}

restart() {
	stop
	start
}

lock() {
	echo "LOCK itunes.sh"
	while [ $count -le 5 ]; do
		if [ -e /tmp/itunes.tmp ]; then
			echo "lock itunes...."
		else
			break
		fi
		sleep 1
		count=`expr $count + 1`
	done

	echo "Touch itunes tmp file"
	touch /tmp/itunes.tmp
}

unlock() {
	echo "UNLOCK itunes.sh"
	rm /tmp/itunes.tmp
}


case "$1" in
  start)
    check_compatible
  	start
	;;
  stop)
  	stop
	;;
  restart)
  	restart
	;;
  add)
    add $2
  	;;
  del)
    del $2
  	;;
  *)
	echo $"Usage: $0 {start|stop|restart|add|del}"
	exit 1
esac

exit $?

