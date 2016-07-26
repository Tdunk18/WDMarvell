#!/bin/bash

One_Bay_Install_Tool_Binary()
{
  sudo cp ../module/one_bay_install/makehd.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/one_bay_install/keepdog.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/one_bay_install/reformat_fw_partition.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/one_bay_install/partition.tab ${TMPLOOP_MNT}/etc/
  sudo cp ../module/one_bay_install/rc.sh ${TMPLOOP_MNT}/etc/
  sudo cp ../module/one_bay_install/default.script ${TMPLOOP_MNT}/usr/share/udhcpc/
  sudo cp ../module/one_bay_install/zcip.script ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/one_bay_install/update_uboot ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/mke2fs ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/gdisk ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/hdparm ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/sdparm ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/fuser ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/blkid ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/utelnetd ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/du ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/xmldb ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/ip ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/devmem ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/watchdog ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libext2fs.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libcom_err.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libblkid.so.1 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libuuid.so.1.3.0 ${TMPLOOP_MNT}/lib/libuuid.so.1
  sudo cp ../module/crfs/${CODE_NAME}/lib/libe2p.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libxml2.so.2.7.4 ${TMPLOOP_MNT}/lib/libxml2.so.2
  sudo cp ../module/crfs/${CODE_NAME}/lib/libz.so.1 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libiconv.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libpopt.so.0 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libxmldbc.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libshare.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libalpha_common.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libalert.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libwipeit.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libusbinfo.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libapollo.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libhdVerify.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libdm.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libmail.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libmipc.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libubi.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/diskmgr ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/usbmount ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/usbumount ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/updateHdState ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/hdVerify ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/mac_read ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/upload_firmware ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/hw/memory_rw ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/custom/WD/localsbin/raid_get_drives_info.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/default/config.xml ${TMPLOOP_MNT}/etc/NAS_CFG/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libsmbif.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libapkg2.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcmd ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcom ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcv ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbif ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/read_version ${TMPLOOP_MNT}/usr/sbin/

  if [ "$1" = "tftp" ]; then
    touch boot_up_from_tftp
    sudo mv boot_up_from_tftp ${TMPLOOP_MNT}/etc/
  else
    touch boot_up_from_usb
    sudo mv boot_up_from_usb ${TMPLOOP_MNT}/etc/
  fi

}

YY_Install_Tool_Binary()
{
  sudo cp ../module/install_package_tool/YY/install_tool.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/install_package_tool/YY/rc.sh ${TMPLOOP_MNT}/etc/
  sudo cp ../module/install_package_tool/YY/default.script ${TMPLOOP_MNT}/usr/share/udhcpc/
  sudo cp ../module/install_package_tool/YY/zcip.script ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/gdisk ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/hdparm ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/sdparm ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/fuser ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/blkid ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/bin/utelnetd ${TMPLOOP_MNT}/usr/bin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/xmldb ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/ip ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libext2fs.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libcom_err.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libblkid.so.1 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libuuid.so.1.3.0 ${TMPLOOP_MNT}/lib/libuuid.so.1
  sudo cp ../module/crfs/${CODE_NAME}/lib/libe2p.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libxml2.so.2.7.4 ${TMPLOOP_MNT}/lib/libxml2.so.2
  sudo cp ../module/crfs/${CODE_NAME}/lib/libz.so.1 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libiconv.so.2 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libpopt.so.0 ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/lib/libxmldbc.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libshare.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libalpha_common.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libalert.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libwipeit.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libusbinfo.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libapollo.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libhdVerify.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libdm.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libmail.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libmipc.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libubi.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/diskmgr ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/usbmount ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/usbumount ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/updateHdState ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/hdVerify ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/mac_read ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/upload_firmware ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/mem_rw ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/custom/WD/localsbin/raid_get_drives_info.sh ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/default/config.xml ${TMPLOOP_MNT}/etc/NAS_CFG/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libsmbif.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/libapkg2.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrlib/librs232.so ${TMPLOOP_MNT}/lib/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcmd ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcom ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbcv ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/smbif ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/up_read_daemon ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/up_send_daemon ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/up_send_ctl ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/read_version ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/led ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/usrsbin/rescue_fw ${TMPLOOP_MNT}/usr/sbin/
  sudo cp ../module/crfs/${CODE_NAME}/sbin/hwclock ${TMPLOOP_MNT}/usr/sbin/
  touch boot_up_from_usb
  sudo mv boot_up_from_usb ${TMPLOOP_MNT}/etc/

}

