#!/bin/sh
#
# MediaServer Control File written by Itzchak Rehberg
# Modified for fedora/redhat by Landon Bradshaw <phazeforward@gmail.com>
# Adapted to Twonky 3.0 by TwonkyVision GmbH
# Adapted to Twonky 4.0 by TwonkyVision GmbH
# Adapted to Twonky 5.0 by PacketVideo
#
# This script is intended for SuSE and Fedora systems.
#
#
###############################################################################
#
### BEGIN INIT INFO
# Provides:       twonkyserver
# Required-Start: $network $remote_fs
# Default-Start:  3 5
# Default-Stop:   0 1 2 6
# Description:    Twonky UPnP server
### END INIT INFO
#
# Comments to support chkconfig on RedHat/Fedora Linux
# chkconfig: 345 71 29
# description: Twonky UPnP server
#
#==================================================================[ Setup ]===

source /usr/local/modules/files/project_features
SUPPORT_BONDING=$PROJECT_FEATURE_BONDING
SUPPORT_VLAN=$PROJECT_FEATURE_VLAN

WORKDIR1="/usr/local/twonky"
WORKDIR2="`dirname $0`"
PIDFILE=/var/run/mediaserver.pid

#change this to 0 to disable the twonky proxy service
START_PROXY=0

#change this to 0 to disable the twonky tuner service
START_TUNER=0

#=================================================================[ Script ]===


stop_support_daemon() {
SUPPORT_DAEMON=$1
	if [ "${SUPPORT_DAEMON}" = "" ]; then
		return 12
	fi
	if [ "${SUPPORT_DAEMON}" = "none" ]; then
		return 13
	fi
	
	echo "Stopping ${SUPPORT_DAEMON}"
	killall ${SUPPORT_DAEMON}
}

check_support_daemon() {
	SUPPORT_DAEMON=$1
	if [ "${SUPPORT_DAEMON}" = "" ]; then
		return 12
	fi
	if [ "${SUPPORT_DAEMON}" = "none" ]; then
		return 13
	fi

#	SD_PID=`ps --no-headers -o pid -C ${SUPPORT_DAEMON}`
        SD_PID=`ps | grep $SUPPORT_DAEMON | grep -v grep | awk '{print $1}'`
#echo SD_PID=$SD_PID
	if [ "${SD_PID}" = "" ]; then
		return 0
	else
		return 1
	fi
}

start_support_daemon() {
SUPPORT_DAEMON=$1
SUPPORT_DAEMON_WORKDIR=$2
	if [ "${SUPPORT_DAEMON}" = "" ]; then
		return 12
	fi
	if [ "${SUPPORT_DAEMON}" = "none" ]; then
		return 13
	fi

	check_support_daemon "${SUPPORT_DAEMON}"
	DSTATUS=$?
	if [ "${DSTATUS}" = "1" ]; then
		echo "${SUPPORT_DAEMON} is already running."
		return
	fi

	if [ -x "${SUPPORT_DAEMON_WORKDIR}/${SUPPORT_DAEMON}" ]; then
		echo -n "Starting ${SUPPORT_DAEMON} ... "
      		"${SUPPORT_DAEMON_WORKDIR}/${SUPPORT_DAEMON}" &
	else
		echo "Warning: support deamon ${SUPPORT_DAEMON_WORKDIR}/${SUPPORT_DAEMON} not found." 
	fi
}

status_support_daemon() {
        SUPPORT_DAEMON=$1
        if [ "${SUPPORT_DAEMON}" = "" ]; then
                return 12
        fi
	if [ "${SUPPORT_DAEMON}" = "none" ]; then
		return 13
	fi

	check_support_daemon "${SUPPORT_DAEMON}"
	DSTATUS=$?
	if [ "${DSTATUS}" = "0" ]; then
		echo "${SUPPORT_DAEMON} is not running."
		return;
	fi
	if [ "${DSTATUS}" = "1" ]; then
		echo "${SUPPORT_DAEMON} is running."
		return;
	fi
	echo "Error checking status of ${SUPPORT_DAEMON}"
}

