<?php
/**
 * \file system_configuration/LedConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Configuration\Controller;

use System\Configuration\Model;

/**
 * \class LedConfiguration
 * \brief Configures LED status
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - NO authentication required to use this component in LAN.
 *
 */
class LedConfiguration
{
	use \Core\RestComponent;

	const COMPONENT_NAME = 'led_configuration';

	/**
	 * \par Description:
	 * 	Retuns current LED status configuration.
	 *
	 * \par Security:
	 *  - No Authentication required if requested from LAN
	 *
	 * \par HTTP Method: GET
	 *   http://localhost/api/@REST_API_VERSION/rest/led_configuration
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \retval led_configuration - LED configuration
	 * - enable_led:  {true/false}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Codes:
	 * - 284 - LED_CONFIGURATION_SERVER_ERROR - Led Configuration Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 	<led_configuration>
	 		<enable_led>true</enable_led>
	 	</led_configuration>
	   \endverbatim
	 */
	public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
	{
		$result = (new Model\Configuration)->getLedStatus();

		if (in_array($result, ['true', 'false']))
		{
			$this->generateSuccessOutput(200, static::COMPONENT_NAME, ['enable_led' => $result], $outputFormat);
		}

		if ($result == Model\Configuration::SERVER_ERROR)
		{
		    throw new \Core\Rest\Exception('LED_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
		}
	}

	/**
	 * \par Description:
	 *  Modify LED status configuration
	 *
	 * \par Security:
	 *  - Requires Admin authentication and if request from LAN
	 *
	 * \par HTTP Method: PUT
	 *  http://localhost/api/@REST_API_VERSION/rest/led_configuration
	 *
	 * \param enable_led            String  - required
	 *
	 * \par Parameter Details:
	 * 	- enable_led:    true/false
	 *
	 * \retval status   String  - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful update of the network
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Codes:
	 * - 284 - LED_CONFIGURATION_SERVER_ERROR - Led Configuration Internal server error
	 * - 285 - LED_CONFIFURATION_BAD_REQUEST - Led Configuration Bad Request
	 *
	 * \par XML Responce XML:
	 * \verbatim
	 <?xml version="1.0" encoding="utf-8"?>
	 <led_configuration>
   		<status>success</status>
	 </led_configuration>
	 \endverbatim
	 */
	public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
	{
		switch ((new Model\Configuration)->setLedStatus($queryParams))
		{
			case Model\Configuration::SUCCESS:

				$this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status'=>'Success'], $outputFormat);

				break;

			case Model\Configuration::BAD_REQUEST:

			    throw new \Core\Rest\Exception('LED_CONFIGURATION_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);

				break;

			case Model\Configuration::SERVER_ERROR:

			    throw new \Core\Rest\Exception('LED_CONFIGURATION_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);

				break;
		}
	}
}