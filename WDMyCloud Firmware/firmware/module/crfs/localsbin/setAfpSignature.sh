#!/bin/sh
#
# © 2010 Western Digital Technologies, Inc. All rights reserved.
#
# setAfpSignature.sh - set signature on afpd.conf if none created
#

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin


macaddr=`getMacAddress.sh | tr -d ":"`
devicename=`getDeviceName.sh`

## Note: the second line is for TimeMachine.  This allows us to "hide" shares by createing 2 servers on different ports
cat > /etc/netatalk/afpd.conf <<EOP
 - -transall -port 12548 -uamlist uams_guest.so,uams_clrtxt.so,uams_dhx2.so -nouservol -defaultvol /etc/netatalk/AppleVolumes.shares -guestname "nobody" -nosavepassword -signature user:${macaddr}
${devicename}- -transall -uamlist uams_guest.so,uams_clrtxt.so,uams_dhx2.so -nouservol -defaultvol /etc/netatalk/AppleVolumes.tm -guestname "nobody" -nosavepassword -signature user:TM${macaddr}
EOP


