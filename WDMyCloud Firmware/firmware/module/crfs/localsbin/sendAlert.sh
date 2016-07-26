#!/bin/sh
#
# ?2010 Western Digital Technologies, Inc. All rights reserved.
#
# sendAlert.sh <alert code> 
#
# Note: alert codes /etc/alert-param.sh
#
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#. /etc/nas/alert-param.sh

if [ $# -lt 1 ]; then
    echo "Usage: sendAlert.sh <alert_code> [<value1> [<value2>] ]"
    exit
fi

alert_code=$1
alert_param=`echo $* | awk '
BEGIN{
	FS=" "
	ORS=""
}
{
	x=2
	while ( x<NF ) {
		print $x","
		x++
	}
	if (NF>=2){
		print $NF
	}
}'`

if [ -z $alert_param ]; then
	fireAlert -a $alert_code -f
else
	fireAlert -a $alert_code -p "$alert_param" -f
fi

exit 0