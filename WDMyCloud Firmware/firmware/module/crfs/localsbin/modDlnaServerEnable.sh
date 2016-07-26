#!/bin/bash
#
# (c) 2014 Western Digital Technologies, Inc. All rights reserved.
#
# modMediaServerEnable.sh <mac_address> <enable/disable>
#
#

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

if [ $# != 2 ]; then
        echo "usage: modDlnaServerEnable.sh <mac_address> <enable/disable>"
        exit 1
fi

# Twonky 7.2 deprecates the client_enable and client_disable APIs and adds a client_change API.
# The client_change API needs a gateway-MAC-address and a unique index to uniquely identify a connacted client.
# So we convert from a mac address (which is what's given to us) to a key constituting a gateway-mac::index.

mac_addr=$1

# To extract the gateway-mac::index, print the two lines before the matching line (w/mac addr), then print the first line.
gateway_mac_and_index=`grep -B 2 $mac_addr /tmp/info_connected_clients | head -1`

enable=$2

TWONKY_IP="127.0.0.1:9000"

case ${enable} in
enable)
        # Wait up to 5 seconds to enable Twonky connected client.
        curl -m 5 "http://${TWONKY_IP}/rpc/client_change?key=${gateway_mac_and_index}&enabled=1" > /tmp/info_client_change 2>/dev/null
        curl_exit_code=`echo $?`
        if [ $curl_exit_code != 0 ]; then
                logger -p local5.err "modMediaServerEnable.sh: Could not enable connected client ${gateway_mac_and_index}, curl failure $curl_exit_code."
                exit 1
        fi

        validate=`head -n 6 /tmp/info_client_change | tail -n 1` #pick up the ENABLED field from the response and validate it
        if [ "$validate" != "1" ]
        then
            exit 1
        fi
        ;;
disable)
        # Wait up to 5 seconds to disable Twonky connected client.
        curl -m 5 "http://${TWONKY_IP}/rpc/client_change?key=${gateway_mac_and_index}&enabled=0" > /tmp/info_client_change 2>/dev/null
        curl_exit_code=`echo $?`
        if [ $curl_exit_code != 0 ]; then
                logger -p local5.err "modMediaServerEnable.sh: Could not disable connected client ${gateway_mac_and_index}, curl failure $curl_exit_code."
                exit 1
        fi

        validate=`head -n 6 /tmp/info_client_change | tail -n 1`
        if [ "$validate" != "0" ]
        then
            exit 1
        fi
        ;;
*)
        echo "usage: modDlnaServerEnable.sh <mac_address> <enable/disable>"
        exit 1
esac
exit 0
		