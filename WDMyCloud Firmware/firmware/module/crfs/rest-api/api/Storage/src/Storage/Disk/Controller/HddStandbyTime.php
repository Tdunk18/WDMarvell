<?php

/**
 * \file disk/HddStandbyTime.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace Storage\Disk\Controller;

use Storage\Disk\Model;

/**
 * \class HddStandbyTime
 * \brief Retrieve and update HDD standby time
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class HddStandbyTime /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'hdd_standby_time';

    /**
     * \par Description:
     * Returns current HDD standby configuration.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/hdd_standby_time
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval hdd_standby_time - HDD standby time.
     * - enable_hdd_standby:  {true/false}
     * - hdd_standby_time_minutes: {number of minutes}
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
      <hdd_standby_time>
      <enable_hdd_standby>true</enable_hdd_standby>
      <hdd_standby_time_minutes>10</hdd_standby_time_minutes>
      </hdd_standby_time>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $hddStanbyConfigObj = new Model\HddStandbyTime();
        $result = $hddStanbyConfigObj->getConfig();

        if ($result !== NULL) {
            $results = array('enable_hdd_standby' => $result['enable_hdd_standby'],
                'hdd_standby_time_minutes' => $result['hdd_standby_time_minutes']
            );
            $this->generateSuccessOutput(200, 'hdd_standby_time', $results, $outputFormat);
        } else {
            throw new \Core\Rest\Exception('INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Modify HDD standby configuration.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/hdd_standby_time
     *
     * \param enable_hdd_standby:       Boolean - required
     * \param hdd_standby_time_minutes: String  - required
     * \param format                    String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - enable_hdd_standby:  {true/false}
     * - Any value that's not "true" will be converted to false.
	 * - hdd_standby_time_minutes:  {number of minutes}
     *
     * \retval status   String  - succes
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 298 - HDD_STAND_BY_TIME_MINUTES_BAD_REQUEST - HDD Stand by Time Minutes Bad Request
     * - 299 - ENABLE_HDD_STANDBY_TIME_BAD_REQUEST - Enable HDD Stand By Time Bad Request
     *
     * \par XML Response Example:
     * \verbatim
<hdd_standby_time>
    <status>success</status>
</hdd_standby_time>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $filterParams = filter_var_array($queryParams, array(
            'hdd_standby_time_minutes' => \FILTER_VALIDATE_INT,
            'enable_hdd_standby' => \FILTER_VALIDATE_BOOLEAN,
        ));

        // NULL is from no value passed.
        // FALSE is invalid validation.
        if ( !is_int($filterParams['hdd_standby_time_minutes']) ) {
            throw new \Core\Rest\Exception('HDD_STAND_BY_TIME_MINUTES_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        // In this instance, FALSE is not TRUE so just check for no-value.
        if ( is_null($filterParams['enable_hdd_standby']) ) {
            throw new \Core\Rest\Exception('ENABLE_HDD_STANDBY_TIME_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        $hddStanbyConfigObj = new Model\HddStandbyTime();
        $result = $hddStanbyConfigObj->modifyConfig($filterParams);

			switch($result) {
            case 'SUCCESS':
				$results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'hdd_standby_time', $results, $outputFormat);
                break;
            case 'SERVER_ERROR':
                throw new \Core\Rest\Exception('HDD_STANDBY_TIME_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
		}
    }

}