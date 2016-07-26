#!/bin/sh
source /usr/local/modules/files/project_features

if [ ! -e /tmp/system_ready ]; then
  exit 0
fi

if [ -e /tmp/sata_power_control_event ]; then
  exit 0
fi
touch /tmp/sata_power_control_event

if [ "$1" = "disable" ]; then
  if [ "$PROJECT_FEATURE_BAYS" = "2" ]; then
    sata_pwr_ctl -n 1 -p 0
    sata_pwr_ctl -n 2 -p 0
  elif [ "$PROJECT_FEATURE_BAYS" = "4" ]; then
    sata_pwr_ctl -n 1 -p 0
    sata_pwr_ctl -n 2 -p 0
    sata_pwr_ctl -n 3 -p 0
    sata_pwr_ctl -n 4 -p 0
  fi
elif [ "$1" = "enable" ]; then
  if [ "$PROJECT_FEATURE_BAYS" = "2" ]; then
    sata_pwr_ctl -n 1 -p 1
    sata_pwr_ctl -n 2 -p 1
  elif [ "$PROJECT_FEATURE_BAYS" = "4" ]; then
    sata_pwr_ctl -n 1 -p 1
    sata_pwr_ctl -n 2 -p 1
    sleep 10
    sata_pwr_ctl -n 3 -p 1
    sata_pwr_ctl -n 4 -p 1
  fi
fi

rm /tmp/sata_power_control_event