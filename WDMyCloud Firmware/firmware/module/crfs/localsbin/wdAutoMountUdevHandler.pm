#!/usr/bin/perl
#
# This script processes udev events for the addition or removal of USB devices and their
# associated partitions.  It only supports Image and Media Storage Class devices.  For
# media storage class devices, it only supports partitions with the following filesystems:
# ext2, ext3, ext4, fat16, fat32, hfs+, ntfs, and xfs.  The script will attempt to mount
# and export as a share all partitions of supported filesystems from USB devices when
# discovered.  When removed, the partitions will be unmounted and their associated shares
# will be deleted.
#
# Copyright (c) [2011-2013] Western Digital Technologies, Inc. All rights reserved.

use strict;
use warnings;
use lib '/usr/local/lib';
use wdAutoMountLib;

# Global Variables - return codes, inquiry data values, and config parameters.

my $STATUS_SUCCESS = 0;
my $STATUS_FAILURE = 1;
my $WD_VENDOR_ID = '1058';
my $INQ_DATA_SCSI_LEVEL_2 = 3;
my $INQ_DATA_SCSI_LEVEL_3 = 4;
my $INQ_DATA_DIRECT_ACCESS_BLOCK_DEVICE = 0;
my %configParams = ();

# Process the udev event and always return success.

&processUdevEvent();
exit $STATUS_SUCCESS;

# Process the udev Event
#
# @global   configParams    global configuration parameters (such as file locations)
#
# Process the udev event based on its event type.  The script is called by a process monitoring
# udev events and will call the script one event at a time.

sub processUdevEvent {

    # Load the auto-mount configuration parameters and obtain a lock on all the resources
    # associated with auto-mount (which is locked to process udev events and auto-mount
    # administrative requests).

    &wdAutoMountLib::loadParams(\%configParams, '/etc/nas/wdAutoMount.conf', '.+');
    my $lockHandle = &wdAutoMountLib::lockDatabase(\%configParams);

    # Load the alert parameters and then process the event.

    &wdAutoMountLib::loadParams(\%configParams, '/etc/nas/alert-param.sh', '^usb');

    my $event = &getEvent();

    if ($event eq 'add usb device') {
        &processUsbDeviceAddedEvent();
    }
    elsif ($event eq 'remove usb device') {
        &processUsbDeviceRemovedEvent();
    }
    elsif ($event eq 'add ptp device') {
        &processPtpDeviceAddedEvent();
    }
    elsif ($event eq 'remove ptp device') {
        &processPtpDeviceRemovedEvent();
    }
    elsif ($event eq 'add scsi generic') {
        &processScsiGenericAddedEvent();
    }
    elsif ($event eq 'add disk') {
        &processDiskAddedEvent();
    }
    elsif ($event eq 'remove disk') {
        &processDiskRemovedEvent();
    }
    elsif ($event eq 'add partition') {
        &processPartitionAddedEvent();
    }
    elsif ($event eq 'remove partition') {
        &processPartitionRemovedEvent();
    }

    # Release the lock.

    &wdAutoMountLib::unlockDatabase($lockHandle);
}

# Get the udev event to be processed.
#
# @global   ENV{ACTION}             udev event action environment variable
# @global   ENV{SUBSYSTEM}          udev event subsystem environment variable
# @global   ENV{DEVTYPE}            udev event device type environment variable
# @global   ENV{ID_USB_INTERFACES}  udev event USB interface descriptor environment variable
# @global   ENV{GPHOTO2_DRIVER}     GPHOTO2 (PTP) driver support environment variable
#
# @return   event string to process
#
# This function breaks a "usb device" event into either a "ptp device" or a "usb device" event.  An
# event will be switched to a PTP device event if the device supports the PTP interface, doesn't
# support the Media Storage Class interface, and is supported by the GHPHOTO2 driver.  The resulting
# event will be one of the following:
#    * add ptp device
#    * add usb device
#    * add scsi generic
#    * add disk
#    * add partition
#    * remove ptp device
#    * remove usb device
#    * remove partition
#
# Note: Events for the removal of scsi generic and disk devices are not received (because they are
# not needed).

sub getEvent {

    my $action = &wdAutoMountLib::getEnv('ACTION');
    my $subsystem = &wdAutoMountLib::getEnv('SUBSYSTEM');
    my $devtype = &wdAutoMountLib::getEnv('DEVTYPE');

    # Udev events for SCSI generic devices have no device type, so set device type to subsystem for
    # so SCSI generic devices so that all event processing can be based on action and device type.

    if ($subsystem eq 'scsi generic') {
        $devtype = $subsystem;
    }

    if ($devtype eq 'usb device') {
        my $interfaces = &wdAutoMountLib::getEnv('ID_USB_INTERFACES');
        my $driver = &wdAutoMountLib::getEnv('GPHOTO2_DRIVER');

        # If the PTP (GPHOTO2) driver supports the device and it is not a media storage class
        # device, change the device type to PTP.

        if (($interfaces !~ /:08/) && (($driver eq 'PTP') || ($driver eq 'proprietary'))) {
            $devtype = 'ptp device';
        }
    }
    return ($action . ' ' . $devtype);
}

# Process a "USB Device Added" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)
#
# For a supported USB device, record information about the device in the USB database, which will be
# used to obtain device information when their associated partitions are added and to report device
# information to the controller management client.  If the device is not supported, an alert is
# generated.

sub processUsbDeviceAddedEvent {

    # Initialize a record to describe the added device (from udev environment variables).

    my $deviceRecord = &createUsbDeviceRecord();

    # If the device is supported (a Media Storage Class device), record it in the database.  If it
    # was already in the database, it will be updated to show that it is now connected.  Also, log
    # an event in the system log that a device was added and signal that a change has been made to
    # the USB database (to allow a polling storage management client to detect a change).

    if (&supportedDevice($deviceRecord)) {
        &wdAutoMountLib::updateDatabaseForAddedDevice(\%configParams, $deviceRecord);
        &wdAutoMountLib::logDeviceEvent('info', 'Device added', $deviceRecord);
        &wdAutoMountLib::databaseChangeNotification();
    }
    # If the device is not supported and is not to be ignored (such as a USB hub), send an alert
    # and log an event that a unsupported device was detected.

    elsif (!&ignoreDevice($deviceRecord)) {
        &wdAutoMountLib::sendAlert($configParams{usbUnsupportedDevice}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\"");
        &wdAutoMountLib::logDeviceEvent('warn', 'Unsupported device', $deviceRecord);
    }
}