get_iface_and_ip()
{
    if [ "$SUPPORT_BONDING" == "1" ]; then
    	BOND_ENABLE=$(xmldbc -g "/network_mgr/bonding/enable")
    else
    	BOND_ENABLE=0
    fi

    if [ "$SUPPORT_VLAN" == "1" ]; then
		VLAN_ENABLE0=$(xmldbc -g "/network_mgr/lan0/vlan_enable")
		VLAN_ENABLE1=$(xmldbc -g "/network_mgr/lan1/vlan_enable")
		VID0=$(xmldbc -g "/network_mgr/lan0/vlan_id")
		VID1=$(xmldbc -g "/network_mgr/lan1/vlan_id")
    else
 		VLAN_ENABLE0=0
		VLAN_ENABLE1=0
   fi

	if [ "$BOND_ENABLE" == "1" ]; then
		if [ "$VLAN_ENABLE0" == "1" ]; then
			IFACE=bond0.$VID0
		else
			IFACE=bond0
		fi
		IP=`ip addr show dev $IFACE | sed -e's/^.*inet \([^ ]*\)\/.*$/\1/;t;d'`
	else
		if [ "$VLAN_ENABLE0" == "1" ]; then
			IFACE0=egiga0.$VID0
		else
			IFACE0=egiga0
		fi
		IP0=`ip addr show dev $IFACE0 | sed -e's/^.*inet \([^ ]*\)\/.*$/\1/;t;d'`

		if [ "$VLAN_ENABLE1" == "1" ]; then
			IFACE1=egiga1.$VID1
		else
			IFACE1=egiga1
		fi
		IP1=`ip addr show dev $IFACE1 | sed -e's/^.*inet \([^ ]*\)\/.*$/\1/;t;d'`

		if [ "$PROJECT_FEATURE_LAN_PORT" = "2" ]; then
			IFACE=$IFACE0,$IFACE1
			IP=$IP0,$IP1
		else
			IFACE=$IFACE0
			IP=$IP0
		fi
	fi
}

# Added umask to ensure twonky creates upload directories with proper permissions
umask 01

# Source function library.
if [ -f /etc/rc.status ]; then
  # SUSE
  . /etc/rc.status
  rc_reset
else
  # Reset commands if not available
  rc_status() {
    case "$1" in
	-v)
	    true
	    ;;
	*)
	    false
	    ;;
    esac
    echo
  }
  alias rc_exit=exit
fi


if [ -x "$WORKDIR1" ]; then
WORKDIR="$WORKDIR1"
else
WORKDIR="$WORKDIR2"
fi

DAEMON=twonkystarter
TWONKYSRV="${WORKDIR}/${DAEMON}"
TWONKY_PORT=9000

DBROOT="/mnt/HD/HD_a2/.twonkymedia"
#DBROOT="/mnt/HD_a4/twonkymedia"

MOUNT_POINT1=`mount | grep /mnt/HD/HD_a2 | awk '{print $3}'`
MOUNT_POINT2=`mount | grep /mnt/HD/HD_b2 | awk '{print $3}'`
MOUNT_POINT3=`mount | grep /mnt/HD/HD_c2 | awk '{print $3}'`
MOUNT_POINT4=`mount | grep /mnt/HD/HD_d2 | awk '{print $3}'`
if [ "x$MOUNT_POINT1" == "x/mnt/HD/HD_a2" ]; then
    DBROOT="/mnt/HD/HD_a2/.twonkymedia"
elif [ "x$MOUNT_POINT2" == "x/mnt/HD/HD_b2" ]; then
    DBROOT="/mnt/HD/HD_b2/.twonkymedia"
elif [ "x$MOUNT_POINT3" == "x/mnt/HD/HD_c2" ]; then
    DBROOT="/mnt/HD/HD_c2/.twonkymedia"
elif [ "x$MOUNT_POINT4" == "x/mnt/HD/HD_d2" ]; then
    DBROOT="/mnt/HD/HD_d2/.twonkymedia"
else
	exit
fi

LOGFILE="$DBROOT/twonkymedia-log.txt"

# see if we need to start the twonky proxy service
PROXY_DAEMON=none
if [ "${START_PROXY}" = "1" ]; then
PROXY_DAEMON=twonkyproxy
fi

# see if we need to start the twonky tuner service
TUNER_DAEMON=none
if [ "${START_TUNER}" = "1" ]; then
TUNER_DAEMON=twonkytuner
fi

case "$1" in
  start)
    if [ -e $PIDFILE ]; then
      PID=`cat $PIDFILE`
      echo "Twonky server seems already be running under PID $PID"
      echo "(PID file $PIDFILE already exists). Checking for process..."
#     running=`ps --no-headers -o "%c" -p $PID`
#     if ( [ "${DAEMON}" = "${running}" ] ); then
      running=`ps | grep $PID | grep -v grep | awk '{print $5}'`
