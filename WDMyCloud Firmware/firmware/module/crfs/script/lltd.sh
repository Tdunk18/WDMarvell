#!/bin/sh

if [ $# -gt 0 ]; then
	source /usr/local/modules/files/project_features
	
	# get ethernet interface number
	PHY_LAN_NUMBER=$PROJECT_FEATURE_LAN_PORT
	echo "PHY_LAN_NUMBER=$PHY_LAN_NUMBER"
	
	# get bonding status, 1: bonding
	BOND_ENABLE=$(xmldbc -g "/network_mgr/bonding/enable")
	echo "BOND_ENABLE=$BOND_ENABLE"
	
	# get vlan status
	VLAN0_ENABLE=$(xmldbc -g "/network_mgr/lan0/vlan_enable")
	VLAN1_ENABLE=$(xmldbc -g "/network_mgr/lan1/vlan_enable")
	echo "VLAN0_ENABLE=$VLAN0_ENABLE"
	echo "VLAN1_ENABLE=$VLAN1_ENABLE"
	
	# Bonding
	if [ "$BOND_ENABLE" == "1" ]; then
		if [ "$VLAN0_ENABLE" == "1" ]; then
			#echo "**BONDING AND VLAN BOTH ENABLE****"
			VID=$(xmldbc -g "/network_mgr/lan0/vlan_id")
			LLTDIF0="bond0".${VID}
		else
			LLTDIF0="bond0"
		fi
	fi
	
	# Not Bonding
	if [ "$BOND_ENABLE" == "0" ] || [ "$BOND_ENABLE" == "" ]; then
		if [ $VLAN0_ENABLE == "1" ]; then
			echo "**LLTD UNDER VLAN0 ENABLE****"
			VID=$(xmldbc -g "/network_mgr/lan0/vlan_id")
			LLTDIF0="egiga0".${VID}
		else
			LLTDIF0="egiga0"
		fi
		
		if [ $VLAN1_ENABLE == "1" ]; then
			echo "**LLTD UNDER VLAN1 ENABLE****"
			VID=$(xmldbc -g "/network_mgr/lan1/vlan_id")
			LLTDIF1="egiga1".${VID}
		else
			LLTDIF1="egiga1"
		fi
	fi
	
	
	LLTD_ENABLE=$(xmldbc -g '/network_mgr/lltd/enable')
	
	if [ $1 == "start" -a "$LLTD_ENABLE" == "1" ]; then
		echo "**LLTD START**"
		echo "LLTDIF0=$LLTDIF0"
		lld2d $LLTDIF0
		if [ $PHY_LAN_NUMBER == "2" -a "$BOND_ENABLE" == "0" ]; then
			echo "LLTDIF1=$LLTDIF1"
			lld2d $LLTDIF1
		fi
	elif [ $1 == "restart" -a "$LLTD_ENABLE" == "1" ]; then
		echo "**LLTD RESTART, IF=$LLTDIF****"
		killall lld2d
		sleep 1
		lltd.sh start
	elif [ $1 == "stop" ]; then
		echo "**LLTD DISABLE****"
		killall lld2d
	fi
	
else
	echo "Usage {stop|start|restart}"
fi