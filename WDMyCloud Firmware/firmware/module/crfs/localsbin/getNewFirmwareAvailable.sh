#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# getNewFirmwareAvailable.sh <immediate> <send_alert>
#
# returns: 
#  "<name>" "<version>" "<description>" "<buildtime>" "<lastupdate time>"
# -OR-
# "no upgrade"
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/config/wd-nas.conf 2>/dev/null
. /usr/local/sbin/share-param.sh
. /etc/nas/alert-param.sh
. /etc/system.conf

#SYSTEM_SCRIPTS_LOG=${SYSTEM_SCRIPTS_LOG:-"/dev/null"}
## Output script log start info
#{ 
#echo "Start: `basename $0` `date`"
#echo "Param: $@" 
#} >> ${SYSTEM_SCRIPTS_LOG}
##
#{
#---------------------
# Begin Script
#---------------------

fw_update_file=/tmp/fw_update_info

if [ "$1" != "immediate" ]; then
	if [ -f ${fw_update_file} ]; then
		cat ${fw_update_file}
	else
		echo "\"no upgrade\""
	fi
	exit 0
fi

update_site=`cat /etc/fwupdate.conf`
model="${modelNumber}"
current_version=`cat ${VERSION_FILE}`

#curl -4 "http://websupport.wdc.com/firmware/list.asp?type=wdh1nc&fw=01.00.16" 2> /dev/null | awk '
curl -4 "${update_site}?type=${model}&fw=${current_version}" 2> /dev/null | awk '
BEGIN {
	found = -1;
}
{
	if ( match($0, "upgrade file" ) != 0 ) {
		found = 1;
		split($0, http, "\"");
		split(http[2], url, "/");
		for ( item in url ) count++;
		split(url[count], version, "-");
		major = substr(version[2], 1, 2);
		minor = substr(version[2], 3, 2);
		build = substr(version[2], 5, 2);
		printf("\"%s\" \"%s.%s.%s\" \"MyBookLive core firmware\"\n",version[1], major, minor, build);
		exit 0;
	}
	else if ( match($0, "no upgrade available" ) != 0 ) {
		found = 0;
	}

}
END {
	if (found == 0) {
		print "\"no upgrade\""
	}
	else if( found == -1 ) {
		print "\"error\""
	}
}
' > ${fw_update_file}

update=`cat ${fw_update_file}`

if [ "${update}" != "\"no upgrade\"" ]; then
	if [ "$2" == "send_alert" ]; then 
		if [ ! -f /etc/.fw_update_alert ]; then
			sendAlert.sh "${newFirmwareAvailable}"
		fi
		touch /etc/.fw_update_alert
	fi
else
	clearAlerts.sh ${newFirmwareAvailable}
fi

echo ${update}

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
