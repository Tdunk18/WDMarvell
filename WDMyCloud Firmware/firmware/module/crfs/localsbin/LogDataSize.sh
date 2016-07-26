#!/bin/bash

# set -x

#LogDataSize.sh
# 
#
# this script use WDlog to log data size for each volume and inode usage of each file systems.
#                  

PATH=/sbin:/bin/:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
TMP_FILE=/var/log/wd_a.tmp

# match of whitelist is OK to print entire mountpoint
mtPt_whiteList="^/run$|^/run/lock$|^/dev/$|^/run/shm$|^/tmp$|^/var/log$|^/$|^/DataVolume$|^/mnt/USB/USB|^/usr/local/config$|^/usr/local/modules$|^/mnt$|^/mnt/HD_|^/mnt/HD/"
# Black list mount points
mtPt_blackList="^/nfs/|^/CacheVolume$|^/var/log.hdd$|^/sys/fs/cgroup$"
# Any mount points in "Greylist" will hash out the remaining expression 
mtPt_greyList="(^/var/media/|^/media/WDSAFE/)(.*)"

# match of filesystem whitelist 
fs_whiteList="^ramlog-tmpfs$|^/dev/|^tmpfs$|^rootfs$|%root%$|^mdev$|^ubi0:config$"
# Black list filesystems
fs_blackList=""
# Any fs in "Greylist" will hash out the remaining expression 
fs_greyList=""


# Filter path to hash any user volume names
## filterPath <expression> <whiteList> <blackList> <greyList>
## returns filteredPath in stdout
filterPath()
{
    path=$1
    whiteList=$2
    blackList=$3
    greyList=$4
    if [ ! -z ${blackList} ] && [[ $path =~ ${blackList} ]]; then
        echo ""
    elif [ ! -z ${whiteList} ] && [[ $path =~ ${whiteList} ]]; then
        echo $path
    elif [ ! -z ${greyList} ] && [[ $path =~  ${greyList} ]]; then
        hash=`echo -n ${path} | openssl md5 | awk '{print $2}'`
        echo "${hash}${BASH_REMATCH[1]}"
    else
        hash=`echo -n ${path} | openssl md5 | awk '{print $2}'`
        echo "${hash}"
    fi
}

# log space usage per volumes 
log_vol_datasize()
{		
	# log data usage for non-root and tmpfs
	df -kP | egrep -v "Filesystem" > $TMP_FILE

	while read v_partition v_capacity v_total v_avail v_used_percent_raw v_mountpoint; do
        mtPt=$(filterPath "$v_mountpoint" "$mtPt_whiteList" "$mtPt_blackList" "$mtPt_greyList")
        [ -z "$mtPt" ] && continue
        
        partition=$(filterPath "$v_partition" "$fs_whiteList" "$fs_blackList" "$fs_greyList")
        [ -z "$partition" ] && continue
        
		wdlog -s BaseOSlog -l INFO -m dataSize mountPoint:string=$mtPt capacityK:longlong=$v_capacity totalK:longlong=$v_total partition:string=$partition 
		if [ $? != 0 ]; then
			echo "WDlog dataSize-2 failed"
		fi
	done < $TMP_FILE 
}

# log inode usage per file system 
log_fs_inode()
{		
	df -i | egrep -v "Inode" > $TMP_FILE
			
	while read v_fs v_icapacity v_iused v_ifree v_iused_percent_raw v_mountpoint; do
        mtPt=$(filterPath "$v_mountpoint" "$mtPt_whiteList" "$mtPt_blackList" "$mtPt_greyList")
        [ -z "$mtPt" ] && continue
        
        fs=$(filterPath "$v_fs" "$fs_whiteList" "$fs_blackList" "$fs_greyList")
        [ -z "$fs" ] && continue
        
		wdlog -s BaseOSlog -l INFO -m inodeUsage filesystem:string=$fs inode:int=$v_icapacity iused:int=$v_iused mountPoint:string=$mtPt
		if [ $? != 0 ]; then
			echo "WDlog inodeUsage-1 failed"
		fi
	done < $TMP_FILE 	 
}

get_storage_usage()
{
    
	local_url=""http://127.0.0.1/api/2.1/rest/storage_usage""
	storage_usage=$(curl ${local_url} 2>/dev/null)

    http_response=$(curl -s -w %{http_code} ${local_url} -o ${TMP_FILE})
    if [ ${http_response} != 200 ]; then
		echo "WDlog get_storage_usage failed"
		exit 1
	fi

	v_capatcity=$(cat ${TMP_FILE} | grep -o '<storage_usage>.*</storage_usage>' | sed 's/\(<storage_usage>\|<\/storage_usage>\)//g')
	v_total=$(cat ${TMP_FILE} | grep -o '<usage>.*</usage>' | sed 's/\(<usage>\|<\/usage>\)//g')
	v_video=$(cat ${TMP_FILE} | grep -o '<video>.*</video>' | sed 's/\(<video>\|<\/video>\)//g')
	v_photos=$(cat ${TMP_FILE} | grep -o '<photos>.*</photos>' | sed 's/\(<photos>\|<\/photos>\)//g')
	v_music=$(cat ${TMP_FILE} | grep -o '<music>.*</music>' | sed 's/\(<music>\|<\/music>\)//g')
	v_other=$(cat ${TMP_FILE} | grep -o '<other>.*</other>' | sed 's/\(<other>\|<\/other>\)//g')
	
	# Log usage data with "longlong" type
	wdlog -s BaseOSlog -l INFO -m usageSize totalB:longlong=$v_total photos:longlong=$v_photos video:longlong=$v_video music:longlong=$v_music other:longlong=$v_other
		
	if [ $? != 0 ]; then
		echo "WDlog usageSize failed"
	fi

}


# main()
  
	# log space usage per volumes 
	  	log_vol_datasize
	
	# log inode usage per file system 
  	   	log_fs_inode

	# log storage usage per its category (video, musio, photo, others) 
  	   	get_storage_usage

	# remove temp. file
	if [ -f "$TMP_FILE" ]; then
		rm $TMP_FILE
	fi
