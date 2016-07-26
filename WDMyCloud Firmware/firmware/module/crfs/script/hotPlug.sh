#!/bin/sh

# exit if iSCSI block device. in kernel, iSCSI block device start since /dev/sdaa
LEN=`expr length "${DEVNAME}"`
[ $LEN -eq 4 ] && exit 0

# only handle "add" and "remove" events
[ "${ACTION}" != "add" -a "${ACTION}" != "remove" ] && exit 0

MDEV_SEQ=`cat /dev/mdev.seq`
echo "hotPlug.sh begin(seq=${MDEV_SEQ})..." > /dev/kmsg
MODEL=$(cat "/usr/local/modules/files/model")

pid_hdVerify=`pidof hdVerify`
pid_hotPlug=`pidof -o $$ hotPlug.sh`

echo "hd_Verify pid : $pid_hdVerify"

echo "$DEVPATH" | grep -q 'usb'
if [ $? -ne 0 ]; then
# TODO : add led behavior function
# TODO : check re-entry issue

	if [ -e /tmp/hotplug_ignore ]; then
		exit 0
	fi
  
	touch /tmp/system_busy
	touch /tmp/hotplug.${ACTION}.${DEVNAME}
	sata_disk hw_scan

	# update sysinfo
	sysinfo_update.sh

  #if [ ! -z "$pid_hotPlug" ]; then
  #  echo "hotPlug.sh pid : $pid_hotPlug"
  #  touch /tmp/hotplug_repeat
  #  exit 0
  #fi
  
  echo "$ACTION" | grep -q 'add'
  if [ $? == 0 ]; then
    #add
    echo "$MDEV $ACTION " >> /tmp/sata
    touch /tmp/sata_hotplug_event
  else
    #remove
    echo "$MDEV $ACTION" >> /tmp/sata
    sata_pwr_ctl
    
    touch /tmp/sata_hotplug_event
    
		RETRY_COUNT=10
		MD=`cat /proc/mdstat | grep ${DEVNAME}1 | awk '{ print $1 }'`
		if [ -n "${MD}" ] ; then
			mknod /dev/${DEVNAME}1 b ${MAJOR} `expr ${MINOR} + 1`
			while [ ${RETRY_COUNT} -gt 0 ] ; do
				echo idle > /sys/block/${MD}/md/sync_action
				mdadm /dev/${MD} -f /dev/${DEVNAME}1
				mdadm /dev/${MD} -r /dev/${DEVNAME}1
				if [ $? -eq 0 ] ; then
					MD=`cat /proc/mdstat | grep ${DEVNAME}1 | awk '{ print $1 }'`
					if [ -z "${MD}" ] ; then
						break
					fi
				fi
				RETRY_COUNT=`expr ${RETRY_COUNT} - 1`
				usleep 200000
			done
			unlink /dev/${DEVNAME}1
		fi
		MD=`cat /proc/mdstat | grep ${DEVNAME}1 | awk '{ print $1 }'`
		if [ -n "${MD}" ] ; then
			echo "hotPlug.sh: unable remove ${DEVNAME}1 from ${MD}" > /dev/console
		fi

		RETRY_COUNT=10
		MD=`cat /proc/mdstat | grep ${DEVNAME}2 | awk '{ print $1 }'`
		if [ -n "${MD}" ] ; then
			mknod /dev/${DEVNAME}2 b ${MAJOR} `expr ${MINOR} + 2`
			while [ ${RETRY_COUNT} -gt 0 ] ; do
				echo idle > /sys/block/${MD}/md/sync_action
				mdadm /dev/${MD} -f /dev/${DEVNAME}2
				mdadm /dev/${MD} -r /dev/${DEVNAME}2
				if [ $? -eq 0 ] ; then
					MD=`cat /proc/mdstat | grep ${DEVNAME}2 | awk '{ print $1 }'`
					if [ -z "${MD}" ] ; then
						break
					fi
				fi
				RETRY_COUNT=`expr ${RETRY_COUNT} - 1`
				usleep 200000
			done
			unlink /dev/${DEVNAME}2
		fi
		MD=`cat /proc/mdstat | grep ${DEVNAME}2 | awk '{ print $1 }'`
		if [ -n "${MD}" ] ; then
			echo "hotPlug.sh: unable remove ${DEVNAME}2 from ${MD}" > /dev/console
		fi

		# umount 4th partition
		HIDDEN_MOUNT=/mnt/HD_`expr substr ${DEVNAME} 3 1`4
		while [ 1 ] ; do
			fuser -v -k -m ${HIDDEN_MOUNT}
			usleep 500000
			umount ${HIDDEN_MOUNT}
			usleep 500000
			mount | grep -q ${HIDDEN_MOUNT}
			if [ $? -ne 0 ] ; then
				rm -rf ${HIDDEN_MOUNT}
				break
			fi
			echo "umount ${HIDDEN_MOUNT} failed, retry..." > /dev/console
		done
  fi
	# update sysinfo
	sysinfo_update.sh full
  
  #touch /tmp/sata_hotplug
  #if [ -e /usr/sbin/led ]; then
  #  led disk hotplug
  #fi
  
  #kill_running_process
  #if [ ! -z "$pid_hdVerify" ]; then
  #  kill -9 `pidof hdVerify`
  #fi
  #pid_diskmgr=`pidof diskmgr`
  #if [ ! -z "$pid_diskmgr" ]; then
  #  kill -9 `pidof diskmgr`
  #fi
  #hdVerify -s
# TODO : call jack's send mail and save log reload hd sleep deamon function
  # sata_disk --> record log when sata disk hotplug
  #sata_disk hotplug

  # offl_chk --> detect hd degraded
  #offl_chk &

  # set_pwm --> hd sleep management
  
  #pwm_ctl=$(cat /etc/NAS_CFG/config.xml  | grep "<hdd_hibernation_enable>1</hdd_hibernation_enable>")

  #if [ -n "$pwm_ctl"  ]; then
  #	killall -9 set_pwm
  #	sleep 1
  #	set_pwm &
  #fi

	#rm -f /tmp/hotplug.${ACTION}.${DEVNAME}
	#[ -e ${XMLDB_SOCK_SYSINFO} ] && killall -SIGUSR2 sysinfod
	
	#rm /tmp/sata_hotplug
	#rm /tmp/system_busy
	
# TODO : add led behavior function
else
  echo "$ACTION" | grep -q 'add'
  if [ $? == 0 ]; then
    echo "USB1 device $MDEV $ACTION " > /tmp/usb
    echo $MDEV >> /tmp/usb_add_dev
    touch /tmp/usb_hotplug_event
    touch usb_hotplug_busy
    ganalytics --usb-conn-num &
  else
    echo "USB3 device $MDEV $ACTION" > /tmp/usb
    if [ -e /var/www/xml/usb_info.xml ]; then
      check_umount=`cat /var/www/xml/usb_info.xml | grep -r $MDEV`
      if [ -n "$check_umount" ]; then
        echo $MDEV >> /tmp/usb_remove_dev
        touch /tmp/usb_hotplug_event
        touch usb_hotplug_busy
      else
        echo $MDEV >> /tmp/usb_remove_unmount_dev
      fi
    else
      echo $MDEV >> /tmp/usb_remove_unmount_dev
    fi
  fi
  # usb_dsik --> blinkging led and call "load_module usb"
# TODO : call jack's send mail and save log function
fi

echo "hotPlug.sh end(seq=${MDEV_SEQ})." > /dev/kmsg
#sync
