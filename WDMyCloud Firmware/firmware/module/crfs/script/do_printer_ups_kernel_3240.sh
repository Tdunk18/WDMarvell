#!/bin/sh	

# Note: PROJECT_FEATURE_MULTI_USB_PORT for searching feature purpose
#       This scripts should be customized for EVERY BOARD that support PROJECT_FEATURE_MULTI_USB_PORT
#       customize note
#        1. the logical port assignment, port name, port alias
#        2. suppported kind of devices
#        3. xmldb name

MISC_USBINFO_DB_NAME="usbdev_info"
MISC_USBINFO_SOCK_PATH="/var/run/xmldb_sock_${MISC_USBINFO_DB_NAME}"
MISC_USBINFO_DB_PID_FILE="/var/run/xmldb_sock_${MISC_USBINFO_DB_NAME}_config.pid"

USB_LOGI_PORT=""
HIDDEN_PATH=""

DBPATH_USBDEV_ROOT="/usbdev"

DBPATH_MTP_DEV="/usbdev/mtp/device"
DBPATH_MTP_DEV_CNT="${DBPATH_MTP_DEV}#"
DBPATH_MTP_DEV_ENTRY="${DBPATH_MTP_DEV}:%d"
DBPATH_MTP_DEV_ENTRY_DEV="${DBPATH_MTP_DEV_ENTRY}/dev"
DBPATH_MTP_DEV_ENTRY_PORT="${DBPATH_MTP_DEV_ENTRY}/port"
DBPATH_MTP_DEV_ENTRY_MFR="${DBPATH_MTP_DEV_ENTRY}/manufacturer"
DBPATH_MTP_DEV_ENTRY_PRODUCT="${DBPATH_MTP_DEV_ENTRY}/product"
DBPATH_MTP_DEV_ENTRY_MTP_PORT="${DBPATH_MTP_DEV_ENTRY}/mtp_port"

DBPATH_PRINTER_DEV="/usbdev/printer/device"
DBPATH_PRINTER_DEV_CNT="${DBPATH_PRINTER_DEV}#"
DBPATH_PRINTER_DEV_ENTRY="${DBPATH_PRINTER_DEV}:%d"
DBPATH_PRINTER_DEV_ENTRY_DEV="${DBPATH_PRINTER_DEV_ENTRY}/dev"
DBPATH_PRINTER_DEV_ENTRY_PORT="${DBPATH_PRINTER_DEV_ENTRY}/port"
DBPATH_PRINTER_DEV_ENTRY_MFR="${DBPATH_PRINTER_DEV_ENTRY}/manufacturer"
DBPATH_PRINTER_DEV_ENTRY_PRODUCT="${DBPATH_PRINTER_DEV_ENTRY}/product"
DBPATH_PRINTER_DEV_ENTRY_LP_DEV="${DBPATH_PRINTER_DEV_ENTRY}/usblp_dev"
DBPATH_PRINTER_DEV_ENTRY_SYS_LP="${DBPATH_PRINTER_DEV_ENTRY}/sys_lp"
DBPATH_PRINTER_DEV_ENTRY_LP_NAME="${DBPATH_PRINTER_DEV_ENTRY}/lp_name"
DBPATH_PRINTER_DEV_ENTRY_DESC="${DBPATH_PRINTER_DEV_ENTRY}/desc"

DBPATH_UPS_DEV="/usbdev/ups/device"
DBPATH_UPS_DEV_CNT="${DBPATH_UPS_DEV}#"
DBPATH_UPS_DEV_ENTRY="${DBPATH_UPS_DEV}:%d"
DBPATH_UPS_DEV_ENTRY_DEV="${DBPATH_UPS_DEV_ENTRY}/dev"
DBPATH_UPS_DEV_ENTRY_PORT="${DBPATH_UPS_DEV_ENTRY}/port"
DBPATH_UPS_DEV_ENTRY_MFR="${DBPATH_UPS_DEV_ENTRY}/manufacturer"
DBPATH_UPS_DEV_ENTRY_PRODUCT="${DBPATH_UPS_DEV_ENTRY}/product"
DBPATH_UPS_DEV_ENTRY_VENDOR_ID="${DBPATH_UPS_DEV_ENTRY}/vendor_id"
DBPATH_UPS_DEV_ENTRY_PRODUCT_ID="${DBPATH_UPS_DEV_ENTRY}/product_id"
DBPATH_UPS_DEV_ENTRY_DRIVER="${DBPATH_UPS_DEV_ENTRY}/driver"
DBPATH_UPS_DEV_ENTRY_UPS_NAME="${DBPATH_UPS_DEV_ENTRY}/ups_name"

##### ups db in flash #####
FLASH_DBPATH_UPS_DEV="/usbdev/ups"
FLASH_DBPATH_UPS_DEV_ENTRY_VND_ID="${FLASH_DBPATH_UPS_DEV}/vendor_id"
FLASH_DBPATH_UPS_DEV_ENTRY_PRD_ID="${FLASH_DBPATH_UPS_DEV}/product_id"
FLASH_DBPATH_UPS_DEV_ENTRY_PORT="${FLASH_DBPATH_UPS_DEV}/port"
FLASH_DBPATH_UPS_DEV_ENTRY_DRIVER="${FLASH_DBPATH_UPS_DEV}/driver"
FLASH_DBPATH_UPS_DEV_ENTRY_UPS_NAME="${FLASH_DBPATH_UPS_DEV}/ups_name"

