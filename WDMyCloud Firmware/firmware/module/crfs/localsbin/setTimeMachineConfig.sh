#!/bin/bash
#
# � 2011 Western Digital Technologies, Inc. All rights reserved.
#
# setTimeMachine.sh <backupEnabled> <backupShare> <backupSizeLimit> <renameOnly>

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh

timeMachineConfig=/etc/nas/timeMachine.conf
tmpTmXml=/tmp/.timeMachine.xml
. $timeMachineConfig

createHdAfpXml(){
	local tmEnable=${1}
	local tmName=${2}
	local tmPath=`ls -l /shares/${tmName} | awk '{print $11}'`
	local tmQuota=${3}
	
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"	>  $tmpTmXml
	echo "<config>"										>> $tmpTmXml
	echo "  <TimeMachine>"								>> $tmpTmXml
	echo "    <count>1</count>"							>> $tmpTmXml
	echo "    <item>"									>> $tmpTmXml
	echo "      <name>${tmName}</name>"					>> $tmpTmXml
	echo "      <path>${tmPath}</path>"					>> $tmpTmXml
	echo "      <smbShareName>${tmName}</smbShareName>"	>> $tmpTmXml
	echo "      <isTMLimited>${tmEnable}</isTMLimited>"	>> $tmpTmXml
	echo "      <tmQuota>${tmQuota}</tmQuota>"			>> $tmpTmXml
	echo "    </item>"									>> $tmpTmXml
	echo "  </TimeMachine>"								>> $tmpTmXml
	echo "</config>"									>> $tmpTmXml

}

isUSB(){
	local sharePath=${1}
	local keyWord=${sharePath:5:3}	# /mnt/USB -> USB;   /mnt/HD/HD_a2 -> HD/
	[ "$keyWord" == "USB" ] && echo "yes" || echo "no"
}

saveXmlToHiddenByShareName(){
	local vol=`ls -l /shares/${1} | awk '{print $11}'`
	local adsEnabled=`xmldbc -g '/system_mgr/samba/ads_enable'`
	[ "$adsEnabled" == "1" ] &&	xmlFileName='.timeMachineAds.xml' || xmlFileName='.timeMachine.xml'
	
	local isUsbFlag=$(isUSB $vol)
	if [ "$isUsbFlag" == "yes" ]; then
		mv -f ${tmpTmXml} ${vol}/${xmlFileName}
	else
		local vBase=${vol:0:13}		#ex: /mnt/HD/HD_a2
		local vDevice=`cat /etc/mtab | grep $vBase | awk '{print $1}'`		#ex: /dev/sda2
    # 20150209, Brian modify for RAID, linear, and encryption case
    moveToHidden $vDevice
    # 20150209, end Brian modify
	fi
	sync
}

delAllTmXml(){
	local adsEnabled=`xmldbc -g '/system_mgr/samba/ads_enable'`
	[ "$adsEnabled" == "1" ] &&	xmlFileName='.timeMachineAds.xml' || xmlFileName='.timeMachine.xml'
	for idx_HD in `ls /mnt | grep HD_`; do 
		rm -f /mnt/$idx_HD/.systemfile/P2/$xmlFileName
    # 20150212, Brian modify for remove all .timemachine.xml file 
		rm -f /mnt/$idx_HD/.systemfile/P3/$xmlFileName
    # 20150212, end Brian modify
	done
	for idx_USB in `ls /mnt/USB`; do 
		rm -f /mnt/USB/$idx_USB/$xmlFileName
	done
}

# 20150212, Brian modify for refer getDataLocationByVolume and saveToRaidHidden function in libshare.so
# refer to getDataLocationByVolume function
moveToHidden(){
  local devicePoint=$1
  
  if [ ${devicePoint:0:12} == "/dev/mapper/" ]; then  # remove mapper word
    local tmpLength=`expr length $devicePoint`
    tmpLength=`expr $tmpLength - 12`
    devicePoint=`echo /dev/${devicePoint:12:tmpLength}`
  fi
  
  # Check its raid state and find mapping hidden partition
  if [ ${devicePoint:0:7} == "/dev/md" ]; then  # raid device, we need to find the mapping hidden partition by parsing /proc/mdstat
    moveToRaidHidden ${devicePoint}
  else  # not raid device, so we don't need to check it in /proc/mdstat file
    local deviceSymbol=${devicePoint:7:1}
    local hiddenFolder=/mnt/HD_${deviceSymbol}4/.systemfile/P2/
    
    if [ ! -d $hiddenFolder ]; then
      mkdir ${hiddenFolder}
    fi
    cp -f ${tmpTmXml} ${hiddenFolder}${xmlFileName}   
  fi
  
  rm -f ${tmpTmXml}
}

