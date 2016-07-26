#!/bin/sh
source /usr/local/modules/files/project_features
MTD1=/dev/mtdblock5

if [ "$PROJECT_FEATURE_CONFIG_FILESYSTEM" = "JFFS2" ];then
	mount -t jffs2 $MTD1 /usr/local/config
elif [ "$PROJECT_FEATURE_CONFIG_FILESYSTEM" = "UBIFS" ];then
	mount -t ubifs ubi0:config /usr/local/config
fi
