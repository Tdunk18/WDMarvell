#!/bin/sh

source /usr/local/modules/files/project_features


if [ "$PROJECT_FEATURE_LAN_PORT" = "1" ]; then
  mtu1_enable=$(xmldbc -g "/network_mgr/lan0/jumbo_enable")
  if [ "$mtu1_enable" = "1" ]; then
    mtu1=$(xmldbc -g "/network_mgr/lan0/jumbo_mtu")
    ifconfig egiga0 mtu $mtu1
  else
    ifconfig egiga0 mtu 1500
  fi
elif [ "$PROJECT_FEATURE_LAN_PORT" = "2" ]; then
  BOND_ENABLE=$(xmldbc -g "/network_mgr/bonding/enable")
  if [ "$BOND_ENABLE" == "1" ]; then
    mtu1_enable=$(xmldbc -g "/network_mgr/lan0/jumbo_enable")
    if [ "$mtu1_enable" = "1" ]; then
      mtu1=$(xmldbc -g "/network_mgr/lan0/jumbo_mtu")
      ifconfig bond0 mtu $mtu1
    else
      ifconfig bond0 mtu 1500
    fi
  else
    mtu1_enable=$(xmldbc -g "/network_mgr/lan0/jumbo_enable")
    if [ "$mtu1_enable" = "1" ]; then
      mtu1=$(xmldbc -g "/network_mgr/lan0/jumbo_mtu")
      ifconfig egiga0 mtu $mtu1
    else
      ifconfig egiga0 mtu 1500
    fi
    
    mtu2_enable=$(xmldbc -g "/network_mgr/lan1/jumbo_enable")
    if [ "$mtu1_enable" = "1" ]; then
      mtu2=$(xmldbc -g "/network_mgr/lan1/jumbo_mtu")
      ifconfig egiga1 mtu $mtu2
    else
      ifconfig egiga1 mtu 1500
    fi
  fi
fi
