<?php

namespace System\Firmware\Controller;
/**
 * \file firmware/Update.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use System\Firmware\Model;

/**
 * \class Update
 * \brief used for Updating the firmware.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Update /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'firmware_update';

    /**
     * \par Description:
     * Returns status of firware update in progress.
     *
     * \par Security:
     * - No authentication if request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/firmware_update
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval firmware_update - Firmware update status. Each field in XML responce can have these values:
     *   status - Value of this field can be one of the following - 'idle', 'downloading', 'upgrading' or 'failed'
     *   completion_percentage - any value from 0-100
     *   error_code - Shell response code
     *   error_description - Shell response description
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the status of the update
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Shell Response Codes:
     * - 200/invalid firmware package
     * - 201/not enough space on device for upgrade
     * - 202/upgrade download failure
     * - 203/upgrade unpack failure
     * - 204/upgrade copy failure
     * - 205/all drives must be present to upgrade firmware
     *
     * \par Error Codes:
     * -178 - FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR - Firmware update configuration internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_update>
      <status>idle</status>
      <completion_percent></completion_percent>
      <error_code></error_code>
      <error_description></error_description>
      </firmware_update>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $fwUpdateObj = new Model\Firmware();
        $result = $fwUpdateObj->getFirmwareUpdate();

        if ($result !== NULL) {
            $this->generateSuccessOutput(($result['status'] == 'failed' ? 500 : 200), 'firmware_update', $result, $outputFormat);
            if ($result['completion_percent'] != '') {
                \Core\Logger::getInstance()->info(sprintf('Firware completion: %d%',$result['completion_percent']));
            }
        } else {
            //Failed to collect info
            throw new \Core\Rest\Exception('FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR', 500, NULL, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Cause NAS to fetch and update FW automatically.
     *
     * \par Security:
     * - Requires user authentication (LAN/WAN)
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/firmware_update
     *
     * \param image        String  - required
     * \param format       String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - image=http://download.wdc.com/nas/apnc-020100-20110807.deb
     * Note that this URI string must be encoded (e.g. php urlencode()) for passing as a parameter to the REST API.
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of the firmware.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 177 - FIRMWARE_UPDATE_BAD_REQUEST - Firmware update bad request
     * - 178 - FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR - Firmware update configuration internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_update
      <status>success</status>
      </firmware_update>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $fwUpdateObj = new Model\Firmware();
        $result = $fwUpdateObj->automaticFWUpdate($queryParams);

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'firmware_update', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                throw new \Core\Rest\Exception('FIRMWARE_UPDATE_BAD_REQUEST', 400, NULL, self::COMPONENT_NAME);
            case 'SERVER_ERROR':
                throw new \Core\Rest\Exception('FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR', 500, NULL, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Causes NAS to update to firmware in file that is copied to the device.
     *
     * \par Security:
     * - Requires user authentication (LAN/WAN)
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/firmware_update
     *
     * \par HTTP POST Body
     * - filepath=/CacheVolume/filename
     *
     * \param filepath  String - optional
     * \param format    String - optional
     *
     * \par Parameter Details:
     * - filepath:   If filepath is not specified, file is assumed to be streamed as part of the http POST.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of the firmware
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 177 - FIRMWARE_UPDATE_BAD_REQUEST - Firmware update bad request
     * - 178 - FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR - Firmware update internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_update>
      <status>success</status>
      </firmware_update>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {

        if (!isset($queryParams['filepath']) && isset($_FILES['file']['tmp_name'])) {
            $queryParams["filepath"] = "/CacheVolume/" . $_FILES['file']['name'];
            move_uploaded_file($_FILES['file']['tmp_name'], $queryParams['filepath']);
        }

        $fwUpdateObj = new Model\Firmware();
        $result = $fwUpdateObj->manualFWUpdate($queryParams);

        //this is the way to receive files from command
//		$result = $fwUpdateObj->manualFWUpdate($_FILES);

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'firmware_update', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                throw new \Core\Rest\Exception('FIRMWARE_UPDATE_BAD_REQUEST', 400, NULL, self::COMPONENT_NAME);
            case 'SERVER_ERROR':
                throw new \Core\Rest\Exception('FIRMWARE_UPDATE_INTERNAL_SERVER_ERROR', 400, NULL, self::COMPONENT_NAME);
        }
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */