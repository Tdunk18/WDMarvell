#!/bin/bash
#


export ARCH=arm
export CROSS_COMPILE=arm-marvell-linux-gnueabi-
export PATH=/bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
#export PATH=$PATH:/Marvell/A375/TOOLS/CrossCompiler_SDK2013Q3_SFP_LE
export PATH=/opt_gccarm/armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002/bin:/bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

make mrproper 

make mvebu_lsp_defconfig

make menuconfig 

make zImage 

#make device-tree-file.dtb

make armada-388-rd.dtb