if [ -z ${PROJECT_NAME} ]; then
	echo '${PROJECT_NAME} has not been setup. Use the source, Luke!'
	exit 1
else
	echo "Generating rootfs for \"${PROJECT_NAME}\""
fi

echo -e "\033[32m **********************\033[0m"
echo -e "\033[32m *  create uRamdisk   *\033[0m"
echo -e "\033[32m **********************\033[0m"

TMPLOOP="aa"
TMPLOOP_MNT="d_aa"

if [ "$(has_feature CUSTOM_WD)" = "Yes" ]; then
  	echo -e "\033[32m --> Ramdisk size 56M \033[0m"
  	ramdisk_size=57344
elif [ "$(has_feature BAYS_4)" = "Yes" ]; then
  	echo -e "\033[32m --> Ramdisk size 10M \033[0m"
  	ramdisk_size=10240
else
  echo -e "\033[32m --> ramdisk size 9M \033[0m"
  ramdisk_size=9216
fi

sudo dd if=/dev/zero of=${TMPLOOP} bs=1k count=$ramdisk_size
sudo losetup /dev/loop7 ${TMPLOOP}
sudo mke2fs -c /dev/loop7 $ramdisk_size
sudo losetup -d /dev/loop7
#sudo chown $USER:sw1 ${TMPLOOP}
if [ ! -e ${TMPLOOP_MNT} ] ; then
        sudo mkdir ${TMPLOOP_MNT}
fi

sudo mount -o loop ${TMPLOOP} ${TMPLOOP_MNT}
cd rootfs
sudo pax -rw .  ${ROOTDIR}/firmware/ramdisk/${TMPLOOP_MNT}
if [ -e ${ROOTDIR}/firmware/ramdisk/${TMPLOOP_MNT}/etc/sudoers ]; then
	sudo chmod 0440 ${ROOTDIR}/firmware/ramdisk/${TMPLOOP_MNT}/etc/sudoers
fi

cd ..

./init_environment.sh ${TMPLOOP_MNT}

if [ -n "$1" ]; then
	if [ ${CODE_NAME} = "Glacier" -a "$1" = "one_bay_install_usb" ]; then
	  One_Bay_Install_Tool_Binary usb
	elif [ ${CODE_NAME} = "Glacier" -a "$1" = "one_bay_install_tftp" ]; then
	  One_Bay_Install_Tool_Binary tftp
	elif [ ${CODE_NAME} = "Yellowstone" -a "$1" = "YY_usb_install" ]; then
	  YY_Install_Tool_Binary
	elif [ ${CODE_NAME} = "Yosemite" -a "$1" = "YY_usb_install" ]; then
	  YY_Install_Tool_Binary  
	fi
fi

sudo sync
sudo chown -R root:root ${TMPLOOP_MNT}
sudo umount ${TMPLOOP_MNT}
sudo gzip ${TMPLOOP}

sudo mv ${TMPLOOP}.gz ramdisk_el.gz
sudo ./mkimage -A arm -O linux -T ramdisk -C gzip -a 0x00e00000 -n Ramdisk -d ramdisk_el.gz uRamdisk
sudo rm -rf ${TMPLOOP_MNT}
sudo chown $USER:$USER uRamdisk
sudo rm -f ramdisk_el.gz
