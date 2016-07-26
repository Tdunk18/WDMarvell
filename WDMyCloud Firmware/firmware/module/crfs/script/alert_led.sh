#!/bin/sh
source /usr/local/modules/files/project_features

alert_led_help()
{
  echo "   alert code                    : [fireAlert auto call led] :   command"
  echo "Critical alert"
  echo "0001 System Over Temperature     : [Yes]                     : alert_led.sh 0001"
  echo "0002 System Under Temperature    : [Yes]                     : alert_led.sh 0002"
#  echo "0003 Drive SMART failure         : [Yes]                     : alert_led.sh 0003 %d"
#  echo "0004 Volume Failure              : [No]                      :"
  echo "0005 Pending thermal shutdown    : [Yes]                     : alert_led.sh 0005"
  echo "0029 Fan Not Working             : [Yes]                     : alert_led.sh 0029"
#  echo "0031 On UPS Power                : [Yes]                     : alert_led.sh 0031"
#  echo "0201 Drive Failed                : [Yes]                     : alert_led.sh 0201 %d"
#  echo "0208 Volume Degraded             : [Yes]                     : alert_led.sh 0208 %d"
#  echo "0212 Volume Rebuild Failed       : [Yes]                     : alert_led.sh 0212 %d"
  echo ""
  echo "Warning alert"
#  echo "1001 Volume Usage is Above 95%   : [Yes]                     : alert_led.sh 1001 %d"
#  echo "1002 Network Link Down           : [No]                      : "
  echo "1022 Power Supply Failure        : [Yes]                      : alert_led.sh 1022"
#  echo "1120 Unsupported USB Device      : [No]                      : alert_led.sh 1120 %d[0~2] %d[sdx]"
#  echo "1121 Unsupported File System     : [No]                      : alert_led.sh 1121 %d[0~2] %d[sdx]"
#  echo "1123 Unsafe Device Removal       : [No]                      : alert_led.sh 1123 %d[sdx]"
#  echo "1124 Unable to Mount USB Device  : [No]                      : alert_led.sh 1124 %d[0~2] %d[sdx]"
#  echo "1127 Cannot Backup Files         : [Yes]                     : alert_led.sh 1127"
#  echo "1028 Reboot Required             : [Yes]                     : alert_led.sh 1028"
#  echo "1200 Unsupported Drive           : [No]                      :"
#  echo "1400 Remote Backup Error         : [Yes]                     : alert_led.sh 1400"
#  echo "1402 Remote Backup Success       : [Yes]                     : alert_led.sh 1402"
#  echo "1045 File System Error Corrected : [No]                      : alert_led.sh 1045 %d[1~4]"
#  echo ""
#  echo "Information alert"
  echo "2003 Temperature Normal          : [Yes]                     : alert_led.sh 2003"
#  echo "2024 Downloading Firmware Update : [Yes]                     : alert_led.sh 2024"
#  echo "2026 Installing Firmware Update  : [Yes]                     : alert_led.sh 2026"
#  echo "2032 System is in standby mode   : [Yes]                     : alert_led.sh 2032"
#  echo "2033 System Rebooting            : [Yes]                     : alert_led.sh 2033"
#  echo "2121 Locked USB device           : [No]                      : alert_led.sh 2121 %d[0~2] %d[sdx]"
#  echo "2126 Files Copied from USB device: [Yes]                     : alert_led.sh 2126"
#  echo "2128 Copying Files               : [Yes]                     : alert_led.sh 2128"
#  echo "2129 Files Moved from USB device : [Yes]                     : alert_led.sh 2129"
#  echo "2131 Moving Files                : [Yes]                     : alert_led.sh 2131"
#  echo "2214 Drive Inserted              : [Yes]                     : alert_led.sh 2214 %d[1-3]"
#  echo "2220 RAID Rebuild completed      : [No]                      : alert_led.sh 2220 %d[1~2] 0"
#  echo "2020 System Shutting Down        : [Yes]                     : alert_led.sh 2020"
}

