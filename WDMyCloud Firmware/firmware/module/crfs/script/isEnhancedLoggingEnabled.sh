EXTLOG=`xmldbc -g '/system_mgr/extended_log/enable'`
if [ "$EXTLOG" = "1" ]; then
	exit 1
else
	exit 0
fi
#if [ "$EXTLOG" != "1" ]; then
#	EXTLOG=0
#fi
#echo $EXTLOG
