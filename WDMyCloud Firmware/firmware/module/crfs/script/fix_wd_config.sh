#!/bin/bash
#
# check cloudholders group, and 1.05,1.06 -> 2.0 fw
# add all user to cloudholders group
# 20150113.VODKA
######
PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
SAVE_PATH="/tmp/fix_wd_config"
DYNAMIC_PATH="/usr/local/config/dynamicconfig_config.ini"
print_f() {
	msg="$1"
	echo "$1" >> "$SAVE_PATH"
}
get_admins() {
	awk -F: '
	{
		if ($1 == "administrators") {
			print $4
		}
	}
	' /etc/group
}
get_user_list() {
	awk -F: '
	{
		if ($1 == "allaccount") {
			print $4
		}
	}
	' /etc/group
}
chk_user() {
	member=$1
	user=$2
	replace_member=`echo "$member" | sed 's/,/ /g'`
	
	echo $replace_member | grep -w "$user"
}

rm $SAVE_PATH
print_f "####fix_wd_config.sh start####"

#Add users to cloudholders ? 1.05 , 1.06 -> 2.00
update="$1"

#Check cloudholders group exists or not

awk '
BEGIN { 
	FS = ":"; RS = "\n";
}
{
	group = $1;
	if( group == "cloudholders" ) {
	  exit 1
	}
}
' /etc/group

if [ $? -eq 0 ];then
	print_f "Can't find cloudholders in group"
	addgroup -g "cloudholders"
	groupmod -g 2000 cloudholders
else
	print_f "Find cloudholders in group"
fi

#add admin to cloudholders group
print_f "======================"
print_f "1.add admins to clouholders"
admins=(`get_admins`)
admins_array=(`echo $admins | tr "," "\n"`)

#get admin list at first
admin_member=`cat /etc/group | grep cloudholders | cut -d: -f4`
print_f "[$admins]"
for admin in "${admins_array[@]}"
do
	#is_exist=`echo "$admin_member" | grep $admin`
	print_f "admin_name:[$admin]"
	is_exist=`chk_user "$admin_member" "$admin"`
	if [ -z "$admin_member" ] && [ -z "$is_exist" ]; then
		print_f "[$admin] is in cloudholders , don't add it"
		admin_member="$admin"
	elif [ ! -z "$admin_member" ] && [ -z "$is_exist" ]; then
		print_f "[$admin] is not in cloudholders , add it"
		admin_member=$admin_member,$admin
	fi
done

print_f "final admin_list:[$admin_member]"
account -m -g cloudholders -l "$admin_member"

print_f "======================"
#Add users to cloudholder
if [ "$update" == "update" ]; then
    print_f "2.add user to clouholders"
	users=(`get_user_list`)
	print_f "[$users]"
	users_array=(`echo $users | tr "," "\n"`)
	member_list=`cat /etc/group | grep cloudholders | cut -d: -f4`
	#member_list="$member"
	for user in "${users_array[@]}";do
		if [ "$user" == "nobody" ];then
			continue
		fi
		print_f "regular_user_name:[$user]"
		is_exist=`chk_user "$member_list" "$user"`
		#Add all user at once, create user list at first 
		if [ -z "$member_list" ] && [ -z "$is_exist" ]; then
			print_f "[$user] is in cloudholders , don't add it"
			member_list="$user"
		elif [ ! -z "$member_list" ] && [ -z "$is_exist" ]; then
			print_f "[$user] is not in cloudholders , add it"
			member_list="$member_list","$user"
		fi
	done
	print_f "final member_list:[$member_list]"
	account -m -g cloudholders -l $member_list
else
	print_f "Dont add user to clouholders"
fi

print_f "======================"
access_mtd "cp /etc/group /usr/local/config/"

print_f "3.Check dynamicconfig_config.ini in flash"

sed -i "s/SERVER_DOMAIN=\"\"//g" /usr/local/config/dynamicconfig_config.ini
sed -i "s/SERVER_DOMAIN=//g" /usr/local/config/dynamicconfig_config.ini

sed -i "s/TOTAL_SETTINGS=\"20\"/TOTAL_SETTINGS=\"19\"/g" /usr/local/config/dynamicconfig_config.ini
sed -i "s/TOTAL_SETTINGS=20/TOTAL_SETTINGS=19/g" /usr/local/config/dynamicconfig_config.ini
# sed -i 's/TOTAL_SETTINGS="19"/TOTAL_SETTINGS="20"/g' "$DYNAMIC_PATH"
# sed -i 's/TOTAL_SETTINGS=19/TOTAL_SETTINGS=20/g' "$DYNAMIC_PATH"

# SERVER_DOMAIN=`cat "$DYNAMIC_PATH" | grep SERVER_DOMAIN`
# if [ -z "$SERVER_DOMAIN" ]; then
	 # tail -c 1 /usr/local/config/dynamicconfig_config.ini | grep "^$"
	 # last_char=`echo $?`
	 # if [ "0" == "$last_char" ]; then
	     # echo "SERVER_DOMAIN=\"\"" >> "$DYNAMIC_PATH"
	 # else
		 # echo -e "\nSERVER_DOMAIN=\"\"" >> "$DYNAMIC_PATH"
	 # fi
# fi

print_f "####fix_wd_config.sh end####"