wait_for_check_pid () {
	myid=$$;
	wdf=$myid;
	
	if [ ! -e /tmp/do_printer_ups_pid ]; then
		echo $wdf > /tmp/do_printer_ups_pid;
		return;
	fi
	
	while [ 1 ]; do
		if [ -e /tmp/do_printer_ups_pid ]; then
			wds=`cat /tmp/do_printer_ups_pid`;

			MATCHX=`ls /proc | grep "$wds"`;
			if [ "$MATCHX" == "" ]; then
				myid=$$;
				echo $myid > /tmp/do_printer_ups_pid;
				break;
			else
				sleep 1;
			fi
		else
			myid=$$;
			echo $myid > /tmp/do_printer_ups_pid;
			break;
		fi
	done
}

############ USB DEV DB ############

chk_usbdev_db_exist () {

	if [ ! -e $MISC_USBINFO_SOCK_PATH ];then
		return 1
	fi
	
	db_exist=`ps -w | grep "xmldb.*$MISC_USBINFO_SOCK_PATH" | grep -v grep`
	if [ -z "$db_exist" ]; then
		return 1
	fi
	
	return 0
}

stop_usbdev_db () {
	if [ -e $MISC_USBINFO_DB_PID_FILE ];then
		dbpid=`cat $MISC_USBINFO_DB_PID_FILE`;
		kill -9 $dbpid
		
		rm -f $MISC_USBINFO_DB_PID_FILE
	fi
	
	if [ -e $MISC_USBINFO_SOCK_PATH ];then
		rm -f $MISC_USBINFO_SOCK_PATH
	fi
}

start_usbdev_db () {
	xmldb -n config -s $MISC_USBINFO_SOCK_PATH &
}

restart_usbdev_db () {
	stop_usbdev_db
	start_usbdev_db
}


############ USB PORT NAME MAP ############
get_port_name_by_USB_LOGI_PORT() {
	USB_PORT_NAME=""
	case $1 in
	1)
		USB_PORT_NAME="Rear USB Port 2"
	;;
	2)
		USB_PORT_NAME="Rear USB Port 1"
	;;
	3)
		USB_PORT_NAME="Front USB 3.0"
	;;
	4)
		USB_PORT_NAME="Front USB 3.0"
	;;
	*)
		USB_PORT_NAME=""
	;;
	esac
}

get_port_alias_by_USB_LOGI_PORT() {
	USB_PORT_ALIAS=""
	case $1 in
	1)
		USB_PORT_ALIAS="USB-2"
	;;
	2)
		USB_PORT_ALIAS="USB-1"
	;;
	3)
		USB_PORT_ALIAS="Front-USB"
	;;
	4)
		USB_PORT_ALIAS="Front-USB"
	;;
	*)
		USB_PORT_ALIAS=""
	;;
	esac
}


############ MTP DEVICES ############

insert_mtp_to_usbdev_db () {
	# before calling this function the following variable must be filled in
	# MANUFACTURER, PRODUCT, USB_DEV, USB_LOGI_PORT, DEV_DEVNUM, DEV_BUSNUM
	#echo "inserting one DC to usbdev_db" > /dev/console
	#echo MANUFACTURER=$MANUFACTURER PRODUCT=$PRODUCT > /dev/console
	#echo USB_DEV=$USB_DEV USB_LOGI_PORT=$USB_LOGI_PORT DEV_DEVNUM=$DEV_DEVNUM DEV_BUSNUM=$DEV_BUSNUM > /dev/console

	# evaluate mtp port string
	mtp_port=$(printf "usb:%03d,%03d\n" $DEV_BUSNUM $DEV_DEVNUM)
	
	xmldb_mtp_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_MTP_DEV_CNT)
	
	idx=$(expr $xmldb_mtp_cnt + 1)
	
	#dev
	xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_DEV $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_DEV"
	#port
	xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_PORT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_LOGI_PORT"
	#manufacturer
	xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_MFR $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$MANUFACTURER"
	#product
	xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_PRODUCT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$PRODUCT"
	#mtp_port
	xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_MTP_PORT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$mtp_port"
}

remove_mtp_from_usbdev_db () {
	#echo "removing one DC from usbdev_db" > /dev/console
	#echo USB_DEV=$USB_DEV > /dev/console
	
	# search the node
	xml_mtp_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_MTP_DEV_CNT)
	
	found=0
	idx=1
	while [ $idx -le $xml_mtp_cnt ]; do
		xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY_DEV $idx)
		db_dev=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		#echo "get db_dev=$db_dev, USB_DEV=$USB_DEV" > /dev/console
		
		if [ "$db_dev" = "$USB_DEV" ]; then
			#found 
			found=1
			#remove entry
			xmlpath=$(printf $DBPATH_MTP_DEV_ENTRY $idx)
			xmldbc -S $MISC_USBINFO_SOCK_PATH -d $xmlpath
		fi
		
		idx=$(expr $idx + 1)
	done
	
	if [ "$found" = 1 ];then
		return 0
	else
		return 1
	fi
	
	return 1
}


############ USB PRINTERS ############