#echo start-running=$running
      if ( [ "${TWONKYSRV}" = "${running}" ] ); then
        echo "Process IS running. Not started again."
      else
        echo "Looks like the daemon crashed: the PID does not match the daemon."
        echo "Removing flag file..."
        rm $PIDFILE
        $0 start
        exit $?
      fi
      exit 0
    else
      if [ ! -x "${TWONKYSRV}" ]; then
	  echo "Twonky server not found".
	  rc_status -u
	  exit $?
      fi

      get_iface_and_ip
      # Set iface option.
      if [ -e $DBROOT/twonkyserver.ini ]; then
          IFACE_OPTION=`grep iface= $DBROOT/twonkyserver.ini | grep -v ignoreiface=`

          if [ "x$IFACE_OPTION" == "x" ]; then
              echo "iface=$IFACE" >> $DBROOT/twonkyserver.ini
          else
              sed -i "s/^iface=.*$/iface=$IFACE/" $DBROOT/twonkyserver.ini
          fi
      fi

      start_support_daemon "${TUNER_DAEMON}" "${WORKDIR}"
      echo -n "Starting $TWONKYSRV ... "
      echo -appdata $DBROOT ¡Vlogfile $LOGFILE

      "$TWONKYSRV" -D -ip ${IP} -httpport ${TWONKY_PORT} -appdata $DBROOT -logfile $LOGFILE

      # Wait 10 seconds for twonky to initialize its RPC mechanism, then RPC the contentdir shares to twonky.
		sleep 2 
		itune_tool --twonky_rescan_share 

      # Set Twonky analytics according to current privacy options.
		XML_UPNPAV_ANALYTICS=`xmldbc -g '/app_mgr/upnpavserver/analytics'`
		ACTION=stop
		if [ "$XML_UPNPAV_ANALYTICS" = "1" ]; then
			ACTION=start
		fi
	#-	twonky_analytics.sh ${ACTION}

      # Set iface option.
		#x wget http://127.0.0.1:9000/rpc/set_option?iface=$IFACE -o /dev/null -O /dev/null	#can't be found

      rc_status -v
    fi
    start_support_daemon "${PROXY_DAEMON}" "${WORKDIR}"
  ;;
  stop)
    if [ ! -e $PIDFILE ]; then
      echo "PID file $PIDFILE not found, stopping server anyway..."
      killall -s TERM ${DAEMON}
      rc_status -u
      stop_support_daemon "${PROXY_DAEMON}" 
      stop_support_daemon "${TUNER_DAEMON}" 
      exit 3
    else
      echo -n "Stopping Twonky MediaServer ... "
      PID=`cat $PIDFILE`
      kill -s TERM $PID
      rm -f $PIDFILE
      rc_status -v
      stop_support_daemon "${PROXY_DAEMON}" 
      stop_support_daemon "${TUNER_DAEMON}" 
    fi
  ;;
  reload)
    if [ ! -e $PIDFILE ]; then
      echo "PID file $PIDFILE not found, stopping server anyway..."
      killall -s TERM ${DAEMON}
      rc_status -u
      exit 3
    else
      echo -n "Reloading Twonky server ... "
      PID=`cat $PIDFILE`
      kill -s HUP $PID
      rc_status -v
    fi
  ;;
  restart)
    $0 stop
      sleep 2
    $0 start
  ;;
  status)
    if [ ! -e $PIDFILE ]; then
#     running="`ps --no-headers -o pid -C ${DAEMON}`"
      running=`ps | grep $DAEMON | grep -v grep | awk '{print $5}'`
      if [ "${running}" = "" ]; then
        echo "No Twonky server is running"
        exit 1
      else
        echo "A Twonky server seems to be running with PID ${running}, but no PID file exists."
        echo "Probably no write permission for ${PIDFILE}."
      fi
      status_support_daemon "${PROXY_DAEMON}" 
      status_support_daemon "${TUNER_DAEMON}" 
      exit 0
    fi
    PID=`cat $PIDFILE`
#   running=`ps --no-headers -o "%c" -p $PID`
#   if ( [ "${DAEMON}" = "${running}" ] ); then
    running=`ps | grep $PID | grep -v grep | awk '{print $5}'`
    if ( [ "${TWONKYSRV}" = "${running}" ] ); then
      echo "Twonky server IS running."
    else
      echo "Looks like the daemon crashed: the PID does not match the daemon."
    fi

    if [ "${START_PROXY}" = "1" ]; then
        status_support_daemon "${PROXY_DAEMON}" 
    fi

    if [ "${START_TUNER}" = "1" ]; then
        status_support_daemon "${TUNER_DAEMON}" 
    fi
  ;;
  *)
    echo ""
    echo "Twonky server"
    echo "------------------"
    echo "Syntax:"
    echo "  $0 {start|stop|restart|reload|status}"
    echo ""
    exit 3
  ;;
esac

rc_exit

