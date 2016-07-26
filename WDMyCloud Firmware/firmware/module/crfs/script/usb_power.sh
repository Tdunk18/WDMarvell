#!/bin/sh

model_name=`cat /usr/local/modules/files/model`

set_usb_power()
{
  
  case ${model_name} in
  #2bay NAS
    WDMyCloudEX2)
      if [ "$1" = "on" ]; then
        # enable usb power
        mem_rw -w -t 1 -o 0x18100 -b 13 -v 1
      elif [ "$1" = "off" ]; then
        mem_rw -w -t 1 -o 0x18100 -b 13 -v 0
      fi
      ;;
      
    WDMyCloudEX2100)
      if [ "$1" = "on" ]; then
        up_send_ctl PowerUSB 0 1
        sleep 2
        up_send_ctl PowerUSB 1 1
      elif [ "$1" = "off" ]; then
        up_send_ctl PowerUSB 0 0
        up_send_ctl PowerUSB 1 0
      fi
      ;;
      
  #4bay NAS
    WDMyCloudEX4100)
      if [ "$1" = "on" ]; then
        # enable usb power , set bit 12 value 1
        mem_rw -w -t 1 -o 0x18140 -b 12 -v 1
      elif [ "$1" = "off" ]; then
        # enable usb power , set bit 12 value 1
        mem_rw -w -t 1 -o 0x18140 -b 12 -v 0
      fi
      ;;    
      
  esac

}

usb_restart()
{
  echo "Unmount USB"
  usbumount all
  sleep 1
  
  #disable usb power
  rm /tmp/usb
  rm /tmp/usb_remove_dev
  rm /tmp/usb_add_dev
  rm /tmp/usb_hotplug_event
  echo "Disable usb power"
  set_usb_power off
  
  count=1
  while [ $count -le 8  ];
  do
    if [ -e /tmp/usb ]; then
      echo "====> USB device remove"
      break;
    fi
    
    echo "count =$count"
    count=`expr $count + 1`
    sleep 1
  done
  
  rm /tmp/usb
  rm /tmp/usb_remove_dev
  rm /tmp/usb_add_dev
  rm /tmp/usb_hotplug_event
  sleep 1
  # enable usb power
  echo "Enable usb power"
  set_usb_power on
  
  count=1
  while [ $count -le 8  ];
  do
    if [ -e /tmp/usb ]; then
      echo "====> USB device add"
      break;
    fi
    count=`expr $count + 1`
    sleep 1
  done
  
  sleep 6
  echo "Mount USB"
  usbmount all
  
  rm /tmp/usb
  rm /tmp/usb_remove_dev
  rm /tmp/usb_add_dev
  rm /tmp/usb_hotplug_event

}

num=$#

if [ "$num" != "1" ]; then
  echo "usb_power.sh on/off"
  exit 0
fi

if [ "$model_name" = "WDMyCloudEX2" -o "$model_name" = "WDMyCloudEX2100" -o "$model_name" = "WDMyCloudEX4100" ]; then
  echo "usb power setting"
else
  echo "Not support"
  exit 0
fi

 
if [ "$1" == "on" ]; then
  set_usb_power on
elif [ "$1" == "off" ]; then
  set_usb_power off
elif [ "$1" == "restart" ]; then
  usb_restart
fi


