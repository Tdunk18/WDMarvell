<?php

/**
 * \file wifi/wifiapconfiguration.php
* \author WDMV - Mountain View - Software Engineering
* \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

namespace Wifi\Controller;
use Wifi\Model;

/**
 * \class WifiApConfiguration
 * \brief provides service to get and set wait time in minutes for wifi downlink before it shutsdown
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_ap_configuration>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </wifi_ap_configuration>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiApConfiguration
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_ap_configuration';

    /**
     * \par Description:
     * This GET request is used to obtain details about NAS's downlink's wait time in minutes before it switches of while NAS is on battery mode.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap_configuration
     *
     * \param format - default is XML
     *
     * \par Parameter Details
     * - format - default value for the format parameter is xml.
     *
     * \return time in minutes
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the zip file
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     *
     * \par XML Response Example:
     * \verbatim
     *    <wifi_ap_configuration>
     *        <idle_time>5</idle_time>
     *    </wifi_ap_configuration>
     * \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        try
        {
            $config = (new Model\WifiAp())->getWifiIdleTime();
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $config, $outputFormat);
    }

    /**
     * \par Description:
     * This PUT request is set wait time in minutes before it NAS's downlink gets switched off while NAS is on battery mode.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap_configuration
     *
     * \param idle_time         integer - required
     * \param format            default is XML
     *
     * \par Parameter Details
     *  - idle_time - waiting period in minutes(ex: 0,1,3,5,10)
     *  - format - default value for the format parameter is xml.
     *
     * \return  status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the zip file
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - User not authorized
     * - 318 - WIFI_CLIENT_BAD_REQUEST - wifi ap bad request
     * - 315 - WIFI_CLIENT_INTERNAL_SERVER_ERROR - wifi ap internal server error
     *
     * \par XML Response Example:
     * \verbatim
     *    <wifi_ap_configuration>
     *        <status>success</status>
     *    </wifi_ap_configuration>
     * \endverbatim
     *
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        if (!isset($queryParams['idle_time']) && !filter_var($queryParams['idle_time'], FILTER_VALIDATE_INT) || ($queryParams['idle_time']<0 || $queryParams['idle_time']>60)){
            throw new \Core\Rest\Exception('WIFI_AP_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            $result = (new Model\WifiAp())->setWifiIdleTime($queryParams['idle_time']);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}