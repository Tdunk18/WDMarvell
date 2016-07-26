#!/bin/bash

cid=$1
new_quota=$2

[ -z "$cid" ] && echo "Specify a container id" && exit 1

function show_cpu
{
	echo "cpu.cfs_quota_us=`cat /sys/fs/cgroup/cpu/docker/${cid}*/cpu.cfs_quota_us`"
	echo "cpu.cfs_period_us=`cat /sys/fs/cgroup/cpu/docker/${cid}*/cpu.cfs_period_us`"
}

function set_cpu_quota
{
	if [ -z "$1" ]; then
		echo "Specify quota!"
		return
	fi
	
	echo $1 > /sys/fs/cgroup/cpu/docker/${cid}*/cpu.cfs_quota_us
}

if [ -n "$new_quota" ]; then
	echo "Setting cpu.cfs_quota_us=$new_quota"
	set_cpu_quota $new_quota
fi

show_cpu