insert_printer_to_usbdev_db () {
	# before calling this function the following variable must be filled in
	# MANUFACTURER, PRODUCT, USB_DEV, USB_LOGI_PORT, LP, DEVLP_PATH
	
	#echo "inserting one printer to usbdev_db" > /dev/console
	#echo MANUFACTURER=$MANUFACTURER PRODUCT=$PRODUCT > /dev/console
	#echo USB_DEV=$USB_DEV USB_LOGI_PORT=$USB_LOGI_PORT > /dev/console
	#echo LP=$LP DEVLP_PATH=$DEVLP_PATH > /dev/console
	
	xmldb_printer_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_PRINTER_DEV_CNT)
	
	idx=$(expr $xmldb_printer_cnt + 1)
	
	#dev
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_DEV $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_DEV"
	#port
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_PORT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_LOGI_PORT"
	#manufacturer
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_MFR $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$MANUFACTURER"
	#product
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_PRODUCT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$PRODUCT"
	#usblp_dev
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_LP_DEV $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$DEVLP_PATH"
	#sys_lp
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_SYS_LP $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$LP"	
	
	get_port_alias_by_USB_LOGI_PORT $USB_LOGI_PORT
	lp_name="${LP}-${USB_PORT_ALIAS}"
	
	#lp_name - printer name for lprng utils
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_LP_NAME $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$lp_name"	

	get_port_name_by_USB_LOGI_PORT $USB_LOGI_PORT
	ptr_desc=""
	if [ -z "$MANUFACTURER" -o -z "$PRODUCT" ]; then
		if [ -n "$USB_PORT_NAME" ]; then
			ptr_desc="USB Printer@${USB_PORT_NAME}"
		else
			ptr_desc="USB Printer"
		fi
	else
		if [ -n "$USB_PORT_NAME" ]; then
			ptr_desc="USB Printer-${MANUFACTURER}_${PRODUCT}@${USB_PORT_NAME}"
		else
			ptr_desc="USB Printer-${MANUFACTURER}_${PRODUCT}"
		fi
	fi
	
	xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_DESC $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$ptr_desc"
	
	
}


remove_printer_from_usbdev_db () {
	#echo "removing printer from usbdev_db" > /dev/console
	#echo USB_DEV=$USB_DEV > /dev/console
	
	# search the node
	xmldb_printer_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_PRINTER_DEV_CNT)
	
	found=0
	idx=1
	while [ $idx -le $xmldb_printer_cnt ]; do
		xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_DEV $idx)
		db_dev=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		if [ "$db_dev" = "$USB_DEV" ]; then
			#found 
			found=1
			#remove entry
			xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY $idx)
			xmldbc -S $MISC_USBINFO_SOCK_PATH -d $xmlpath
		fi
		
		idx=$(expr $idx + 1)
	done
	
	if [ "$found" = 1 ];then
		return 0
	else
		return 1
	fi
	
	return 1
}


get_HIDDEN_PATH () {
	DSK_INDEX=abcdefghijklmnopqrstuvwxyz
	dsknum=1
	while [ $dsknum -le 26 ]
	do
		HIDDEN_PATH=/mnt/HD_`expr substr "$DSK_INDEX" "$dsknum" 1`4
		if [ -d $HIDDEN_PATH ]
		then
			if [ ! -d "${HIDDEN_PATH}/.lpd" ]; then
				rm -f "${HIDDEN_PATH}/.lpd" 2>/dev/null
				mkdir $HIDDEN_PATH/.lpd 2>/dev/null
				chmod 777 $HIDDEN_PATH/.lpd
			fi
			break
		fi
		
		dsknum=$(expr $dsknum + 1)
	done
	
	if [ $dsknum -gt 26 ]; then
		HIDDEN_PATH=""
	fi
	
}


gen_printcap () {
	
	if [ -z "$HIDDEN_PATH" ]; then
		get_HIDDEN_PATH
	fi
	
	#echo HIDDEN_PATH=$HIDDEN_PATH > /dev/console
	if [ -z "$HIDDEN_PATH" ]; then
		return 1
	fi
	
	#echo "Generating printcap ..." > /dev/console
	
	xmldb_printer_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_PRINTER_DEV_CNT)
	
	echo -n "" > /usr/local/LPRng/etc/printcap
	
	idx=1
	while [ $idx -le $xmldb_printer_cnt ]; do
		
		#sys_lp
		xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_SYS_LP $idx)
		ptr_lp=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		#usblp_dev
		xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_LP_DEV $idx)
		ptr_devlp_path=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		if [ -z "$ptr_lp" -o -z "$ptr_devlp_path" ]; then
			idx=$(expr $idx + 1)
			continue
		fi
		
		#lp_name
		xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_LP_NAME $idx)
		ptr_lp_name=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		if [ -z "ptr_lp_name" ]; then
			idx=$(expr $idx + 1)
			continue
		fi
		
		xmlpath=$(printf $DBPATH_PRINTER_DEV_ENTRY_DESC $idx)
		ptr_desc=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		if [ -z "$ptr_desc" ]; then
			ptr_desc="USB Printer"
		fi
		
		# check the spool directory
		if [ ! -e "${HIDDEN_PATH}/.lpd/${ptr_lp}" ]; then
			chmod 777 $HIDDEN_PATH/.lpd
			mkdir -m 777 -p "${HIDDEN_PATH}/.lpd/${ptr_lp}" 2>/dev/null
			if [ ! -e "${HIDDEN_PATH}/.lpd/${ptr_lp}" ]; then
				#fail to create spool in HIDDEN_PATH
				idx=$(expr $idx + 1)
				continue
			fi
		fi
		
		#generate printcap
		echo "${ptr_lp_name}|${ptr_desc}\\" >> /usr/local/LPRng/etc/printcap
		echo "        :sh\\" >> /usr/local/LPRng/etc/printcap
		echo "        :ml=0\\" >> /usr/local/LPRng/etc/printcap
		echo "        :mx=0\\" >> /usr/local/LPRng/etc/printcap
		echo "        :sd=${HIDDEN_PATH}/.lpd/${ptr_lp}\\" >> /usr/local/LPRng/etc/printcap
		echo "        :lp=${ptr_devlp_path}" >> /usr/local/LPRng/etc/printcap
		
		idx=$(expr $idx + 1)
		
	done
}


