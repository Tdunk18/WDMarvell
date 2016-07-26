#!/bin/bash

## Initialize

## Section: Functions

usage()
{
	echo	
	echo "Usage: wd2go.sh [Options]"
	echo "A tool for managing wd2go server for Orion."
	echo
	echo "  -0, --stage10       Sets Orion for Staging10"
	echo "  -9, --stage9        Sets Orion for Staging9"
	echo "  -8, --stage8        Sets Orion for Staging8"
	echo "  -7, --stage7        Sets Orion for Staging7"
	echo "  -6, --stage6        Sets Orion for Staging6"
	echo "  -3, --wdtest3       Sets Orion for TestBed3"
	echo "  -t, --wdtest2a     Sets Orion for TestBed2a"
	echo "  -u, --wdtest2b     Sets Orion for TestBed2b"
	echo "  -v, --wdtest2c     Sets Orion for TestBed2c"
	echo "  -w, --wdtest2d     Sets Orion for TestBed2d"
	echo "  -b, --beta          Sets Orion for Beta"   
	echo "  -c, --betawebfiles  Sets Orion for Beta Webfiles"   
	echo "  -d, --stage6weba    Sets Orion for Staging6 Weba"
	echo "  -e, --wdtest1       Sets Orion for TestBed1"
	echo "  -f, --stage9weba    Sets Orion for Staging9 Weba"
	echo "  -p, --pro           Sets Orion for Production"
	echo "  -q, --proa          Sets Orion for ProductionA"
	echo 
	exit 0
}


