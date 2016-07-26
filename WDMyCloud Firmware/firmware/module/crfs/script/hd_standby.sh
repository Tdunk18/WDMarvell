#!/bin/sh
help_message()
{
  echo "hd_standby.sh now"
  echo "hd_standby.sh 2-10"
}

num=$#
if [ $num != 1 ]; then
  help_message
fi

if [ "$1" = "now" ]; then
  xmldbc -i -s /runtime/set_pwm standy
elif [ $1 -ge 2 ] && [ $1 -le 10 ]; then
  pwm_ctl=$(xmldbc -g "/system_mgr/power_management/hdd_hibernation_enable")
  if [ "$pwm_ctl" = "1" ]; then
  	echo "set hd sleep time $1"
    killall set_pwm
    xmldbc -s "/system_mgr/power_management/turn_off_time" $1
    xmldbc -D /etc/NAS_CFG/config.xml
    access_mtd "cp /etc/NAS_CFG/config.xml /usr/local/config/"
    set_pwm&
  fi
else
  help_message
fi

