#!/bin/sh

mkdir /tmp/recover

model=`cat /usr/local/modules/files/model`
case ${model} in
    #one bay
	  WDMyCloud)
      #Glacier
      echo "WDMyCloud"
      ;;
      
    #two bay
    WDMyCloudEX2)
      #KC/Zion
      echo "WDMyCloudEX2"
      ;;
      
    WDMyCloudDL2100)
      #Aurora
      echo "WDMyCloudDL2100"
      killall crond
      grep -v "mtd_check -b" /var/spool/cron/crontabs/root > /tmp/crond_root
      cp -avf /tmp/crond_root /var/spool/cron/crontabs/root
      crond &
      ;;

    WDMyCloudEX2100)
      #Yosemite
      echo "WDMyCloudEX2100"
      ;;
    
    MyCloudEX2Ultra)
      #RP/GT
      echo "MyCloudEX2Ultra"
      ;;
    
    MyCloudPR2100)
      #BryceCanyon
      echo "MyCloudPR2100"
      ;;
        
    #four bay
    WDMyCloudEX4)
      #LT4A
      echo "WDMyCloudEX4"
      ;;
      
    WDMyCloudEX4100)
      #Yellowstone
      echo "WDMyCloudEX4100"
      ;;

    WDMyCloudDL4100)
      #Sprite
      echo "WDMyCloudDL4100"
      killall crond
      grep -v "mtd_check -b" /var/spool/cron/crontabs/root > /tmp/crond_root
      cp -avf /tmp/crond_root /var/spool/cron/crontabs/root
      crond &
      ;;
    
    MyCloudPR4100)
      #BlackCanyon
      echo "MyCloudPR4100"
      ;;
esac

######################
#       common       #
######################
smbcmd -b 0

# [+] Rotate All logs
[ -f /etc/init.d/atop ] && /etc/init.d/atop rotate

#rotate Apache log
APACHE_LOG1=/var/log/apache2/access.log
APACHE_LOG2=/var/log/apache2/access.log.1
[ -f ${APACHE_LOG2} ] && rm -f ${APACHE_LOG2}
mv -f ${APACHE_LOG1} ${APACHE_LOG2}

# Restart apache
/usr/local/modules/script/apache restart web
[ -f /usr/local/sbin/rotateApache.sh ] && /usr/local/sbin/rotateApache.sh "rotate" ${APACHE_LOG2}

if [ -f /var/log/mycloud.log ] ; then
	mv /var/log/mycloud.log /var/log/mycloud.log.tmp >/dev/null 2>&1
	rt_script.sh /var/log/mycloud.log 800
fi
# [-] rotate All logs
