<?php

namespace System\Network\Controller;

require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');

/**
 * \file Network\Controller\NetworkWorkgroup.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

/**
 * \class NetworkWorkgroup
 * \brief Used for retrieving and updating network workgroup details.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need to be authenticated, must be admin, and in LAN to use this component.
 *
*/
class NetworkWorkgroup{

	use \Core\RestComponent;

	/**
	 * \par Description:
	 * Return network work group configuration details.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/network_workgroup
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *
	 * \retval network_workgroup - Network workgroup
	 * - workname:  {work group name}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful return of network workgroup details
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <network_workgroup>
	 <workname>WORKGROUP</workname>
	 </network_workgroup>
	 \endverbatim
	 */
	function get($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->getNetworkWorkgroup($urlPath, $queryParams, $outputFormat);
		$this->generateSuccessOutput(200, 'network_workgroup', $result, $outputFormat);
	}

	/**
	 * \par Description:
	 * Used to update network work group details.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/@REST_API_VERSION/rest/network_workgroup
	 *
	 * \param workname              String  - required
	 * \param format                String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 * - workname:  Work group name
	 *
	 * \retval status   String  - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful update of network workgroup details
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Code:
	 *  - 269 - 'NETWORK_WORKGROUP_BAD_REQUEST' - Network Workgroup Bad Request
	 *  - 270 - 'NETWORK_WORKGROUP_SERVER_ERROR' - Network WorkGroup Server Error
	 *
	 * \par XML Response Example: None on success
	 * \verbatim
	 <network_workgroup>
	 <status>success</status>
	 </network_workgroup>
	 \endverbatim
	 */
	function put($urlPath, $queryParams=null, $outputFormat='xml'){
		$infoObj = \System\Network\Configuration::getManager();
		$result = $infoObj->putNetworkWorkgroup($urlPath, $queryParams, $outputFormat);
	switch($result){
			case 'SUCCESS':
				$results = array();
				$results['status'] = 'Success';
				$this->generateSuccessOutput(200, 'network_workgroup', $results, $outputFormat);
				break;
			case 'BAD_REQUEST':
				$this->generateSuccessOutput(400, 'network_workgroup', 'NETWORK_WORKGROUP_BAD_REQUEST', $outputFormat);
				break;
			case 'SERVER_ERROR':
				$this->generateErrorOutput(500, 'network_workgroup', 'NETWORK_WORKGROUP_SERVER_ERROR', $outputFormat);
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