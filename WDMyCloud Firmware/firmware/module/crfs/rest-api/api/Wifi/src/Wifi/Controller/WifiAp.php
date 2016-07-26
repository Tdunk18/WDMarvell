<?php
/**
 * \file wifi/wifiap.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Wifi\Controller;

use Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \class WifiAp
 * \brief provides service to get and set local access point configuration
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_ap>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </wifi_ap>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiAp
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_ap';

    /**
     * \par Description:
     * This GET request is used to obtain details about NAS's wifi access point configuration.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap
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
     *    <wifi_ap>
     *        <enabled>true</enabled>
     *        <ssid>my passport lan</ssid>
     *        <broadcast>true</broadcast>
     *        <mac_address>11:22:a3:b2:44:55<mac_address>
     *        <secured>true</secured>
     *        <security_mode>wpa2</security_mode>
     *        <channel>9</channel>
     *        <channel_mode>auto</channel>
     *        <ip>192.168.60.1</ip>
       *        <netmask>255.255.255.0</netmask>
       *        <network_mode>bgn</network_mode>
       *        <enable_dhcp>true</enable_dhcp>
       *        <max_available_channel>11</max_available_channel>
     *    </wifi_ap>
     *     \endverbatim
     *
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        try
        {
            $config = (new Model\WifiAp())->getWifiApConfig();
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $config, $outputFormat);
    }

    /**
     * \par Description:
     * This PUT request is used to configure details about NAS's wifi access point configuration.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_ap
     *
     * \param enable            boolean - required
     * \param ssid              string  - optional
     * \param broadcast            boolean - optional
     * \param security_key        string  - optional (Required if security_mode is not NONE)
     * \param security_mode        string  - optional (Required if security_key is passed)
     * \param channel           integer - optional
     * \param ip                string  - optional
     * \param netmask           string  - optional
     * \param network_mode      string  - optional
     * \param channel_mode        string  - optional
     * \param enable_dhcp       boolean  - optional
     * \param format            default is XML
     *
     * \par Parameter Details
     *  - enabled - enable access point(true/false)
     *  - ssid - the SSID(Service Set IDentifier) string for NAS. This  is a unique identifier that clients use to connect. Note: In this string, space is not allowed at the start and end of string, nul character are not allowed at the end of string. Maximum allowed string length of SSID is 32.
     *  - broadcast - define if SSID is broadcasted or not(true/false)
     *  - security_key - Wi-Fi access point password. This string can be 'NULL' if no password is set for access point. If not NULL then, length of security_key will depend on the mode of security. As below:  WEP - 5 or 13 printable ASCII characters OR 10 or 26 Hexadecimel characters.For all other security_mode type - 8 to 63 printable ASCII characters. NONE - will have no security_key
     *  - security_mode - A string to define the kind of encryption used by access point.
     *    List of security modes are :  WEP
     *                                    WPAPSK/AES
     *                                    WPAPSK/TKIP
     *                                    WPAPSK/TKIPAES
     *                                    WPA2PSK/AES
     *                                    WPA2PSK/TKIP
     *                                    WPA2PSK/TKIPAES
     *                                    WPAPSK1WPAPSK2/AES
     *                                    WPAPSK1WPAPSK2/TKIP
     *                                    WPAPSK1WPAPSK2/TKIPAES
     *                                    NONE(to define no encryption mode supported)
     *    - channel -  A string to define which network channel NAS belongs to(this is a required parameter if channel_mode is set to 'manual')
     *  - ip      - IP address of NAS
     *  - netmask - Subnet mask of NAS's wifi AP mode
     *  - network_mode - a string defines the network mode of NAS. (ex: bgn)
     *  - channel_mode - to define mode of selecting channel(value: auto or manual). If channel_mode auto is selected then no need to pass "channel" parameter
     *  - enable_dhcp - to define if DHCP server is active for WIFI AP(true/false)
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
     * - 321 - WIFI_AP_BAD_REQUEST - wifi ap bad request
     * - 322 - WIFI_AP_SECURITY_MODE_BAD_REQUEST - wifi ap security mode bad request
     * - 323 - WIFI_AP_INVALID_SSID_ERROR - wifi ap ssid invalid
     * - 324 - WIFI_AP_SECURITY_KEY_BAD_REQUEST - wifi ap security key invalid
     * - 330 - WIFI_AP_CHANNEL_SETTINGS_MISMATCH - A channel has to be set for channel mode manual
     * - 367 - WIFI_AP_IP_ADDRESS_BAD_REQUEST - Wifi ap IP address bad request
     * - 368 - WIFI_AP_NETMASK_BAD_REQUEST - Wifi ap IP address bad request
     * - 325 - WIFI_AP_INTERNAL_SERVER_ERROR - wifi ap internal server error
     *
     * \par XML Response Example:
     * \verbatim
     *    <wifi_ap>
     *        <status>success</status>
     *    </wifi_ap>
     *     \endverbatim
     *
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        if (!isset($queryParams['enabled']))
        {
            throw new \Core\Rest\Exception('WIFI_AP_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }

        $changes     = ['enabled' => $this->_getFilteredBooleanValue($queryParams['enabled'])];
        $validateObj = new Model\WifiMapper();

        if (isset($queryParams['security_mode']))
        {
            try
            {
                $changes['security_mode'] = $validateObj->verifySecurityMode(strtoupper($queryParams['security_mode']));
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_AP_SECURITY_MODE_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
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
                 throw new \Core\Rest\Exception('WIFI_AP_INVALID_SSID_ERROR', 400, NULL, static::COMPONENT_NAME);
             }
        }

        if (isset($queryParams['broadcast']))
        {
            $changes['broadcast'] = $this->_getFilteredBooleanValue($queryParams['broadcast']);
        }

        if (isset($queryParams['security_key']))
        {
            try
            {
                $changes['security_key'] = $validateObj->verifySecurityKey($queryParams['security_key'], strtoupper($queryParams['security_mode']));
            }
            catch (\Wifi\Exception $e)
            {
                throw new \Core\Rest\Exception('WIFI_AP_SECURITY_KEY_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }
        }

        if (isset($queryParams['channel_mode']))
        {
            $changes['channel_mode'] = strtolower($queryParams['channel_mode']);

            if (strcmp($queryParams['channel_mode'], 'manual') == 0)
            {
                if (!isset($queryParams['channel']))
                {
                    throw new \Core\Rest\Exception('WIFI_AP_CHANNEL_SETTINGS_MISMATCH', 400, NULL, static::COMPONENT_NAME);
                }
                elseif((isset($queryParams['channel']) && !filter_var($queryParams['channel'], FILTER_VALIDATE_INT)) ||
                (isset($queryParams['channel']) && filter_var($queryParams['channel'], FILTER_VALIDATE_INT) && (($queryParams['channel'] <= 0) || ($queryParams['channel'] > 13))))
                {
                    throw new \Core\Rest\Exception('WIFI_AP_CHANNEL_SETTINGS_INVALID', 400, NULL, static::COMPONENT_NAME);
                }
                else{
                    $changes['channel'] = $queryParams['channel'];
                }
            }
        }

        if (isset($queryParams['ip']))
        {
            if (!filter_var($queryParams['ip'], FILTER_VALIDATE_IP))
            {
                throw new \Core\Rest\Exception('WIFI_AP_IP_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes['ip'] = $queryParams['ip'];
        }

        if (isset($queryParams['network_mode']) && is_string($queryParams['network_mode']))
        {
            $changes['network_mode'] = $queryParams['network_mode'];
        }

        if (isset($queryParams['netmask']))
        {
            if (!filter_var($queryParams['netmask'], FILTER_VALIDATE_IP))
            {
                throw new \Core\Rest\Exception('WIFI_AP_NETMASK_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes['netmask'] = $queryParams['netmask'];
        }

        if (isset($queryParams['enable_dhcp']))
        {
            $changes['enable_dhcp'] = $this->_getFilteredBooleanValue($queryParams['enable_dhcp']);
        }

        try
        {
            $result = (new Model\WifiAp())->setWifiApConfig($changes);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}