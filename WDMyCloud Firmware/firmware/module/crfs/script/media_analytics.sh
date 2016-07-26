#!/bin/sh

TWONKY_STATUS=`xmldbc -g '/app_mgr/upnpavserver/enable'`
if [ "$TWONKY_STATUS" = "0" ]; then
	echo twonky was disabled!
	exit
fi

# Number of media players
wget http://127.0.0.1:9000/rpc/info_connected_clients -o /dev/null -O /tmp/info_connected_clients.txt
LINE_COUNT=`cat /tmp/info_connected_clients.txt | wc -l`
#echo LINE_COUNT=$LINE_COUNT

count=0
index=1
line=1
while [ "$index" -le "$LINE_COUNT" ];
do
#echo index=$index---------
	CONTENT=`cat /tmp/info_connected_clients.txt | awk NR==$index`
	if [ "$line" == "5" ]; then
		LINE5=$CONTENT		# IS_AGGREGATION_SERVER
#		echo LINE5=$LINE5
	fi
	if [ "$line" == "7" ]; then
		LINE7=$CONTENT		# DEVICE_TYPE
#		echo LINE7=$LINE7
	fi
	if [ "$CONTENT" == "##########" ]; then
		line=0

		if [ "$LINE5" == "0" -a "$LINE7" != "Twonky NMC" ]; then
			count=`expr $count + 1`
#echo Count=$count
		fi
	fi

	line=`expr $line + 1`
	index=`expr $index + 1`
done
echo media players=$count
ganalytics --media-player-num $count


# Time spent streaming - Not Support
#


# Number of Videos
# Number of Photos
# Number of Music
wget http://127.0.0.1:9000/rpc/info_status -o /dev/null -O /tmp/info_status.txt
count=`grep videos /tmp/info_status.txt | awk '{FS="|"} {print $2}'`
echo videos=$count
ganalytics --video-num $count

count=`grep pictures /tmp/info_status.txt | awk '{FS="|"} {print $2}'`
echo pictures=$count
ganalytics --photo-num $count

count=`grep musictracks /tmp/info_status.txt | awk '{FS="|"} {print $2}'`
echo musictracks=$count
ganalytics --music-num $count