# Process a "USB Device Removed" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)
#
# For a supported USB device that is still recorded as connected in the database, update the
# database to indicate that it is no longer connected.  If the user had ejected the drive prior
# to removal, the device will already be marked as "not connected" in the database so no additional
# work must be done.

sub processUsbDeviceRemovedEvent {

    # Initialize a record to describe the removed device (from udev environment variables).

    my $deviceRecord = &createUsbDeviceRecord();

    # If a device was removed that is still recorded as connected in the database, remove any
    # partitions that have not been removed, update the database to show it as removed, and send
    # an alert that the device was unsafely removed.  If the device had gone through a software
    # "eject", the device would not still be "connected" in the database.  Also, signal that a
    # change has been made to the USB database.

    if ($deviceRecord->{connected}) {
        &wdAutoMountLib::removeDevicePartitions(\%configParams, $deviceRecord, 0);
        &wdAutoMountLib::markDeviceAsRemoved(\%configParams, "WHERE connected='1' AND devpath='$deviceRecord->{devpath}'");
        &wdAutoMountLib::databaseChangeNotification();
    }

    # If the device is not to be ignored, log an event that it was removed.

    if (!&ignoreDevice($deviceRecord)) {
        &wdAutoMountLib::logDeviceEvent('info', 'Device removed', $deviceRecord);
    }
}

# Process a "PTP Device Added" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)
#
# The attributes of the added USB device are described in udev environment
# variables.  A device record is initialized based on those variables.  If the
# record was successfully initialized and the device is supported, the database
# is updated to describe the newly added device. If the device is not support,
# an alert is generated.  Having the device in the database allows us to easily
# obtain device information when its associated partitions are added and to report
# the connected devices when asked by a storage management client.

sub processPtpDeviceAddedEvent {

    my ($deviceRecord, $partitionRecord) = &createPtpRecords();

    &wdAutoMountLib::updateDatabaseForAddedDevice(\%configParams, $deviceRecord);
    &wdAutoMountLib::logDeviceEvent('info', 'Device added', $deviceRecord);

    # Create a share name for the partition.  Then, attempt to mount the partition and create a
    # share for it.  If the operation failed, send an alert.  Otherwise, update the database
    # with the partition information.

    &wdAutoMountLib::createShareName(\%configParams, $partitionRecord);

    if (&wdAutoMountLib::mountAndCreateShare(\%configParams, $partitionRecord, 'total') != $STATUS_SUCCESS) {
        &wdAutoMountLib::sendAlert($configParams{usbUnableToCreateShare}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\" \"$partitionRecord->{type}\" \"$partitionRecord->{label}\" \"$partitionRecord->{share_name}\"");
    }
    else {
        &wdAutoMountLib::updateDatabaseForAddedPartition(\%configParams, $partitionRecord);
        &wdAutoMountLib::sendAlert($configParams{usbReadOnlyPartition}, "\"$partitionRecord->{share_name}\"");
        &wdAutoMountLib::logPartitionEvent('info', 'Partition added', $partitionRecord);
        &wdAutoMountLib::databaseChangeNotification();
    }
}

# Process a "PTP Device Removed" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)
#
# The attributes of the removed PTP device are described in udev environment
# variables.  The function initializes a device record based on those variables.
# If the record was successfully initialized, the database is updated to indicate
# that the device is no longer connected and an "device removed" event is logged.

sub processPtpDeviceRemovedEvent {

    my ($deviceRecord, $partitionRecord) = &createPtpRecords();

    if ($partitionRecord->{connected}) {
        &wdAutoMountLib::unmountAndDeleteShare(\%configParams, $partitionRecord, 'total');
        &wdAutoMountLib::markPartitionAsRemoved(\%configParams, $partitionRecord);
        &wdAutoMountLib::logPartitionEvent('info', 'Partition removed', $partitionRecord);
        &wdAutoMountLib::databaseChangeNotification();
    }
    if ($deviceRecord->{connected}) {
        &wdAutoMountLib::markDeviceAsRemoved(\%configParams, "WHERE connected='1' AND devpath='$deviceRecord->{devpath}'");
    }
    &wdAutoMountLib::logDeviceEvent('info', 'Device removed', $deviceRecord);
}

# Process a "SCSI Generic (Device) Added" udev Event
#
# @global   ENV{DEVNAME}      udev event device name environment variable
# @global   ENV{DEVPATH}      udev event device path environment variable
# @global   configParams      global configuration parameters (such as file locations)
#
# To spin down a drive on eject, unlock a locked WD drive, get a drives standby timer, or obtain
# the SMART and lock status of a WD drives, SCSI commands must be performed through a SCSI generic
# device associated with the USB device.  So, discovery of SCSI generic devices must be for all
# drives.  However, we are only interested in the SCSI direct access block device (and the first
# one we find if there are multiple).  We need to find SCSI generic device associated with a USB
# device, its scsi_devname will be 'pending' or is empty ('').  When 'pending' is set, we know the
# device has a SCSI generic device associated with it and we will not report the device to the UI
# will it found and additional device information is obtained (SMART and/or lock status).  If the
# name is not set, the device may or may not have a SCSI generic device associated with it.
# If we find a SCSI generic device whose device type is 'direct access block device', we will save
# the SCSI devname.  We will then correct the SCSI level (if possible) and attempt to get the
# standby timer value.  If the drive may support SMART, we attempt to get its SMART status.  The
# devname of the SCSI generic device may be used later to unlock, spin down, or set the standby
# timer of the drive.

sub processScsiGenericAddedEvent {

    # Find the USB device associated with the SCSI generic device by checking the device paths.
    # The SCSI generic device path will contain the device path of its associated USB device.  A
    # USB device that needs to find its associated SCSI generic device will have an empty SCSI
    # devname or it will be set to 'pending'.

    my $deviceRecord = undef;
    my $devpath = &wdAutoMountLib::getEnv('DEVPATH', 1);
    my @deviceList = &wdAutoMountLib::getDeviceList(\%configParams, "WHERE connected='1'");
    foreach my $record (@deviceList) {
        if (($record->{scsi_devname} eq 'pending') || ($record->{scsi_devname} eq '')) {
            if ($devpath =~ /^$record->{devpath}/) {
                $deviceRecord = $record;
                last;
            }
        }
    }

    # If the associated USB device was found (which may not happen if this associated USB device
    # is not supported), check if it is a direct access block device.  If it is, we can take
    # additional actions.

    if (defined($deviceRecord)) {
        $deviceRecord->{scsi_devname} = &wdAutoMountLib::getEnv('DEVNAME');
        my $peripheralDeviceType = &wdAutoMountLib::getPeripheralDeviceType($deviceRecord);
        if ($peripheralDeviceType == $INQ_DATA_DIRECT_ACCESS_BLOCK_DEVICE) {

            # The SCSI driver for USB devices forces SCSI 3 device to report as SCSI 2.  To get the
            # encryption commands to work, we need to change the level back to SCSI 3.

            my $scsiLevel = `cat /sys$devpath/../../scsi_level`;
            chomp($scsiLevel);
            if ($scsiLevel == $INQ_DATA_SCSI_LEVEL_2) {
                &wdAutoMountLib::performSystemCommand("echo $INQ_DATA_SCSI_LEVEL_3 > /sys$devpath/../../scsi_level");
                my $newScsiLevel = `cat /sys$devpath/../../scsi_level`;
                chomp($newScsiLevel);
                &wdAutoMountLib::logEvent('info', "Changed SCSI level from $scsiLevel to $newScsiLevel for $deviceRecord->{vendor} $deviceRecord->{model}");
            }

            # Attempt to get the drive's standby timer.

            $deviceRecord->{standby_timer} = &wdAutoMountLib::getStandbyTimer($deviceRecord);

            # If the may supports SMART, attempt to get its SMART status.  Send an alert if the
            # drive's SMART status has transitioned to bad.

            if (&supportedSmartDrive($deviceRecord)) {
                my $smart_status = &wdAutoMountLib::getSmartStatus($deviceRecord);
                if (($smart_status eq 'bad') && ($deviceRecord->{smart_status} ne 'bad'))  {
                    &wdAutoMountLib::sendAlert($configParams{usbBadSmartStatus}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\"");
                }
                $deviceRecord->{smart_status} = $smart_status;
                &wdAutoMountLib::logEvent('info', "SMART status $smart_status");
            }

            # Update the database with the SCSI devname and any newly discovered drive values.

            &wdAutoMountLib::performDatabaseCommand(\%configParams, "UPDATE Devices SET smart_status='$deviceRecord->{smart_status}', standby_timer='$deviceRecord->{standby_timer}', scsi_devname='$deviceRecord->{scsi_devname}' WHERE handle='$deviceRecord->{handle}'");
            &wdAutoMountLib::databaseChangeNotification();
        }
    }
}

# Process a "Disk Added" udev Event
#
# @global   ENV{DEVNAME}        udev event device name environment variable
# @global   ENV{DEVPATH}        udev event device path environment variable
# @global   ENV{ID_FS_USAGE}    udev event partition usage environment variable
# @global   ENV{ID_FS_TYPE}     udev event partition type environment variable
# @global   ENV{ID_FS_LABEL}    udev event partition label environment variable
# @global   configParams        global configuration parameters (such as file locations)
#
# To force the kernel to discover partitions from a locked drive after it has been unlocked, a
# command must be issued to the disk device.  This function gets the devname of a block device
# associated with a lockable drive that has not yet obtained the needed devname.  If the device
# supports encryption, its encryption status will be obtained.  If the device is locked, the
# password hint will read from the device's handy store.  An Attempt to unlock the drive will be
# made if the password hash was previously saved.  If the device was successfully unlocked, the
# kernel will be signaled to reread the partition table so that partition discovery will be
# performed. If this device reports its partition on its disk (instead of reporting it separately
# as a partition), add it now because we will not get a partition added event.

sub processDiskAddedEvent {

    my $deviceRecord = undef;
    my $devpath = &wdAutoMountLib::getEnv('DEVPATH', 1);
    my @deviceList = &wdAutoMountLib::getDeviceList(\%configParams, "WHERE connected='1'");
    foreach my $record (@deviceList) {
        if ($devpath =~ /^$record->{devpath}/) {
            if (($record->{lock_state} eq 'pending') && ($record->{devname} eq '')) {
                $deviceRecord = $record;
            }
            last;
        }
    }

    # If the disk device was found, it's a WD drive that supports encryption.  Get it's lock state
    # and password hint.  Attempt to unlock the drive if we have a password hash saved.  If the
    # disk was unlocked, force Linux to read the partition table and discover partitions.

    if (defined($deviceRecord)) {
        $deviceRecord->{devname} = &wdAutoMountLib::getEnv('DEVNAME');
        $deviceRecord->{lock_state} = &wdAutoMountLib::getLockState($deviceRecord, 1);
        $deviceRecord->{password_hint} = '';
        if ($deviceRecord->{lock_state} eq 'locked') {
            my $securityRecord = &wdAutoMountLib::getSecurityInfo($deviceRecord);
            $deviceRecord->{password_hint} = $securityRecord->{password_hint};
            if ($deviceRecord->{password_hash} ne '') {
                $deviceRecord->{lock_state} = &wdAutoMountLib::unlockDrive($deviceRecord, $securityRecord);
            }
        }

        # If the device is locked, send an alert.  Then, update the database with the devname and
        # any newly discovered drive values.

        if ($deviceRecord->{lock_state} eq 'locked') {
            &wdAutoMountLib::sendAlert($configParams{usbLockedDevice}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\"");
        }

        &wdAutoMountLib::performDatabaseCommand(\%configParams, "UPDATE Devices SET devname='$deviceRecord->{devname}', lock_state='$deviceRecord->{lock_state}', password_hint='$deviceRecord->{password_hint}' WHERE handle='$deviceRecord->{handle}'");
    }

    # Some devices don't have a partition table and put the partition on the block device.  If this
    # device reports having a supported filesystem, treat it as a partition.

    my %partitionRecord = ();
    $partitionRecord{usage} = &wdAutoMountLib::getEnv('ID_FS_USAGE');
    $partitionRecord{type} = &wdAutoMountLib::getEnv('ID_FS_TYPE');
    $partitionRecord{label} = &wdAutoMountLib::getEnv('ID_FS_LABEL');

    if (&supportedPartition(\%partitionRecord)) {
        processPartitionAddedEvent();
    }
}

# Process a "Disk Removed" udev Event
#
# @global   ENV{ID_FS_USAGE}    udev event partition usage environment variable
# @global   ENV{ID_FS_TYPE}     udev event partition type environment variable
# @global   ENV{ID_FS_LABEL}    udev event partition label environment variable
#
# If this device reports its partition on its disk (instead of reporting it separately as a
# partition), remove it now because we will not get a partition removed event.

