#!/bin/bash

CURL="curl --unix-socket /var/run/wdappmgr.sock"

function get_json() {
   if [ $# -ne 2 ]; then
       echo "Usage: getJsonVal 'json' 'key'";
       return;
   fi;
   echo "$1" | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["'$2'"]' ;
}

function install()
{
    b=
    copied_file=0
    if [ -f "$1" ]; then
        # use a temp copy
        cp -f $1 $1.tmp
	if [ "$?" = "0" ]; then
	    copied_file=1
	fi
	file_path=$1.tmp
	if [ "${1:0:1}" != "/" ]; then
	    file_path=`pwd`/$1.tmp
	fi
        b="{\"Method\":\"file\",\"PackagePath\":\"${file_path}\""
    elif [[ "$1" =~ "http" ]]; then
        b="{\"Method\":\"url\",\"PackagePath\":\"$1\""
    else
        echo "Invalid package path. Please specify app file path or http URL."
        exit 1
    fi

    if [ "$2" == "upgrade" ]; then
	b="${b},\"Upgrade\":1"
    fi
    b="${b}}"
    
    response=$(${CURL} -X POST -d "${b}" -w "\n\nSTATUS %{http_code}\nCONTENT_TYPE %{content_type}\n" "http://localhost/LocalApps" 2>/dev/null)
    echo "Response:"
    echo $response
    
    http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
    echo "HTTP Status: $http_status"
    content_type=$(echo "${response}" | grep "^CONTENT_TYPE" 2>/dev/null | awk '{print $2}')
    echo "CONTENT-TYPE: $content_type"
    
    if [ "$http_status" != "200" ]; then
        echo "Failed to install App"
	# clean up temp file if needed
	if [ "${copied_file}" = "1" ]; then
	    rm -f $1.tmp
	fi
        exit 1
    fi
    
    json_resp=$(echo "${response}" | sed '/^STATUS\|^CONTENT_TYPE/d')
	#echo "JSON: "
	#echo $json_resp
    bgtaskid=`get_json "${json_resp}" "BgTaskID"`
    echo "Background Task ID: $bgtaskid"
    
    # TODO: Query background task status
    while(true); do
	response=$(${CURL} -X GET -w "\n\nSTATUS %{http_code}\nCONTENT_TYPE %{content_type}\n" "http://localhost/BgTaskStatus?BgTaskID=${bgtaskid}" 2>/dev/null)
	http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    content_type=$(echo "${response}" | grep "^CONTENT_TYPE" 2>/dev/null | awk '{print $2}')
    echo "CONTENT-TYPE: $content_type"
    
    if [ "$http_status" != "200" ]; then
            echo "Failed to query App installation status"
            exit 1
	fi
    
	json_resp=$(echo "${response}" | sed '/^STATUS\|^CONTENT_TYPE/d')
	bgprogress=`get_json "${json_resp}" "Progress"`
	bgstatus=`get_json "${json_resp}" "Status"`
	if [ "${bgstatus}" = "FAILED" ]; then
	    echo "App installation failed"
	    exit 1
	elif [ "${bgstatus}" = "FINISHED" ]; then
	    echo "App install status: ${bgstatus}, progress: ${bgprogress}%"
	    echo "App installation completed"
	    exit 0
	else
	    echo "App install status: ${bgstatus}, progress: ${bgprogress}%"
	fi
	sleep 1
    done
}

function run()
{
	if [ "$1" == "" ]; then
		echo "Specify App name"
		exit 1
	fi
	
	b="{\"AppName\":\"$1\"}"
	response=$(${CURL} -X POST -d "${b}" -w "\n\nSTATUS %{http_code}\n" "http://localhost/ActiveApps" 2>/dev/null)
	echo "Response:"
    echo $response
	
    http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    if [ "$http_status" != "200" ]; then
        echo "Failed to run App"
        exit 1
    fi
}

function list()
{
    q=
    if [ "$1" != "" ]; then
        q="?AppName=$1"
    fi
    
    response=$(${CURL} -w "\n\nSTATUS %{http_code}\n" "http://localhost/LocalApps${q}" 2>/dev/null)
	#echo "Response:"
    #echo $response
	
	http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    if [ "$http_status" == "405" ]; then
        echo "App not found"
		exit 1
    fi
	
	json_resp=$(echo "${response}" | sed '/^STATUS/d')
	echo "${json_resp}" | python -m json.tool
}

function configure()
{
    if [ "$1" == "" ]; then
		echo "Specify App name"
		exit 1
    fi
    if [ "$2" == ""  ]; then
	        echo "Specify Auto start value"
		exit 1
    fi
    b="{\"AppName\":\"$1\",\"AutoStart\":$2}"
    response=$(${CURL} -X PUT -d "${b}" -w "\n\nSTATUS %{http_code}\nCONTENT_TYPE %{content_type}\n" "http://localhost/LocalApps" 2>/dev/null)
    echo $response
    http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    if [ "$http_status" != "200" ]; then
        echo "Failed to configure App"
        exit 1
    fi
}

function stop()
{
    if [ "$1" == "" ]; then
		echo "Specify App name"
		exit 1
	fi
	
	q="?AppName=$1"
	response=$(${CURL} -X DELETE -w "\n\nSTATUS %{http_code}\n" "http://localhost/ActiveApps${q}" 2>/dev/null)
	echo "Response:"
    echo $response
	
    http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    if [ "$http_status" != "200" ]; then
        echo "Failed to stop App"
        exit 1
    fi
}

#  delete $AppName [ $RemoveAppData=(0|1) ]
function delete()
{
    if [ "$1" == "" ]; then
		echo "Specify App name"
		exit 1
	fi
	
	q="?AppName=$1"
	if [ "$2" == "0" ]; then
		q=${q}\&RemoveAppData=0
	elif [ "$2" == "1" ]; then
		q=${q}\&RemoveAppData=1
	fi
		
	response=$(${CURL} -X DELETE -w "\n\nSTATUS %{http_code}\n" "http://localhost/LocalApps${q}" 2>/dev/null)
	echo "Response:"
    echo $response
	
    http_status=$(echo "${response}" | grep "^STATUS" 2>/dev/null | awk '{print $2}')
	echo "HTTP Status: $http_status"
    if [ "$http_status" != "200" ]; then
        echo "Failed to delete App"
        exit 1
    fi
}

function usage()
{
    echo "Usage: wdappmgr_cli.sh COMMAND [arg...]"
    echo
    echo "A command line interface for wdappmgr"
    echo
    echo "Commands:"
    echo
    echo "  install URL|PATH               install app package from http URL or path on filesystem"
    echo "  run APP_NAME                   starts the specified installed app"
    echo "  list [APP_NAME]                list all or the specified installed apps"
    echo "  configure APP_NAME AUTO_START  configure app"
    echo "  stop APP_NAME                  stop the specified installed app"
    echo "  delete APP_NAME                delete the specified installed app"
    echo
}

## Main

action=$1
shift

case $action in
    install)
    install "$@"
    ;;
    run)
    run "$@"
    ;;
    list)
    list "$@"
    ;;
    configure)
    configure "$@"
    ;;
    stop)
    stop "$@"
    ;;
    delete)
    delete "$@"
    ;;
    upgrade)
    install "$@" upgrade
    ;;
    *)
    echo "Invalid command"
    usage
    exit 1
    ;;
esac

