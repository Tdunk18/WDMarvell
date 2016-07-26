#!/bin/sh

MOUNT_CMD="busybox mount"
UMOUNT_CMD="busybox umount"

${MOUNT_CMD} -o remount -w %root% /

echo "** Mounting /etc/fstab"
${MOUNT_CMD} -a
${UMOUNT_CMD} /proc
${UMOUNT_CMD} /usr/local/modules
sleep 1

${MOUNT_CMD} -t proc proc /proc
${MOUNT_CMD} -a

# Cgroup support
CGROUP_ROOT=/sys/fs/cgroup
${MOUNT_CMD} -t cgroup -o rw,memory,cpu cgroup ${CGROUP_ROOT}

echo 8192 > /proc/sys/vm/min_free_kbytes

echo 4096 > /proc/sys/net/core/somaxconn
echo 16777216 > /proc/sys/net/core/wmem_max
echo 16777216 > /proc/sys/net/core/rmem_max
echo 163840 > /proc/sys/net/core/wmem_default
echo 163840 > /proc/sys/net/core/rmem_default
echo 3000 > /proc/sys/net/core/netdev_max_backlog

echo 1800 > /proc/sys/net/ipv4/tcp_keepalive_time
echo 30 > /proc/sys/net/ipv4/tcp_fin_timeout
echo 2048 > /proc/sys/net/ipv4/tcp_max_syn_backlog
#echo 1 > /proc/sys/net/ipv4/tcp_syncookies
echo 0 > /proc/sys/net/ipv4/tcp_timestamps

echo /sbin/mdev > /proc/sys/kernel/hotplug
mdev -s
touch /dev/mdev.seq

# Set SATA settings, For improving driving capability.
memory_rw -w -o 0xf10a003c -v 0xaa60
memory_rw -w -o 0xf10a0044 -v 0x895a
memory_rw -w -o 0xf10a103c -v 0xaa62
memory_rw -w -o 0xf10a1044 -v 0x895c

#for judge kernel or ramdisk if error
#mknod -m  777 /dev/REG c 88 0
#busybox insmod /lib/modules/reg.ko

ubiattach /dev/ubi_ctrl -m 5 -O 2048
sync
sleep 1
${MOUNT_CMD} -t ubifs ubi0:config /usr/local/config

chk_image

/usr/local/modules/script/system_init