# refer to saveToRaidHidden function
moveToRaidHidden() {
    local devicePoint=$1
    
    local isLinear=0
    
    local raid10Dev=$devicePoint
    local isRaid10=0
    
    mdadm --detail ${devicePoint} | while read line; do
      local lineLinear=`echo $line | grep "Raid Level : linear"`
      test -n "${lineLinear}" && isLinear=1 && continue
      
      local lineHDD=`echo "$line" | grep -o "/dev/sd.*"`
      
      if [ "${lineHDD:0:7}" == "/dev/sd" ]; then
        local deviceSymbol=${lineHDD:7:1}
        if [ $isLinear == 1 ]; then
          local hiddenFolder=/mnt/HD_${deviceSymbol}4/.systemfile/P3/
        else
          local hiddenFolder=/mnt/HD_${deviceSymbol}4/.systemfile/P2/
        fi
        
        if [ ! -d $hiddenPath ]; then
          mkdir ${hiddenFolder}
        fi
        cp -f ${tmpTmXml} ${hiddenFolder}${xmlFileName}
        
        if [ $isLinear == 1 ]; then
          break
        else
          continue
        fi
      fi
      
      local Raid10=`echo "$line" | grep "/dev/md" | grep -v ":"`
      if [ "${Raid10}" != "" ]; then
        isRaid10=1
        raid10Dev=`echo "$line" | grep -o "/dev/md.*"`
        raid10Dev=`echo ${raid10DevicePoint:0:8}`
        break
      fi
    done
    
    if [ $isRaid10 == 1 ]; then
      moveToRaidHidden ${raid10Dev}
    fi
}
# 20150212, end Brian modify

# Possible errors

ERROR_INCORRECT_ARGUMENT_COUNT=1
ERROR_SHARE_DOES_NOT_EXIST=2
ERROR_UNABLE_TO_CREATE_TIME_MACHINE_DIRECTORY=3
ERROR_UNABLE_TO_CONFIGURE_TIME_MACHINE_DIRECTORY=4

# If the correct number of arguments were not provided, fail the request and show the proper usage.
# Although three arguments must be given, an empty string indicates an unchanged/unspecified parameter.

if [ $# -lt 3 ]; then
	echo "usage: setTimeMachine.sh <backupEnabled> <backupShare> <backupSizeLimit> <renameOnly>"
	exit $ERROR_INCORRECT_ARGUMENT_COUNT
fi

newBackupEnabled="$1"
newBackupShare="$2"
newBackupSizeLimit="$3"
renameOnly="$4"
createBackupDirectory="false"

# If a new "backup enabled" value was specified, assign the new value.
if [ ! -z "$newBackupEnabled" ] && [ "$newBackupEnabled" != "$backupEnabled" ]; then
    backupEnabled=$newBackupEnabled
fi

# If a new time machine share was specified, assign the new value.
if [ ! -z "$newBackupShare" ] && [ "$newBackupShare" != "$backupShare" ]; then
    if [ "$renameOnly" != "true" ]; then
        createBackupDirectory="true"
    fi
    backupShare=$newBackupShare
fi

# If "backup size limit" was specified, assign the new value.
if [ ! -z "$newBackupSizeLimit" ]; then
    backupSizeLimit=$newBackupSizeLimit
fi

# If a new backup share has been specified
if [ $createBackupDirectory == "true" ]; then
    if [ ! -d "/shares/$newBackupShare" ]; then
        exit $ERROR_SHARE_DOES_NOT_EXIST
    fi
fi

# Update the time machine config file, then generate the AFP and netatalk config files.  Restart
# the MDNS responsder service so the changes get acted on
echo "backupEnabled=\"$backupEnabled\"" 	> 	${timeMachineConfig}
echo "backupShare=\"$backupShare\"" 		>>	${timeMachineConfig}
echo "backupSizeLimit=\"$backupSizeLimit\""	>>	${timeMachineConfig}

# write & save config.xml
afpEnabled=`xmldbc -g '/system_mgr/afp/enable'`

if [ "$backupEnabled" == "true" ]; then
    	if [ ! -d "/shares/$newBackupShare" ]; then
        	exit $ERROR_SHARE_DOES_NOT_EXIST
    	fi

	xmldbc -s '/backup_mgr/time_machine/enable' 1
	[ "$afpEnabled" == "0" ] && xmldbc -s '/system_mgr/afp/enable' 1
else
	xmldbc -s '/backup_mgr/time_machine/enable' 0
fi
xmldbc -D /etc/NAS_CFG/config.xml
cp -f /etc/NAS_CFG/config.xml /usr/local/config/


# restart service
avahi_tm_serv --tm_delall >/dev/null

if [ "$backupEnabled" == "true" ]; then
	delAllTmXml
	createHdAfpXml "1" "$backupShare" "$backupSizeLimit"
	saveXmlToHiddenByShareName "$backupShare"
fi

afpcom >/dev/null
smbcom >/dev/null
[ "$backupEnabled" == "true" ] && avahi_tm_serv --tm_start >/dev/null
[ "$afpEnabled" == "0" ] &&	afp restart >/dev/null

exit 0

