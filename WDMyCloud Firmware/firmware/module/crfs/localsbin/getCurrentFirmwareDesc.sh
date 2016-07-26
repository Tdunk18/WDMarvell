#!/bin/sh
#
# Modified by Alpha_Hwalock, for LT4A
#
# getCurrentFwDesc.sh 
#
# returns: 
#  "<name>" "<version>" "<description>" "<buildtime>" "<lastupdate time>"
#

#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
#. /usr/local/sbin/share-param.sh
#. /usr/local/sbin/disk-param.sh
#. /etc/nas/config/wd-nas.conf 2>/dev/null
#. /etc/system.conf 2>/dev/null

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


name=`xmldbc -g hw_ver`
version=`xmldbc -g sw_ver_1`
description="Core F/W"
buildtime=`xmldbc -g sw_ver_2 |
        awk -F. '
        {
                command = sprintf("date +%%s -d \"%s-%s-%s 00:00:00\"",
                        $5, substr($4, 1, 2), substr($4, 3, 2));
                command | getline res
                print res
        }
        '`
lastupdate=`cat /etc/version.update`

echo "\"${name}\" \"${version}\" \"${description}\" \"${buildtime}\" \"${lastupdate}\""

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