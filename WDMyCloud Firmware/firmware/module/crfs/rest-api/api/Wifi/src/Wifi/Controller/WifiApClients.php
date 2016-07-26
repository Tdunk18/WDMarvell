<?php
/**
 * \file wifi/wifiapclients.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Wifi\Controller;

use Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \class WifiApClients
 * \brief provides service to retrieve the list of clients attached to Wifi access point and delete a selected client when required
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_ap_clients>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </wifi_ap_clients>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiApClients
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_ap_clients';

    /**
     * \par Description:
     * This GET request is used obtain details about NAS's wifi access point clients.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap_clients/{mac_address}
     *
     * \param mac_address  string - optional
     *
     * \par Parameter Details
     *
     * - mac_address - this string will be the mac address of access point client. If this parameter is not present result will be list of all clients
     * - format - default value for the format parameter is xml.
     *
     * \return Array of wifi access point clients list and their details if there is any
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
     *    <wifi_ap_clients>
     *        <wifi_ap_client>
     *            <mac_address>00:90:A9:F6:06:04</mac_address>
     *            <name>My Phone</name>
     *            <ip_address>12.0.67.1</ip_address>
     *            <connected_time>1390339272</connected_time>
     *        </wifi_ap_client>
     *    </wifi_ap_clients>
     *     \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $macAddress = '';

        if (isset($urlPath[0]))
        {
            try
            {
                $macAddress = (new Model\WifiMapper())->verifyMacAddress($urlPath[0]);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_AP_CLIENT_MAC_ADDRERSS_INVALID', 400, NULL, static::COMPONENT_NAME);
            }
        }

        try
        {
            $clientList = (new Model\WifiAp())->getWifiApClients($macAddress);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateCollectionOutput(200, static::COMPONENT_NAME, 'wifi_ap_client', $clientList, $outputFormat);
    }

    /**
     * \par Description:
     * This Delete request is to remove a connected client from the list of clients and disconnect from NAS wifi access point.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap_clients/<mac_address>
     *
     * \param mac_address       string - required
     * \param format            default is XML
     *
     * \par Parameter Details
     * - mac_address - this string will be the mac address of access_point_client to be removed.
     * - format - default value for the format parameter is xml.
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
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     *
     * \par XML Response Example:
     * \verbatim
     *    <wifi_ap_clients>
     *        <status>success</status>
     *    </wifi_ap_clients>
     * \endverbatim
     *
     */
    public function delete($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        if (isset($queryParams['mac_address']))
        {
            $mac = $queryParams['mac_address'];
        }
        elseif (isset($urlPath[0]))
        {
            $mac = $urlPath[0];
        }
        else
        {
            throw new \Core\Rest\Exception('WIFI_AP_CLIENT_MAC_ADDRERSS_INVALID', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            $macAddress = (new Model\WifiMapper())->verifyMacAddress($mac);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_CLIENT_MAC_ADDRERSS_INVALID', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            $result = (new Model\WifiAp())->deleteWifiApClient($macAddress);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}