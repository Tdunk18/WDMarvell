#!/bin/sh

#rebuild new authentication file
echo "Make new ssl Certificate when change IP"
echo "Usage: make_auth.sh $Location $Company $Duration"
echo "Location is US, TW, or abbreviation for other country "

if [ $# -gt 0 ]; then
#	if [ $1 != "0" -a $1 != "1" ]; then
#		echo "Please enter interface index, 0 for egiga0, 1 for egiga1"
#		exit
#	elif [ $1 == "0" ]; then
		LAN=lan0
		PEM="/etc/server_v4_egiga0.pem"
		echo "Interface egiga0 PEM=$PEM"
#	elif [ $1 == "1" ]; then
#		LAN=lan1
#		PEM="/etc/server_v4_egiga1.pem"
#		echo "Interface egiga1 PEM=$PEM"
#	fi

	if [ $1 != "" ]; then
		LOCATION=$2
	else
		LOCATION=`xmldbc -g '/network_mgr/location'`
	fi
	
	if [ $2 != "" ]; then
		COMPANY=$3
	else
		COMPANY=`xmldbc -g '/network_mgr/company'`
	fi
	
	if [ $3 != "" ]; then
		DURATION=$4
	else
		DURATION=365
	fi

	IFIP=$(xmldbc -g "/network_mgr/$LAN/ip")
	echo  "IP: $IFIP, LOCATION: $LOCATION, COMPANY: $COMPANY"
	openssl req -new -x509 -subj "/C=$LOCATION/ST=$COMPANY/L=$LOCATION/O=$COMPANY/CN=$IFIP" -newkey rsa:1024 -keyout $PEM -out $PEM -days $DURATION -nodes
	cp $PEM /usr/local/config/
else
	echo "Please enter make_auth.sh"
fi

#Alpha.tim.20101206
#mv /etc/server.pem.NEW /etc/server.pem

echo "Certificate is done"