############ UPS ############
insert_ups_to_usbdev_db () {
	# before calling this function the following variable must be filled in
	# MANUFACTURER, PRODUCT, USB_DEV, USB_LOGI_PORT, UPS_DRIVER, UPS_NAME, VENDOR_ID, PRODUCT_ID
	#echo "inserting one UPS to usbdev_db" > /dev/console
	#echo MANUFACTURER=$MANUFACTURER PRODUCT=$PRODUCT > /dev/console
	#echo USB_DEV=$USB_DEV USB_LOGI_PORT=$USB_LOGI_PORT DEV_DEVNUM=$DEV_DEVNUM DEV_BUSNUM=$DEV_BUSNUM > /dev/console
	#echo UPS_DRIVER=$UPS_DRIVER UPS_NAME=$UPS_NAME > /dev/console
	#echo VENDOR_ID=$VENDOR_ID PRODUCT_ID=$PRODUCT_ID > /dev/console
	
	xmldb_ups_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_UPS_DEV_CNT)
	
	idx=$(expr $xmldb_ups_cnt + 1)
	
	#dev
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_DEV $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_DEV"
	#port
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_PORT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$USB_LOGI_PORT"
	#manufacturer
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_MFR $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$MANUFACTURER"
	#product
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_PRODUCT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$PRODUCT"
	#driver
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_DRIVER $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$UPS_DRIVER"
	#ups_name
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_UPS_NAME $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$UPS_NAME"
	#vendor id
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_VENDOR_ID $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$VENDOR_ID"
	#product id
	xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_PRODUCT_ID $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -s $xmlpath "$PRODUCT_ID"
}


remove_ups_from_usbdev_db () {
	#echo "removing ups from usbdev_db" > /dev/console
	#echo USB_DEV=$USB_DEV > /dev/console
	
	# search the node
	xmldb_ups_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_UPS_DEV_CNT)
	
	found=0
	idx=1
	while [ $idx -le $xmldb_ups_cnt ]; do
		xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY_DEV $idx)
		db_dev=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $xmlpath)
		
		if [ "$db_dev" = "$USB_DEV" ]; then
			#found 
			found=1
			#remove entry
			xmlpath=$(printf $DBPATH_UPS_DEV_ENTRY $idx)
			xmldbc -S $MISC_USBINFO_SOCK_PATH -d $xmlpath
		fi
		
		idx=$(expr $idx + 1)
	done
	
	if [ "$found" = 1 ];then
		return 0
	else
		return 1
	fi
	
	return 1
}


insert_ups_to_flash_db () {
	# before calling this function the following variable must be filled in
	# USB_LOGI_PORT, VENDOR_ID, PRODUCT_ID, UPS_DRIVER, UPS_NAME
	#echo "inserting one UPS to flash usbdev_db" > /dev/console
	#echo VENDOR_ID=$VENDOR_ID PRODUCT_ID=$PRODUCT_ID > /dev/console
	#echo USB_LOGI_PORT=$USB_LOGI_PORT > /dev/console
	#echo UPS_DRIVER=$UPS_DRIVER UPS_NAME=$UPS_NAME > /dev/console
	
	#port
	xmlpath=$FLASH_DBPATH_UPS_DEV_ENTRY_PORT
	xmldbc -s $xmlpath "$USB_LOGI_PORT"
	#vendor id
	xmlpath=$FLASH_DBPATH_UPS_DEV_ENTRY_VND_ID
	xmldbc -s $xmlpath "$VENDOR_ID"
	#product id
	xmlpath=$FLASH_DBPATH_UPS_DEV_ENTRY_PRD_ID
	xmldbc -s $xmlpath "$PRODUCT_ID"
	#driver
	xmlpath=$FLASH_DBPATH_UPS_DEV_ENTRY_DRIVER
	xmldbc -s $xmlpath "$UPS_DRIVER"
	#ups_name
	xmlpath=$FLASH_DBPATH_UPS_DEV_ENTRY_UPS_NAME
	xmldbc -s $xmlpath "$UPS_NAME"
	
	#xmldbc -D /etc/NAS_CFG/config.xml
	#access_mtd "cp /etc/NAS_CFG/config.xml /usr/local/config"
}


