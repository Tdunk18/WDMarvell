#!/bin/sh

echo "hardware init"

# enable usb power
#mem_rw -w -t 1 -o 0x18100 -v 0x2010

#for SPI clock
mem_rw -w -t 1 -o 0x1100c -v 0xfb

ifconfig egiga1 up
ifconfig egiga2 up

usb_error=`dmesg | grep "Maybe the USB cable is bad"`
port1_error=`echo $usb_error | grep "5-0:1.0"`
if [ -n "$port1_error" ]; then
  echo "USB Port 1 error"
  touch /tmp/usb1_failed
fi

port2_error=`echo $usb_error | grep "3-0:1.0"`
if [ -n "$port2_error" ]; then
  echo "USB Port 2 error"
  touch /tmp/usb2_failed
fi