Clean_HD_Status()
{
  hd_num=`expr ${2} - 1`
  #echo "led hd${hd_num} ${1} 0"
  led hd${hd_num} ${1} 0
}

Clean_Volume_Status()
{
  led volume ${1} ${2} 0
}

Clean_RAID_Status()
{
  led volume ${1} ${2} 0
}

if [ "$1" = "help" ]; then
  alert_led_help
  exit 0
fi

num=$#
if [ -e /tmp/dbg_alert_led ]; then
  echo "num=$num , alert code:$1" >> /tmp/dbg_alert_led
  if [ $num -eq 1 ]; then
    echo "alert code:$1" >> /tmp/dbg_alert_led
  elif [ $num -eq 2 ]; then
    echo "alert code:$1;$2" >> /tmp/dbg_alert_led
  elif [ $num -eq 3 ]; then
    echo "alert code:$1;$2;$3" >> /tmp/dbg_alert_led
  elif [ $num -eq 4 ]; then
    echo "alert code:$1;$2;$3;$4" >> /tmp/dbg_alert_led
  elif [ $num -eq 5 ]; then
    echo "alert code:$1;$2;$3;$4;$5" >> /tmp/dbg_alert_led
  elif [ $num -eq 6 ]; then
    echo "alert code:$1;$2;$3;$4;$5;$6" >> /tmp/dbg_alert_led
  else
    echo "alert code:$1;$2;$3;$4;$5;$6;$7" >> /tmp/dbg_alert_led
  fi
fi

if [ "$2" = "clean" ]; then
  exit 0
fi

if [ "$2" != "clean" ]; then
  if [ "$PROJECT_FEATURE_USE_WD_HWLIB" != "1" -a "$PROJECT_FEATURE_WD_CUSTOME_HWLIB" != "1" ]; then
    exit 0
  fi
fi


#############################
#     Critical message      #
#############################
if [ "$1" = "1" -o "$1" = "0001" ]; then
  if [ "$2" = "clean" ]; then
    led temperature_over 0
  else
    led temperature_over 1
  fi
elif [ "$1" = "2" -o "$1" = "0002" ]; then
  if [ "$2" = "clean" ]; then
    led temperature_under 0
  else
    led temperature_under 1
  fi
elif [ "$1" = "3" -o "$1" = "0003" ]; then
#  led hd${2} smart_failed 1
  if [ "$2" = "clean" ]; then
    Clean_HD_Status smart_failed ${3}
  fi
elif [ "$1" = "5" -o "$1" = "0005" ]; then
  if [ "$2" = "clean" ]; then
    led temperature_over 0
  else
    led temperature_over 1
  fi
elif [ "$1" = "29" -o "$1" = "0029" ]; then
  if [ $num -eq 1 ]; then
    led fan_not_working 1
  elif [ $num -eq 2 ]; then
    if [ "$2" = "clean" ]; then
      led fan_not_working 0
    elif [ "$2" = "1" ]; then
      led fan_not_working 1
    elif [ "$2" = "0" ]; then
      led fan_not_working 0
    else
      led fan_not_working 1
    fi
  fi
elif [ "$1" = "31" -o "$1" = "0031" ]; then
  if [ $num -eq 1 ]; then
    led UPS_power 1 
  else
    if [ "$2" = "clean" ]; then
      led UPS_power 0
    else
      led UPS_power $2
    fi
  fi
elif [ "$1" = "201" -o "$1" = "0201" ]; then
#  led hd${2} drive_failed 1
  if [ "$2" = "clean" ]; then
    Clean_HD_Status drive_failed ${3}
  fi
elif [ "$1" = "208" -o "$1" = "0208" ]; then
#  led volume volume_degraded ${2} 1
  if [ "$2" = "clean" ]; then
    Clean_RAID_Status volume_degraded ${3}
    
  fi
elif [ "$1" = "212" -o "$1" = "0212" ]; then
#  led volume rebuild_failed ${2} 1
  if [ "$2" = "clean" ]; then
    Clean_RAID_Status rebuild_failed ${3}
  fi  
