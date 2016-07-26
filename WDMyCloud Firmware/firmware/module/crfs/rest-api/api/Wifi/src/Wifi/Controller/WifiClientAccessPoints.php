<?php
/**
 * \file wifi/wificlientaccesspoints.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Wifi\Controller;

use \Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \class WifiClientAccessPoints
 * \brief is used to return details of Wi-Fi access point the device is connected to and all other discovered access points, also the list of access points remembered.
 * If any acess point has non broadcasted SSID, then SSID will be blank for that access point. And also used to update information of an remembered access point
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_client_access_points>
 *      <error_code>{error number}</error_code>
 *      <error_message>{description or error}</error_message>
 *  </wifi_client_access_points>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiClientAccessPoints
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_client_access_points';
    static $lagacyVersions = array('1.0', '2.1', '2.4');
    static $legecyRequest = false;

    /**
     * \par Description:
     * This GET request is used to return details of Wi-Fi access point the device is connected to and all other discovered access points, also the list of access points remembered.
     * If any acess point has non broadcasted SSID, then SSID will be blank for that access point.
     * \par Security:
     * - User Authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_client_access_points/{mac_address}
     *
     * \param mac_address String  - optional
     * \param format      String  - optional (default is xml)
     *
     *  \par Parameter Details:
     * - mac_address - the MAC address of the provider access point
     *
     * \par Parameter Usages:
     *
     * \return the list of available wifi access points and if the device is connected to any, also the list of access points remembered.
     *
     * \par HTTP Response Codes:
     * - 200 - On success
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
     *    <wifi_client_access_points>
     *        <wifi_client_access_point>
     *            <ssid>MY_HOME</ssid>
     *            <mac_address>20:AA:4B:18:62:55</mac_address>
     *            <signal_strength>95</signal_strength>
     *            <auto_join>true</auto_join>
     *            <trusted>true</trusted>
     *            <security_mode>WPA2</security_mode>
     *            <connected>true</connected>
     *            <remembered>true</remembered>
     *            <secured>true</secured>
     *          <wps_enabled>true</wps_enabled>
     *          <dhcp_enabled>true</dhcp_enabled>
     *          <ip>192.168.0.165</ip>
     *          <netmask>255.255.255.0</netmask>
     *          <gateway>192.168.1.1</gateway>
     *          <dns0>192.168.1.1</dns0>
     *          <dns1>192.168.1.1</dns1>
     *          <dns2>192.168.1.1</dns2>
     *          <mac_clone_enabled>true</mac_clone_enabled>
     *          <cloned_mac_address>AA:12:14:15:12:DE</cloned_mac_address>
     *        </wifi_client_access_point>
     *    </wifi_client_access_points>
     *     \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $macAddress = '';

        if (isset($queryParams['mac_address']))
        {
            $mac = $queryParams['mac_address'];
        }
        elseif (isset($urlPath[0]))
        {
            $mac = $urlPath[0];
        }

        if (isset($mac))
        {
            try
            {
                $macAddress = (new Model\WifiMapper())->verifyMacAddress($mac);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_AP_CLIENT_MAC_ADDRERSS_INVALID', 400, NULL, static::COMPONENT_NAME);
            }
        }

        try
        {
            $listOfAp = (new Model\WifiClient())->wifiClientApScan($macAddress);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateCollectionOutput(200, static::COMPONENT_NAME, 'wifi_ap_client_access_point', $listOfAp, $outputFormat);
    }

    /**
     * \par Description:
     * This PUT request is used update information of an remembered access point
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_client_access_points/{mac_address}
     *
     * \param mac_address           String  - Required
     * \param trusted               Boolean - Optional (default is False).
     * \param auto_join             Boolean - Optional (default is True).
     * \param remember_network      Boolean - Optional (default is True).
     * \param dhcp_enabled          String  - Optional (true/false)
     * \param ip                    String  - Required only if dhcp_enabled is false
     * \param netmask               String  - Required only if dhcp_enabled is false
     * \param gateway               String  - Required only if dhcp_enabled is false
     * \param dns0                  String  - Required only if dhcp_enabled is false
     * \param dns1                  String  - Required only if dhcp_enabled is false
     * \param dns2                  String  - Required only if dhcp_enabled is false
     * \param mac_clone_enable      Boolean - Optional (default is False).
     * \param cloned_mac_address    String  - Optional.
     * \param format                String  - default is XML
     *
     * \par Parameter Details
     *  - mac_address: MAC address of access point
     *  - trusted: to define if the access point is trusted or not
     *  - auto_join:  For API version 2.4, If true NAS will join this access point automatically. From API version 2.4.1 onwards this parameter is deprecated.
     *  - remember_network: For API version 2.4, Value of this parameter will be always True for POST method. From API version 2.4.1 onwards this parameter can be set to true or false.
     *  - dhcp_enabled:  This parameter will define the The network mode. If it is true then 'dhcp' protocol will get set, otherwise protocol will be 'static'.
     *  - ip:  The IP address can be any Class A, B or C address except 127.X.X.X and those with all zeros or ones in the host portion.
     *  - netmask:  Is the number of leading binary 1s to make up mask.
     *  - gateway:  If gateway is set, IP and gateway must be on the same network.
     *  - dns0:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     *  - dns1:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     *  - dns2:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     *  - mac_clone_enable: To define if mac address clone feature is enabled
     *  - cloned_mac_address : This parameter will return the MAC address which has been used for MAC address cloning feature
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
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     *
     * \par XML Response Example:
     * \verbatim
     * <wifi_client_access_points>
     *      <status>success</status>
     * </wifi_client_access_points>
     * \endverbatim
     *
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version=null)
    {
        if(in_array($version, self::$lagacyVersions)){
            self::$legecyRequest = true;
        }

        $changes     = [];
		$validateObj = new Model\WifiMapper();

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
            throw new \Core\Rest\Exception('WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            $changes['mac'] = $validateObj->verifyMacAddress($mac);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }

        if (isset($queryParams['remember_network']))
        {
            if(self::$legecyRequest){
                $changes['remember'] = filter_var($queryParams['remember_network'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
            }
            else{
                $changes['remember_network'] = filter_var($queryParams['remember_network'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
            }
        }

        if(isset($queryParams['trusted'])){
            $changes['trusted'] = filter_var($queryParams['trusted'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
        }

        if(isset($queryParams['auto_join']) && self::$legecyRequest){
            $changes['auto_join'] = filter_var($queryParams['auto_join'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
        }

        if(isset($queryParams['dhcp_enabled'])){
            $changes['dhcp_enabled'] = filter_var($queryParams['dhcp_enabled'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
        }

        if ($queryParams['dhcp_enabled'] == 'false')
        {
            if (!isset($queryParams['netmask']))
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_NETMASK_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes['netmask'] = $queryParams['netmask'];

            if (!isset($queryParams['ip']) || !filter_var($queryParams['ip'], FILTER_VALIDATE_IP))
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_IP_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes['ip'] = $queryParams['ip'];

            if (isset($queryParams['gateway']))
            {
                if (!filter_var($queryParams['gateway'], FILTER_VALIDATE_IP))
                {
                    throw new \Core\Rest\Exception('WIFI_CLIENT_GATEWAY_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }

                $changes['gateway'] = $queryParams['gateway'];
            }

            foreach (['dns0', 'dns1', 'dns2'] as $dns)
            {
                if (!isset($queryParams[$dns]) || (!empty($queryParams[$dns]) && !filter_var($queryParams[$dns], FILTER_VALIDATE_IP)))
                {
                    throw new \Core\Rest\Exception('WIFI_CLIENT_DNS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }

                $changes[$dns] = $queryParams[$dns];
            }
        }

        if (isset($queryParams['mac_clone_enable']))
        {
            $changes['mac_clone_enable'] = $this->_getFilteredBooleanValue($queryParams['mac_clone_enable']);

            if ($changes['mac_clone_enable'] == 'true')
            {
                try
                {
                    $changes['cloned_mac_address'] = $validateObj->verifyMacAddress($queryParams['cloned_mac_address']);
                }
                catch (\Wifi\Exception $e)
                {
                    throw new \Core\Rest\Exception('WIFI_CLIENT_CLONED_MAC_ADDRERSS_INVALID', 400, null, self::COMPONENT_NAME);
                }
            }
        }

        try
        {
            $result = (new Model\WifiClient())->wifiClientApUpdate($changes, $version, self::$legecyRequest);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
    }
}