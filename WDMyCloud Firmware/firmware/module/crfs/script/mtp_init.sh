#!/bin/sh
mkdir /etc/hotplug
CAMLIBS=/lib/camlibs print-camera-list usb-usermap usbcam >> /etc/hotplug/usb.usermap
mkdir /etc/hotplug/usb
cp /usr/local/modules/files/usbcam.user /etc/hotplug/usb/usbcam
chmod +x /etc/hotplug/usb/usbcam