doSetMVTestBed3()
{
CONFIG_STATUS="Test Bed 3 Staging Server:"
DISCOVERY_HOST="\/\/wdtest3discovery.wdtest3.com"
SERVER_HOST="wdtest3web.wdtest3.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetMVTestBed2a()
{
CONFIG_STATUS="Test Bed 2a Staging Server:"
DISCOVERY_HOST="\/\/wdtest2discovery.wdtest2.com"
SERVER_HOST="wdtest2weba.wdtest2.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetMVTestBed2b()
{
CONFIG_STATUS="Test Bed 2b Staging Server:"
DISCOVERY_HOST="\/\/wdtest2discovery.wdtest2.com"
SERVER_HOST="wdtest2webb.wdtest2.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetMVTestBed2c()
{
CONFIG_STATUS="Test Bed 2c Staging Server:"
DISCOVERY_HOST="\/\/wdtest2discovery.wdtest2.com"
SERVER_HOST="wdtest2webc.wdtest2.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetMVTestBed2d()
{
CONFIG_STATUS="Test Bed 2d Staging Server:"
DISCOVERY_HOST="\/\/wdtest2discovery.wdtest2.com"
SERVER_HOST="wdtest2webd.wdtest2.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetMVTestBed1()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/wdtest1discovery.wdtest1.com"
SERVER_HOST="wdtest1webfiles.wdtest1.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetBetaWebfiles()
{
CONFIG_STATUS="Beta Webfiles Server:"
DISCOVERY_HOST="\/\/betaweba.wd2go.com"
SERVER_HOST="betaweba.wd2go.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}



doSetStage10()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage10discovery.remotewd5.com"
SERVER_HOST="stage10web.remotewd5.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}



doSetStage9()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage9discovery.remotewd4.com"
SERVER_HOST="stage9web.remotewd4.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetStage9Weba()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage9weba.remotewd4.com"
SERVER_HOST="stage9weba.remotewd4.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetStage8()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage8discovery.remotewd3.com"
SERVER_HOST="stage8web.remotewd3.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetStage7()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage7discovery.remotewd2.com"
SERVER_HOST="stage7web.remotewd2.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}

doSetStage6()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage6discovery.remotewd1.com"
SERVER_HOST="stage6web.remotewd1.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetStage6Weba()
{
CONFIG_STATUS="Staging Server:"
DISCOVERY_HOST="\/\/stage6weba.remotewd1.com"
SERVER_HOST="stage6weba.remotewd1.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}


doSetBeta()
{
CONFIG_STATUS="Beta Server:"
DISCOVERY_HOST="\/\/betadiscovery.wd2go.com"
SERVER_HOST="betaweb.wd2go.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
}

##
## There are 3 possible SERVER_BASE_URL values for prod: "www.wd2go.com", "web.wd2go.com", and ""
##
doSetPro()
{
CONFIG_STATUS="Production Server:"
CONFIG_LINE="wd2go_server="
DISCOVERY_HOST="\/\/discovery.wd2go.com"
SERVER_HOST="web.wd2go.com"
SERVER_HOST_2="www.wd2go.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
if [ "$SAME_HOST" = '' ] 
then
    SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST_2\"" /var/www/rest-api/config/dynamicconfig.ini` 
    if [ "$SAME_HOST" = '' ] 
    then
        SAME_HOST=`grep "SERVER_BASE_URL=\"\"" /var/www/rest-api/config/dynamicconfig.ini`
    fi
fi
}

##
## There are 3 possible SERVER_BASE_URL values for prodA: "apia.wd2go.com", "weba.wd2go.com", and ""
##
doSetProA()
{
CONFIG_STATUS="Production Server A:"
CONFIG_LINE="wd2go_server="
DISCOVERY_HOST="\/\/discovery.wd2go.com"
SERVER_HOST="weba.wd2go.com"
SERVER_HOST_2="apia.wd2go.com"
SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"" /var/www/rest-api/config/dynamicconfig.ini` 
if [ "$SAME_HOST" = '' ] 
then
    SAME_HOST=`grep "SERVER_BASE_URL=\"https:\/\/$SERVER_HOST_2\"" /var/www/rest-api/config/dynamicconfig.ini` 
    if [ "$SAME_HOST" = '' ] 
    then
        SAME_HOST=`grep "SERVER_BASE_URL=\"\"" /var/www/rest-api/config/dynamicconfig.ini`
    fi
fi    
}

# Logging for debugging purposes.
logger -p local0.err "wd2go.sh $1 ENTER."

## Section: Main Script
[ $# -eq 0 ] && usage
set -- `getopt -n$0 -u -a --longoptions="stage10 stage9 stage8 stage7 stage6 wdtest3 wdtest2a wdtest2b wdtest2c wdtest2d beta betawebfiles stage6weba wdtest1 stage9weba pro proa help" "0 9 8 7 6 3 t u v w b c d e f p q h" "$@"` || usage

while [ $# -gt 0 ]
do
    case "$1" in
		-0|--stage10)   doSetStage10;shift;;
		-9|--stage9)	doSetStage9;shift;;
		-8|--stage8)	doSetStage8;shift;;
		-7|--stage7)	doSetStage7;shift;;
		-6|--stage6)	doSetStage6;shift;;
		-3|--wdtest3)	doSetMVTestBed3;shift;;
		-t|--wdtest2a)	doSetMVTestBed2a;shift;;
		-u|--wdtest2b)	doSetMVTestBed2b;shift;;
		-v|--wdtest2c)	doSetMVTestBed2c;shift;;
		-w|--wdtest2d)	doSetMVTestBed2d;shift;;
		-b|--beta)	doSetBeta;shift;;
		-c|--betawebfiles)	doSetBetaWebfiles;shift;;
		-d|--stage6weba)	doSetStage6Weba;shift;;
		-e|--wdtest1)	doSetMVTestBed1;shift;;
		-f|--stage9weba)	doSetStage9Weba;shift;;
		-p|--pro)	doSetPro;shift;;
		-q|--proa)	doSetProA;shift;;
		-h|--help)	usage;shift;;
		--)	shift;break;;
		-*)	usage;;
		*)	break;;

	esac
	shift
done

CONFIG_LINE="wd2go_server="

# Stop apache server
if [ -f /usr/sbin/apache2ctl ]; then
    /usr/sbin/apache2ctl stop
else
    apache stop web
fi

# Set the system.conf file - this causes the server entry to be added to /etc/hosts if it is not production
[ -a "/etc/system.conf" ] || echo $CONFIG_LINE > /etc/system.conf

echo "Orion is set for the "$CONFIG_STATUS": "

# If a wd2go_server line does not exist in system.conf, add a line
grep "wd2go_server=" /etc/system.conf > /dev/null
if [ $? -ne 0 ]; then
	echo -e "\n$CONFIG_LINE" >> /etc/system.conf
else
	sed -i "s/wd2go.*/$CONFIG_LINE/g" /etc/system.conf
fi

#copy to alpha config dir
if [ -d /usr/local/config ]; then
    cp /etc/system.conf /usr/local/config
fi

