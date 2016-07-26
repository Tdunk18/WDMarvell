<?php

namespace System\Power\Controller;

/**
 * \file Power/Controller/PowerProfile.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

/**
 * \class PowerProfile
 * \brief gets and sets power profile
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 *
 */
class PowerProfile /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'power_profile';

    /**
     * \par Description:
     * Get the Power Profile configuration status.
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/power_profile
     *
     * \retval status String - success
     *
     * \param format     String  - optional (default is xml)
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     *  \par Response Details:
     * - profile: max_life | max_system_performance
     *
     * \par XML Response Example:
     * \verbatim
     <power_profile>
		<profile>max_life</profile>
	</power_profile>
       \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	$infoObj = \System\Power\Manager::getManager();
    	$result = $infoObj->getPowerProfile();
    	$this->generateMultipleCollectionOutputWithTypeAndCollectionNameCustom(200, self::COMPONENT_NAME, $result, $outputFormat);
    }

    /**
     * \par Description:
     * Modify power profile
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/power_profile
     *
     * \param profile  String - required: max_life  | max_system_performance
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * “max_life” means that the battery life will be maximized, status “max_system_performance” means that the quality of performance will be maximized at the expense of battery life
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
     <power_profile>
     <status>success</status>
     </power_profile>
     \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	$powerProfiles = array('max_life' => 'max_life',
    										'max_system_performance' => 'max_system_performance');
    	//parameter validation
    	if(!isset($queryParams['profile']) || !isset($powerProfiles[$queryParams['profile']])){
    		throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, null, 'power_profile');
    	}
    	$infoObj = \System\Power\Manager::getManager();
    	$result = $infoObj->setPowerProfile($queryParams['profile']);
    	$this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
    }


}
