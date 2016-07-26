<?php

namespace System\Power\Controller;

/**
 * \file Power/Controller/BatteryStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

/**
 * \class BatteryStatus
 * \brief Get information about Battery status
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 *
 */


class BatteryStatus /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'battery_status';

    /**
     * \par Description:
     * Get the status of the battery.
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/battery_status
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
     * - percent_remaining
     * - state: charging | discharging
     * “charging” means that the battery is being charged either through AC or USB power. Status “discharging” means that the battery is not connected to either.
     *
     * \par XML Response Example:
     * \verbatim
     <battery_status>
		<percent_remaining>90</percent_remaining>
		<state>discharging</state>
	</battery_status>
       \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	$infoObj = \System\Power\Manager::getManager();
    	$result = $infoObj->getBatteryStatus();
        $this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
    }


}