#check if selecting different server then last time, or if selecting a production server.
if [ "$SAME_HOST" = '' ]; then
	#selecting a different host
	# Remove temp dynamicconfig.ini
	rm /tmp/dynamicconfig.ini

	# Disable communication manager
	/usr/local/orion/communicationmanager/communicationmanagerd disable > /dev/null

	# Delete device users
	`sqlite3 /usr/local/nas/orion/orion.db 'delete from DeviceUsers' > /dev/null`

    # modify dynamic config on Alpha and Non-Alpha NASes
    if [ -f "/usr/local/config/dynamicconfig_config.ini" ]; then
        sed -i "s/DEVICEID=\"[0-9]*\"/DEVICEID=\"\"/g" /usr/local/config/dynamicconfig_config.ini
        sed -i "s/DEVICEAUTH=\"[0-9,a-f]*\"/DEVICEAUTH=\"\"/g" /usr/local/config/dynamicconfig_config.ini
        #set server base url     
        sed -i "s/SERVER_BASE_URL=.*/SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"/g" /usr/local/config/dynamicconfig_config.ini
        #remove server domain line, if present
        sed -i "s/SUBDOMAIN=\".*\"/SUBDOMAIN=\"\"/g" /usr/local/config/dynamicconfig_config.ini
        sed -i "/SERVER_DOMAIN=/d" /usr/local/config/dynamicconfig_config.ini
        #fix number of settings                     
        sed -i "s/TOTAL_SETTINGS=\"20\"/TOTAL_SETTINGS=\"19\"/g" /usr/local/config/dynamicconfig_config.ini
    else                                                
        sed -i "s/DEVICEID=\"[0-9]*\"/DEVICEID=\"\"/g" /var/www/rest-api/config/dynamicconfig.ini
        sed -i "s/DEVICEAUTH=\"[0-9,a-f]*\"/DEVICEAUTH=\"\"/g" /var/www/rest-api/config/dynamicconfig.ini
        #set server base url, if present
        sed -i "s/SERVER_BASE_URL=.*/SERVER_BASE_URL=\"https:\/\/$SERVER_HOST\"/g" /var/www/rest-api/config/dynamicconfig.ini
        #clear subdomain if present
        sed -i "s/SUBDOMAIN=\".*\"/SUBDOMAIN=\"\"/g" /var/www/rest-api/config/dynamicconfig.ini
        #remove server domain line, if present
        sed -i "/SERVER_DOMAIN=/d" /var/www/rest-api/config/dynamicconfig.ini
        #fix number of settings
        sed -i "s/TOTAL_SETTINGS=\"20\"/TOTAL_SETTINGS=\"19\"/g" /var/www/rest-api/config/dynamicconfig.ini
    fi    

fi

# Update hosts file
/usr/local/sbin/genHostsConfig.sh --force

#copy to alpha config dir
if [ -d /usr/local/config ]; then
    cp /etc/hosts /usr/local/config
fi

# Start apache server
if [ -f /usr/sbin/apache2ctl ]; then
    /usr/sbin/apache2ctl start
else
     apache start web
fi  
    
# Check if need to modify onboarding ini file
if [ -f /usr/local/onboarding/onbrd.ini ]; then
    grep "$DISCOVERY_HOST" /usr/local/onboarding/onbrd.ini > /dev/null 2> /dev/null
    if [ $? -ne 0 ]; then
        # Stop onboarding daemon
        if [ -x /etc/init.d/onbrdnetloccommd ]; then
            /etc/init.d/onbrdnetloccommd stop
        fi

        # Select a different discovery host and modify its ini file on Alpha and non-Alpha NASs.
        # Check for existence of Alpha's onboarding config file.
        if [ -f "/usr/local/config/onbrd.ini" ]; then
            sed -i "s/SERVER_BASE_URL=.*/SERVER_BASE_URL=\"https:$DISCOVERY_HOST\"/g" /usr/local/config/onbrd.ini
        else
            sed -i "s/SERVER_BASE_URL=.*/SERVER_BASE_URL=\"https:$DISCOVERY_HOST\"/g" /usr/local/onboarding/onbrd.ini
        fi

        # Start onboarding daemon
        if [ -x /etc/init.d/onbrdnetloccommd ]; then
            /etc/init.d/onbrdnetloccommd start
        fi
    fi
fi

exit 0
