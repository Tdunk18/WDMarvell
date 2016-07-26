<?php

namespace System\Network\Controller;

require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');

/**
 * \file Network\Controller\SshConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

/**
 * \class SshConfiguration
 * \brief Used for retrieving and updating ssh feature status.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need to be authenticated, must be admin, and in LAN to use this component.
 *
 */
class SshConfiguration{

	use \Core\RestComponent;

	/**
	 * \par Description:
	 * Used for retrieving SSH configuration.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/ssh_configuration
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *
	 * \retval ssh_configuration - SSH configuration
	 * - enablessh:  {true/false}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <ssh_configuration>
	 <enablessh>true</enablessh>
	 </ssh_configuration>
	 \endverbatim
	 */
	function get($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->getSshConfiguration($urlPath, $queryParams, $outputFormat);
		$results = array();
		$results['enablessh'] = $result;
		$this->generateSuccessOutput(200, 'ssh_configuration', $results, $outputFormat);
	}

	/**
	 * \par Description:
	 * Used for updating the SSH configuration set up, so that it can be enabled or disabled.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/@REST_API_VERSION/rest/ssh_configuration
	 *
	 * \param enablessh            String  - required
	 *
	 * \par Parameter Details:
	 * - enablessh:    true/false
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
	 * \par Error Code:
	 *  - 271 - 'SSH_CONFIGURATION_BAD_REQUEST' - SSH Configuration Bad Request
	 *  - 272 - 'SSH_CONFIGURATION_SERVER_ERROR' - SSH Configuration Server Error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <ssh_configuration>
	 <status>success</status>
	 </ssh_configuration>
	 \endverbatim
	 */
	function put($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->putSshConfiguration($urlPath, $queryParams, $outputFormat);
		switch($result){
				case 'SUCCESS':
					$results = array();
					$results['status'] = 'success';
					$this->generateSuccessOutput(200, 'ssh_configuration', $results, $outputFormat);
					break;
				case 'BAD_REQUEST':
					$this->generateErrorOutput(400, 'ssh_configuration', 'SSH_CONFIGURATION_BAD_REQUEST', $outputFormat);
					break;
				case 'SERVER_ERROR':
					$this->generateErrorOutput(500, 'ssh_configuration', 'SSH_CONFIGURATION_SERVER_ERROR', $outputFormat);
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