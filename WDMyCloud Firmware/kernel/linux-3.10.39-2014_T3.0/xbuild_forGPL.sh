#!/bin/sh

build()
{
  if [ -z "$ARCH" ] ; then
    echo "do \"export ARCH=arm\" first."
    exit 1
  fi
  RET=1
  PREV_CROSS_COMPILE=$CROSS_COMPILE
  PREV_PATH=$PATH
  
  export KBUILD_BUILD_USER=kman
  export KBUILD_BUILD_HOST=kmachine
  export BASEVERSION=2014T30p5
  export BUILDNO=git$(git rev-parse --verify --short HEAD)
  if [ "$PROJECT_NAME" = "WDMyCloudEX4100" ]; then
    echo -e "\033[32m ***************************\033[0m"
    echo -e "\033[32m *  build WDMyCloudEX4100  *\033[0m"
    echo -e "\033[32m ***************************\033[0m"
    cp arch/arm/boot/dts/Yellowstone/* arch/arm/boot/dts/
  elif [ "$PROJECT_NAME" = "WDMyCloudEX2100" ]; then
    echo -e "\033[32m ******************************\033[0m"
    echo -e "\033[32m *    build WDMyCloudEX2100   *\033[0m"
    echo -e "\033[32m ******************************\033[0m"
    cp arch/arm/boot/dts/Yosemite/* arch/arm/boot/dts/
  else
    echo "Not support"
    exit 0
  fi
  
  #make mrproper
  #make mvebu_lsp_defconfig
  
  rm arch/arm/boot/zImage
	KCFLAGS="-DALPHA_CUSTOMIZE" make zImage
	#make armada-388-rd.dtb
	make dtbs
	#cat arch/arm/boot/zImage arch/arm/boot/dts/armada-388-rd.dtb > arch/arm/boot/zImage_dtb
	cat arch/arm/boot/zImage arch/arm/boot/dts/armada-385-db.dtb > arch/arm/boot/zImage_dtb
	rm arch/arm/boot/zImage
	mv arch/arm/boot/zImage_dtb arch/arm/boot/zImage
	./scripts/mkuboot.sh -A arm -O linux -T kernel -C none -a 0x00008000 -e 0x00008000 -n 'Linux-388' -d arch/arm/boot/zImage arch/arm/boot/uImage
	if [ $? = 0 ] ; then
		KCFLAGS="-DALPHA_CUSTOMIZE" make modules
		if [ $? = 0 ] ; then
			RET=0
		fi
	fi

	export CROSS_COMPILE=$PREV_CROSS_COMPILE
	export PATH=$PREV_PATH
  
  rm arch/arm/boot/dts/armada-385-db.dts  
  rm arch/arm/boot/dts/armada-385-rd.dts 
  rm arch/arm/boot/dts/armada-388-rd.dts  
  rm arch/arm/boot/dts/armada-38x.dtsi
	exit $RET
}

clean()
{
	make clean
}

if [ "$1" = "build" ]; then
	build
elif [ "$1" = "clean" ]; then
	clean
else
	echo "Usage : $0 build or $0 clean"
fi
