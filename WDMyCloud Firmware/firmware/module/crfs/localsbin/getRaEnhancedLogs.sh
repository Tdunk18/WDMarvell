#!/bin/bash
#
# Script for collecting "Enhanced Logs" for remote access analysis,
# in addition to those already collected on the WD WebUI support page.
# This script just collects information, settings are NOT changed.
#
# This script is expected to be used when a remote access issue can be
# reproduced between executions of this script. Therefore the execution
# of this script shall in no way interfere with the reproduction of the
# issue.
#
function log_cmd()
{
	# Output script progress to stdout.
	echo $1
	
	# Log remote access related data description.
	echo $1 &>> $3
	
	# Log remote access related command output.
	$2 &>> $3
	
	# Log a blank line for space.
	echo "" &>> $3
}

# Check if no log filename specified.
if [ $# -eq 0 ]; then
	log_file="/CacheVolume/getRaEnhancedLogs.out"
else
	log_file="$1"
fi 

log_cmd "-------------- Log collection date and time ----------------" "date" $log_file

log_cmd "-------------- comm mgr process status --------------" "/usr/local/orion/communicationmanager/communicationmanagerd status" $log_file

log_cmd "-------------- process status info --------------" "ps -elf" $log_file

log_cmd "-------------- heap memory info --------------" "cat /proc/`pidof communicationmanager`/status" $log_file

log_cmd "-------------- openvpnpid.out timestamp --------------" "ls -l /tmp/openvpnpid.out" $log_file

log_cmd "-------------- openvpnpid.out contents --------------" "cat /tmp/openvpnpid.out" $log_file

log_cmd "-------------- auth.txt --------------" "cat /usr/local/orion/openvpnclient/auth.txt" $log_file

log_cmd "-------------- ca.crt --------------" "cat /usr/local/orion/openvpnclient/ca.crt" $log_file

log_cmd "-------------- client.ovpn --------------" "cat /usr/local/orion/openvpnclient/client.ovpn" $log_file

log_cmd "-------------- minutes since disk access --------------" "cat /tmp/minutes_since_disk_access" $log_file

log_cmd "-------------- DNS servers --------------" "cat /etc/resolv.conf" $log_file

log_cmd "-------------- remote access status --------------" "curl --connect-timeout 30 -v http://wd2go.com/api/1.0/rest/remote_access_status" $log_file

log_cmd "-------------- central server provided openvpn client config --------------" "curl --connect-timeout 30 -v http://wd2go.com/api/1.0/rest/relay_server" $log_file
# Extra space needed after this curl call.
echo "" &>>  $log_file

log_cmd "-------------- system information --------------" "curl --connect-timeout 30 -v http://127.0.0.1/api/2.1/rest/system_information" $log_file
# Extra space needed after this curl call.
echo "" &>>  $log_file

echo "log file located at $log_file"
