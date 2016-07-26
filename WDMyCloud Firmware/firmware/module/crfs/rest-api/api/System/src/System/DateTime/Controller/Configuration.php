<?php

/**
 * \file date-time/Configuration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\DateTime\Controller;

use System\DateTime\Model;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
/**
 * \class Configuration
 * \brief Retrieve or update date and time configuration
 *
 * - This component extends the Rest Component.
 * - Supports xml format for response data.
 * - User must be authenticated to use this component.
 *
 */
class Configuration /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'date_time_configuration';

    /**
     * \par Description:
     * Get date and time configuration
     *
     * \par Security:
     * - Does not require authentication on LAN and WAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/date_time_configuration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval date_time_configuration - Date and time configuration
     * - datetime:  {timestamp} - unix timestamp
     * - ntpservice:  {true/false}
     * - ntpsrv0:  {Fixed address of time server}
     * - ntpsrv1:  {Fixed address of time server}
     * - ntpsrv_user: {User enterable time server}
     * - time_zone_name: {Name from timeZones}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of date time configuration
     * - 401 - User is not authorized
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 239  - ERROR_INTERNAL_SERVER - Error in internal server.
     *
     * \par XML Response Example:
     * \verbatim
      <?xml version="1.0" encoding="utf-8"?>
      <date_time_configuration>
      <datetime>1338312000</datetime>
      <ntpservice>true</ntpservice>
      <ntpsrv0>time.windows.com</ntpsrv0>
      <ntpsrv1>pool.ntp.org</ntpsrv1>
      <ntpsrv_user></ntpsrv_user>
      <time_zone_name>US/Pacific</time_zone_name>
      </date_time_configuration>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

    	$configobj = new Model\Configuration();
        try {
            $result = $configobj->getConfig();
        }

        catch ( \Exception $e ) {
            throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }
        $this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
    }

    /**
     * \par Description:
     * Update date and time configuration
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/date_time_configuration
     *
     * \par HTTP PUT Body
     * - datetime=1552508460
     * - ntpservice=true
     * - ntpsrv0=time.windows.com
     * - ntpsrv1=pool.ntp.org
     * - ntpsrv_user=time.myfav.com
     * - time_zone_name=Pacific
     *
     * \param datetime              String   - required
     * \param ntpservice            Boolean  - required
     * \param ntpsrv0               String   - required
     * \param ntpsrv1               String   - required
     * \param ntpsrv_user           String   - required
     * \param time_zone_name        String   - required
     * \param format                String   - optional (default is xml)
     *
     * \par Parameter Details:
     * - datetime:  timestamp
     * - ntpservice:  true/false
     * - ntpsrv0:  Fixed address of time server0
     * - ntpsrv1:  Fixed address of time server1
     * - ntpsrv_user:  User selectable time server
     * - time_zone_name:  Name from timeZones
     *
     * \retval status   HTTP status only
     *
     * \par HTTP Response Codes:
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 239 - ERROR_INTERNAL_SERVER - Error in internal server.
     * - 238 - ERROR_BAD_REQUEST - Bad request.
     *
     * \par XML Response Example: None
     * \verbatim
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

    	if (!isset($queryParams["datetime"]) ||
    	!isset($queryParams["ntpservice"]) ||
    	!isset($queryParams["ntpsrv0"]) ||
    	!isset($queryParams["ntpsrv1"]) ||
    	!isset($queryParams["ntpsrv_user"]) ||
    	!isset($queryParams["time_zone_name"])) {
    		throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
    	}

    	if((strcmp($queryParams['ntpservice'], 'true') == 0) || (strcmp($queryParams['ntpservice'], 'false') == 0)){
    		$queryParams['ntpservice'] = (filter_var($queryParams['ntpservice'], \FILTER_VALIDATE_BOOLEAN)) ? 'true' : 'false';
    	}
    	else{
    		throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_BAD_REQUEST_NTP', 400, null, self::COMPONENT_NAME);
    	}

    	$timeZonesObj = new Model\TimeZones();
    	$timeZoneList = $timeZonesObj->getTimeZones();
    	if ($timeZoneList === NULL) {
    		throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
    	}

    	if (!array_key_exists($queryParams["time_zone_name"], $timeZoneList)) {
    		throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
    	}
    	$changes = array();
    	if(!getNTPServiceValidity()){
			$changes["ntpservice"] = 'false';
			$changes["ntpsrv_user"] = '';
		}
		else{
			$changes["ntpservice"] = $queryParams["ntpservice"];
			$changes["ntpsrv_user"] = $queryParams["ntpsrv_user"];
		}
		$changes["datetime"] = $queryParams["datetime"];
		$changes["ntpsrv0"] = $queryParams["ntpsrv0"];
		$changes["ntpsrv1"] = $queryParams["ntpsrv1"];
		$changes["time_zone_name"] = $queryParams["time_zone_name"];

    	$confObj = new Model\Configuration();
        $result = $confObj->modifyConf($changes);
        if($result == 'Success'){
        	$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status'=>'Success'), $outputFormat);
        }
        else{
        	throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        }
    }

}
