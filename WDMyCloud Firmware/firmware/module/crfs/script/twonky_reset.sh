#!/bin/sh
STATUS=`twonky.sh status | awk '{print $3}'`
#	echo STATUS=$STATUS

twonky.sh stop
sleep 2
#rm /mnt/HD_a4/twonkymedia/twonkyserver.ini
rm -rf /mnt/HD_a4/twonkymedia/ 2> /dev/null
rm /mnt/HD/HD_a2/.twonkymedia/twonkyserver.ini
twonky.sh start
sleep 5
wget http://127.0.0.1:9000/rpc/reset -o /dev/null -O /dev/null
wget http://127.0.0.1:9000/rpc/log_clear -o /dev/null -O /dev/null
#wget http://127.0.0.1:9000/rpc/set_option?"contentdir=%2BA|/Public" -o /dev/null -O /dev/null
#wget http://127.0.0.1:9000/rpc/set_option?"contentdir=%2BA|/SmartWare" -o /dev/null -O /dev/null
#wget http://127.0.0.1:9000/rpc/set_option?"contentdir=%2BA|/TimeMachineBackup" -o /dev/null -O /dev/null
if [ "x$STATUS" != "xIS" ]; then
	sleep 2
	twonky.sh stop
fi
