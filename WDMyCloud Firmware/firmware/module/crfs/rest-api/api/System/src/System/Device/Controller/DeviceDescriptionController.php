<?php

namespace System\Device\Controller;

use System\Device\Model;
use System\Device\Exception as DeviceException;

/**
 * \file device/DeviceDescriptionController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class DeviceDescriptionController
 * \brief Retrieve or update device name and description
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class DeviceDescriptionController /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'device_description';

    /**
     * \par Description:
     * Get device name and description.
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only.
     * - API 1.0: Admin Authentication is required when using API 1.0
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/device_description
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval device_description - device desciption info
     * - machine_name: {Device name}
     * - machine_desc: {Device Description}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of device name and description
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <?xml version="1.0" encoding="utf-8"?>
      <device_description>
      <machine_name>wdvenue</machine_name>
      <machine_desc>My Book Live Network Storage</machine_desc>
      </device_description>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version = null) {

        // 1.0 compatibility: force authentication check
        if ( 1.0 == $version ) {
            \Core\NasController::authenticate($urlPath, $queryParams, true);
        }

        $device = new Model\Device();
        try {
        	$result = $device->getDescription();
        } catch (DeviceException $e) {
        	throw new \Core\Rest\Exception('DEVICE_DESCRIPTION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, 'device_description', array('machine_name' => $result['machine_name'],'machine_desc' => $result['machine_desc']), $outputFormat);
    }

    /**
     * \par Description:
     * Update device name and description.
     *
     * \par Security:
     * - Requires Admin authentication and request allowed in LAN only
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/device_description
     *
     * \param machine_name          String  - required
     * \param machine_desc          String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - machine_name:  The machine name may only contain ASCII letters "A" through ‘Z’, ‘a’ to ‘z’, the digits ‘0’ through ‘9’, and the hyphen (-). The machine name may only be between 1 and 15 characters long. (see RFC-1001)
     * - machine_desc:  Device description must begin with alphanumeric and be no more that 42 characters long.
     *
     * \retval status   String  - success
     *
     * \par Error code
     * - 148 - DEVICE_DESCRIPTION_BAD_REQUEST - Device description bad request
	 * - 149 - DEVICE_DESCRIPTION_INTERNAL_SERVER_ERROR - Device description internal server error
	 * - 301 - DEVICE_DESCRIPTION_DESC_BAD_REQUEST - Device Description Machine Description Bad Request
	 * - 302 - DEVICE_DESCRIPTION_DESC_NAME_REQUEST - Device Description Machine Name Bad Request
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of device name, description
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <device_description>
      <status>success</status>
      </device_description>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $device = new Model\Device();

        if (!isset($queryParams["machine_name"]) ||
        !isset($queryParams["machine_desc"])) {

        	throw new \Core\Rest\Exception('DEVICE_DESCRIPTION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        $queryParams["machine_desc"] = trim($queryParams['machine_desc']);
        $queryParams['machine_name'] = trim($queryParams['machine_name']);

        //Verify changes are valid
        if (!$this->_isValidMachineName($queryParams["machine_name"]) || !$this->_isValidMachineDescription($queryParams["machine_desc"])){
        	throw new \Core\Rest\Exception('DEVICE_DESCRIPTION_NAME_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }
        try {
        	$device->modifyDescription($queryParams);
        } catch (DeviceException $e) {
        	throw new \Core\Rest\Exception('DEVICE_DESCRIPTION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        }
        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
    }
    /**
     * _isValidMachineName validates the machine name.
     * Machinename consists of a string greater that 1-15 characters
     * It should be alphanumeric and hyphens are allowed
     */
    private function _isValidMachineName($name) {
    	if ((strlen($name) > 15) ||
    	(strlen($name) == 0)) {
    		return FALSE;
    	}

    	// Don't allow all numbers
    	if (preg_match("/^[0-9]+$/", $name)) {
    		return FALSE;
    	}

    	// Allow alphanumeric and hyphens
    	if (preg_match('/^[a-z0-9\-]+$/i', $name)) {
    		return TRUE;
    	} else {
    		return FALSE;
    	}
    }
    /**
     * isValidMachineDEscription validates machine description
     * Description cannot be empty
     * String length of this variable cannot be more than 42 and alphanumeric values are allowed
     */
    private function _isValidMachineDescription($desc) {
    	if ($desc === '') {
    		return TRUE;
    	}

    	if ((strlen($desc) > 42) ||
    	(preg_match("/^[a-z0-9]/i", $desc) == 0)) {
    		return FALSE;
    	} else {
    		return TRUE;
    	}
    }
}