sub processDiskRemovedEvent {

    # Some devices don't have a partition table and put the partition on the block device.  If this
    # device reports having a supported filesystem, treat it as a partition.

    my %partitionRecord = ();
    $partitionRecord{usage} = &wdAutoMountLib::getEnv('ID_FS_USAGE');
    $partitionRecord{type} = &wdAutoMountLib::getEnv('ID_FS_TYPE');
    $partitionRecord{label} = &wdAutoMountLib::getEnv('ID_FS_LABEL');

    if (&supportedPartition(\%partitionRecord)) {
        processPartitionRemovedEvent();
    }
}

# Process a "Partition Added" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)

sub processPartitionAddedEvent {

    my $partitionRecord = &createPartitionRecord();
    my $deviceRecord = $partitionRecord->{deviceRecord};

    # If the device associated with the partition couldn't be found, do not process the
    # partition event.

    if (!defined($deviceRecord)) {
        &wdAutoMountLib::logPartitionEvent('warn', 'Device not found for partition', $partitionRecord);
        return;
    }

    # If the partition is not supported (for reasons such as having an unsupported filesystem), do
    # not process it and send an alert if it is not also to be ignored.

    if (!&supportedPartition($partitionRecord)) {
        &wdAutoMountLib::logPartitionEvent('warn', 'Unsupported partitions', $partitionRecord);
        if (!&ignorePartition($partitionRecord)) {
            &wdAutoMountLib::sendAlert($configParams{usbUnsupportedFilesystem}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\" \"$partitionRecord->{type}\" \"$partitionRecord->{label}\"");
        }
        return;
    }

    # Create a share name for the partition.  Then, attempt to mount the partition and create a
    # share for it.  If the operation failed, send an alert.  Otherwise, update the database
    # with the partition information.

    &wdAutoMountLib::createShareName(\%configParams, $partitionRecord);

    if (&wdAutoMountLib::mountAndCreateShare(\%configParams, $partitionRecord, 'total') != $STATUS_SUCCESS) {
        &wdAutoMountLib::sendAlert($configParams{usbUnableToCreateShare}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\" \"$partitionRecord->{type}\" \"$partitionRecord->{label}\" \"$partitionRecord->{share_name}\"");
    }
    else {
        &wdAutoMountLib::updateDatabaseForAddedPartition(\%configParams, $partitionRecord);
        &wdAutoMountLib::logPartitionEvent('info', 'Partition added', $partitionRecord);
        &wdAutoMountLib::databaseChangeNotification();
        if ($partitionRecord->{read_only} eq 'true') {
            &wdAutoMountLib::sendAlert($configParams{usbReadOnlyPartition}, "\"$partitionRecord->{share_name}\"");
        }
    }
}

# Process a "Partition Removed" udev Event
#
# @global   configParams    global configuration parameters (such as file locations)

sub processPartitionRemovedEvent {

    my $partitionRecord = &createPartitionRecord();

    # If the removed partition is still recorded as connected, unmount it, delete its share, update
    # the database to show the partition as removed, and signal that the USB database has changed.
    # If the user performed an ejected on the device before removing it, the partition will not
    # show up as connected and there will be no additional work to do.  Also, send an alert that an
    # unsafe removal was performed.  The user should have ejected the drive before removing it.  If
    # an ejected was performed on the device before removing it, the partition will not show up as
    # connected and there will be no additional work to do.

    if ($partitionRecord->{connected}) {
        my $deviceRecord = $partitionRecord->{deviceRecord};
        &wdAutoMountLib::unmountAndDeleteShare(\%configParams, $partitionRecord, 'total');
        &wdAutoMountLib::markPartitionAsRemoved(\%configParams, $partitionRecord);
        &wdAutoMountLib::sendAlert($configParams{usbUnsafeDeviceRemoval}, "\"$deviceRecord->{vendor}\" \"$deviceRecord->{model}\" \"$deviceRecord->{serial_number}\" \"$partitionRecord->{share_name}\"");
        &wdAutoMountLib::logPartitionEvent('info', 'Partition removed', $partitionRecord);
        &wdAutoMountLib::databaseChangeNotification();
    }
}

# Create USB Device Record
#
# @global   ENV{ID_VENDOR}          udev event vendor environment variable
# @global   ENV{ID_MODEL}           udev event model environment variable
# @global   ENV{ID_SERIAL_SHORT}    udev event serial number environment variable
# @global   ENV{ID_REVISION}        udev event revision environment variable
# @global   ENV{DEVPATH}            udev event device path environment variable
# @global   ENV{ID_USB_INTERFACES}  udev event USB interface descriptor environment variable
# @global   configParams            global configuration parameters (such as file locations)
#
# Create a record to describe the USB device being added or removed.  Many of the attributes are
# taken from udev environment variables that describe the device.  The other attributes are:
# timestamp - the time when the device was last added, handle - used to uniquely identify a device
# in the database, lock_state - indicates the lock state of the device (which will be determine
# later during discovery), ptp - indicates if the device supports PTP,  in_database - indicates if
# the device was previously connected to the system and already in the database (and is only used
# during "add", and connected - indicates if the device is still connected to the controller (and
# is only used during a "remove".  A device is not considered connected if the user performed an
# eject operation on the device.

