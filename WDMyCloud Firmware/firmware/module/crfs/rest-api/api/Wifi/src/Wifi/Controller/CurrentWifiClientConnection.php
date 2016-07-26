<?php
/**
 * \file wifi/currentwificlientconnection.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Wifi\Controller;

use \Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \class CurrentWifiClientConnection
 * \brief is used obtain details about wifi access point connection to which NAS is connected currently and also these APIs are used to connect or disconnect from and access point
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <current_wifi_client_connection>
 *      <error_code>{error number}</error_code>
 *      <error_message>{description or error}</error_message>
 *  </current_wifi_client_connection>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class CurrentWifiClientConnection
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'current_wifi_client_connection';
    static $lagacyVersions = array('1.0', '2.1', '2.4');
    static $legecyRequest = false;

    /**
     * \par Description:
     * This GET request is used obtain details about wifi access point connection to which NAS is connected currently. Also, if NAS wifi failed to get connected to any AP then, this API
     * will provide reason of failure
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/current_wifi_client_connection
     *
     * \param format  string - optional(default is XML)
     *
     * \par Parameter Details
     *
     * - format - default value for the format parameter is xml.
     *
     * \return details of current wifi access point
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
     * \per Shell script output
     * - 5 - Success
     * - 15 - WPSNotSupported
     * - 10 - IncorrectPin| IncorrectKey
     * - 20 - WPSPairedDeviceNotAvailable
     * - 25 - TIMEOUT
     *
     * \par XML Response Example:
     * \verbatim
     *    <current_wifi_client_connection>
     *        <ssid>The LAN before time</ssid>
     *        <mac_address>00:99:1A:2B:00:C3</mac_address>
     *        <wireless_strength>2</wireless_strength>
     *        <auto_join>true</ auto_join >
     *        <trusted>true</trusted>
     *        <security_mode>wpa2</security_mode>
     *        <connected>true</connected>
     *        <remembered>false</remembered>
     *        <secured>true</secured>
     *      <dhcp_enabled>true</dhcp_enabled>
     *      <ip>192.168.0.165</ip>
     *      <netmask>255.255.255.0</netmask>
     *      <gateway>192.168.1.1</gateway>
     *      <dns0>192.168.1.1</dns0>
     *      <dns1>192.168.1.1</dns1>
     *      <dns2>192.168.1.1</dns2>
     *      <mac_clone_enabled>true</mac_clone_enabled>
     *      <cloned_mac_address>AA:12:14:15:12:DE</cloned_mac_address>
     *    </current_wifi_client_connection >
     *     \endverbatim
     *
     * If NAS is not connected to any wifi access point, then XML response will be:
     * \verbatim
     *    <current_wifi_client_connection>
     *    </current_wifi_client_connection >
     * \endverbatim
     *
     * While NAS is trying to connect to an access point via WPS PIN method, then XML response will be:
     * \verbatim
     * <current_wifi_client_connection>
     *     <connected>false</connected>
     *     <message>wps paired device not available</message>
     * </current_wifi_client_connection>
     * \endverbatim
     *
     * While NAS failed to connect to a particular AP, then response will be
     * \verbatim
     * <?xml version="1.0" encoding="utf-8"?>
     * <current_wifi_client_connection>
     *   <connected>false</connected>
     *   <code>10</code>
     *   <message>IncorrectKey</message>
     * </current_wifi_client_connection>
     * \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml'){

        $configObj = new Model\WifiClient();
        try {
            $apDetails = $configObj->wifiClientApCurrent();
        } catch (\Wifi\Exception $e) {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }
        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $apDetails, $outputFormat);
    }

    /**
     * \par Description:
     * This POST request is used connect/re-connect to an access point. Also, this API can be used to connect to an access point using WPS PIN method
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/current_wifi_client_connection
     * - http://localhost/api/@REST_API_VERSION/rest/current_wifi_client_connection?mac_address=
     *
     * \param mac_address           String  - Required (Only this parameter has to be used to re-connect with a remembered network)
     * \param ssid                  String  - Optional (Required if MAC address is not present while connecting to any access point initially)
     * \param security_key          String  - Optional (Required for initial connection with an access point)
     * \param security_mode         String  - Optional (Should be same as AP security_mode, and it is required for initial connection with an access point)
     * \param auto_join             Boolean - Optional (default is True) (Deprecated from API version 2.4.1 onwards.)
     * \param trusted               Boolean - Optional (default is False)
     * \param remember_network      Boolean - Optional (default is True)
     * \param wps_pin               String  - Required only if WPS PIN method is used to connect to an AP
     * \param dhcp_enabled          String  - Optional (true/false)
     * \param ip                    String  - Required only if dhcp_enabled is false
     * \param netmask               String  - Required only if dhcp_enabled is false
     * \param gateway               String  - Required only if dhcp_enabled is false
     * \param dns0                  String  - Required only if dhcp_enabled is false
     * \param dns1                  String  - Required only if dhcp_enabled is false
     * \param dns2                  String  - Required only if dhcp_enabled is false
     * \param mac_clone_enable      boolean - Optional (default is False).
     * \param cloned_mac_address    String  - Optional.
     * \param format                String  - Optional (default is xml)
     *
     * \par Parameter Details
     * - mac_address: MAC address of access point
     * - ssid: SSID of access point
     * - trusted:  To define if the access point is trusted or not
     * - auto_join:  For API version 2.1 and 2.4, if true NAS will join this access point automatically. From API version 2.4.1 onwards this parameter is deprecated.
     * - remember_network: For API version 2.1 and 2.4, value of this parameter will be always True for POST method. From API version 2.4.1 onwards, this parameter can be set to true or false.
     * - security_key: the security key to join the network, this value can be null
     * - security_mode:  the type of security used by the AP
     * - wps_pin: a string of 8 numeric characters. This is required along with mac_address to connect to any access point via WPS PIN method.
     * - dhcp_enabled:  This parameter will define the The network mode. If it is true then 'dhcp' protocol will get set, otherwise protocol will be 'static'.
     * - ip:  The IP address can be any Class A, B or C address except 127.X.X.X and those with all zeros or ones in the host portion.
     * - netmask:  Is the number of leading binary 1s to make up mask.
     * - gateway:  If gateway is set, IP and gateway must be on the same network.
     * - dns0:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - dns1:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - dns2:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - mac_clone_enable: To define if mac address clone feature is enabled
     * - cloned_mac_address : This parameter will return the MAC address which has been used for MAC address cloning feature
     * - format - default value for the format parameter is xml.
     *
     * \return details of currently connected wifi access point
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
     * - 315 - WIFI_CLIENT_INTERNAL_SERVER_ERROR - wifi client internal server error
     * - 316 - WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST - wifi client mac address bad request
     * - 317 - WIFI_CLIENT_INVALID_SSID_ERROR - wifi client invalid ssid error
     * - 318 - WIFI_CLIENT_BAD_REQUEST - wifi client bad request
     * - 331 - WIFI_CLIENT_SECURITY_KEY_MISMATCH - Security key and security mode mismatch
     * - 319 - WIFI_CLIENT_SECURITY_MODE_BAD_REQUEST - wifi client security mode invalid
     * - 363 - WIFI_CLIENT_NETMASK_BAD_REQUEST - Wifi Cliet Netmask bad request
     * - 354 - WIFI_CLIENT_IP_ADDRESS_BAD_REQUEST - Wifi Client IP address bad request
     * - 355 - WIFI_CLIENT_GATEWAY_BAD_REQUEST - Wifi Client Gateway bad request
     * - 356 - WIFI_CLIENT_DNS_BAD_REQUEST - Wifi Client DNS bad request
     * - 366 - WIFI_CLIENT_WPS_PIN_BAD_REQUEST - Wifi Client WPS PIN bad request
     *
     * \par XML Response Example:
     * \verbatim
     *    <current_wifi_client_connection>
     *        <status>success</status>
     *    </current_wifi_client_connection>
     * \endverbatim
     *
     */
    public function post($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version=null)
    {
        if(in_array($version, self::$lagacyVersions)){
            self::$legecyRequest = true;
        }

        if(self::$legecyRequest){
            $changes     = ['remember_network' => 'true'];
        }
        else{
            if(isset($queryParams['remember_network'])){
                $changes['remember_network'] = (filter_var($queryParams['remember_network'], \FILTER_VALIDATE_BOOLEAN) == 1) ? 'true' : 'false';
            }
            else{
                $changes     = ['remember_network' => 'true'];
            }
        }

        $validateObj = new Model\WifiMapper();

        if (isset($queryParams['mac_address']))
        {
           try
           {
               $changes['mac'] = $validateObj->verifyMacAddress($queryParams['mac_address']);
           }
           catch (\Wifi\Exception $e)
           {
               throw new \Core\Rest\Exception('WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
           }
        }

        if (isset($queryParams['ssid']))
        {
            try
            {
               $changes['ssid'] = $validateObj->verifySsid($queryParams['ssid']);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_INVALID_SSID_ERROR', 400, NULL, static::COMPONENT_NAME);
            }
        }

        if (!isset($queryParams['mac_address']) && !isset($queryParams['ssid']))
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }

        if (isset($queryParams['security_mode']) &&
            strtolower($queryParams['security_mode']) != 'none' &&
            !isset($queryParams['security_key']))
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_SECURITY_KEY_MISMATCH', 400, NULL, static::COMPONENT_NAME);
        }

        if (isset($queryParams['security_mode']))
        {
            try
            {
                $changes['security_mode'] = $validateObj->verifySecurityMode($queryParams['security_mode']);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_SECURITY_MODE_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }
        }

        if (isset($queryParams['security_key']))
        {
            try
            {
                $changes['security_key'] = $validateObj->verifySecurityKey($queryParams['security_key'], $queryParams['security_mode']);
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_SECURITY_KEY_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
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

        if (isset($queryParams['dhcp_enabled']) && $queryParams['dhcp_enabled'] == 'false')
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
                    throw new \Core\Rest\Exception('WIFI_CLIENT_CLONED_MAC_ADDRERSS_INVALID', 400, NULL, static::COMPONENT_NAME);
                }
            }
        }

        if (isset($queryParams['wps_pin']))
        {
            if (strlen($queryParams['wps_pin']) != 8 || !is_numeric($queryParams['wps_pin']))
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_WPS_PIN_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes['wps_pin'] = $queryParams['wps_pin'];

            if (!isset($queryParams['mac_address']))
            {
                throw new \Core\Rest\Exception('WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }
        }

        $configObj = new Model\WifiClient();

        try
        {
            $result = $configObj->wifiClientApConnect($changes);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }

    /**
     * \par Description:
     * This Delete request is to disconnect NAS from an access point
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/current_wifi_client_connection/<mac_address>
     *
     * \param mac_address       string - required
     * \param format            default is XML
     *
     * \par Parameter Details
     * - mac_address - this string will be the mac address of NAS
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
     * - 57  - USER_NOT_AUTHORIZED - User not authorized
     * - 316 - WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST - wifi client mac address bad request
     * - 315 - WIFI_CLIENT_INTERNAL_SERVER_ERROR - wifi client internal server error
     *
     * \par XML Response Example:
     * \verbatim
     *    <current_wifi_client_connection>
     *        <status>success</status>
     *    </current_wifi_client_connection>
     * \endverbatim
     *
     */
    function delete($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version=null)
    {
        if(in_array($version, self::$lagacyVersions)){
            self::$legecyRequest = true;
        }

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
            $macAddress = (new Model\WifiMapper())->verifyMacAddress($mac);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_MAC_ADDRESS_BAD_REQUEST', 400, $e, static::COMPONENT_NAME);
        }

        try
        {
            $result = (new Model\WifiClient())->wifiClientApDisconnect($macAddress, $version, self::$legecyRequest);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_CLIENT_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}
