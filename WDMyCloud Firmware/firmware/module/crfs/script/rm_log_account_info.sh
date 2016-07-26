[ "$#" -eq "1" ] || exit 1

cd ${1}

cd current_config
#etc/
cd etc
	rm -f alert_email.conf
	rm -f certificate_https_all.pem
	rm -f passwd*
	rm -f rsyncd.secrets
	rm -f s3.conf
	rm -f shadow
	sed -i '/password/d' sms_conf.xml
	sed -i '/username/d' sms_conf.xml
	sed -i '/url_arg/d' sms_conf.xml
	rm -f smtp.conf

	rm -f samba/smbpasswd
	rm -f samba/secrets.tdb
	rm -rf samba/var

	rm -f ssh/ssh_host_dsa_key
	rm -f ssh/ssh_host_dsa_key.pub

	rm -f ssl/certs/ca-certificates.crt
	rm -f wdcomp.d/admin-rest-api/saved_settings/var/www/rest-api/config/server.*

	grep -v "DEVICEAUTH=" /etc/wdcomp.d/admin-rest-api/saved_settings/var/www/rest-api/config/dynamicconfig.ini | grep -v "DEVICEID=" > wdcomp.d/admin-rest-api/saved_settings/var/www/rest-api/config/dynamicconfig.ini
	grep -v "DEVICEAUTH=" /etc/wdcomp.d/admin-rest-api/saved_settings/var/www/rest-api/config/dynamicconfig.ini_safe | grep -v "DEVICEID=" > wdcomp.d/admin-rest-api/saved_settings/var/www/rest-api/config/dynamicconfig.ini_safe

	for fn in `find NAS_CFG -type f -iname "*.xml"`
	do
		sed -i '/username/d' ${fn}
		sed -i '/pwd/d' ${fn}
		sed -i '/passwd/d' ${fn}
		sed -i '/password/d' ${fn}
	done

#usr/local/nas/orion/
	cd ..
	sqlite3 usr/local/nas/orion/orion.db "UPDATE deviceusers SET auth=NULL, dac=NULL, email=NULL;"

#var/www/rest-api/config/
	rm -f var/www/rest-api/config/server.*
	grep -v "DEVICEAUTH=" /var/www/rest-api/config/dynamicconfig.ini | grep -v "DEVICEID=" > var/www/rest-api/config/dynamicconfig.ini
	grep -v "DEVICEAUTH=" /var/www/rest-api/config/dynamicconfig.ini_safe | grep -v "DEVICEID=" > var/www/rest-api/config/dynamicconfig.ini_safe


cd ../log
	rm -f .ash_history

	for fn in `find var/log -type f -iname "*.log*"`
	do
		sed -i '/DEVICEAUTH/d' ${fn}
		sed -i '/DEVICEID/d' ${fn}
		sed -i '/pw=/d' ${fn}
		sed -i '/device_user_auth_code/d' ${fn}
		sed -i '/auth_password/d' ${fn}
		sed -i '/username/d' ${fn}
		sed -i '/pwd/d' ${fn}
		sed -i '/passwd/d' ${fn}
		sed -i '/password/d' ${fn}
	done