sub createUsbDeviceRecord {

    # Initialize all the attributes that are provided from the udev event (through environment
    # variables).  Also, indicate that the device is not a PTP device.

    my %deviceRecord = ();
    $deviceRecord{vendor} = &wdAutoMountLib::getEnv('ID_VENDOR');
    $deviceRecord{model} = &wdAutoMountLib::getEnv('ID_MODEL');
    $deviceRecord{serial_number} = &wdAutoMountLib::getEnv('ID_SERIAL_SHORT');
    $deviceRecord{revision} = &wdAutoMountLib::getEnv('ID_REVISION');
    $deviceRecord{devpath} = &wdAutoMountLib::getEnv('DEVPATH', 1);
    $deviceRecord{interfaces} = &wdAutoMountLib::getEnv('ID_USB_INTERFACES');
    $deviceRecord{ptp} = 'false';

    # If the device is not supported, the record is initialize enough.  Unsupported devices are not
    # recorded in the database.  They do cause an alert to be sent so the basic device information
    # needed to be initialized.

    if (!&supportedDevice(\%deviceRecord)) {
        return \%deviceRecord;
    }

    # If the device is being added, set its lock state to unsupported (until later when we can
    # determine if the device supports locking) and assign it a new timestamp.  Next, check if
    # the device is in the database (which means it had previously been attached). We use vendor,
    # model, and serial number to identify the device.  Unfortunately, serial number may not be
    # supported, in which case this is a weak method to identify a device.  We check database
    # entries for devices not connected to avoid devices with the same vendor and model and no
    # serial number from grabbing the same handle.  When the device is found in the database, use
    # the unique handle previously assigned the device.  If it's not in the database, create
    # a unique handle for the device.

    my $action = &wdAutoMountLib::getEnv('ACTION');
    if ($action eq 'add') {
        $deviceRecord{timestamp} = &wdAutoMountLib::getTimestamp();
        $deviceRecord{connected} = 1;
        $deviceRecord{password_hash} = '';
        $deviceRecord{password_hint} = '';
        $deviceRecord{scsi_devname} = '';
        $deviceRecord{devname} = '';
        $deviceRecord{standby_timer} = 'unsupported';

        # Get The Vendor and Product ID as well as USB information.

        $deviceRecord{usb_port} = &wdAutoMountLib::getUsbPortNumber($deviceRecord{devpath});
        $deviceRecord{usb_version} = &wdAutoMountLib::getUsbVersion($deviceRecord{devpath});
        $deviceRecord{usb_speed} = &wdAutoMountLib::getUsbSpeed($deviceRecord{devpath});
        $deviceRecord{vendor_id} = &wdAutoMountLib::getVendorId($deviceRecord{devpath});
        $deviceRecord{product_id} = &wdAutoMountLib::getProductId($deviceRecord{devpath});

        # Devices that support encryption or may support SMART, need to be communicated with using
        # SCSI commands.  Set the SCSI devname to pending, which will cause the processing of SCSI
        # generic events to find the device's corresponding SCSI device.  After it's found, the
        # lock state and SMART status can be determined.

        if (&supportedSmartDrive(\%deviceRecord)) {
            $deviceRecord{scsi_devname} = 'pending';
            $deviceRecord{smart_status} = 'pending';
        }
        else {
            $deviceRecord{smart_status} = 'unsupported';
        }

        if (&supportedLockableDrive(\%deviceRecord)) {
            $deviceRecord{scsi_devname} = 'pending';
            $deviceRecord{lock_state} = 'pending';
        }
        else {
            $deviceRecord{lock_state} = 'unsupported';
        }

        # If a device with the same vendor, model, and serial number is currently connected, make
        # sure its still connected.  If it's not, remove it and its partitions.

        my $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE vendor='$deviceRecord{vendor}' AND model='$deviceRecord{model}' AND serial_number='$deviceRecord{serial_number}' AND connected='1'");
        if (defined($deviceDatabaseRecord)) {
            my $contents = `ls /sys$deviceDatabaseRecord->{devpath} 2> /dev/null`;
            if ($contents eq '') {
                &wdAutoMountLib::removeDevicePartitions(\%configParams, $deviceDatabaseRecord, 1);
            }
        }

        $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE vendor='$deviceRecord{vendor}' AND model='$deviceRecord{model}' AND serial_number='$deviceRecord{serial_number}' AND connected='0'");
        if (defined($deviceDatabaseRecord) && defined($deviceDatabaseRecord->{handle})) {
            $deviceRecord{handle} = $deviceDatabaseRecord->{handle};
            $deviceRecord{smart_status} = $deviceDatabaseRecord->{smart_status};
            $deviceRecord{in_database} = 1;
        }
        else {
            $deviceRecord{handle} = &wdAutoMountLib::createDriveHandle(\%configParams);
            $deviceRecord{in_database} = 0;
        }
    }

    # If the device is being removed, get is handle and timestamp based on its devpath, which is
    # unique for all connected devices.  If the user performed a software "eject", the device
    # would have been marked as disconnected, so it would not be found in the database.  If that's
    # the case, set connected as false.

    else {
        my $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE devpath='$deviceRecord{devpath}' AND vendor='$deviceRecord{vendor}' AND model='$deviceRecord{model}' AND serial_number='$deviceRecord{serial_number}' AND connected='1'");
        if (defined($deviceDatabaseRecord) && defined($deviceDatabaseRecord->{handle})) {
            $deviceRecord{handle} = $deviceDatabaseRecord->{handle};
            $deviceRecord{timestamp} = $deviceDatabaseRecord->{timestamp};
            $deviceRecord{smart_status} = $deviceDatabaseRecord->{smart_status};
            $deviceRecord{lock_state} = $deviceDatabaseRecord->{lock_state};
            $deviceRecord{password_hash} = $deviceDatabaseRecord->{password_hash};
            $deviceRecord{devname} = $deviceDatabaseRecord->{devname};
            $deviceRecord{standby_timer} = $deviceDatabaseRecord->{standby_timer};
            $deviceRecord{usb_port} = $deviceDatabaseRecord->{usb_port};
            $deviceRecord{usb_version} = $deviceDatabaseRecord->{usb_version};
            $deviceRecord{usb_speed} = $deviceDatabaseRecord->{usb_speed};
            $deviceRecord{vendor_id} = $deviceDatabaseRecord->{vendor_id};
            $deviceRecord{product_id} = $deviceDatabaseRecord->{product_id};
            $deviceRecord{connected} = 1;
        }
        else {
            $deviceRecord{handle} = '';
            $deviceRecord{timestamp} = '';
            $deviceRecord{smart_status} = '';
            $deviceRecord{lock_state} = '';
            $deviceRecord{password_hash} = '';
            $deviceRecord{connected} = 0;
        }
    }
    return \%deviceRecord;
}

