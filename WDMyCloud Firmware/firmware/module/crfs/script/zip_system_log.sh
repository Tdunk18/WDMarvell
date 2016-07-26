#BOARD_SERIAL=`cat /tmp/wd_serial.txt | head -n 1`
#TIMESEC=` date +%s`
#ZIP_ROOT_FOLDER=system_log_${BOARD_SERIAL}_${TIMESEC}
#ZIP_FILE=/tmp/abc.zip

[ "$#" -eq "1" ] || exit 1

ZIP_ROOT_FOLDER=$1
ZIP_FILE=/tmp/$1.zip
TR_WD2GO_FILE="/tmp/traceroute-wd2go.com.txt"
TR_WDC_FILE="/tmp/traceroute-wdc.com.txt"
VER_INFO_FILE="/etc/version_info"

cd /tmp
rm -r ${ZIP_ROOT_FOLDER}
rm -f ${ZIP_FILE}

mkdir ${ZIP_ROOT_FOLDER}
[ "$?" -eq "0" ] || exit 1

cd ${ZIP_ROOT_FOLDER}


mkdir current_config
mkdir current_status
mkdir log
cp /tmp/wd_serial.txt .
echo -n "date: " > timestamp_info.txt
date >> timestamp_info.txt
echo -n "sec: ">> timestamp_info.txt
date +%s >> timestamp_info.txt
cp ${VER_INFO_FILE} .


#current_status
cd current_status
(config_set -b ; cp /tmp/backup.tgz ./backup)
#traceroute -w1 -m 20 www.wd2go.com > traceroute-wd2go.com.txt
#traceroute -w1 -m 20 www.wdc.com > traceroute-wdc.com.txt
cp -f ${TR_WD2GO_FILE} ${TR_WDC_FILE} .
df -hi > df_hi_output
df > df_output
free > free_output
ifconfig > ifconfig_output
mount > mount_output
ps -aux > process_list
#MyCloudEX2.conf  [dump system config info to a file, this can be the existing user save-able config]
#config_set -b ; cp /tmp/backup.tgz .
cat /proc/mdstat > proc_mdstat.txt
cat /var/spool/cron/crontabs/root > cron_item.txt
cat /proc/partitions > proc_partitions.txt
/usr/bin/top -n1 > top_info.txt


#current_config
cd ../current_config
cp /CacheVolume . -a
cp /etc . -rL
ls /shares > shares
#rsyncom -l > shares
#tar cvf - /usr/local/nas/orion | tar xvf - -C .
mkdir -p usr/local/nas/orion
cp /usr/local/nas/orion/* usr/local/nas/orion
mkdir -p var/www/rest-api/config
cp /var/www/rest-api/config/* var/www/rest-api/config/ -rL
mkdir -p var/www/xml
cp /var/www/xml/*  var/www/xml
(cd var/www/xml; rm -f sms_conf.xml lang.xml english.xml )

#log
cd ../log
mkdir -p var/log
smart_report -a -d >/dev/null
getinfo drive>/dev/null
cp /var/log/* var/log -rL
dmesg > dmesg
mkdir -p mnt/HD_a4/twonkymedia/
cp /mnt/HD_a4/twonkymedia/twonkymedia-log.txt mnt/HD_a4/twonkymedia/
cp  /home/root/.ash_history ./.ash_history
cp  /usr/local/config/hd_list.xml .

#kill backgroup process_list
#killall traceroute

rm_log_account_info.sh /tmp/${ZIP_ROOT_FOLDER}

#zip file
cd /tmp
zip -rq ${ZIP_FILE} ${ZIP_ROOT_FOLDER}
rm -rf ${ZIP_ROOT_FOLDER}




