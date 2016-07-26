<?php

namespace System\Network\Controller;

//require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');

/**
 * \file Network\Controller\NetworkServicesConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

/**
 * \class NetworkServicesConfiguration
 * \brief Used for retrieving and updating network services configuration details
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need to be authenticated, must be admin, and in LAN to use this component.
 *
*/
class NetworkServicesConfiguration {

	use \Core\RestComponent;

	/**
	 * \par Description:
	 * Returns network configuration, especially the ftp enable status.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/network_services_configuration
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *
	 * \retval network_services_configuration - Network services configuration
	 * - enable_ftp:  {true/false}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful retrieval of network services(ftp) status.
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Request not found
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <network_services_configuration>
	 <enable_ftp>true</enable_ftp>
	 </network_services_configuration>
	 \endverbatim
	 */
	function get($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->getNetworkServicesConfiguration($urlPath, $queryParams, $outputFormat);
		$this->generateSuccessOutput(200, 'network_services_configuration', $result, $outputFormat);
	}

	/**
	 * \par Description:
	 * Used for updating ftp feature, to enable or disable it.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/@REST_API_VERSION/rest/network_services_configuration
	 *
	 * \param enable_ftp            Boolean  - required
	 * \param format                String   - optional (default is xml)
	 *
	 * \par Parameter Details:
	 * - enable_ftp:  true/false
	 *
	 * \retval status   String  - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful update of ftp network service
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 *\par Error code:
	 * - 267 - 'NETWORK_SERVICE_CONFIGURATION_BAD_REQUEST' - Network Service Configuration Bad Request
	 * - 268 - 'NETWORK_SERVICE_CONFIGURATION_SERVER_ERROR' - Network Service Configuration Server Error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <network_services_configuration>
	 <status>success</status>
	 </network_services_configuration>
	 \endverbatim
	 */
	function put($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->putNetworkServicesConfiguration($urlPath, $queryParams, $outputFormat);
		switch($result){
			case 'SUCCESS':
				$results = array();
				$results['status'] = 'success';
				$this->generateSuccessOutput(200, 'network_services_configuration', $results, $outputFormat);
				break;
			case 'BAD_REQUEST':
				$this->generateErrorOutput(400, 'network_services_configuration', 'NETWORK_SERVICE_CONFIGURATION_BAD_REQUEST', $outputFormat);
				break;
			case 'SERVER_ERROR':
				$this->generateErrorOutput(500, 'network_services_configuration', 'NETWORK_SERVICE_CONFIGURATION_SERVER_ERROR', $outputFormat);
				break;
		}
	}

	function post($urlPath, $queryParams=null, $outputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function delete($urlPath, $queryParams=null, $outputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

}