# Create PTP Records
#
# @global   ENV{ID_VENDOR}          udev event vendor environment variable
# @global   ENV{ID_MODEL}           udev event model environment variable
# @global   ENV{ID_SERIAL_SHORT}    udev event serial number environment variable
# @global   ENV{ID_REVISION}        udev event revision environment variable
# @global   ENV{DEVPATH}            udev event device path environment variable
# @global   ENV{DEVNUM}             udev event device number environment variable
# @global   ENV{BUSNUM}             udev event bus number environment variable
# @global   ENV{ID_USB_INTERFACES}  udev event USB interface descriptor environment variable
# @global   configParams            global configuration parameters (such as file locations)
#
# Create a record to describe the USB device being added or removed.  Many of the attributes are
# taken from udev environment variables that describe the device.  The other attributes are:
# timestamp - the time when the device was last added, handle - used to uniquely identify a device
# in the database, lock_state - indicates the lock state of the device (which will be determine
# later during discovery), ptp - indicates if the device supports PTP,  in_database - indicates if
# the device was previously connected to the system and already in the database (and is only used
# during "add", and connected - indicates if the device is still connected to the controller (and
# is only used during a "remove".  A device is not considered connected if the user performed an
# eject operation on the device.
#
# To see if this is a "returning device", on an add, we check against non-connected
# devices with the same vendor, model, and serial number.
#
# Since their can be multiple devices with the same vendor, model, and serial number
# (because serial number is not mandatory), once a device has been inserted and we
# get a udev event, we look it up from its devpath because Linux will ensure no
# other device has the same devpath at the same time.

sub createPtpRecords {

    # Initialize all the attributes that are provided from the udev event (through environment
    # variables).  Also, indicate that this is a PTP device and it doesn't support locking
    # (because locking is only supported on WD drives, which aren't PTP devices).

    my %deviceRecord = ();
    $deviceRecord{vendor} = &wdAutoMountLib::getEnv('ID_VENDOR');
    $deviceRecord{model} = &wdAutoMountLib::getEnv('ID_MODEL');
    $deviceRecord{serial_number} = &wdAutoMountLib::getEnv('ID_SERIAL_SHORT');
    $deviceRecord{revision} = &wdAutoMountLib::getEnv('ID_REVISION');
    $deviceRecord{devname} = &wdAutoMountLib::getEnv('DEVNAME');
    $deviceRecord{interfaces} = &wdAutoMountLib::getEnv('ID_USB_INTERFACES');
    $deviceRecord{devpath} = &wdAutoMountLib::getEnv('DEVPATH', 1);
    $deviceRecord{ptp} = 'true';
    $deviceRecord{smart_status} = 'unsupported';
    $deviceRecord{lock_state} = 'unsupported';
    $deviceRecord{standby_timer} = 'unsupported';
    $deviceRecord{password_hash} = '';
    $deviceRecord{password_hint} = '';
    $deviceRecord{scsi_devname} = '';

    my $devnum = &wdAutoMountLib::getEnv('DEVNUM');
    my $busnum = &wdAutoMountLib::getEnv('BUSNUM');
    my $port = "usb:$busnum,$devnum";

    my $action = &wdAutoMountLib::getEnv('ACTION');
    if ($action eq 'add') {

        $deviceRecord{timestamp} = &wdAutoMountLib::getTimestamp();

        # Get The Vendor and Product ID as well as USB information.

        $deviceRecord{usb_port} = &wdAutoMountLib::getUsbPortNumber($deviceRecord{devpath});
        $deviceRecord{usb_version} = &wdAutoMountLib::getUsbVersion($deviceRecord{devpath});
        $deviceRecord{usb_speed} = &wdAutoMountLib::getUsbSpeed($deviceRecord{devpath});
        $deviceRecord{vendor_id} = &wdAutoMountLib::getVendorId($deviceRecord{devpath});
        $deviceRecord{product_id} = &wdAutoMountLib::getProductId($deviceRecord{devpath});

        my $data = `gphoto2 --port="$port" --summary`;
        if (defined($data)) {
            &wdAutoMountLib::updateRecordValue(\%deviceRecord, 'vendor', 'Manufacturer', $data);
            &wdAutoMountLib::updateRecordValue(\%deviceRecord, 'model', 'Model', $data);
            &wdAutoMountLib::updateRecordValue(\%deviceRecord, 'revision', 'Version', $data);
            &wdAutoMountLib::updateRecordValue(\%deviceRecord, 'serial_number', 'Serial Number', $data);
        }

        # If a device with the same vendor, model, and serial number is currently connected, make
        # sure its still connected.  If it's not, remove it and its partitions.

        my $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE vendor='$deviceRecord{vendor}' AND model='$deviceRecord{model}' AND serial_number='$deviceRecord{serial_number}' AND connected='1'");
        if (defined($deviceDatabaseRecord)) {
            my $contents = `ls /sys$deviceDatabaseRecord->{devpath} 2> /dev/null`;
            if ($contents eq '') {
                &wdAutoMountLib::removeDevicePartitions(\%configParams, $deviceDatabaseRecord, 1);
            }
        }

        $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE vendor='$deviceRecord{vendor}' AND model='$deviceRecord{model}' AND serial_number='$deviceRecord{serial_number}' AND connected='0'");
        if (defined($deviceDatabaseRecord) && defined($deviceDatabaseRecord->{handle})) {
            $deviceRecord{handle} = $deviceDatabaseRecord->{handle};
            $deviceRecord{in_database} = 1;
        }
        else {
            $deviceRecord{in_database} = 0;
            $deviceRecord{handle} = &wdAutoMountLib::createDriveHandle(\%configParams);
        }
    }
    else {
        my $deviceDatabaseRecord = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE devpath='$deviceRecord{devpath}' AND connected='1'");
        if (defined($deviceDatabaseRecord) && defined($deviceDatabaseRecord->{handle})) {
            $deviceRecord{handle} = $deviceDatabaseRecord->{handle};
            $deviceRecord{timestamp} = $deviceDatabaseRecord->{timestamp};
            $deviceRecord{vendor} = $deviceDatabaseRecord->{vendor};
            $deviceRecord{model} = $deviceDatabaseRecord->{model};
            $deviceRecord{serial_number} = $deviceDatabaseRecord->{serial_number};
            $deviceRecord{revision} = $deviceDatabaseRecord->{revision};
            $deviceRecord{standby_timer} = $deviceDatabaseRecord->{standby_timer};
            $deviceRecord{usb_port} = $deviceDatabaseRecord->{usb_port};
            $deviceRecord{usb_version} = $deviceDatabaseRecord->{usb_version};
            $deviceRecord{usb_speed} = $deviceDatabaseRecord->{usb_speed};
            $deviceRecord{vendor_id} = $deviceDatabaseRecord->{vendor_id};
            $deviceRecord{product_id} = $deviceDatabaseRecord->{product_id};
            $deviceRecord{connected} = 1;
        }
        else {
            $deviceRecord{connected} = 0;
        }
    }

    # Now initialize the partition record.

    # First, initialize all the attributes that are provided from the udev event
    # (through environment variables).

    my %partitionRecord = ();
    $partitionRecord{devname} = $port;
    $partitionRecord{label} = '';
    $partitionRecord{type} = 'fuse.gphotofs';
    $partitionRecord{usage} = 'filesystem';
    $partitionRecord{uuid} = $deviceRecord{serial_number};
    $partitionRecord{partition_number} = 1;
    $partitionRecord{share_name} = '';

    $partitionRecord{device_handle} = $deviceRecord{handle};
    $partitionRecord{deviceRecord} = \%deviceRecord;
    $partitionRecord{read_only} = 'true';
    $partitionRecord{mount_time} = '';

    if ($action eq 'add') {

        my $partitionDatabaseRecord = &wdAutoMountLib::getPartitionDatabaseRecord(\%configParams, "WHERE device_handle='$partitionRecord{device_handle}' AND label='$partitionRecord{label}' AND partition_number='$partitionRecord{partition_number}' AND uuid='$partitionRecord{uuid}' AND connected='0'");
        if (defined($partitionDatabaseRecord) && defined($partitionDatabaseRecord->{share_name})) {
            $partitionRecord{id} = $partitionDatabaseRecord->{id};
            $partitionRecord{share_name} = $partitionDatabaseRecord->{share_name};
            $partitionRecord{media_serving} = $partitionDatabaseRecord->{media_serving};
            $partitionRecord{description} = $partitionDatabaseRecord->{description};
            $partitionRecord{public_access} = $partitionDatabaseRecord->{public_access};
            $partitionRecord{in_database} = 1;
        }
        else {
            $partitionRecord{id} = &wdAutoMountLib::createPartitonId(\%configParams);
            $partitionRecord{media_serving} = 'none';
            $partitionRecord{description} = '';
            $partitionRecord{public_access} = 'true';
            $partitionRecord{in_database} = 0;
        }
    }
    else {
        my $partitionDatabaseRecord = &wdAutoMountLib::getPartitionDatabaseRecord(\%configParams, "WHERE devname='$partitionRecord{devname}' AND connected='1'");
        if (defined($partitionDatabaseRecord) && defined($partitionDatabaseRecord->{share_name})) {
            $partitionRecord{id} = $partitionDatabaseRecord->{id};
            $partitionRecord{share_name} = $partitionDatabaseRecord->{share_name};
            $partitionRecord{media_serving} = $partitionDatabaseRecord->{media_serving};
            $partitionRecord{description} = $partitionDatabaseRecord->{description};
            $partitionRecord{public_access} = $partitionDatabaseRecord->{public_access};
            $partitionRecord{mount_time} = $partitionDatabaseRecord->{mount_time};
            $partitionRecord{connected} = 1;
        }
        else {
            $partitionRecord{connected} = 0;
        }
    }
    return (\%deviceRecord, \%partitionRecord);
}

