#!/bin/bash
maxSleepCount=3

# This is a script to update the NAS's list of relay servers. The central
# server maintains this list. There are four possible domains in which the
# central server can be found.
#   1. www.wd2go.com production central server.
#   2. apia.wd2go.com japan production central server.
#   3. beta*.wd2go.com beta central server.
#   4. stage*.*.com a staging central server.

centralServerUrl=`php -f /var/www/rest-api/api/Remote/src/Remote/Cli/get_server_base_url.php`
php_exit_code=$?

# Check if central server URL is not configured. This is not expected.
if [ $php_exit_code -ne 0 ]; then
    centralServerUrl="http://www.wd2go.com"
    logger -p local0.err "updateremote.sh: Failure, production central server url not defined. Therefore using $centralServerUrl."
fi

# Get relay servers and other openvpn configuration settings from central server.
serverUp=0    # 0 is equivalent to false boolean flag
sleepCount=0  # sleep counter in seconds

# Retry if central server does not respond.
while [[ $serverUp -eq 0 && $sleepCount -lt $maxSleepCount ]]
do
    # Wait up to 5 seconds for central server to receive the curl request.
    `curl -4 -m 5 $centralServerUrl/api/1.0/rest/relay_server?format=openvpn -o /tmp/relayServers >/dev/null 2>/dev/null`
    curl_exit_code=$?

    # Check for curl exit error, which means central server may not have receive the curl request.
    if [ $curl_exit_code -ne 0 ]; then
        logger -p local0.err "updateremote.sh: curl exit code ${curl_exit_code}, sleep count $sleepCount, while trying to get relay servers from central server url $centralServerUrl."
        exit 1
    fi

    # Check if central server did not respond.
    if [ -s /tmp/relayServers ]; then
        serverUp=1  # set boolean flag to true and exit the loop.
    else
        logger -p local0.err "updateremote.sh: empty curl response, exit code ${curl_exit_code} and sleep count $sleepCount, from central server $centralServerUrl."
        sleep 1  # sleep 1 second.
        sleepCount=`expr $sleepCount + 1`  # increment sleep count 1 second
    fi
done

# Check if timed out waiting for central server to respond.
if [ $sleepCount -eq $maxSleepCount ];
then
    logger -p local0.err "updateremote.sh: $sleepCount seconds timeout waiting for central server url $centralServerUrl to become operational."
    exit 2   # So this error can be distinguished from the curl exit error
fi

# Paste central server supplied configuration settings into open vpn client initialization settings.
SRV=`cat /tmp/relayServers`
sed -e "s/remote host port/$SRV/g" client.ovpn.tpl > /usr/local/orion/openvpnclient/client.ovpn
logger -p local0.info "updateremote.sh: got relay servers from central server url $centralServerUrl."
rm /tmp/relayServers
