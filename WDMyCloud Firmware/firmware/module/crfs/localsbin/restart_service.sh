#!/bin/bash
RESTART_SERVICE() {
  local SERVICE="${1}"
  case "$SERVICE" in
		"AFP") touch /tmp/sevc_reload/afp.restart;;
  		"SAMBA") touch /tmp/sevc_reload/samba.restart;;
		"FTP") touch /tmp/sevc_reload/ftp.restart;;
		"WEBDAV") touch /tmp/sevc_reload/webdav.restart;;
		*) echo "IGNORE";;		
  esac 
}	
#afp
RESTART_SERVICE AFP

#webdav,samba
if [ -s /tmp/set_webdav_note ]; then
   #make sure /var/www/xml/smb.xml is the latest
   smbcom -v >/dev/null
   RESTART_SERVICE WEBDAV
else 
   smbcom -v >/dev/null
fi
#ftp
ftp_state=`xmldbc -g /app_mgr/ftp/setting/state`
if [ 1 -eq $ftp_state ]; then
    RESTART_SERVICE FTP
fi
