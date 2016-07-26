#!/bin/sh

mkdir /tmp/recover

model=`cat /usr/local/modules/files/model`
case ${model} in
    #one bay
	  WDMyCloud)
      #Glacier
      echo "WDMyCloud"
      ;;
      
    #two bay
    WDMyCloudEX2)
      #KC/Zion
      echo "WDMyCloudEX2"
      ;;
      
    WDMyCloudDL2100)
      #Aurora
      echo "WDMyCloudDL2100"
      ;;

    WDMyCloudEX2100)
      #Yosemite
      echo "WDMyCloudEX2100"
      ;;
    
    #four bay
    WDMyCloudEX4)
      #LT4A
      echo "WDMyCloudEX4"
      ;;
      
    WDMyCloudEX4100)
      #Yellowstone
      echo "WDMyCloudEX4100"
      ;;

    WDMyCloudDL4100)
      #Sprite
      echo "WDMyCloudDL4100"
      ;;
esac

######################
#       common       #
######################
smbcmd -b 0
      
