#!/bin/sh

num=$#

if [ $num -ne 1 ]; then
  echo "Usage drive_sleep.sh on/off"
fi

if [ "${1}" = "on" ]; then
  rm /tmp/drive_sleep_off
	killall set_pwm > /dev/null
	sleep 1
	set_pwm& > /dev/null
elif [ "${1}" = "off" ]; then
  set_pwm -e 0 -t 0
  touch /tmp/drive_sleep_off
else
  echo "Usage drive_sleep.sh on/off"
fi