remove_ups_from_flash_db () {
	#echo "removing ups from flash" > /dev/console
	
	xmldbc -d $FLASH_DBPATH_UPS_DEV
	
	#xmldbc -D /etc/NAS_CFG/config.xml
	#access_mtd "cp /etc/NAS_CFG/config.xml /usr/local/config"
	
	return 0
}

############ misc ############
get_USB_LOGI_PORT_by_busnum_phy_port () {
	# TODO : chagne this by each board !!!
	# !!! Board dependent codes, please modify this for each board !!!
	# $1 = usb bus number
	# $2 = usb port number
	
	case $1 in
	1)
		USB_LOGI_PORT=1
	;;
	2)
		USB_LOGI_PORT=2
	;;
	3)
		USB_LOGI_PORT=3
	;;
	4)
		USB_LOGI_PORT=4
	;;
	*)
		USB_LOGI_PORT=""
	;;
	esac
}

############ led ############
check_usb_led () {
  if [ "$1" = "add" ]; then
    led usb unknow_device add "$MDEV"
  elif [ "$1" = "remove" ]; then
    led usb unknow_device remove "$MDEV"
  fi
}

############ MAIN ############
ACTION=$1

case $ACTION in

ver)
	echo "20130715-2100"
;;

renew)
	# this step make sure the shell script
	# not in racing condition .
	wait_for_check_pid
	
	#for system_init to init all USB printer, ups devices
	if chk_usbdev_db_exist ;then
		restart_usbdev_db
	else
		start_usbdev_db
	fi

	# Kill them all!
	xmlpath=$(printf $DBPATH_USBDEV_ROOT $idx)
	xmldbc -S $MISC_USBINFO_SOCK_PATH -d $xmlpath

	printer_in=0
	image_in=0
	ups_in=0
	ups_usbhid=0	
	
	# for each interface's uevent
	for uevent in /sys/bus/usb/devices/*-*:*\.*/uevent ; do
		USBTYPE=""
		INTERFACE=""
		. $uevent
		
					
		if [ -z "$INTERFACE" ]; then
			# this device might be gone
			continue
		fi
		
		case $INTERFACE in
		3/*/*)
			USBTYPE=3
		;;
		6/*/*)
			USBTYPE=6
		;;
		255/*/*)
			USBTYPE=255
		;;
		esac
		
		if [ -z "$USBTYPE" ]; then
			continue
		fi
		
		usb_devpath=`echo $uevent | sed 's/:[0-9]*.[0-9]*\/uevent$//g'`
		#echo -e "uevent=$uevent / usb_devpath=$usb_devpath"	 > /dev/console	

		if echo "$usb_devpath" | grep -q "1-[0-9]*" ; then
			DEV_BUSNUM=1
		elif echo "$usb_devpath" | grep -q "2-[0-9]*" ; then
			DEV_BUSNUM=2
		elif echo "$usb_devpath" | grep -q "3-[0-9]*" ; then
			DEV_BUSNUM=3
		elif echo "$usb_devpath" | grep -q "4-[0-9]*" ; then
			DEV_BUSNUM=4
		else
			continue
		fi
		
		USB_PHY_PORT=$(echo $usb_devpath | grep -o -E "[0-9]+\-[0-9]+" | awk -F '-' '{print $2}')
		#echo USB_PHY_PORT=$USB_PHY_PORT > /dev/console
		
		get_USB_LOGI_PORT_by_busnum_phy_port $DEV_BUSNUM $USB_PHY_PORT
		if [ -z "$USB_LOGI_PORT" ]; then
			continue
		fi
				
		USB_DEV=`ls ${usb_devpath}/usb_device 2>/dev/null | awk '{print $1}'`
		DEV_DEVNUM=$(cat $usb_devpath/devnum)
		#echo USB_DEV=$USB_DEV usb_type=$USBTYPE USB_LOGI_PORT=$USB_LOGI_PORT DEV_DEVNUM=$DEV_DEVNUM > /dev/console
				
		MANUFACTURER=$(cat $usb_devpath/manufacturer)
		PRODUCT=$(cat $usb_devpath/product)
		#echo MANUFACTURER=$MANUFACTURER PRODUCT=$PRODUCT > /dev/console
		
		VENDOR_ID=$(cat $usb_devpath/idVendor)
		PRODUCT_ID=$(cat $usb_devpath/idProduct)
		
		#echo VENDOR_ID=$VENDOR_ID   PRODUCT_ID=$PRODUCT_ID > /dev/console
		
		if ! /usr/sbin/chk_usbdev -b $DEV_BUSNUM -d $DEV_DEVNUM; then
			#echo "$USB_DEV can not be opened!" > /dev/console
			continue;
		fi
		
		#echo -e "USBTYPE = $USBTYPE / USB_LOGI_PORT = $USB_LOGI_PORT / USB_PHY_PORT  = $USB_PHY_PORT"


		case $USBTYPE in
		3)
			# HID, might be a UPS
			# delagate UPS flow to ups_action.sh
			
			# filter out explicit mouse, keyboard, joystick devices
			if ! echo "$PRODUCT" | grep -q -i -e "mouse" -e "keyboard" -e "joystick" ; then
				ups_in=1
			else
				fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
				check_usb_led add
			fi
			
		;;
		6)
			# insert this usb device to MTP device
			TMPDC_PATH=$(expr match "$uevent" '\(.*\)[^/uevent]*/uevent')
			TMPDC_PATH=`readlink $TMPDC_PATH`
			export DEVPATH=$TMPDC_PATH
				
			insert_mtp_to_usbdev_db
			
			image_in=1
			
			/usr/sbin/prtrscan -p > /dev/null
			touch /tmp/dc_in
			#mtp_share -a add
			mtp_backup -I
			MTP_BACKUP_AUTO=`xmldbc -g /download_mgr/mtp_backup/automatic`
			if [ "$MTP_BACKUP_AUTO" == "1" ]; then
				mtp_backup
			fi
			
			export DEVPATH=""
		;;
		255)
			TMPDC_PATH=$(expr match "$uevent" '\(.*\)[^/uevent]*/uevent')
			TMPDC_PATH=`readlink $TMPDC_PATH`
			export DEVPATH=$TMPDC_PATH
			#Try to get if it may a Camera .
			if [ "$USB_PHY_PORT" = 1 ]; then
				mtp_backup -c -i usb2
				PPPING=$?
			elif [ "$USB_PHY_PORT" = 2 ]; then
				mtp_backup -c -i usb1
				PPPING=$?
			fi

			if [ "$PPPING" = 1 ]; then
				mtp_backup -I
				MTP_BACKUP_AUTO=`xmldbc -g /download_mgr/mtp_backup/automatic`
				if [ "$MTP_BACKUP_AUTO" == "1" ]; then 
					mtp_backup
				fi
				
				insert_mtp_to_usbdev_db
			else
				if [ "$vdr_printer_in" = "0" ]; then
					# try to apply the ups driver
					ups_in=1
				fi
			fi
			
			export DEVPATH=""
		;;
		esac
		
	done
	
	# Because we can not exactly know which device will be bringged up by the NUT module,
	# handle the UPS device here
	if [ "$ups_in" = "1" ]; then
		#echo " It might be an UPS, run the ups_action.sh... " > /dev/console
		/usr/sbin/ups_action.sh add > /dev/null
		
		# sleep to wait something is ready
		sleep 1
		if [ -e /tmp/upsin ]; then	
			# an ups is working, find which usbdev runs in ups driver
			if [ -e /var/state/ups/usbhid-ups-usbhid.pid ]; then
				UPS_DRIVER="usbhid-ups"
				UPS_NAME="usbhid"
			elif [ -e /var/state/ups/blazer_usb-megatec.pid ]; then
				UPS_DRIVER="blazer_usb"
				UPS_NAME="megatec"
			elif [ -e /var/state/ups/bcmxcp_usb-bcmxcp.pid ]; then      
				UPS_DRIVER="bcmxcp_usb"
				UPS_NAME="bcmxcp"
			elif [ -e /var/state/ups/tripplite_usb-tripplite.pid ]; then
				UPS_DRIVER="tripplite_usb"
				UPS_NAME="tripplite"
			else
				#================================================
				#	we can't find PID_FILE , driver load false .
				#================================================
				UPS_DRIVER=""
				fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
				check_usb_led add
				
				#remove the guard flag
				if [ -e /tmp/do_printer_ups_pid ]; then
					rm /tmp/do_printer_ups_pid
				fi
			fi
			
			# the hint to know which usbdev is with UPS driver:
			# driver==usbfs, vendorid,productid from upsc
			ups_product_id=$(upsc ${UPS_NAME}@localhost ups.productid)
			ups_vendor_id=$(upsc ${UPS_NAME}@localhost ups.vendorid)
			
			for uevent in /sys/bus/usb/devices/*-*:*\.*/uevent ; do
				DRIVER=""
				. $uevent
				
				if [ "$DRIVER" = "usbfs" ]; then
					usb_devpath=`echo $uevent | sed 's/:[0-9]*.[0-9]*\/uevent$//g'`
				
					VENDOR_ID=$(cat $usb_devpath/idVendor)
					PRODUCT_ID=$(cat $usb_devpath/idProduct)
					
					#echo VENDOR_ID=$VENDOR_ID   PRODUCT_ID=$PRODUCT_ID > /dev/console
					
					if [ -n "$ups_vendor_id" ]; then
						if [ "$ups_vendor_id" != "$VENDOR_ID" ]; then
							#echo "UPS vendor id not matched!" > /dev/console
							continue
						fi
					fi
					
					if [ -n "$ups_product_id" ]; then
						if [ "$ups_product_id" != "$PRODUCT_ID" ]; then
							#echo "UPS product id not matched!" > /dev/console
							continue
						fi
					fi
					
					# okay, got the ups device
					
					if echo "$usb_devpath" | grep -q "1-[0-9]*" ; then
						DEV_BUSNUM=1
					elif echo "$usb_devpath" | grep -q "2-[0-9]*" ; then
						DEV_BUSNUM=2
					elif echo "$usb_devpath" | grep -q "3-[0-9]*" ; then
						DEV_BUSNUM=3
					elif echo "$usb_devpath" | grep -q "4-[0-9]*" ; then
						DEV_BUSNUM=4
					else
						continue
					fi
					
					USB_PHY_PORT=$(echo $usb_devpath | grep -o -E "[0-9]+\-[0-9]+" | awk -F '-' '{print $2}')
					#echo USB_PHY_PORT=$USB_PHY_PORT > /dev/console
					
					get_USB_LOGI_PORT_by_busnum_phy_port $DEV_BUSNUM $USB_PHY_PORT
					if [ -z "$USB_LOGI_PORT" ]; then
						continue
					fi
					
					USB_DEV=`ls ${usb_devpath}/usb_device 2>/dev/null | awk '{print $1}'`
					#echo USB_DEV=$USB_DEV USB_LOGI_PORT=$USB_LOGI_PORT > /dev/console
					
					MANUFACTURER=$(cat $usb_devpath/manufacturer)
					PRODUCT=$(cat $usb_devpath/product)
					#echo MANUFACTURER=$MANUFACTURER PRODUCT=$PRODUCT > /dev/console
					
					insert_ups_to_usbdev_db
					#insert_ups_to_flash_db
					
					# we only need one UPS
					break
				fi
				
			done
			
		fi
	fi
	
	#remove the guard flag
	if [ -e /tmp/do_printer_ups_pid ]; then
		rm /tmp/do_printer_ups_pid
	fi
	
	exit 0
