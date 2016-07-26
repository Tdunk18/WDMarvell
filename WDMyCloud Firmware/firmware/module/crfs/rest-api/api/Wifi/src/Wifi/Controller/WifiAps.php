<?php
/**
 * \file wifi/wifiaps.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Wifi\Controller;

use Wifi\Model;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \class WifiAps
 * \brief provides service to get and set local access point configuration
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <wifi_aps>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </wifi_aps>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication require dto use this component
 */
class WifiAps
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'wifi_aps';

    /**
     * \par Description:
     * This GET request is used to obtain details about NAS's wifi access point configuration.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_aps/{ism_band}
     *
     * \param format - default is XML
     * \param ism_band {2.4 or 5}
     *
     * \par Parameter Details
     * - ism_band - Wi-Fi ISM band(2.4 or 5)
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
     *  <wifi_aps>
     *      <wifi_ap>
     *          <ism_band>2.4</ism_band>
     *          <enabled>true</enabled>
     *          <ssid>Korra356</ssid>
     *          <broadcast>true</broadcast>
     *          <is_secured>true</is_secured>
     *          <mac_address>02:E0:4C:BC:88:60</mac_address>
     *          <security_mode>WPAPSK1WPAPSK2/TKIP</security_mode>
     *          <channel_mode>auto</channel_mode>
     *          <channel>4</channel>
     *          <ip>192.168.60.1</ip>
     *          <netmask>255.255.255.0</netmask>
     *          <network_mode>gn</network_mode>
     *          <dhcp_enabled>true</dhcp_enabled>
     *          <available_channels>1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11<available_channels/>
     *      </wifi_ap>
     *      <wifi_ap>
     *          <ism_band>5</ism_band>
     *          <enabled>true</enabled>
     *          <ssid>Korra5G</ssid>
     *          <broadcast>true</broadcast>
     *          <is_secured>true</is_secured>
     *          <mac_address>02:E0:4C:87:11:22</mac_address>
     *          <security_mode>WPAPSK1WPAPSK2/TKIP</security_mode>
     *          <channel_mode>auto</channel_mode>
     *          <channel>149</channel>
     *          <ip>192.168.60.1</ip>
     *          <netmask>255.255.255.0</netmask>
     *          <network_mode>ac</network_mode>
     *          <dhcp_enabled>true</dhcp_enabled>
     *          <available_channels>36, 40, 44, 48, 149, 153, 157, 161, 165<available_channels/>
     *      </wifi_ap>
     * </wifi_aps>
     * \endverbatim
     *
     */

    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        if(isset($urlPath[0]) && in_array($urlPath[0], ['2.4', '5'])){
            $input = $urlPath[0];
        }
        try
        {
            $configs = (new Model\WifiAp())->getWifiApConfig();
            if(!empty($configs)){
                $output = new \OutputWriter(strtoupper($outputFormat));
                $output->pushElement(self::COMPONENT_NAME);
                $output->pushArray("wifi_ap");
                foreach ($configs as $ismBand=>$configArray){
                    if(isset($input) && $ismBand != $input)
                        continue;
                    $output->pushArrayElement();
                    $output->element('ism_band', $ismBand);
                    foreach ($configArray as $configK=>$configV){
                        if($configK === 'available_channels'){
                            $channels = implode(', ', $configV);
                            $output->element($configK, $channels);
                        }
                        else{
                            $output->element($configK, $configV);
                        }
                    }
                    $output->popArrayElement();
                }
                $output->popArray();
                $output->popElement();
                $output->close();
            }
            else{
                throw new \Core\Rest\Exception('WIFI_AP_CONFIG_GET_FAILURE', 500, $e, static::COMPONENT_NAME);
            }
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * This PUT request is used to modify details of NAS's wifi access point configuration. All configurable details of an access point are related to a particular ISM band,
     * so while changing any of these details ISM band needs to be specified as well. Otherwise, change request will be considered invalid. If ISM band's details has to be
     * changed,it can be passed in a form of JSON array, where ISM bands will be the keys of the array and all configuration details can be mentioned as it's value.
     * Ex:{ism_band:{configuration:updated_value}}. If, details of more than one band needs to be changed they can be passed at a same time as elements of same array.
     *
     * \par Security:
     * - Admin authentication required.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/wifi_aps
     *
     * \par HTTP PUT Body - Required
     * - Content-Type headers should be application/json.
     * - Body should be a JSON array. Example:
     * \code
     *  {
     *      "ism_band": {
     *              "enabled": "true",
     *              "ssid": "My Passport Wireless Pro(5GHz)",
     *              "broadcast": "true",
     *              "security_mode": "WPA2PSK/AES",
     *              "security_key": "passport",
     *              "channel_mode": "manual",
     *              "channel": "149"
     *           }
     *   }
     * \endcode
     *
     * \param ism_band          float - required
     * \param enable            boolean - required
     * \param ssid              string  - optional
     * \param broadcast         boolean - optional
     * \param security_key      string  - optional (Required if security_mode is not NONE)
     * \param security_mode     string  - optional (Required if security_key is passed)
     * \param channel           integer - optional
     * \param ip                string  - optional
     * \param netmask           string  - optional
     * \param network_mode      string  - optional
     * \param channel_mode      string  - optional
     * \param dhcp_enabled      boolean - optional
     * \param format            default is XML
     *
     * \par Parameter Details
     *  - ism_band - Wi-Fi ISM band(2.4 or 5)
     *  - enabled - enable access point(true/false)
     *  - ssid - the SSID(Service Set IDentifier) string for NAS. This  is a unique identifier that clients use to connect. Note: In this string, space is not allowed at the start and end of string, nul character are not allowed at the end of string. Maximum allowed string length of SSID is 32.
     *  - broadcast - define if SSID is broadcasted or not(true/false)
     *  - security_key - Wi-Fi access point password. This string can be 'NULL' if no password is set for access point. If not NULL then, length of security_key will depend on the mode of security. As below:  WEP - 5 or 13 printable ASCII characters OR 10 or 26 Hexadecimel characters.For all other security_mode type - 8 to 63 printable ASCII characters. NONE - will have no security_key
     *  - security_mode - A string to define the kind of encryption used by access point.
     *    List of security modes are :    WEP
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
     *  - channel -  A string to define which network channel NAS belongs to(this is a required parameter if channel_mode is set to 'manual').
     *  - ip      - IP address of NAS
     *  - netmask - Subnet mask of NAS's wifi AP mode
     *  - network_mode - a string defines the network mode of NAS. (ex: bgn)
     *  - channel_mode - to define mode of selecting channel(value: auto or manual). If channel_mode auto is selected then no need to pass "channel" parameter
     *  - enable_dhcp - to define if DHCP server is active for WIFI AP(true/false)
     *  - restart_hostapd - In order to make all the changes take affect, hostapd daemon needs to be restarted, if this parameter is true, then hostapd will be restarted, otherwise not.
     *                      Default value of this parameter is false.
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
     *    <wifi_aps>
     *        <status>success</status>
     *    </wifi_aps>
     *     \endverbatim
     *
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $json = file_get_contents("php://input");
        $apArray = json_decode($json, true);

        if(empty($apArray)){
            throw new \Core\Rest\Exception('WIFI_AP_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
        }
        foreach($apArray as $ism_band=>$value){

            if (!isset($value['enabled']) || !(in_array($ism_band, ['2.4','5'])))
            {
                throw new \Core\Rest\Exception('WIFI_AP_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
            }

            $changes = array();

            $changes['enabled'] = filter_var($value['enabled'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';

            $validateObj = new Model\WifiMapper();

            if (isset($value['security_mode']))
            {
                try
                {
                    $changes['security_mode'] = $validateObj->verifySecurityMode(strtoupper($value['security_mode']));
                }
                catch (\Wifi\Exception $e)
                {
                    throw new \Core\Rest\Exception('WIFI_AP_SECURITY_MODE_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }
            }

            if (isset($value['ssid']))
            {
                try
                {
                     $changes['ssid'] = $validateObj->verifySsid($value['ssid']);
                 }
                 catch (\Wifi\Exception $e)
                 {
                     throw new \Core\Rest\Exception('WIFI_AP_INVALID_SSID_ERROR', 400, NULL, static::COMPONENT_NAME);
                 }
            }

            if (isset($value['broadcast']))
            {
                $changes['broadcast'] = filter_var($value['broadcast'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
            }

            if (isset($value['security_key']))
            {
                try
                {
                    $changes['security_key'] = $validateObj->verifySecurityKey($value['security_key'], strtoupper($value['security_mode']));
                }
                catch (\Wifi\Exception $e)
                {
                    throw new \Core\Rest\Exception('WIFI_AP_SECURITY_KEY_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }
            }

            if (isset($value['channel_mode']))
            {
                $changes['channel_mode'] = strtolower($value['channel_mode']);

                if (strcmp($value['channel_mode'], 'manual') == 0)
                {
                    if (!isset($value['channel']))
                    {
                        throw new \Core\Rest\Exception('WIFI_AP_CHANNEL_SETTINGS_MISMATCH', 400, NULL, static::COMPONENT_NAME);
                    }
                    elseif((!filter_var($value['channel'], FILTER_VALIDATE_INT)) ||
                    (isset($value['channel']) && filter_var($value['channel'], FILTER_VALIDATE_INT) && (($value['channel'] <= 0))))
                    {
                        throw new \Core\Rest\Exception('WIFI_AP_CHANNEL_SETTINGS_INVALID', 400, NULL, static::COMPONENT_NAME);
                    }
                    else{
                        $changes['channel'] = $value['channel'];
                    }
                }
            }

            if (isset($value['ip']))
            {
                if (!filter_var($value['ip'], FILTER_VALIDATE_IP))
                {
                    throw new \Core\Rest\Exception('WIFI_AP_IP_ADDRESS_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }

                $changes['ip'] = $value['ip'];
            }

            if (isset($value['network_mode']) && is_string($value['network_mode']))
            {
                $changes['network_mode'] = escapeshellcmd($value['network_mode']);
            }

            if (isset($value['netmask']))
            {
                if (!filter_var($value['netmask'], FILTER_VALIDATE_IP))
                {
                    throw new \Core\Rest\Exception('WIFI_AP_NETMASK_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);
                }

                $changes['netmask'] = $value['netmask'];
            }

            if (isset($value['dhcp_enabled']))
            {
                $changes['dhcp_enabled'] = filter_var($value['dhcp_enabled'], \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
            }

            $element[$ism_band] = $changes;
        }

        try
        {
            $result = (new Model\WifiAp())->setWifiApConfig($element);
        }
        catch (\Wifi\Exception $e)
        {
            throw new \Core\Rest\Exception('WIFI_AP_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}