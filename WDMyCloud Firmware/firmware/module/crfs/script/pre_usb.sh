#!/bin/sh
debug=0

old_kernel()
{
	#kernel 3.2.40 KC,LT4A
	case "$ACTION" in
	
	add|"")
		for uevent in /sys/class/usb_device/usbdev?.*/*/uevent; do
			. $uevent
			
			if [ ! -e /dev/bus/usb/$BUSNUM/$DEVNUM ]; then
				mkdir -p /dev/bus/usb/$BUSNUM
				
				mknod /dev/bus/usb/$BUSNUM/$DEVNUM c 189 $MINOR
			fi
			
		done
	  
	  if [ $debug -eq 1 ]; then
	    echo "call do_printer_ups.sh"
	    sh -x /usr/sbin/do_printer_ups.sh add
	  else
	    sh /usr/sbin/do_printer_ups.sh add
	  fi
	;;
	
	remove)
		sh -x /usr/sbin/do_printer_ups.sh remove
		for device in /dev/bus/usb/*/*; do
			REMOVED=1
			dev=`basename $device`
			bus=`basename $(dirname $device)`
			
			for uevent in /sys/class/usb_device/usbdev?.*/*/uevent; do
				. $uevent
				
				#echo $dev $DEVNUM $bus $BUSNUM >> /tmp/rem.txt
				
				if [ $dev -eq $DEVNUM ] && [ $bus -eq $BUSNUM ]; then
					REMOVED=0
					break;
				fi
			done
			
			if [ $REMOVED -eq 1 ]; then
				rm /dev/bus/usb/$bus/$dev
			
				if [ -z $(ls /dev/bus/usb/$bus/) ]; then
					rmdir /dev/bus/usb/$bus/
				fi
				led usb blue off
				led usb red off
			fi
		done
	;;
	
	esac
}

new_kernel()
{
  #kernel 3.10.x later
  case "$ACTION" in
	add|"")
		for uevent in /sys/bus/usb/devices/?-*/uevent; do
			. $uevent
	
			if [ -z $BUSNUM ]; then                                 
				continue;       
			fi
			
			if [ ! -e /dev/bus/usb/$BUSNUM/$DEVNUM ]; then
				mkdir -p /dev/bus/usb/$BUSNUM
				mknod /dev/bus/usb/$BUSNUM/$DEVNUM c 189 $MINOR
			fi
			
		done
		
		if [ $debug -eq 1 ]; then
		  echo "call do_printer_ups.sh"
		  sh -x /usr/sbin/do_printer_ups.sh add
		else  
			sh /usr/sbin/do_printer_ups.sh add
		fi
	;;
	
	remove)
		sh -x /usr/sbin/do_printer_ups.sh remove
		for device in /dev/bus/usb/*/*; do
			REMOVED=1
			dev=`basename $device`
			bus=`basename $(dirname $device)`
			
			for uevent in /sys/bus/usb/devices/?-*/uevent; do
				. $uevent
				
				#echo $dev $DEVNUM $bus $BUSNUM >> /tmp/rem.txt
				
				if [ $dev -eq $DEVNUM ] && [ $bus -eq $BUSNUM ]; then
					REMOVED=0
					break;
				fi
			done
			
			if [ $REMOVED -eq 1 ]; then
				rm /dev/bus/usb/$bus/$dev
			
				if [ -z $(ls /dev/bus/usb/$bus/) ]; then
					rmdir /dev/bus/usb/$bus/
				fi
	
			fi
		done
	;;
	
	esac
}

kernel_ver=`cat /proc/version | grep "3.2.40"`
if [ -n "$kernel_ver" ]; then
  if [ $debug -eq 1 ]; then
	  echo "Run in old kernel"
	fi
	old_kernel
else
	if [ $debug -eq 1 ]; then
		echo "Run in new kernel"
	fi
	new_kernel
fi
