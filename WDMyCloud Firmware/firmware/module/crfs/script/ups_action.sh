#!/bin/sh
#echo "0=$0 1=$1 2=$2 `env`">>/tmp/debug_usbagent

#echo "ups_action.sh" > /dev/console

count=1
cnt=0

case $1 in                                                 
add)
	#echo "add" > /dev/console
	if [ -e /tmp/ups_sok ]; then
		exit 1
	fi

	sh -c /usr/sbin/upscan
	sleep 2
	if [ ! -e /tmp/upsin ]; then
	    exit 1
	fi                
    sleep 1

	if [ -e /tmp/UPS_Montor_Unloading ]; then
		rm /tmp/UPS_Montor_Unloading
	fi

  touch /tmp/ups_loading    
	
	#==================================
	#	UPS Driver loading
	#==================================
    /usr/sbin/upsdrvctl start

    if [ -e /var/state/ups/usbhid-ups-usbhid.pid ]
    then      
      rm /tmp/ups_loading                                         
      touch /tmp/ups_sok                                          
    elif [ -e /var/state/ups/blazer_usb-megatec.pid ]
    then
      rm /tmp/ups_loading
      touch /tmp/ups_sok
    elif [ -e /var/state/ups/bcmxcp_usb-bcmxcp.pid ]
    then      
      rm /tmp/ups_loading                                         
      touch /tmp/ups_sok                                          
    elif [ -e /var/state/ups/tripplite_usb-tripplite.pid ]
    then
      rm /tmp/ups_loading                                         
      touch /tmp/ups_sok
    elif [ -e /var/state/ups/richcomm_usb-richcomm.pid ]
    then
      rm /tmp/ups_loading                                         
      touch /tmp/ups_sok
  	else
	#================================================
	#	we can't find PID_FILE , driver load false .
	#================================================
      rm /tmp/ups_loading
	  rm /tmp/upsin      
	  upsd -c stop                                   
      touch /tmp/ups_sno
	  if [ -e /tmp/ups_sok ]; then
		  rm /tmp/ups_sok
	  fi
	  if [ -e /tmp/UPS_Montor_loading ]; then
		  rm /tmp/UPS_Montor_loading
	  fi

	  exit 1
    fi
	#==================================
	#	Start UPS daemon
	#==================================
    /usr/sbin/upsd
		UPS_Setting -M ON
	#==================================
	#	UPS Monter Start
	#==================================
	if [ -e /tmp/ups_sok ]; then
		touch /tmp/UPS_Montor_loading
	fi
    ;;

remove)
	#echo "remove" > /dev/console
	#=======================================
	# Stop UPS daemon , upsmon ,and driver
	#=======================================
    sleep 1
	
	if [ -e /tmp/ups_sok ]; then
		while [ $count -le 10 ]; do
			if [ -e /var/state/ups/usbhid-ups-usbhid.pid ]; then      
				upsc usbhid@localhost > /dev/null
			elif [ -e /var/state/ups/blazer_usb-megatec.pid ]; then
				upsc megatec@localhost > /dev/null
			elif [ -e /var/state/ups/bcmxcp_usb-bcmxcp.pid ]; then      
				upsc bcmxcp@localhost > /dev/null
			elif [ -e /var/state/ups/tripplite_usb-tripplite.pid ]; then
				upsc tripplite@localhost > /dev/null
			elif [ -e /var/state/ups/richcomm_usb-richcomm.pid ]; then
				upsc richcomm@localhost > /dev/null
			fi

			if [ $? != 0 ]; then
				break;
			else
				cnt=`expr $cnt + 1`	
			fi
			sleep 2
			count=`expr $count + 1`
		done
	fi
	
	if [ $cnt -eq 10 ]; then
		exit 0
	fi

	killall upsmon

	if [ -e /var/state/ups/upsd.pid ]; then   
    	upsd -c stop                                                
	fi

	upsdrvctl stop

	if [ -e /tmp/ups_sok ]; then                                
    	rm /tmp/ups_sok                                             
    fi                                                          
    
	if [ -e /tmp/ups_sno ]; then                                
    	rm /tmp/ups_sno                                             
    fi

   	if [ -e /tmp/ups_state ]; then
    	rm /tmp/ups_state
    fi

    if [ -e /tmp/ups_loading ]; then                            
   		rm /tmp/ups_loading                                            
    fi

    if [ -e /tmp/upsin ]; then
    	rm /tmp/upsin
    fi

	if [ -e /tmp/UPS_OB ]; then
		rm /tmp/UPS_OB
	fi

	if [ -e /tmp/UPS_LB ]; then
		rm /tmp/UPS_LB
	fi                                                          
	
	if [ ! -e /tmp/UPS_Montor_Unloading ]; then
		touch /tmp/UPS_Montor_Unloading
	fi

	if [ -e /tmp/UPS_Montor_loading ]; then
		rm /tmp/UPS_Montor_loading
	fi

	if [ -e /var/www/xml/usb_ups.xml ]; then
		rm /var/www/xml/usb_ups.xml
	fi
    ;;                 
                                                                
*)                                                              
    echo -e "The action do not correct ."
	echo -e "Usage : ups_action.sh [add|remove]"
    exit 1                                                      
    ;;                                                          
                                                                
esac                                                            
                                                                
exit 0 
                                                         
