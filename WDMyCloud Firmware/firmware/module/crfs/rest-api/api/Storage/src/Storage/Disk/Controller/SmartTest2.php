<?php
// Copyright (c) [2012] Western Digital Technologies, Inc. All rights reserved.
/**
 * \file disk/SmartTest2.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Storage\Disk\Controller;

use Storage\Disk\Model;

/**
 * \class SmartTest2
 * \brief Run and return results of short and long drive-specific smart test. A smart test is run to check the disk health.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class SmartTest2  {

	use \Core\RestComponent;

    const COMPONENT_NAME = 'smart_test2';

	/**
	 * \par Description:
	 * Returns results of short or long smart test for each drive along with location.
	 * If unit does not have a labeled location (3g) for the drive, its location will be returend as UNDEFINED.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/smart_test2
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *
	 * \retval smart_test - Smart test, list of:
	 * - location: {A,B,UNDEFINED}
	 * - percent_complete:  {Number between 0 and 100}
	 * - status:  {good/bad/in_progress/aborted}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful return of the status
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <smart_test2>
	 <internal_drive>
	 <location>{A,B,UNDEFINED}</location>
	 <percent_complete>{Number between 0 and 100}</percent_complete>
	 <status>{good/bad/in_progress/aborted}</status>
	 </internal_drive>
	 ...
	 </smart_test2>
	 \endverbatim
	 */

	function get($urlPath, $queryParams=null, $outputFormat='xml'){
		$testObj = new Model\SmartTest();
		$result = $testObj->getResults('DRIVE_SPECIFIC');

		if($result !== NULL){
			$this->generateCollectionOutput(200, 'smart_test2', 'internal_drive', $result, $outputFormat);
		} else {
			throw new \Core\Rest\Exception('INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
		}
	}

	/**
	 * \par Description:
	 * Cause short or long smart test to start/stop on all internal drives.
	 * If either drive is currently running a smart test, bad request is returned.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN.
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/@REST_API_VERSION/rest/smart_test2
	 *
	 * \param test                  String  - required
	 * \param format                String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 * - test:  {start_short/start_long/stop}
	 *
	 * \retval status   String  - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 404 - Request not found
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 <smart_test2>
		<status>success</status>
		</smart_test2>
		\endverbatim
		*/

	function put($urlPath, $queryParams=null, $outputFormat='xml'){

		$testObj = new Model\SmartTest();

        $filterParams = filter_var_array($queryParams, array('test' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('start_short', 'start_long', 'stop'))) {
                        throw new \Core\Rest\Exception('BAD_REQUEST', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                })
        ));

		$result = $testObj->start($filterParams);

		switch($result){
			case 'SUCCESS':
				$this->generateSuccessOutput(200, 'smart_test2', array('status' => 'success'), $outputFormat);
				break;
			case 'BAD_REQUEST':
    			throw new \Core\Rest\Exception('BAD_REQUEST', 400, null, self::COMPONENT_NAME);
			case 'PARAMETER_MISSING':
        		throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, null, self::COMPONENT_NAME);
			case 'INTERNAL_ERROR':
                throw new \Core\Rest\Exception('INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
		}
	}
}