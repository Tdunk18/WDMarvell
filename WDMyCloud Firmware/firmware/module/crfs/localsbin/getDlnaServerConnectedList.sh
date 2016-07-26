#!/bin/bash
#
# (c) 2013 Western Digital Technologies, Inc. All rights reserved.
#
# getDlnaServerConnectedList.sh
#
# RETURNS:
# List of media players'
#   "mac_address" "ip_address" "friendly_name" "device_description" "enabled/disabled for streaming"
# Returns a list of attributes for players ONLY; servers have been filtered out.

# Twonky version 7.3 gets 13 attribute values returned for each Media Device, listed in the order below.
# The script has been adjusted from Twonky 5 to accomodate the new ordering.
#    Key (#1)
#    ID (#2)
#    MAC (#3)
#    IP (#4)
#    IS_AGGREGATION_SERVER (#5) 
#    ENABLED (#6)
#    DEVICE_TYPE (#7)
#    ICON (#8)
#    ICON_MIME_TYPE (#9) 
#    VIEW_NAME (#10)
#    HAS_DEFAUT_VIEW (#11) 
#    USER_FRIENDLY_NAME (#12)
#    CLIENT_TYPE (#13) Valid values are 0, 1, 2 or 8.
#    ########## (delimiter)
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

# Get info_clients option from Twonky.
# Returns a *complete* list of known/supported clients as a tuple: ID, description.
if [ ! -f /tmp/info_clients ]; then
	# Wait up to 5 seconds to get all supported Twonky clients.
	curl -m 5 "http://127.0.0.1:9000/rpc/info_clients" > /tmp/info_clients 2>/dev/null
	curl_exit_code=`echo $?`
	if [ $curl_exit_code != 0 ]; then
		logger -p local5.err "cmdDlnaServer.sh: Failure $curl_exit_code getting Twonky info clients."
		exit 1
	fi
fi

# Wait up to 5 seconds to get clients who have connected to Twonky.
curl -m 5 "http://127.0.0.1:9000/rpc/info_connected_clients" > /tmp/info_connected_clients 2>/dev/null
curl_exit_code=`echo $?`
if [ $curl_exit_code != 0 ]; then
	logger -p local5.err "cmdDlnaServer.sh: Failure $curl_exit_code getting Twonky info connected clients."
	exit 1
fi

awk '
BEGIN { 
	FS = "\n"; RS = "##########\n";
	getline info < "/tmp/info_clients"
	split(info, info_arr, ",")
	for ( item in info_arr ) info_count++;
}
{
	id = $1;
	mac = $3;
	ip = $4;
	is_aggregation_server = $5;
	if ( $6 == 1 )
		enable = "enable";
	else
		enable = "disable";

	device_type = $7;
	friendly_name = $12;
	for (i = 1; i <= info_count; i=i+2) {
		if (info_arr[i] == id) {
			desc = info_arr[i+1];
			break;
		}
	}

	# Ignore aggregation servers.
	if ( is_aggregation_server != 1 ) {

		# Ignore Twonky NMC Queue Handler servers. A version of the Twonky
		# Media Server later than 7.3.1-11 will make this check unnecessary.
		if ( device_type != "Twonky NMC" ) {
			printf("\"%s\" \"%s\" \"%s\" \"%s\" \"%s\"\n", mac, ip, friendly_name, desc, enable);
		}
	}
}

' /tmp/info_connected_clients
