#!/bin/sh
kill_program()
{
  killall quotacheck
	killall lighttpd
	killall chk_hotplug
	killall system_daemon
	killall crond
	killall op_server
	killall fan_control
	killall temperature_monitor 2> /dev/null
  killall set_pwm 2> /dev/null
  killall sysinfod 2> /dev/null
}

one_bay_shutdown()
{
  killall mserver
  killall mail_daemon
  killall avahi-daemon
  killall udhcpc
  killall syslogd 
  killall dbus-daemon
  killall xmldb
  mem_rw -w -t 2 -p0 -o 0 -v 0x1940 #[phy link down]
  mem_rw -w -t 1 -o 0x18140 -b 29 -v 0 > /dev/null #[phy LED down]
  mem_rw -w -t 1 -o 0x18140 -b 26 -v 0 > /dev/null #[phy LED down]
  #mem_rw -w -t 1 -o 0x18000 -v 0         #On Lorten's script file
  mem_rw -w -t 1 -o 0x18004 -v 0x22000000 #[disable spi flash function]
  mem_rw -w -t 1 -o 0x18104  -vffaffc50 #[disable USB device power]
  led power red off #[led off]
  led power blue off #[led off]
  led power yellow off #[led off]
  cp /usr/local/modules/bin/hdparm /usr/bin/
  cp /usr/local/modules/usrsbin/mem_rw /usr/sbin/
  hdparm -y /dev/sda #[ HD enter standby mode ]
  #mem_rw -w -t 1 -o 0x18310 -v 0x6006    #On Lorten's script file
  #mem_rw -w -t 1 -o 0x18314 -v 0x6004    #On Lorten's script file
  #mem_rw -w -t 1 -o 0x1831c -v 0x440e006 #On Lorten's script file
  mem_rw -w -t 1 -o 0x18318 -v 0x4406002 #[ SATA disable ]

  memory_rw -w -o 0xf1001520 -v 0x0b4312c1   #Provide by Marvell Ofer
  #memory_rw -w -o 0xf1018220 -v 0xfffff14   #Provide by Marvell Ofer
                                             #If CPU need to alive
  memory_rw -w -o 0xf1018220 -v 0x0          #Close All of Chip .
}

source /usr/local/modules/files/project_features
sleep 1

cp /usr/local/default/mail_event_conf.xml /usr/local/config/
cp /etc/blockip /usr/local/config/

cmd=$1
if [ "$cmd" = "2" ]; then
  kill_program
fi

killall apkg
if [ "$PROJECT_FEATURE_DOCKER" = "1" ]; then
    /etc/init.d/wdappmgrd stop
    /usr/sbin/docker_daemon.sh shutdown
fi
kill_running_process all
lighty stop
#kill -9 -1

lltd.sh stop 2>/dev/null

if [ "$PROJECT_FEATURE_MV_TCP_WORKAROUND" = "1" -a "$PROJECT_FEATURE_BOOT_FROM_HD" = "1" ]; then
	sync_tm_to_hd.sh
fi

# remove link file
rm /usr/local/upload
sync

umount_dev.sh all

# don't remove this line, if need, call Bing
if [ -e /usr/local/sbin/custom_shutdown.sh ]; then
	custom_shutdown.sh
fi
/usr/sbin/ga_cron.sh now > /dev/null
sync

if [ "$PROJECT_FEATURE_ROOTFS_ON_USBDOM" = "1" -o "$PROJECT_FEATURE_ROOTFS_ON_EMMC" = "1" ]; then
	mtd_check -f
fi

umount -l /usr/local/config

sleep 1
# shutdown device

MODEL=$(cat "/usr/local/modules/files/model")
echo "MODEL:$MODEL"

if [ -e /usr/sbin/set_wol ]; then
  set_wol
fi

led power red off
led power blue off

if [ "$PROJECT_FEATURE_MCU_SHUTDOWN_REBOOT" = "1" ]; then
	echo "send cmd to micro-p to shutdown"
	up_send_ctl DeviceShutdown 1
	sleep 20
	poweroff
elif [ "$PROJECT_FEATURE_ACPI" = "1" ]; then
	echo "device shutdown"
	if [ "$PROJECT_FEATURE_OLED" = "1" ]; then
		up_send_ctl DeviceShutdown 0
  fi
  sleep 5
  poweroff
else
  if [ "$PROJECT_FEATURE_BAYS" = "1" ]; then
    if [ "$MODEL" = "WDMyCloud" ]; then
      one_bay_shutdown
    else
      echo "Not Support shutdown."
    fi
  else
    echo "Not Support shutdown."
  fi
	
fi
