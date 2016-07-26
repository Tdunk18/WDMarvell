## disk-param.sh
## Please do not source this file. 
## This file is for downgrade backward compatibility support only.
disk=/dev/sda
bootDevice=""
dataVolumeDevice="/dev/sda4"
swapDevice="/dev/sda3"
rootfsDevice="/dev/md0"
cacheVolumeDevice=""
sharesDevice=""
rootfsDisk1="${disk}1"
rootfsDisk2="${disk}2"
blockSize=64k
blockCount=31247
backgroundPattern=0xE5
dataVolumeFormat="ext4"
WDCOMP_DIR="/etc/wdcomp.d"
diskWarningThresholdReached=/etc/.freespace_failed
reformatDataVolume=/etc/.reformat_data_volume
updateInProgress=/etc/.updateInProgress
freshInstall=/etc/.fresh_install
upgradeMountPath=/mnt/rootfs
