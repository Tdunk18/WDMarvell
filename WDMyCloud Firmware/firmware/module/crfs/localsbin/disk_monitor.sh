#!/bin/bash
# 2013.12.5 VODKA
#
# disk_monitor - Monitor disk activity, and put system into standby.  
##
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

drivelist=(/dev/sda /dev/sdb /dev/sdc /dev/sdd)
volumepoint=(/mnt/HD/HD_a2 /mnt/HD/HD_b2 /mnt/HD/HD_c2 /mnt/HD/HD_d2)

total_df_file=/tmp/dsk_size/total_df
file_path=/tmp/dsk_size
file_path_tmp=/tmp/dsk_size/tmp

# trigger tally (or share size) when df result changes by TALLY_TRIGGER_THRESH_KB
TALLY_TRIGGER_THRESH_KB=1000000
TALLY_TRIGGER_THRESH_BYTE=1000000000
#TALLY_TRIGGER_THRESH_KB=1
declare -i sleepcount
declare -i rootdisk_thresh

resetSleepCount() {
	sleepcount=0
	standby_time=10
	rootdisk_thresh=`expr $standby_time - 1`
	standby_enable="enabled"
}

checkDataVolume() {
		if [ "$cmd" == "debug" ];then 
			echo --checkDataVolume--
		fi
		result="trigger"
		declare -i total_vol_size=0
		declare -i total_ori_size=0
    for i in ${volumepoint[@]}; do
				map=`awk -v vol="$i" '{if ($2==vol) print $1}' /etc/mtab`
				if [ ! $map == "" ]; then
					map_base=`basename $map`
					vol_size=`df | grep $map_base | awk '{print $3}'`
					#save disk size to tmp folder
					echo $vol_size > "$file_path_tmp"/"$map_base"					
					
					total_vol_size=`expr $total_vol_size + $vol_size`
					#echo "$file_path"$map_base
					if [ -f "$file_path"/"$map_base" ]; then	
						#file exist , compare size
						ori_size=`cat "$file_path"/"$map_base"`
						total_ori_size=`expr $total_ori_size + $ori_size`
					else 
						#file doesn't exist , create it
						if [ "$cmd" == "debug" ];then 
							echo "$file_path"/"$map_base" not exist
						fi
					  echo $vol_size > "$file_path"/"$map_base"
					fi
				fi		
    done	
    result=`echo $total_vol_size | awk -v total_df=${total_ori_size} -v thresh=${TALLY_TRIGGER_THRESH_KB} '{x=$1 - total_df; abs_x=(x >= 0) ? x : -x ; if(abs_x >= thresh) printf("trigger")}'` 
		if [ "$result" == "trigger" ]; then
			if [ "$cmd" == "debug" ];then 
				echo total_vol_size=$total_vol_size
				echo total_ori_size=$total_ori_size
				echo -------Copy File size is more than 1G
			fi
			#copy disk size to /tmp/dsk_size form /tmp/dsk_size/tmp
			cp -rf $file_path_tmp/* $file_path/
			incUpdateCount.pm data_volume_write
		fi
}

checkVolume() {
		if [ "$cmd" == "debug" ];then 
			echo --checkVolume--
		fi		
		vol_size=`xmldbc -S /var/run/xmldb_sock_sysinfo -g /vols/total_used_size`
		ori_size=`cat $total_df_file`
		
		result=`echo $vol_size | awk -v total_df=${ori_size} -v thresh=${TALLY_TRIGGER_THRESH_BYTE} '{x=$1 - total_df; abs_x=(x >= 0) ? x : -x ; if(abs_x >= thresh) printf("trigger")}'`
		if [ "$result" == "trigger" ]; then
			if [ "$cmd" == "debug" ];then 
				echo vol_size=$vol_size
				echo ori_size=$ori_size
				echo -------File size is more than 1G
			fi
			#replace total size
			echo $vol_size > $total_df_file
			incUpdateCount.pm data_volume_write
		fi
}

reset_dsk_size() {
		echo Reset Disk Size.....
		rm -rf $file_path
		mkdir $file_path
		#create tmp for save disk size
		mkdir $file_path_tmp
    for i in ${volumepoint[@]}; do
				map=`awk -v vol="$i" '{if ($2==vol) print $1}' /etc/mtab`
				if [ ! $map == "" ]; then
					map_base=`basename $map`
					vol_size=`df | grep $map_base | awk '{print $3}'`
					echo $vol_size > "$file_path"/"$map_base"
				fi
		done
}

reset_dsk_total_size() {
		echo Reset Disk Size.....
		rm -rf $file_path	
		mkdir $file_path	
		vol_size=`xmldbc -S /var/run/xmldb_sock_sysinfo -g /vols/total_used_size`
		echo $vol_size > $total_df_file
}

#shell begin
echo Disk Monitor Run.....

cmd="${1}"

#let all disk size reset
#reset_dsk_size
reset_dsk_total_size

#create /tmp/dsk_size folder for save vol size
if [ ! -d $file_path ]; then
	mkdir $file_path
fi

while :; do
		#check every hdd mode
    for i in ${drivelist[@]}; do
        hdparm -C $i | grep -q "standby"
        standby_test=$?
        [ "$standby_test" -eq "1" ] && break
    done
		
    if [ "$standby_test" -eq "0" ]; then
    		#if all disk in standby mode , wait 5s and loop again
    		#echo all disk are standby mode
        sleep 5
        continue
    else
    
    	 resetSleepCount
			 # Calculate every disk w/r speed at first
			 io_datavol_1=`awk -v disk="sda" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
			 io_datavol_2=`awk -v disk="sdb" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
			 io_datavol_3=`awk -v disk="sdc" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
			 io_datavol_4=`awk -v disk="sdd" '{if ($3==disk) print $10 + $14}' /proc/diskstats`	
			 
			 #check r/w speed and decide df disk or not			 		 
       while :; do
          # Wait for 60 seconds
          sleep 60   	
					
					# Calculate every disk w/r speed
				  io_datavol2_1=`awk -v disk="sda" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
				  io_datavol2_2=`awk -v disk="sdb" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
				  io_datavol2_3=`awk -v disk="sdc" '{if ($3==disk) print $10 + $14}' /proc/diskstats`
				  io_datavol2_4=`awk -v disk="sdd" '{if ($3==disk) print $10 + $14}' /proc/diskstats`	
					if [ "$cmd" == "debug" ];then 
					echo =====disk speed start=====
					echo io_datavol_1 =$io_datavol_1
					echo io_datavol2_1=$io_datavol2_1	
					echo io_datavol_2 =$io_datavol_2
					echo io_datavol2_2=$io_datavol2_2	
					echo io_datavol_3 =$io_datavol_3
					echo io_datavol2_3=$io_datavol2_3	
					echo io_datavol_4 =$io_datavol_4
					echo io_datavol2_4=$io_datavol2_4	
					echo =====disk speed end=====		
					fi		
          #if [ "$io_datavol_1" != "$io_datavol2_1" ] || [ "$io_datavol_2" != "$io_datavol2_2" ] || [ "$io_datavol_3" != "$io_datavol2_3" ] || [ "$io_datavol_4" != "$io_datavol2_4" ]; then
            #check every hdd size
          	#checkDataVolume
          	checkVolume
          	#echo sleepcount=$sleepcount
          #fi
          
          if [ $((sleepcount)) -eq $((rootdisk_thresh)) ] && [ "$io_datavol_1" = "$io_datavol2_1" ] && [ "$io_datavol_2" = "$io_datavol2_2" ] && [ "$io_datavol_3" = "$io_datavol2_3" ] && [ "$io_datavol_4" = "$io_datavol2_4" ]; then
						sleepcount=$((sleepcount+1))
          elif [ $((sleepcount)) -lt $((rootdisk_thresh)) ] && [ "$io_datavol_1" = "$io_datavol2_1" ] && [ "$io_datavol_2" = "$io_datavol2_2" ] && [ "$io_datavol_3" = "$io_datavol2_3" ] && [ "$io_datavol_4" = "$io_datavol2_4" ]; then
          	sleepcount=$((sleepcount+1))
	        else
	        	resetSleepCount
	        fi

          io_datavol_1=$io_datavol2_1
          io_datavol_2=$io_datavol2_2
          io_datavol_3=$io_datavol2_3
          io_datavol_4=$io_datavol2_4
          
          #check standby time is ready or not
          if [ "$standby_enable" == "enabled" ] && [ "$sleepcount" -eq "$standby_time" ]; then
						if [ "$cmd" == "debug" ];then          
						  echo "Enter standby mode"
						fi
          	sleep 5
          	break
          fi
       done
    fi    
done
