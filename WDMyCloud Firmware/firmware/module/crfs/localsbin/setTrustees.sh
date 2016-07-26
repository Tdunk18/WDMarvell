#!/bin/bash
#
# � 2011 Western Digital Technologies, Inc. All rights reserved.
#
# setTrustees.sh 
#
# Sets trustees file.  This generates additional list of denied users to private shares.
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
. /usr/local/sbin/share-param.sh
. /etc/system.conf

#SYSTEM_SCRIPTS_LOG=${SYSTEM_SCRIPTS_LOG:-"/dev/null"}
## Output script log start info
#{ 
#echo "Start: `basename $0` `date`"
#echo "Param: $@" 
#} >> ${SYSTEM_SCRIPTS_LOG}
##
#{


TRUSTEES_MOD=/tmp/trustees.mod
TMP_FILE=`mktemp`

echo "" > ${TMP_FILE}
echo "###DENY LIST" >> ${TMP_FILE}
#---------------------
# Begin Script
#---------------------
while read line; do
	if [ "${line:0:4}" == "#usb" ] || [ "${line:0:1}" != "#" -a "${line}" != ""  ]; then
		share_path=`echo $line | awk -F: '{print $1}'`
		share_name=`echo $share_path | awk -F/ '{print $NF}'`
		is_private=`echo $line | awk -F: '{if (!( $2 =="*" && $3 == "RWBEX" )) {print "true";} else {print "false";}}'`
		if [ "${is_private}" == "true" ] && [ "${share_name}" != "shares" ] && [ "${share_name}" != "backup" ]; then
			# get all users not previously listed, and list in "deny" list
			echo -n "${share_path}"
			
			# deny guest user (nfs uses this)
			echo -n ":guest:DRWBEX"
			
			#  deny read-only users from write
			getAcl.sh ${share_name} RO > /tmp/ro_user_list
			while read user; do
				echo -n ":${user}:DW"
			done < /tmp/ro_user_list
			
			# Deny all other users
			getAcl.sh ${share_name} RW > /tmp/user_list
			cat /tmp/ro_user_list >> /tmp/user_list
			getUsers.sh > /tmp/full_user_list
			while read user; do
				grep -x -q $user /tmp/user_list
				if [ $? -ne 0 ]; then
					echo -n ":${user}:DRWBEX"
				fi
			done < /tmp/full_user_list
			echo ":*:CU"
		fi
	fi
done < ${trustees} >> ${TMP_FILE}

echo "" >> ${TMP_FILE}
echo "### USB DEVICE LIST" >> ${TMP_FILE}
while read line; do
	if [ "${line:0:4}" == "#usb" ]; then
		echo $line | awk -F: '
		{
			gsub("#usb","",$0);
			split($1,dev,"]");
			printf("%s]/",dev[1]);
			for(i=2;i<=NF;i++) printf(":%s",$i);
			printf("\n");
		}
		'
	fi
done < ${trustees} >> ${TMP_FILE}


cp ${trustees} ${TRUSTEES_MOD}
cat ${TMP_FILE} >> ${TRUSTEES_MOD}
settrustees -f ${TRUSTEES_MOD}

rm ${TMP_FILE}

#---------------------
# End Script
#---------------------
## Copy stdout to script log also
#} # | tee -a ${SYSTEM_SCRIPTS_LOG}
## Output script log end info
#{ 
#echo "End:$?: `basename $0` `date`" 
#echo ""
#} >> ${SYSTEM_SCRIPTS_LOG}


