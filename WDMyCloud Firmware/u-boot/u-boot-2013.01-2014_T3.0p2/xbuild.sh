#!/bin/bash

#export PATH=$PATH:/home/jack/WD/src/Armada375/marvell-gcc-4.6.x-2013_Q3.1/armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002/bin
export PATH=$PATH:/opt_gccarm/armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002/bin
export ARCH=arm
export CROSS_COMPILE=arm-marvell-linux-gnueabi-
export CROSS_COMPILE_BH=arm-marvell-linux-gnueabi-
export ALPHA_UBOOT_VERSION=1.0
export BUILD_FOR_GRANDTETON=y
xbuild(){
	rm -rf UBOOT_BIN_FILES
	mkdir UBOOT_BIN_FILES
	make mrproper
	#mv ./include/version.GT.h ./include/version.h
	./build.pl -f nand -v GrandTeton_2014T3_PQ -b armada_38x -i nand -c -o $(pwd)
	cp -avf ./u-boot-a38x-GrandTeton_2014T3_PQ-nand.bin ./UBOOT_BIN_FILES/u-boot-a38x-GrandTeton_2014T3_PQ-nand_512M
	cp -avf ./u-boot-a38x-GrandTeton_2014T3_PQ-nand-uart.bin ./UBOOT_BIN_FILES/u-boot-a38x-GrandTeton_2014T3_PQ-nand-uart_512M

	export BUILD_FOR_GRANDTETON=n
	rm -rf tools/marvell/bin_hdr/a38x.a
	rm -rf tools/marvell/bin_hdr/ddr_a38x.uart.a
	#rm -rf common/cmd_version.o
	#mv ./include/version.RP.h ./include/version.h
        ./build.pl -f nand -v GrandTeton_2014T3_PQ -b armada_38x -i nand -c -o $(pwd)
        cp -avf ./u-boot-a38x-GrandTeton_2014T3_PQ-nand.bin ./UBOOT_BIN_FILES/u-boot-a38x-RangerPeak_2014T3_PQ-nand_1G
        cp -avf ./u-boot-a38x-GrandTeton_2014T3_PQ-nand-uart.bin ./UBOOT_BIN_FILES/u-boot-a38x-RangerPeak_2014T3_PQ-nand-uart_1G
	
	cd ./UBOOT_BIN_FILES/
	mv ./u-boot-a38x-GrandTeton_2014T3_PQ-nand_512M ./u-boot-a38x-GrandTeton_2014T3_PQ-nand_512M.bin
	mv ./u-boot-a38x-GrandTeton_2014T3_PQ-nand-uart_512M ./u-boot-a38x-GrandTeton_2014T3_PQ-nand-uart_512M.bin
	mv ./u-boot-a38x-RangerPeak_2014T3_PQ-nand_1G ./u-boot-a38x-RangerPeak_2014T3_PQ-nand_1G.bin
	mv ./u-boot-a38x-RangerPeak_2014T3_PQ-nand-uart_1G ./u-boot-a38x-RangerPeak_2014T3_PQ-nand-uart_1G.bin
	cd -	
	echo ""
	echo ""	
	echo "############################ Please use files in folder of UBOOT_BIN_FILES ############################"
	echo "#                                                                                                     #"
	ls ./UBOOT_BIN_FILES
	echo "#                                                                                                     #"
	echo "#######################################################################################################"
}

xclean()
{
	make clean
	find -iname '.depend*' -exec \rm -rf {} \;
}


if [ "$1" = "build" ]; then
	xbuild
elif [ "$1" = "clean" ]; then
	xclean
else
	echo "Usage : xbuild.sh build or xbuild.sh clean"
fi