;;


add)
	# this step make sure the shell script
	# not in racing condition .
	wait_for_check_pid
	
	if ! chk_usbdev_db_exist ;then
		start_usbdev_db
	fi
	
	#env > /dev/console
	
	USB_DEV=$MDEV
	dev_sys_path="/sys$DEVPATH"
	dev_sys_dev_path="$dev_sys_path/device"
	
	DEV_BUSNUM=$(cat $dev_sys_dev_path/busnum)
	DEV_DEVNUM=$(cat $dev_sys_dev_path/devnum)
	if [ -z "$DEV_DEVNUM" -o -z "$DEV_BUSNUM" ]; then
		# this device might be gone
		exit 0
	fi


	USB_PHY_PORT=$(echo $dev_sys_path | grep -o -E "[0-9]+\-[0-9]+" | awk -F '-' '{print $2}')
	#echo USB_PHY_PORT=$USB_PHY_PORT > /dev/console
	
	get_USB_LOGI_PORT_by_busnum_phy_port $DEV_BUSNUM $USB_PHY_PORT
	
	MANUFACTURER=$(cat $dev_sys_dev_path/manufacturer)
	PRODUCT=$(cat $dev_sys_dev_path/product)
	
	#echo USB_LOGI_PORT=$USB_LOGI_PORT devnum=$DEV_DEVNUM> /dev/console
	#echo MANUFACTURER=$MANUFACTURER   PRODUCT=$PRODUCT > /dev/console
	
	VENDOR_ID=$(cat $dev_sys_dev_path/idVendor)
	PRODUCT_ID=$(cat $dev_sys_dev_path/idProduct)
	
	#echo VENDOR_ID=$VENDOR_ID   PRODUCT_ID=$PRODUCT_ID > /dev/console
	
	ups_in=0
	ups_usbhid=0
	image_in=0
	printer_in=0
	vendordef_in=0
	printer_usbinf=""
	for inf_dirpath in "$dev_sys_dev_path"/*-*:*\.*; do
	
		inf_class=$(cat $inf_dirpath/bInterfaceClass)
		
		#echo inf_dirpath=$inf_dirpath > /dev/console
		#echo inf_class=$inf_class > /dev/console		
		
		case $inf_class in
		03)
			#HID; UPS
			#echo "Get HID interface ..." > /dev/console
			USBTYPE=3
			# filter out explicit mouse, keyboard, joystick devices
			if ! echo "$PRODUCT" | grep -q -i -e "mouse" -e "keyboard" -e "joystick" ; then
				#echo "this device might be an UPS" > /dev/console
				ups_in=1
				ups_usbhid=1
			else
				fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
				check_usb_led add
			fi
		;;
		06)
			#IMAGE
			USBTYPE=6
			image_in=1
		;;
		ff)
			#VENDOR DFEINED
			USBTYPE=255
			vendordef_in=1
			# Get the first vendor device
			if [ -z "$vendordef_usbinf" ]; then
				vendordef_usbinf=$inf_dirpath
			fi
		;;
		08)
			#For USB CD-ROM
			#echo $inf_dirpath > /dev/console
			infsubclass=$(cat $inf_dirpath/bInterfaceSubClass)
			bMaxSize=$(cat $inf_dirpath/../bMaxPacketSize0)
			#echo $infsubclass > /dev/console
			#echo $bMaxSize > /dev/console
			# Get the first vendor device
			if [ "$infsubclass" = 02 ] && [ "$bMaxSize" = 64 ]; then
				fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
				check_usb_led add
			fi
		;;
		07)
			#For USB Print, we should not support.
			if [ "$vendordef_in" = 1 ]; then
				fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
				check_usb_led add
			fi
		;;
		*)
			#NOT SUPPORT
			USBTYPE=""
			continue;
		;;
		esac
		
		#echo USBTYPE=$USBTYPE > /dev/console
		
	done
	
	#echo "" > /dev/console
	if ! /usr/sbin/chk_usbdev -b $DEV_BUSNUM -d $DEV_DEVNUM; then
		#echo "$MDEV can not be opened!" > /dev/console
		exit 0
	fi
	
	if [ $image_in = 1 ]; then
		#echo "Get IMAGE device try to check ..." > /dev/console
		/usr/sbin/prtrscan -p > /dev/null
		
		touch /tmp/dc_in
		#usb_disk mtp add
		#mtp_share -a add
		mtp_backup -I
		MTP_BACKUP_AUTO=`xmldbc -g /download_mgr/mtp_backup/automatic`
		if [ "$MTP_BACKUP_AUTO" == "1" ]; then
			mtp_backup
		fi

		insert_mtp_to_usbdev_db

	fi
	
	if [ $vendordef_in = 1 ]; then
	#	echo -e "USB_PHY_PORT = $USB_PHY_PORT" > /dev/console
		#Try to apply the DC .
		if [ "$USB_PHY_PORT" = 1 ]; then
			mtp_backup -c -i usb2
			PPPING=$?
			#echo "mtp_backup -c -i usb2 -D > /dev/console" > /dev/console
		elif [ "$USB_PHY_PORT" = 2 ]; then
			mtp_backup -c -i usb1
			PPPING=$?
			#echo "mtp_backup -c -i usb1 -D > /dev/console" > /dev/console
		fi
		
		if [ "$PPPING" = 1 ]; then
			mtp_backup -I
			MTP_BACKUP_AUTO=`xmldbc -g /download_mgr/mtp_backup/automatic`
			if [ "$MTP_BACKUP_AUTO" == "1" ]; then 
				mtp_backup
			fi
				
			insert_mtp_to_usbdev_db
		else
			if [ "$vdr_printer_in" = "0" ]; then
				# try to apply the ups driver
				ups_in=1
			fi
		fi
	fi
	
	# we only accept one UPS
	# assume there is no printer+UPS product on the market
	if [ $ups_in = 1 -a ! -e /tmp/upsin -a $printer_in = 0 ]; then
		#echo " It might be an UPS; run the ups_action.sh... " > /dev/console
	#	if [ $ups_usbhid = 1 ]; then
			#ups comes with class 3 (hid) suggest to apply usbhid driver first
	#		sh /usr/sbin/ups_action.sh add "usbhid" > /dev/null
	#	else
			sh /usr/sbin/ups_action.sh add > /dev/null			#try ups when usb drive fails to work
	#	fi
		
		sleep 1 # sleep a while for something ready
		if [ -e /tmp/upsin ]; then
			if [ -e /var/state/ups/usbhid-ups-usbhid.pid ]; then
				UPS_DRIVER="usbhid-ups"
				UPS_NAME="usbhid"
			elif [ -e /var/state/ups/blazer_usb-megatec.pid ]; then
				UPS_DRIVER="blazer_usb"
				UPS_NAME="megatec"
			elif [ -e /var/state/ups/bcmxcp_usb-bcmxcp.pid ]; then      
				UPS_DRIVER="bcmxcp_usb"
				UPS_NAME="bcmxcp"
			elif [ -e /var/state/ups/tripplite_usb-tripplite.pid ]; then
				UPS_DRIVER="tripplite_usb"
				UPS_NAME="tripplite"
			else
				#================================================
				#	we can't find PID_FILE , driver load false .
				#================================================
				UPS_DRIVER=""
			fi
			
			if [ -n "$UPS_DRIVER" -a -n "$UPS_NAME" ]; then
				insert_ups_to_usbdev_db
				#insert_ups_to_flash_db
			fi
		else
			fireAlert -a 1120 -p "$VENDOR_ID,$PRODUCT_ID,unkown" -f
			check_usb_led add
		fi
	fi
	
	# remove the guard flag
	if [ -e /tmp/do_printer_ups_pid ]; then
		rm /tmp/do_printer_ups_pid
	fi
	exit 0
;;

remove)
	wait_for_check_pid
	
	USB_DEV=$MDEV
	
	xml_mtp_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_MTP_DEV_CNT)
	if [ $xml_mtp_cnt -gt 0 ]; then
		if remove_mtp_from_usbdev_db
		then
			xml_mtp_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_MTP_DEV_CNT)
			if [ $xml_mtp_cnt = 0 ]; then
				rm -f /tmp/dc_in
			fi
			# left led control for MTP device to usb_disk
			#usb_disk mtp remove
			#mtp_share -a del
			mtp_backup -I -r
		fi
	fi
	
	if [ -e /tmp/upsin ]; then
		# remove ups from usbdev db
		xmldb_ups_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_UPS_DEV_CNT)
		if [ $xmldb_ups_cnt -gt 0 ]; then
			if remove_ups_from_usbdev_db
			then
				xmldb_ups_cnt=$(xmldbc -S $MISC_USBINFO_SOCK_PATH -g $DBPATH_UPS_DEV_CNT)
				if [ $xmldb_ups_cnt = 0 ]; then
					sh /usr/sbin/ups_action.sh remove > /dev/null
					remove_ups_from_flash_db
				fi
			fi
		fi
	fi
	
	# remove the guard flag
	if [ -e /tmp/do_printer_ups_pid ]; then
		rm /tmp/do_printer_ups_pid
	fi

  check_usb_led remove
  
	exit 0
;;

*)
	echo "USB $ACTION event not supported"
	exit 1
;;

esac

exit 0
