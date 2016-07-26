<?php

/**
 * \file disk/SmarTest.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace Storage\Disk\Controller;

use Storage\Disk\Model;

/**
 * \class SmartTest
 * \brief Run and return results of short and long smart test. A smart test is run to check the disk health.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class SmartTest /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Returns results of short or long smart test.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/smart_test
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval smart_test - Smart test
     * - percent_complete:  {Number between 0 and 100}
     * - status:  {good/bad/in_progress/aborted}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <smart_test>
      <percent_complete>30</percent_complete>
      <status>inprogress</status>
      </smart_test>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $testObj = new Model\SmartTest();
        $result = $testObj->getResults();

        if ($result !== NULL) {
            $results = array('percent_complete' => $result['percent_complete'],
                'status' => $result['status']);
            $this->generateSuccessOutput(200, 'smart_test', $results, $outputFormat);
        } else {
            //Failed to collect info
            $this->generateErrorOutput(500, 'smart_test', 'SMART_TEST_INTERNAL_SERVER_ERROR', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Cause short or long smart test to start/stop. Only one test can be started at a time.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/smart_test
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
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <smart_test>
      <status>success</status>
      </smart_test>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $testObj = new Model\SmartTest();
        $result = $testObj->start($queryParams);

        switch ($result) {
            case 'SUCCESS':
                syslog(LOG_NOTICE, "Smart Test executed or aborted");
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'smart_test', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                $this->generateErrorOutput(400, 'smart_test', 'SMART_TEST_BAD_REQUEST', $outputFormat);
                break;
            case 'SERVER_ERROR':
                $this->generateErrorOutput(500, 'smart_test', 'SMART_TEST_INTERNAL_SERVER_ERROR', $outputFormat);
                break;
			case 'PARAMETER_MISSING':
                $this->generateErrorOutput(400, 'smart_test', 'PARAMETER_MISSING', $outputFormat);
                break;
        }
    }

}