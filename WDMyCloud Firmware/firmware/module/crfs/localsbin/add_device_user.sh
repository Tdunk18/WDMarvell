#!/bin/sh                                                                                           
#                                                                                                   
# add_device_user.sh <username> <isemail> <email_address|mobile_app_name> <device_user_id>                                                                         
#                                                                                                   
# Script to notify when a device user is created via the REST API
#
# Parameters: <username> - local Linux username         
#             <isemail> - true if email device_user, else false
#             <email_address> - email address for email device_user
#             <mobile_app_name> - name of mobile application for mobile device user (may be empty)                                                    
#             <device_user_id> - unique ID for device_user 
#                                                 
#                                                 
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

username="$1"
isemail=`echo $2 | tr "[:upper:]" "[:lower:]"`
device_user_id="$4"

if [ "$isemail" == "true" ];then
   email_address="$3"
   chfn -o "$email_address" "$username"
   access_mtd 'cp /etc/passwd /usr/local/config/passwd'
   account
elif [ "$isemail" == "false" ];then
   mobile_app_name="$3" 
fi



