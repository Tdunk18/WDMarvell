#!/bin/sh
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#

###########################################
# share setup files
###########################################
trustees=/etc/trustees.conf
sambaOverallShare=/etc/samba/overall_share
hostsConfig=/etc/hosts
networkConfig=/etc/network/interfaces
dnsConfig=/etc/resolv.conf
dhclientConfig=/etc/dhcp3/dhclient.conf
#ntpConfig=/etc/default/ntpdate
ntpConfig=/usr/local/modules/files/ntp_url.txt
smbConfig=/etc/samba/smb.conf
remoteAccessConfig=/etc/remote_access.conf
itunesConfig=/etc/forked-daapd.conf
upgrade_link=/tmp/fw_upgrade_link
nssConfig=/etc/nsswitch.conf

userConfig=/etc/passwd
passwdConfig=/etc/shadow
smbpasswdConfig=/etc/samba/smbpasswd

# Alphha_Lock++
#USR_PW_XML=/etc/usr_pw.xml		# for add/delete/mod user
ETC_FTP_XML=/etc/NAS_CFG/ftp.xml

ownerUid=500
adminDefaultAlias="admin-dfalias-wd"

# 3G required for F/W update
fwUpdateSpace="3000000"

fileTally=/var/local/nas_file_tally
twonky_dir=/usr/local/twonkymedia-5

# bash scripts logging for debugging use.. currently not all scripts are instrumented.
# SYSTEM_SCRIPTS_LOG="/var/log/wdscripts.log"