#############################
#      Warning message      #
#############################
elif [ "$1" = "1001" ]; then
#  led volume size_full ${2} 1
  if [ "$2" = "clean" ]; then
    Clean_Volume_Status size_full ${3}
  fi
elif [ "$1" = "1022" ]; then
  if [ $num -eq 2 ]; then
    if [ "${2}" = "0" ]; then
      led power_failed 0
    else
      if [ -e /tmp/ignore_power_failure ]; then
        rm /tmp/ignore_power_failure
      else
        led power_failed 1
      fi
    fi
  elif [ $num -eq 3 ]; then
    if [ "${2}" = "clean" ]; then
      led power_failed 0
    fi
  fi
#elif [ "$1" = "1120" ]; then
#  if [ $num -eq 3 ]; then
#    led usb_unknow_device ${2} ${3}
#  fi
elif [ "$1" = "1121" ]; then
#  if [ $num -eq 3 ]; then
#    led usb_unsupport_filesystem ${2} ${3}
#  fi
  if [ "$2" = "clean" ]; then
    led usb unsupport_filesystem clean "${3},${4},${5}"
  fi
#elif [ "$1" = "1123" ]; then
#  if [ $num -eq 2 ]; then
#    led usb unsafe_remove ${2}
#  fi
elif [ "$1" = "1124" ]; then
#  if [ $num -eq 3 ]; then
#    led usb mount_failed ${2} ${3}
#  fi
  if [ "$2" = "clean" ]; then
    led usb mount_failed clean "${3},${4},${5}"
  fi
#elif [ "$1" = "1127" ]; then
#  led usb backup_failed
  if [ "$2" = "clean" ]; then
    led usb backup_done
  fi
elif [ "$1" = "1200" ]; then
#  #led hd${2} unsupported_drive 1
  if [ "$2" = "clean" ]; then
    Clean_HD_Status unsupported_drive ${3}
  fi
elif [ "$1" = "1400" ]; then
#    led remote_backup_failed 1
  if [ "$2" = "clean" ]; then
    led remote_backup_failed 0
  fi
elif [ "$1" = "1402" ]; then
#    led remote_backup_failed 0
#elif [ "$1" = "1028" ]; then
#  led system reboot_required
  if [ "$2" = "clean" ]; then
    led system reboot_required 0
  fi
elif [ "$1" = "1045" ]; then
#  if [ $num -eq 2 ]; then
#    led volume file_system_check_failed ${2} 0
#  fi
  if [ "$2" = "clean" ]; then
    Clean_Volume_Status file_system_check_failed ${3}
  fi
#############################
#    Information message    #
#############################
elif [ "$1" = "2003" ]; then
  led temperature_over 0
  led temperature_under 0
#elif [ "$1" = "2024" ]; then
#  led firmware downloading
#elif [ "$1" = "2026" ]; then
#  led firmware updating
#elif [ "$1" = "2032" ]; then
#  led disk sleep
#elif [ "$1" = "2033" ]; then
#  led system booting
elif [ "$1" = "2121" ]; then
#  if [ $num -eq 3 ]; then
#    led usb locked ${2} ${3}
#  fi
  if [ "$2" = "clean" ]; then
    led usb locked clean "${3},${4},${5}"
  fi
#elif [ "$1" = "2126" ]; then
#  led usb backup_done
#elif [ "$1" = "2128" ]; then
#  led usb backup
#elif [ "$1" = "2129" ]; then
#  led usb backup_done
#elif [ "$1" = "2131" ]; then
#  led usb backup
elif [ "$1" = "2214" ]; then
  if [ "$2" = "clean" ]; then
    Clean_HD_Status unused ${3}
  fi
#elif [ "$1" = "2220" ]; then
#  if [ $num -eq 2 ]; then
#    led rebuild_failed ${2} 0
#    led volume_degraded ${2} 0
#  fi
#elif [ "$1" = "2020" ]; then
#  led system shutting_down
fi
