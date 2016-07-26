#!/bin/sh


check_certificate(){

   sleep 3
   
 if [ -f /var/www/rest-api/config/server.crt ] && \
 [ -f /var/www/rest-api/config/server.key ];then

	openssl verify /var/www/rest-api/config/server.crt 2>&1 | grep "unable to load" >/dev/null 2>&1; [ "$?" -eq "0" ] && return 1
	openssl rsa -in /var/www/rest-api/config/server.key 2>&1 | grep "unable to load" >/dev/null 2>&1; [ "$?" -eq "0" ] && return 1
   
  cat /var/www/rest-api/config/server.key /var/www/rest-api/config/server.crt > \
  /etc/certificate_https_all.pem_tmp

  diff /etc/certificate_https_all.pem_tmp   /etc/certificate_https_all.pem >/dev/null 2>&1
  if [ $? -ne 0 ];then
 	mv /etc/certificate_https_all.pem_tmp   /etc/certificate_https_all.pem
 	access_mtd "cp /etc/certificate_https_all.pem  /usr/local/config/"
 	access_mtd "cp /var/www/rest-api/config/server.crt  /usr/local/config/"
 	access_mtd "cp /var/www/rest-api/config/server.key  /usr/local/config/"
	if [  "$1" == "lrestart"  ] ;then
 		lighty restart
 	fi
  else
    rm /etc/certificate_https_all.pem_tmp
  fi

fi


 }

 check_certificate $1


