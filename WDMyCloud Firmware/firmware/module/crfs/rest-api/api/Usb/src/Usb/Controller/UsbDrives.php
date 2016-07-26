<?php

/**
 * \file usb_drives/UsbDrives.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Usb\Controller;

/**
 * \class UsbDrives
 * \brief This component provides services that operate on all Usb drives.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class UsbDrives /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'usb_drives';

    /**
     * \par Description:
     * The GET request is used to obtain information about all the Usb drives
     * connected to the NAS (that have not been ejected).
     *
     * \par Security:
     * - No authentication if request is from LAN. User authentication required from WAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/usb_drives
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *  format: refer main page for details
     *
     * \retval usb_drives - Array of Usb Drives connected
     * - name: Since drives are not assigned names, the name is built from combining the vendor
     *         and model information (or assigned "Usb device", if both the vendor and model are not given).
     * - handle:  {drive handle}
     * - serial_number:  {serial number}
     * - vendor:  {vendor}
     * - model:  {model}
     * - revision:  {revision number}
     * - ptp:  {true/false} - Picture Transfer Protocol. The other protocol is MSC (Mass Storage Class), default for digital cameras.
     * - smart_status:  {unsupported/good/bad} - Self-Monitoring, Analysis and Reporting Technology.
     *                  Unsupported - the drive does not have SMART functionality.
     *                  Good - the drive is functioning correctly and is not predicting failure.
     *                  Bad - the drive is predicting imminent failure.
     * - lock_state:  {unsupported/locked/unlocked/security_off} - The data on the drives can be "locked" and require a password to "unlock" (which allows access to the decrypted data).
     *                Unsupported - the drive does not support encryption.
     *                Locked - the encrypted drive is locked (requiring a password to unlock).
     *                Unlocked - the encrypted drive is unlocked (a password was used to unlock).
     *                Security_off - the encrypted drive has not be configured for security (does not require a password to access data).
     * - password_hint: {hint} - The password_hint is only included in the response when the device supports.
     *                   locking (has a lock_state of locked or unlocked).
     * - vendor_id:  {vendor ID}
     * - product_id:  {product ID}
     * - standby_timer:  {unsupported/disabled/error/time out value in deciseconds} - This indicate how long a drive has to be idle before going into standby/sleep mode.
     *                   Unsupported - the drive does not support the standby timer functionality
     *                   Disabled - the drive supports standby timer functionality but is disabled (will never go into standby/sleep mode)
     *                   Error - the standby timer functionality is not working correctly
     *                   Timer value - the numeric value of the standby timer in deciseconds (1/10 of a second)
     * - usb_port:  {1/2/3/4}
     * - usb_version:  {1.0/1.1/2.0/2.1/3.0/unknown}
     * - usb_speed:  {1.5/12/480/5000/unknown(in Mbps)}
     * - is_connected:  {true/false}
     * - volume_id:  {volume ID}
     * - base_path:  {shares directory mount point}
     * - label:  {volume label}
     * - mounted_date:  {Unix time when volume mounted}
     * - usage: {given in MB} - usage is the sum of the used capacities of all the partitions using a supported filesystem.
     *           The value of usage can obviously change over time as users create and delete files on a partition.
     * - capacity: {given in MB} - The capacity reported is not the total size of the drive but rather the sum of the capacities
     *  			of all the partitions that use a supported filesystem (FAT16, FAT32, NTFS, EXT2, EXT3, EXT4, XFS, HFS, and HFS+).
     *  			Discovery of a Usb drive and its associated partitions is not an atomic operation.
     *              The information about the drive and its partitions will be obtained from the Linux device manager (udev)
     *              one at a time.  As a result, if a GET is performed on a device that has
     *              not yet had all its partitions discovered, it will report a capacity that
     *              will be less than the value given once all of its partitions are discovered.
     * - share: {share name}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return information of connected usb drives
     * - 401 - User is not authorized
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 208 - USB_INTERNAL_SERVER_ERROR - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
<usb_drives>
    <usb_drive>
    <name>SanDisk Cruzer</name>
    <handle>1</handle>
    <serial_number>1000150906110937598D</serial_number>
    <vendor>SanDisk</vendor>
    <model>Cruzer</model>
    <revision>1100</revision>
    <ptp>false</ptp>
    <smart_status>unsupported</smart_status>
    <standby_timer>unsupported</standby_timer>
    <lock_state>unsupported</lock_state>
    <usage>875.061248</usage>
    <capacity>7988.678656</capacity>
    <vendor_id>0781</vendor_id>
    <product_id>5530</product_id>
    <usb_port>2</usb_port>
    <usb_version>2.0</usb_version>
    <usb_speed>480</usb_speed>
    <is_connected>true</is_connected>
    <volumes>
        <volume>
            <volume_id>1</volume_id>
            <base_path>/shares/Cruzer</base_path>
            <label></label>
            <mounted_date>1338572532</mounted_date>
            <usage>875.061248</usage>
            <capacity>7988.678656</capacity>
            <read_only>false</read_only>
            <shares>
                <share>Cruzer</share>
            </shares>
        </volume>
    </volumes>
    </usb_drive>
</usb_drives>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $output = array();
        $retVal = null;
        exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm \"getDrives\"", $output, $retVal);

        if ($retVal !== 0) {
            throw new \Core\Rest\Exception('USB_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        } else {
            //Currently, the array we receive from shell script consists a few empty lines. This is breaking API's JSON output, so removing all empty lines first.
            //Script Output:
            /*
             *  usb_drives
             *      usb_drive
             *         name=Corporation USB_DISK
             *         handle=00120807133736R6I3SH
             *         ***
             *         volumes
             *             volume
             *                 volume_id=00120807133736R6I3SH_1
             *                 ***
             *                 shares
             *                 share=USB_DISK-1
             *             volume
             *                 volume_id=00120807133736R6I3SH_5
             *                 ***
             *                 shares
             *                 share=USB_DISK-5
             */
            $outputWriter = new \OutputWriter(strtoupper($outputFormat));
            $outputWriter->pushElement(self::COMPONENT_NAME);
            if(!empty($output[1])){
                foreach($output as $line){
                    if(strlen($line) > 0){
                        $elements[] = $line;
                    }
                }
                $outputWriter->pushArray('usb_drive');
                $outputWriter->pushArrayElement();
                foreach ($elements as $key => $line) {
                    if (($line === 'usb_drive') && $key != 1) {
                        $outputWriter->popArray();
                        $outputWriter->popElement();
                        $outputWriter->popArrayElement();
                        $outputWriter->pushArrayElement();
                    } elseif (strpos($line, '=') != false) {
                        $pair = explode('=', $line);
                        if($pair[0] === 'volume_id'){
                            $outputWriter->pushArrayElement();
                        }
                        $outputWriter->element($pair[0], $pair[1]);
                        if($pair[0] === 'share'){
                            $outputWriter->popElement();
                            $outputWriter->popArrayElement();
                        }
                    } elseif ($line === 'volumes'){
                        $outputWriter->pushElement('volumes');
                        $outputWriter->pushArray('volume');
                    } elseif ($line === 'shares'){
                        $outputWriter->pushElement('shares');
                    }
                }
                $outputWriter->popArray();
                $outputWriter->popElement();
                $outputWriter->popArrayElement();
                $outputWriter->popArray();
            }
            $outputWriter->popElement();
            $outputWriter->close();
        }
    }
}

