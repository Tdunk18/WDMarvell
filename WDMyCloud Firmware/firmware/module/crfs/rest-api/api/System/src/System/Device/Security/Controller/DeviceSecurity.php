<?php

namespace System\Device\Security\Controller;

use System\Device\Security\Model;

/**
 * \file DeviceSecurity.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class DeviceSecurity
 * \brief Used for enabling and disabling pluggable storage reads.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class DeviceSecurity {

    use \Core\RestComponent;

	const COMPONENT_NAME = 'device_security';

    /**
     * \par Description:
     * Returns the device security configuration properties.
     *
     * \par Security:
     * - Admin authentication is required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/device_security
     *
     * \param format    String   - optional (default is xml)
     *
     * \retval storage_configuration - storage transfer configuration properties
     * locked:  true/false
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the configuration location and/or configuration file.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     *
     * \par XML Response Example:
     * \verbatim
      	<device_security>
			<locked>true</locked>
		</device_security>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {


    	$deviceSecurity = new Model\DeviceSecurity();
    	try {
    		$result = $deviceSecurity->getSecurityConfiguration();
    	} catch (\System\Device\Security\Exception $e) {
    		throw new \Core\Rest\Exception('DEVICE_SECURITY_INTERNAL_SERVER_ERROR', 500, null, static::COMPONENT_NAME);
    	}

    	$this->generateSuccessOutput(200, static::COMPONENT_NAME, array('locked' => $result), $outputFormat);

    }

    /**
     * \par Description:
     * Used to update the device security configuration properties.
     *
     * \par Security:
     * - Requires Admin User authentication.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/device_security
     *
     * \param locked  String - required
     *
     * \par Parameter Details:
     * \param locked        Boolean   - {true/false}
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful restore of the configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     *
     * \par XML Response Example:
     * \verbatim
      <device_security>
      	<status>SUCCESS</status>
      </device_security>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

    	$deviceSecurity = new Model\DeviceSecurity();

      	if (!isset($queryParams["locked"]) || !((strcasecmp($queryParams["locked"],'true') == 0) || (strcasecmp($queryParams["locked"],'false') == 0))) {
    		throw new \Core\Rest\Exception('DEVICE_SECURITY_BAD_REQUEST', 400, null, static::COMPONENT_NAME);
    	}

    	try {
    		$deviceSecurity->updateSecurityConfiguration($queryParams);
    	} catch (\Exception $e) {
    		throw new \Core\Rest\Exception('DEVICE_SECURITY_INTERNAL_SERVER_ERROR', 500, null, 'device_security');
    	}
    	$this->generateSuccessOutput(200, static::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);

    }

}