#!/bin/sh

###########################################
# (c) 2013 Western Digital Technologies, Inc. All rights reserved.
#
# Alert definition (see /etc/nas/alertmessages.txt for descriptions
###########################################

##############################################
## system Alerts part 1 (original from Apollo)
## Critical: 0001-0019
## Warn: 1001-1019
## Info: 2001-2019
##############################################
temperatureOver="0001"
temperatureUnder="0002"
driveSmartFail="0003"
volumeFailure="0004"
thermalShutdownPending="0005"
thermalShutdownImmediate="0006"

diskNearCapacity="1001"
firmwareUpdateFailed="1003"
systemTemperatureHigh="1004"

restart="2001"
temperatureNormal="2003"
firmwareUpdateSucceeded="2004"
factoryRestoreSucceeded="2005"

networkLinkDown="1002"
newFirmwareAvailable="1011"

##############################################
## system Alerts part 1 (added for additional programs beyond Apollo)
## Critical: 0020-0099
## Warn: 1020-1099
## Info: 2020-2099
##############################################
systemShuttingDown="2020"
configRestoreFailed="1021"
powerSupplyFailure="1022"
msgNewFwAvailable="2023"
firmwareUpdateDownloading="2024"
firmwareUpdateRebooting="2025"
firmwareUpdateInstalling="2026"
syncTargetUnavailable="2027"
rebootRequired="1028"
fanNotWorking="0029"
storageBelowThreshold="1030"
onUpsPower="0031"
systemIsSuspending="2032"
systemRebooting="2033"
networkLinkUp="1034"
productImprovementProgramOptInReminder="1035"
fileSystemCheckFailed="0036"
systemNotReady="1037"
quotaNearLimit="2038"
quotaFull="2039"
unsupportedUps="2040"
ethernetConnectedAtSlowSpeed="2041"
upsPowerAt50Percent="0042"
upsPowerAt15Percent="0043"
upsOutOfPower="0044"
fileSystemErrorCorrected="1045"

###########################################
# WDSAFE Alerts
# Info Alerts: 2100 - 2119
# Warn Alerts: 1100 - 1119
###########################################
wdsafeCreateSucceeded="2100"
wdsafeCreateFailed="1100"
wdsafeDestroySucceeded="2101"
wdsafeDestroyFailed="1101"
wdsafeUpdateSucceeded="2102"
wdsafeUpdateFailed="1102"
wdsafeRestoreSucceeded="2103"
wdsafeRestoreFailed="1103"

###########################################
# data-volume-config Alerts
# X2XX
###########################################
UNSUPPORTED_DRIVE="1200"
FAILED_DRIVE="0201"
DRIVE_TOO_SMALL="2202"
DRIVE_BEING_INITIALIZED="2203"
RAID_EXPANSION_FAILURE="0204"
RAID_EXPANSION_REBOOT_REQUIRED="1205"
RAID_SYNC_REBUILD_FAILURE="0206"

DRIVE_ABOUT_TO_FAIL="0207"
VOLUME_DEGRADED="0208"
VOLUME_MIGRATION_PROGRESS="2209"
REPAIRING_VOLUME_TIME="2210"
CHECKING_STORAGE_INTEGRITY="2211"
VOLUME_SYNC_FAILED="0212"
VOLUME_EXTEND_FAILED="0213"
DISK_INSERTED_IN_BAY_X="2214"
DISK_REMOVED_FROM_BAY_X="2215"
RAID_ROAMING_ENABLED="2216"
NO_DRIVES_INSTALLED="2217"
HOT_SPARE_DRIVE_ADDED_INTO_RAID_ARRAY="2218"
RAID_MIGRATION_COMPLETED="2219"
RAID_REBUILD_COMPLETED="2220"
NON_WD_RED_DRIVE_INSERTED="2221"
DISK_FORMATTED="2222"
EXPANDING_VOLUME="2223"
REPLACE_DRIVE_WITH_BLINKING_RED_LED="0224"

###########################################
# USB Alerts
# Info Alerts: 2120 - 2139
# Warn Alerts: 1120 - 1139
###########################################
usbUnsupportedDevice="1120"
usbUnsupportedFilesystem="1121"
usbUnableToCreateShare="1122"
usbUnsafeDeviceRemoval="1123"
usbBadSmartStatus="1124"
usbTimeMachineShareRemoved="1125"
usbReadOnlyPartition="2120"
usbLockedDevice="2121"
usbTimeMachineShareReconnected="2122"

usbFilesCopiedFromCamera="2126"
usbCannotCopyFilesFromCamera="1127"
usbCopyingFiles="2128"
usbFilesMovedFromCamera="2129"
usbCannotMoveFilesFromCamera="1130"
usbMovingFiles="2131"


###########################################
# File-System Alerts
# Info Alerts: 2300 - 2319
###########################################
inotifyWatchLimitReached="2300"

###########################################
# Remote Backup Alerts
# Alerts: X4XX
###########################################
remoteBackupError="1400"
remoteBackupRestoreError="1401"
remoteBackupSuccess="1402"
remoteBackupRestoreSuccess="1403"

###########################################
# Miscellaneous Alerts
# Alerts: X5XX
###########################################
appUpdateAvailable="1501"
virusFound="1502"
virusScanCompleted="2503"
scheduledVirusScanStarted="2504"
scheduledVirusScanStopped="2505"
