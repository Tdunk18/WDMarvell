#!/bin/sh
#O/P: XML_FILE=/var/www/xml/rebuild_status.xml

STATUS_FILE=/tmp/info_status.txt
SAVED_DBFILE=/tmp/db.info_bak
getDBfolder()
{
	wget http://localhost:9000/rpc/info_status -o /dev/null -O $STATUS_FILE

	DBROOT=`cat $STATUS_FILE | grep "^configlocation|" | awk '{FS="|"} {print $2}' | sed -e 's/twonkymedia.*$/twonkymedia/' `
#		echo "  DBROOT=$DBROOT"
	DBFILE="$DBROOT/db.info_bak"
#		echo "  DBFILE=$DBFILE"

	# for aborting and getting again
	MUSICTRACKS=`cat $DBFILE | grep "^m:" | awk '{FS=":"} {print $2}'`
#		echo "  MUSICTRACKS=$MUSICTRACKS"
	if [ "x$MUSICTRACKS" == "x" ]; then
		cp	$SAVED_DBFILE $DBFILE
	else
		cp	$DBFILE       $SAVED_DBFILE 
	fi
}

# get total count of media (previous)
getTotalCount()
{
	wget http://localhost:9000/rpc/info_status -o /dev/null -O $STATUS_FILE

	MUSICTRACKS=`cat $DBFILE | grep "^m:" | awk '{FS=":"} {print $2}'`
	PICTURES=`cat $DBFILE | grep "^p:" | awk '{FS=":"} {print $2}'`
	VIDEOS=`cat $DBFILE | grep "^v:" | awk '{FS=":"} {print $2}'`
	TOTAL=`expr $MUSICTRACKS + $PICTURES + $VIDEOS`
#		echo "  TOTAL=$TOTAL"
}

get_status_rebuild()
{
	wget http://localhost:9000/rpc/info_status -o /dev/null -O $STATUS_FILE

	MUSICTRACKS=`cat $STATUS_FILE | grep "^musictracks|" | awk '{FS="|"} {print $2}'`
	PICTURES=`cat $STATUS_FILE | grep "^pictures|" | awk '{FS="|"} {print $2}'`
	VIDEOS=`cat $STATUS_FILE | grep "^videos|" | awk '{FS="|"} {print $2}'`
	COUNT=`expr $MUSICTRACKS + $PICTURES + $VIDEOS`
#		echo "  COUNT=$COUNT"
	PERCENTAGE=`expr $COUNT \* 100 / $TOTAL`
#		echo "  PERCENTAGE=$PERCENTAGE"
	STATUS=`cat $STATUS_FILE | grep "^dbupdate|" | awk '{FS="|"} {print $2}' | sed -e 's/Progress.*$/Progress/' `
#		echo "  STATUS=$STATUS"
	VERSION=`cat $STATUS_FILE | grep "^version|" | awk '{FS="|"} {print $2}'`
#		echo "  VERSION=$VERSION"
}

XML_FILE=/var/www/xml/rebuild_status.xml
XML_TMP_FILE=/tmp/rebuild_status.xml
make_xml_file()
{
	echo \<?xml version=\"1.0\" encoding=\"UTF-8\"?\> > $XML_TMP_FILE
	echo \<config\>                               >> $XML_TMP_FILE
	echo \<musictracks\>$MUSICTRACKS\</musictracks\>    >> $XML_TMP_FILE
	echo \<pictures\>$PICTURES\</pictures\>       >> $XML_TMP_FILE
	echo \<videos\>$VIDEOS\</videos\>             >> $XML_TMP_FILE
	echo \<percentage\>$PERCENTAGE\</percentage\> >> $XML_TMP_FILE
	echo \<status\>$STATUS\</status\>             >> $XML_TMP_FILE
	echo \<finished\>$FINISHED\</finished\>       >> $XML_TMP_FILE
	echo \<version\>$VERSION\</version\>          >> $XML_TMP_FILE
	echo \</config\>                              >> $XML_TMP_FILE

	mv $XML_TMP_FILE $XML_FILE
}

#starting
getDBfolder

wget http://localhost:9000/rpc/rebuild -o /dev/null -O /tmp/rebuild.txt
sleep 1

rm $XML_FILE
getTotalCount

STATUS=""
FINISHED=0
while [ 1 ];
do
	get_status_rebuild
	if [ "$STATUS" != "In Progress" -a "x$STATUS" != "x" ]; then
		FINISHED=1
		break
	fi

	make_xml_file
#		cat $XML_FILE | grep percentage
	sleep 1
done

make_xml_file
#		cat $XML_FILE
