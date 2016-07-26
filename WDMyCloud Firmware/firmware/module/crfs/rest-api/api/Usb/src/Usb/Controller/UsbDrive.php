<?php

/**
 * \file usb_drive/UsbDrive.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Usb\Controller;

// Defined Return Values

define("RET_VAL_SUCCESS", 0);
define("RET_VAL_FAILURE", 1);
define("RET_VAL_ERROR_DRIVE_NOT_FOUND", 2);
define("RET_VAL_ERROR_DRIVE_NOT_LOCKED", 3);
define("RET_VAL_ERROR_PASSWORD_MISSING", 4);
define("RET_VAL_ERROR_UNLOCK_FAILED", 5);
define("RET_VAL_ERROR_UNLOCK_ATTEMPTS_EXCEEDED", 6);
define("RET_VAL_ERROR_STANDBY_TIMER_UNSUPPORTED", 7);

/**
 * \class UsbDrive
 * \brief This component provides services to obtain information about a Usb drive,
 *  unlock a Usb drive, eject a Usb drive and set standby timer of Usb drive. The
 *  format of a Usb drive error response is shown below.  The specific error codes
 *  that can be returned will be described for each request.
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <usb_drive>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </usb_drive>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class UsbDrive /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'usb_drive';

    /**
     * \par Description:
     * The GET request is used to obtain information about a specified Usb drive.
     *
     * \par Security:
     * - No authentication if request is from LAN. User authentication required from WAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/usb_drive/{handle}
     *
     * \param handle    Integer - required (Usb handle)
     * \param format    String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - handle: Usb handle
     *
     * \retval usb_drive - Usb drive info
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
     * - 200 - On successful returns information about the Usb drive
     * - 400 - Bad request, handle id not given
     * - 401 - User is not authorized
     * - 404 - Request resource not found, usb drive does not exists
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 191 - USB_ERROR_DRIVE_NOT_FOUND - Drive not found
     * - 192 - USB_ERROR_DRIVE_HANDLE_MISSING - Drive handle missing
     * - 208 - INTERNAL_ERROR - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
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
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $handle = isset($urlPath[0]) && !(strcmp($urlPath[0], "") == 0) ? trim($urlPath[0]) : null;
        //self::$logObj->LogData('OUTPUT', __CLASS__, __FUNCTION__, "PARAMS: (handle=$handle)");

        if ($handle == null) {
            throw new \Core\Rest\Exception('USB_ERROR_DRIVE_HANDLE_MISSING', 400, null, self::COMPONENT_NAME);
        } else {
            $output = $retVal = null;
            exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm \"getDrive\" \"$handle\"", $output, $retVal);

            if ($retVal == RET_VAL_ERROR_DRIVE_NOT_FOUND) {
                throw new \Core\Rest\Exception('USB_ERROR_DRIVE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            } elseif ($retVal !== RET_VAL_SUCCESS) {
                throw new \Core\Rest\Exception('INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
            } else {
                $this->generateOutput(200, $output, $outputFormat);
            }
        }
    }

    /**
     * \par Description:
     * The PUT request can be used to unlock a locked Usb drive. To unlock the
     * drive, the drive password must be specified and an optional "encoding"
     * parameter can be used to indicate how the password is encoded.  If it is
     * not specified, the password must be encoded in utf-8.  The "save" parameter
     * is also optional and is used to indicate if the password is to be saved
     * and used to automatically unlock the drive every time it is connected to
     * the NAS.  If the "save" parameter is not specified, the password will not
     * be saved.  To make the NAS no longer save the password, the PUT must be issued
     * without the "password" parameter and with the "save" parameter set to false.
     * That will cause the NAS to delete the saved password and not automatically
     * attempt to unlock the drive when it is connected.  When the request fails
     * with "Unlock failed - unlock attempts exceeded" you need to reset the drive by
     * unplugging the drive from the NAS and plug back in or you can powered off and
     * back on the drive before it will allow further unlock attempts.
     *
     * In addition to unlocking the drive, the standby timer can be configured.
     * Setting the standby timer and unlocking the drive are mutually exclusive
     * in that the same put can not be used to unlock the drive and set its standby
     * timer.  A request standby time value of zero disables standby timer.  Not all
     * time-out values are supported by all drives so the actual time-out set is
     * returned in the success response.
     *
     * \par Security:
     * - Requires user authentication (LAN/WAN)
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/usb_drive/{handle}
     *
     * \param handle            Integer - required (Usb handle)
     * \param drive_password    String  - optional
     * \param encoding          String  - optional
     * \param save              String  - optional
     * \param standby_timer     String  - optional
     * \param format            String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - handle: Usb handle
     * - drive_password: {base64 encoded password}
     * - encoding: {base64/utf-8}
     * - save: true/false
     * - standby_timer: {0 means disable standby timer | number representing number of
     *   deciseconds(An unit of time equal to 1/10 seconds) before entering standby}
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful change of Usb drive settings
     * - 401 - User is not authorized
     * - 400 - Bad request, handle id not given or password not given or other bad request values
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 191 - USB_ERROR_DRIVE_NOT_FOUND - Usb drive not found
     * - 192 - USB_ERROR_DRIVE_HANDLE_MISSING - Drive handle missing
     * - 193 - USB_ERROR_PASSWORD_MISSING - Password missing
     * - 194 - USB_ERROR_INVALID_SAVE_VALUE - Invalid save value
     * - 195 - USB_ERROR_DRIVE_NOT_LOCKED - Drive not locked
     * - 196 - USB_ERROR_UNLOCK_FAILED - Unlock failed
     * - 197 - USB_ERROR_UNLOCK_ATTEMPTS_EXCEEDED - Unlock failed - unlock attempts exceeded
     * - 198 - USB_ERROR_INVALID_ENCODING_VALUE - Invalid encoding value
     * - 199 - USB_ERROR_UNSUPPORTED_REQUEST - Unsupported request
     * - 200 - USB_ERROR_INVALID_STANDBY_VALUE - Invalid standby timer value
     * - 201 - USB_ERROR_STANDBY_UNSUPPORTED - Standby timer is unsupported
     * - 208 - INTERNAL_ERROR - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <usb_drive>
      <status>success</status>
      <standby_timer>{disabled|Actual set standby timer}</standby_timer>
      </usb_drive>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $handle = isset($urlPath[0]) && !(strcmp($urlPath[0], "") == 0) ? trim($urlPath[0]) : null;
        $drivePassword = isset($queryParams['drive_password']) ? trim($queryParams['drive_password']) : '';
        $save = isset($queryParams['save']) ? trim($queryParams['save']) : 'false';
        $encoding = isset($queryParams['encoding']) ? trim($queryParams['encoding']) : 'utf-8';
        $standby_timer = isset($queryParams['standby_timer']) ? trim($queryParams['standby_timer']) : '';

        // The handle must be set. If the password is specified, it can't be an empty string.
        // If both the password and save parameter are not specified, fail the request.

        if ($handle == null) {
            $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_DRIVE_HANDLE_MISSING', $outputFormat);
            return;
        }

        // Unlocking drive and setting its standby timer are mutually exclusive.

        if ((isset($queryParams['drive_password']) || isset($queryParams['save'])) && isset($queryParams['standby_timer'])) {
            $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_UNSUPPORTED_REQUEST', $outputFormat);
            return;
        }

        if (isset($queryParams['standby_timer'])) {
            if (strcmp($standby_timer, '') == 0 || !is_numeric($standby_timer)) {
                $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_INVALID_STANDBY_VALUE', $outputFormat);
            } else {
                $output=$retVal=null;
                exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm \"setStandbyTimer\" \"$handle\" \"$standby_timer\"", $output, $retVal);
                if ($retVal == RET_VAL_SUCCESS) {
                    $this->generateOutput(200, $output, $outputFormat);
                } elseif ($retVal == RET_VAL_ERROR_STANDBY_TIMER_UNSUPPORTED) {
                    $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_STANDBY_UNSUPPORTED', $outputFormat);
                } else {
                    $this->generateErrorOutput(500, 'usb_drive', 'INTERNAL_ERROR', $outputFormat);
                }
            }
        } else {
            if ((isset($queryParams['drive_password']) && (strcmp($drivePassword, '') == 0)) || (!isset($queryParams['drive_password']) && !isset($queryParams['save']))) {
                $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_PASSWORD_MISSING', $outputFormat);
            } elseif ((strcmp($save, '') != 0) && (strcasecmp($save, 'true') != 0) && (strcasecmp($save, 'false') != 0)) {
                $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_INVALID_SAVE_VALUE', $outputFormat);
            } elseif ((strcmp($drivePassword, '') != 0) && (strcasecmp($encoding, 'base64') != 0) && (strcasecmp($encoding, 'utf-8') != 0)) {
                $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_INVALID_ENCODING_VALUE', $outputFormat);
            } else {

                // If the password is specified and it's base64, decode it.  If will not be specified
                // if the user no longer wants the password saved.

                if ((strcmp($drivePassword, '') != 0) && (strcasecmp($encoding, 'base64') == 0)) {
                    $drivePassword = base64_decode($drivePassword);
                }

                $output=$retVal=null;
                exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm \"unlockDrive\" \"$handle\" \"$drivePassword\" \"$save\"", $output, $retVal);

                if ($retVal == RET_VAL_SUCCESS) {
                    $this->generateSuccessOutput(200, 'usb_drive', array('status' => 'success'), $outputFormat);
                } elseif ($retVal == RET_VAL_ERROR_DRIVE_NOT_FOUND) {
                    $this->generateErrorOutput(404, 'usb_drive', 'USB_ERROR_DRIVE_NOT_FOUND', $outputFormat);
                } elseif ($retVal == RET_VAL_ERROR_DRIVE_NOT_LOCKED) {
                    $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_DRIVE_NOT_LOCKED', $outputFormat);
                } elseif ($retVal == RET_VAL_ERROR_PASSWORD_MISSING) {
                    $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_PASSWORD_MISSING', $outputFormat);
                } elseif (($retVal == RET_VAL_FAILURE) || ($retVal == RET_VAL_ERROR_UNLOCK_FAILED)) {
                    $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_UNLOCK_FAILED', $outputFormat);
                } elseif ($retVal == RET_VAL_ERROR_UNLOCK_ATTEMPTS_EXCEEDED) {
                    $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_UNLOCK_ATTEMPTS_EXCEEDED', $outputFormat);
                } else {
                    $this->generateErrorOutput(500, 'usb_drive', 'INTERNAL_ERROR', $outputFormat);
                }
            }
        }
    }

    /**
     * \par Description:
     * The DELETE request is used to eject a specified Usb drive.  It causes
     * all the shares associated with the drive to be deleted and all of its
     * partitions unmounted. This operation is to be performed prior to
     * disconnecting a drive. After being ejected, the drive and its associated
     * shares will no longer be reported by the NAS.
     *
     * \par Security:
     * - Requires user authentication (LAN/WAN)
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/@REST_API_VERSION/rest/usb_drive/{handle}
     *
     * \param handle                   Integer - required (Usb handle)
     * \param format                   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - handle: Usb handle
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful eject of the Usb drive
     * - 400 - Bad request, handle id not given
     * - 401 - User is not authorized
     * - 404 - Request resource not found, usb drive does not exists
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 191 - USB_ERROR_DRIVE_NOT_FOUND - Drive not found
     * - 192 - USB_ERROR_DRIVE_HANDLE_MISSING - Drive handle missing
     * - 208 - INTERNAL_ERROR - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <usb_drive>
      <status>success</status>
      </usb_drive>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $handle = isset($urlPath[0]) && !(strcmp($urlPath[0], "") == 0) ? trim($urlPath[0]) : null;
//        self::$logObj->LogData('OUTPUT', __CLASS__, __FUNCTION__, "PARAMS: (handle=$handle)");

        if ($handle == null) {
            $this->generateErrorOutput(400, 'usb_drive', 'USB_ERROR_DRIVE_HANDLE_MISSING', $outputFormat);
        } else {
            $output=$retVal=null;
            exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm \"ejectDrive\" \"$handle\"", $output, $retVal);

            if ($retVal == RET_VAL_SUCCESS) {
                $this->generateSuccessOutput(200, 'usb_drive', array('status' => 'success'), $outputFormat);
            } elseif ($retVal == RET_VAL_ERROR_DRIVE_NOT_FOUND) {
                $this->generateErrorOutput(404, 'usb_drive', 'USB_ERROR_DRIVE_NOT_FOUND', $outputFormat);
            } else {
                $this->generateErrorOutput(500, 'usb_drive', 'INTERNAL_ERROR', $outputFormat);
            }
        }
    }

    private function generateOutput($statusCode, $output, $outputFormat) {
        setHttpStatusCode($statusCode);

        //Currently, the array we receive from shell script consists a few empty lines. This is breaking API's JSON output, so removing all empty lines first.
        /*Script Output:
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
        foreach($output as $line){
            if(strlen($line) > 0){
                $elements[] = $line;
            }
        }
        $outputWriter = new \OutputWriter(strtoupper($outputFormat));
        $outputWriter->pushElement(self::COMPONENT_NAME);
        foreach ($elements as $key => $line) {
            if (strpos($line, '=') != false) {
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
        $outputWriter->popElement();
        $outputWriter->close();
    }

}

