<?php

/**
 * \file wifi/wificlientconfiguration.php
* \author WDMV - Mountain View - Software Engineering
* \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

namespace Wifi\Controller;
use Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');

/**
 * \class WifiClientConfiguration
 * \brief provides service to get and set local access point configuration
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_client_configuration>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </wifi_client_configuration>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiClientConfiguration
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_client_configuration';
    static $lagacyVersions = array('1.0', '2.1', '2.4');

    /**
     * \par Description:
     * This GET request is used to obtain details about NAS's uplink network configuration.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_client_configuration
     *
     * \param format - default is XML
     *
     * \par Parameter Details
     * - format - default value for the format parameter is xml.
     *
     * \return Array of wifi access point settings info
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
     *    <wifi_client_configuration>
     *        <enabled>true</enabled>
     *    </wifi_client_configuration>
     * \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version=null)
    {
        if(!in_array($version, self::$lagacyVersions)){
            try
            {
                $config = (new Model\WifiClient())->getWifiClientConfig();
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
            }

            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $config, $outputFormat);
        }
    }

    /**
     * \par Description:
     * This PUT request is used to update details of NAS's uplink network configuration.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_client_configuration
     *
     * \param enable            boolean - required
     * \param format            default is XML
     *
     * \par Parameter Details
     *  - enabled - enable access point(true/false)
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
     *    <wifi_client_configuration>
     *        <status>success</status>
     *    </wifi_client_configuration>
     *     \endverbatim
     *
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version=null)
    {
        if(!in_array($version, self::$lagacyVersions)){
            if (!isset($queryParams['enable'])){
                throw new \Core\Rest\Exception('WIFI_CLIENT_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }
            else{
                $enable = filter_var($queryParams['enable'], \FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
            }

            try
            {
                $result = (new Model\WifiClient())->setWifiClientConfig($enable);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
            }

            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
        }
    }
}