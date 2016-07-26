#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getVolumeStatus.sh 
#
# at least one volume over MAX_USAGE_THRESH -> bad

#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

#---------------------
# Begin Script
#---------------------

MAX_USAGE_THRESH=95

# MIN_USAGE_THRESH=93

# testFreeSpace() {
        # if [ "$1" != "" ]; then
			# FreeSpaceUsed1=`df | grep ${1} | awk '{printf("%.0f\n", ($3*100/$2 +1))}'`
			# if [ "${FreeSpaceUsed1}" -gt "${MAX_USAGE_THRESH}" ]; then
				# FreeSpaceStatus="bad"
			# fi
        # fi
        # if [ "$2" != "" ]; then
			# FreeSpaceUsed2=`df | grep ${2} | awk '{printf("%.0f\n", ($3*100/$2 +1))}'`
			# if [ "${FreeSpaceUsed2}" -gt "${MAX_USAGE_THRESH}" ]; then
				# FreeSpaceStatus="bad"
			# fi
        # fi
        # if [ "$3" != "" ]; then
			# FreeSpaceUsed3=`df | grep ${3} | awk '{printf("%.0f\n", ($3*100/$2 +1))}'`
			# if [ "${FreeSpaceUsed3}" -gt "${MAX_USAGE_THRESH}" ]; then
				# FreeSpaceStatus="bad"
			# fi
        # fi
        # if [ "$4" != "" ]; then
			# FreeSpaceUsed4=`df | grep ${4} | awk '{printf("%.0f\n", ($3*100/$2 +1))}'`
			# if [ "${FreeSpaceUsed4}" -gt "${MAX_USAGE_THRESH}" ]; then
				# FreeSpaceStatus="bad"
			# fi
        # fi
        # echo $FreeSpaceStatus
# }

testFreeSpace() {
		for hd_f in $*; do
			if [ "${hd_f}" != "" ]; then
				FreeSpaceUsed=`df | grep ${hd_f} | sed 's/%//g' | awk '{print $5}'`	# calculate volume used percentage
				if [ "${FreeSpaceUsed}" -gt "${MAX_USAGE_THRESH}" ]; then
					FreeSpaceStatus="bad"
				fi
			fi
		done
		
        echo $FreeSpaceStatus
}

FreeSpaceStatus="good"
VolumeList=`cat /etc/shared_name | grep -v USB | awk 'BEGIN{ORS=" "}{print $3}' `	# find all volume except USB
TFSresult=`testFreeSpace $VolumeList`
echo $TFSresult

# if [ -f /tmp/freespace_failed ]; then
	# echo "bad"
# else
	# echo "good"
# fi

#---------------------
# End Script
#---------------------