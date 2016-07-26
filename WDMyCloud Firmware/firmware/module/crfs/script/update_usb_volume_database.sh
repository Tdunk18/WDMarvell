#!/bin/sh

# Mark check wdmcserver process, because crawler will be called after update_usb_volumes_database.sh .
# +VODKA.20150814 JIRA-SKY-4176 no MountPoints if DUT is booted with USB drive
# pid_wdmcserver=`pidof wdmcserver`
# remoteAccess=`cat /usr/local/config/dynamicconfig_config.ini | grep REMOTEACCES | sed 's/"//g' | sed 's/REMOTEACCESS=//'`
# if [ $remoteAccess == "TRUE" ]; then
  # if [ -z "$pid_wdmcserver" ]; then
    # echo "can not find wdmcserver"
    # exit 0
  # fi
# fi

usb_add=/tmp/wd_usb_volume_mount
usb_remove=/tmp/wd_usb_volume_unmount

if [ -e $usb_add ]; then

	smbcom

	while read cmd
	do
		#echo "cmd=$cmd"
		`$cmd`
	done <$usb_add
	rm -f $usb_add
	
	# Start samba server
	#smbwddb
	smbcom -s -v
	
  pid_smbd=`pidof smbd`
  if [ -z "$pid_smbd" ]; then
    smbcmd -r
  fi
fi

if [ -e $usb_remove ]; then
	# Start samba server
	#smbwddb
	smbcom -v
	
	while read cmd
	do
		#echo "cmd=$cmd"
		`$cmd`
	done <$usb_remove
	rm -f $usb_remove
	
fi
