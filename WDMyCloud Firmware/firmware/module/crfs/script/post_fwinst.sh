#!/bin/sh

Upload_fw_Success()
{
  echo "Upload fw success"
  model=`cat /usr/local/modules/files/model`
  case ${model} in
      #one bay
      WDMyCloud)
        #Glacier
        echo "WDMyCloud"
        new_v=`cat /tmp/new_firmware_version.txt`
        old_v=`xmldbc -g sw_ver_2`
        #echo $new_v
        #echo $old_v

        new_v_major=`cat /tmp/new_firmware_version.txt | awk -F "." '{ print $1 }'`
        new_v_minor=`cat /tmp/new_firmware_version.txt | awk -F "." '{ print $2 }'`
        new_v_sub=`cat /tmp/new_firmware_version.txt | awk -F "." '{ print $3 }'`
        #echo $new_v_minor
        #echo $new_v_major
        #echo $new_v_sub

        old_v_major=`echo $old_v | awk -F "." '{ print $1 }'`
        old_v_minor=`echo $old_v | awk -F "." '{ print $2 }'`
        old_v_sub=`echo $old_v | awk -F "." '{ print $3 }'`
        #echo $old_v_major
        #echo $old_v_minor
        #echo $old_v_sub
        
        if [ $old_v_major -lt 2 ]; then
          cp /tmp/default/onbrd.ini /usr/local/config/
        elif [ $old_v_major -eq 2 ] && [ $old_v_minor -eq 0 ] && [ $old_v_sub -lt 241 ]; then
          cp /tmp/default/onbrd.ini /usr/local/config/
        elif [ $old_v_major -eq 2 ] && [ $old_v_minor -eq 10 ] && [ $old_v_sub -lt 245 ]; then
          cp /tmp/default/onbrd.ini /usr/local/config/
        fi
        ;;
        
      #two bay
      WDMyCloudEX2)
        #KC/Zion
        echo "WDMyCloudEX2"
        ;;
        
      WDMyCloudDL2100)
        #Aurora
        echo "WDMyCloudDL2100"
        mtd_check -u
        ;;

      WDMyCloudEX2100)
        #Yosemite
        echo "WDMyCloudEX2100"
        ;;
      
      MyCloudEX2Ultra)
        #RP/GT
        echo "MyCloudEX2Ultra"
        ;;
    
      MyCloudPR2100)
        #BryceCanyon
        echo "MyCloudPR2100"
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
        mtd_check -u
        ;;
      
      MyCloudPR4100)
      #BlackCanyon
      echo "MyCloudPR4100"
      ;;
  esac

  ######################
  #       common       #
  ######################

}

Upload_fw_Fail()
{
  echo "Upload fw fail recover pr-install"
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
        killall crond
        grep -v "mtd_check -b" /var/spool/cron/crontabs/root > /tmp/crond_root
        echo "*/1 * * * * mtd_check -b &" >> /tmp/crond_root
        cp -avf /tmp/crond_root /var/spool/cron/crontabs/root
        crond &
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
        killall crond
        grep -v "mtd_check -b" /var/spool/cron/crontabs/root > /tmp/crond_root
        echo "*/1 * * * * mtd_check -b &" >> /tmp/crond_root
        cp -avf /tmp/crond_root /var/spool/cron/crontabs/root
        crond &
        ;;
      
      MyCloudPR4100)
      #BlackCanyon
      echo "MyCloudPR4100"
      ;;
  esac

  ######################
  #       common       #
  ######################
  xmldbc -l /tmp/recover/config.xml
  xmldbc -D /etc/NAS_CFG/config.xml
  access_mtd "cp -f /etc/NAS_CFG/config.xml /usr/local/config/config.xml"
}

if [ "$1" = "0" ]; then
  Upload_fw_Success
elif [ "$1" = "1" ]; then
  Upload_fw_Fail
fi

      