# Create Partition Record
#
# @global   ENV{DEVNAME}            udev event device name environment variable
# @global   ENV{ID_FS_TYPE}         udev event partition type environment variable
# @global   ENV{ID_FS_USAGE}        udev event partition usage environment variable
# @global   ENV{ID_FS_UUID}         udev event partition UUID environment variable
# @global   configParams            global configuration parameters (such as file locations)
#
# Create a record to describe the discovered block partition.  Many of the attributes are taken from
# udev environment variables that describe the partition.  The attributes that are not, are: partition
# number (which is obtained from the Linux assigned device name); vendor, model, and serial number
# (which are taken from the USB device associated with the partition and is obtain a little later),
# and share name which is created later.

sub createPartitionRecord {

    # Initialize all the attributes that are provided from the udev event (through environment
    # variables).  Determine the partition number from the device name.

    my %partitionRecord = ();
    $partitionRecord{devname} = &wdAutoMountLib::getEnv('DEVNAME');
    $partitionRecord{type} = &wdAutoMountLib::getEnv('ID_FS_TYPE');
    $partitionRecord{usage} = &wdAutoMountLib::getEnv('ID_FS_USAGE');
    $partitionRecord{uuid} = &wdAutoMountLib::getEnv('ID_FS_UUID');
    ($partitionRecord{partition_number}) = $partitionRecord{devname} =~ /[a-z,A-Z]([0-9]+)/;
    if (!defined($partitionRecord{partition_number})) {
        $partitionRecord{partition_number} = 0;
    }

    # These attributes will only be initialized on an "add" to allow a share name to be created if
    # no label is available.

    $partitionRecord{read_only} = 'false';
    $partitionRecord{deviceRecord} = undef;
    $partitionRecord{device_handle} = '';
    $partitionRecord{mount_time} = '';

    my $action = &wdAutoMountLib::getEnv('ACTION');
    if ($action eq 'add') {

        # Get the partition label using the blkid utility.  Do not allow it to use a cache file
        # because it may return the wrong label for partitions with no label.  When a partition
        # has no defined label, set it as an empty string.

        my $result = `/sbin/blkid $partitionRecord{devname} -s LABEL  -c /dev/null`;
        chomp($result);
        ($partitionRecord{label}) = $result =~ /LABEL=\"(.+)\"/;
        if (!defined($partitionRecord{label})) {
            $partitionRecord{label} = '';
        }

        # Replace unsupported characters in the volume label with underscores.

        $partitionRecord{label} =~ s/[\$\`\'"\\]/_/g;

        $partitionRecord{share_name} = '';
        my $devpath = &wdAutoMountLib::getEnv('DEVPATH', 1);
        my @deviceList = &wdAutoMountLib::getDeviceList(\%configParams, "WHERE connected='1'");
        foreach my $deviceRecord (@deviceList) {
            if ($devpath =~ /^$deviceRecord->{devpath}/) {
                $partitionRecord{deviceRecord} = $deviceRecord;
                $partitionRecord{device_handle} = $deviceRecord->{handle};
                last;
            }
        }

        if (!defined($partitionRecord{deviceRecord})) {
            return \%partitionRecord;
        }
        my $partitionDatabaseRecord = &wdAutoMountLib::getPartitionDatabaseRecord(\%configParams, "WHERE device_handle='$partitionRecord{device_handle}' AND partition_number='$partitionRecord{partition_number}' AND uuid='$partitionRecord{uuid}' AND connected='0'");
        if (defined($partitionDatabaseRecord)) {
            $partitionRecord{id} = $partitionDatabaseRecord->{id};
            $partitionRecord{share_name} = $partitionDatabaseRecord->{share_name};
            $partitionRecord{media_serving} = $partitionDatabaseRecord->{media_serving};
            $partitionRecord{description} = $partitionDatabaseRecord->{description};
            $partitionRecord{public_access} = $partitionDatabaseRecord->{public_access};
            $partitionRecord{in_database} = 1;

            # If the label has changed (and it not empty), attempt to change the share name to
            # match the new label.  Update the database so that the partition and its associated
            # share access use the new share name.

            if (($partitionRecord{label} ne $partitionDatabaseRecord->{label}) && ($partitionRecord{label} ne ''))  {
                my $oldShareName = $partitionRecord{share_name};
                &wdAutoMountLib::createShareName(\%configParams, \%partitionRecord, "forcedUpdate");
                &wdAutoMountLib::performDatabaseCommands(\%configParams,
                    "UPDATE ShareAccess SET share_name='$partitionRecord{share_name}' WHERE share_name='$oldShareName'",
                    "UPDATE Partitions SET label='$partitionRecord{label}', share_name='$partitionRecord{share_name}' WHERE share_name='$oldShareName'");
                &wdAutoMountLib::logEvent('info', "Renamed share $oldShareName to $partitionRecord{share_name} due to label change");
            }
        }
        else {
            $partitionRecord{id} = &wdAutoMountLib::createPartitonId(\%configParams);
            $partitionRecord{in_database} = 0;
            $partitionRecord{media_serving} = 'any';
            $partitionRecord{description} = '';

            # Partitions discovered from an unlocked drive must have private access.

            if ($partitionRecord{deviceRecord}->{lock_state} eq 'unlocked') {
                $partitionRecord{public_access} = 'false';
            }
            else {
                $partitionRecord{public_access} = 'true';
            }
        }
    }
    else {
        my $partitionDatabaseRecord = &wdAutoMountLib::getPartitionDatabaseRecord(\%configParams, "WHERE devname='$partitionRecord{devname}' AND connected='1'");
        if (defined($partitionDatabaseRecord)) {
            $partitionRecord{id} = $partitionDatabaseRecord->{id};
            $partitionRecord{share_name} = $partitionDatabaseRecord->{share_name};
            $partitionRecord{label} = $partitionDatabaseRecord->{label};
            $partitionRecord{device_handle} = $partitionDatabaseRecord->{device_handle};
            $partitionRecord{mount_time} = $partitionDatabaseRecord->{mount_time};
            $partitionRecord{deviceRecord} = &wdAutoMountLib::getDeviceDatabaseRecord(\%configParams, "WHERE handle='$partitionRecord{device_handle}' AND connected='1'");
            $partitionRecord{connected} = 1;
        }
        else {
            $partitionRecord{connected} = 0;
        }
    }
    return \%partitionRecord;
}

# Supported Partition
#
# @param    partitionRecord    record that describes the partition to be checked
#
# @return   true if the partition is supported, false otherwise
#
# Currently, only the following filesystems are supported: XFS, NTFS, EXT2, EXT3, EXT4, HFS+, and
# VFAT (FAT16 & FAT32).  A partition that is to be ignored (such as Apple's hidden partitions) will
# be treated as unsupported.

sub supportedPartition {
    my($partitionRecord) = @_;
    return (defined($partitionRecord->{usage}) && defined($partitionRecord->{type}) && defined($partitionRecord->{label})
           && ($partitionRecord->{usage} eq 'filesystem') && ($partitionRecord->{type} =~ /^(xfs|ntfs|vfat|hfsplus|ext[234])$/)
           && !ignorePartition($partitionRecord));
}

# Ignore Partition
#
# @param    partitionRecord    record that describes the partition to be checked
#
# @return   true if the partition is to be ignored, false otherwise
#
# Ignore both swap and unnamed filesystems.  Also ignore Apple's hidden partitions which are either
# a vfat partition that is labeled 'EFI' or an hfsplus partition that is labeled 'Boot OS X' (with
# or without a space between 'OS' and 'X'). Ignored partitions will not be added to the database
# and won't cause unsupported filesystem alerts.

sub ignorePartition {
    my($partitionRecord) = @_;
    return (($partitionRecord->{type} eq 'swap') || ($partitionRecord->{type} eq '')
           || (($partitionRecord->{type} eq 'vfat') && ($partitionRecord->{label} eq 'EFI'))
           || (($partitionRecord->{type} eq 'hfsplus') && ($partitionRecord->{label} =~ /^Boot OS( |)X$/i)));
}

# Supported Device
#
# @param    deviceRecord    record that describes the device to be checked
#
# @return   true if the device is supported, false otherwise
#
# Currently, the only Media Storage Class and PTP devices are supported.

sub supportedDevice {
    my($deviceRecord) = @_;
    return ($deviceRecord->{interfaces} =~ /(:08)|(:060101:)/);
}

# Ignore Device
#
# @param    deviceRecord    record that describes the device to be checked
#
# @return   true if the device is to be ignored, false otherwise
#
# Ignore the device is it is an USB hub, which means it wouldn't be added to the database and won't
# cause an unsupported device alert.

sub ignoreDevice {
    my($deviceRecord) = @_;
    return ($deviceRecord->{interfaces} =~ /:09/);
}

# Supported Lockable Drive
#
# @param    deviceRecord    record that describes the device to be checked
#
# @return   true if the device is a supported lockable WD drive, false otherwise
#
# The only lockable drives supported are WD drives that are on a white list.

sub supportedLockableDrive {
    my($deviceRecord) = @_;

    # If the vendor ID is support (WD), read the file of support product IDs and compare them to
    # the device's product ID.  If one matches, the device is supported.

    my $status = 0;
    if ($deviceRecord->{vendor_id} eq $WD_VENDOR_ID) {

        my $inputFilename = '/etc/nas/wdLockableDrives';
        open(INPUT_FILE, "$inputFilename");
        while (<INPUT_FILE>) {
            my $whiteListProductId = lc($_);
            chomp($whiteListProductId);

            if ($whiteListProductId eq $deviceRecord->{product_id}) {
                $status = 1;
                last;
            }
        }
        close(INPUT_FILE);
    }
    return $status;
}

# Supported SMART Drive
#
# @param    deviceRecord    record that describes the device to be checked
#
# @return   true if we can attempt to get SMART data from the drive, false otherwise
#
# Currently, the reading of SMART status is only supported on WD drives.

sub supportedSmartDrive {
    my($deviceRecord) = @_;
    return ($deviceRecord->{vendor_id} eq $WD_VENDOR_ID) ? 1 : 0;
}


