#!/bin/sh

device=$(xmldbc -g "system_mgr/samba/netbios_name/")
hw_ver=$(xmldbc -g "hw_ver")
ver=$(expr substr $(xmldbc -g "sw_ver_1") 1 4)
url=$(xmldbc -g "app_mgr/upnpavserver/company_url/")
ip=$(xmldbc -g "network_mgr/lan/ip/")

echo "<info><ip>"$ip"</ip><device>"$device"</device><hw_ver>"$hw_ver"</hw_ver><version>"$ver"</version><url>"$url"</url></info>" > /var/www/xml/info.xml