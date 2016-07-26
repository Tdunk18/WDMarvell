#!/bin/sh
source /usr/local/modules/files/project_features
dbg_flag=0
PrintHelp()
{
  phy_link_led.sh [0/1]
  exit 0
}

num=$#

if [ "$num" != "1" ]; then
  PrintHelp
fi

#if [ "$PROJECT_FEATURE_LAN_PORT_SWITCH" = "1" ]; then
#  if [ "$1" = "0" ]; then
#    real_lan_port=1
#  elif [ "$1" = "1" ]; then
#    real_lan_port=0
#  fi
#else
  real_lan_port=$1
#fi

LSTATUS=`cat /sys/class/net/egiga${1}/operstate`
LSPEED=`cat /sys/class/net/egiga${1}/speed`

if [ "$LSTATUS" = "down" ]; then
  echo "lan $1 link down"
  exit 0
fi

if [ "$LSPEED" = "10" -o "$LSPEED" = "100" -o "$LSPEED" = "1000" ]; then
  echo "set lan led"
else
  exit 0
fi

if [ "$1" = "0" ]; then
  if [ -e /tmp/egiga0_speed ]; then
     old_lan_speed=`cat /tmp/egiga0_speed`
     echo "old egiga0 lan speed: $old_lan_speed"
     echo "new egiga0 lan speed: $LSPEED"
     if [ $old_lan_speed -eq $LSPEED ]; then
       echo "lan0 led don't change"
       exit 0
     elif [ $old_lan_speed  -ge 100 -a $LSPEED -ge 100 ]; then
       echo "lan 0 led don't change"
       exit 0
     else
       echo $LSPEED > /tmp/egiga0_speed
     fi
   else
     echo $LSPEED > /tmp/egiga0_speed
     echo "new egiga0 lan speed: $LSPEED"
  fi
elif [ "$1" = "1" ]; then
 if [ -e /tmp/egiga1_speed ]; then
     old_lan_speed=`cat /tmp/egiga1_speed`
     echo "old egiga1 lan speed: old_lan_speed"
     echo "new egiga1 lan speed: $LSPEED"
     if [ $old_lan_speed -eq $LSPEED ]; then
       echo "lan1 led don't change"
       exit 0
     elif [ $old_lan_speed  -ge 100 -a $LSPEED -ge 100 ]; then
       echo "lan 1 led don't change"
       exit 0
     else
       echo $LSPEED > /tmp/egiga1_speed
     fi
  else
    echo $LSPEED > /tmp/egiga1_speed
    echo "new egiga1 lan speed: $LSPEED"
  fi
fi

if [ $LSTATUS == "up" ]; then
  touch /tmp/change_lan_speed
  if [ $LSPEED -eq "1000" -o $LSPEED -eq "100" ]; then
    echo "Set lan $real_lan_port phy led 100/1000 mode"
    if [ "$dbg_flag" = "1" ]; then
      echo "mem_rw -w -t 2 -p $real_lan_port -o 22 -v 3 > /dev/null"
      echo "mem_rw -w -t 2 -p $real_lan_port -o 16 -v 0x1177 > /dev/null"
      echo "mem_rw -w -t 2 -p $real_lan_port -o 22 -v 0 > /dev/null"
    fi
    mem_rw -w -t 2 -p $real_lan_port -o 22 -v 3 > /dev/null
    usleep 100000
    mem_rw -w -t 2 -p $real_lan_port -o 16 -v 0x1177 > /dev/null
    usleep 100000
    mem_rw -w -t 2 -p $real_lan_port -o 22 -v 0 > /dev/null
    usleep 100000
    mem_rw -r -t 2 -p $real_lan_port -o 19 > /dev/null
  elif [ $LSPEED -eq "10" ]; then
    echo "Set lan $real_lan_port phy led 10 mode"
    if [ "$dbg_flag" = "1" ]; then
      echo "mem_rw -w -t 2 -p $real_lan_port -o 22 -v 3 > /dev/null"
      echo "mem_rw -w -t 2 -p $real_lan_port -o 16 -v 0x1117 > /dev/null"
      echo "mem_rw -w -t 2 -p $real_lan_port -o 22 -v 0 > /dev/null"
    fi
    mem_rw -w -t 2 -p $real_lan_port -o 22 -v 3 > /dev/null
    usleep 100000
    mem_rw -w -t 2 -p $real_lan_port -o 16 -v 0x1117 > /dev/null
    usleep 100000
    mem_rw -w -t 2 -p $real_lan_port -o 22 -v 0 > /dev/null
    usleep 100000
    mem_rw -r -t 2 -p $real_lan_port -o 19 > /dev/null
  fi
  rm /tmp/change_lan_speed
fi
