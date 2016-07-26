<?php

namespace System\Network\Controller;

//require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

/**
 * \file Network\Controller\NetworkConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class NetworkConfiguration
 * \brief Used for retrieving network configuration details and updating the same.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need to be authenticated, must be admin, and in LAN to use this component.
 *
 */
class NetworkConfiguration{

	use \Core\RestComponent;

	/**
     * \par Description:
     * Get the configuration for the default NIC.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/network_configuration
     *
     * \param  format  String - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval network_configurations - Array of Network configurations
     * - ifname:  {interface_name}
     * - iftype: {interface_type}
     * - proto:  {dhcp_client/static/disconnected}
     * - ip:  {xxx.xxx.xxx.xxx}
     * - netmask:  {Network Mask}
     * - gateway:  {xxx.xxx.xxx.xxx}
     * - dns0:  {Domain Name Server 0}
     * - dns1:  {Domain Name Server 1}
     * - dns2:  {Domain Name Server 2}
     * - gateway_mac_address: {MAC address of AP}
     *
     * - Note: when switching from static to dhcp and vice versa there will be an intermediate state of disconnected before seeing the expected response. This behavior is valid only for Avatar.
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of network config
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
<?xml version="1.0" encoding="utf-8"?>
<network_configuration>
    <ifname>eth0</ifname>
    <iftype>wired</iftype>
    <proto>dhcp_client</proto>
    <ip>192.168.0.165</ip>
    <netmask></netmask>
    <gateway></gateway>
    <dns0></dns0>
    <dns1></dns1>
    <dns2></dns2>
    <gateway_mac_address></gateway_mac_address>
</network_configuration>

\endverbatim
     */
    function get($urlPath, $queryParams=null, $outputFormat='xml'){
    	$infoObj = \System\Network\Configuration::getManager();
    	try {
	    	$result = $infoObj->getNetworkConfiguration($urlPath, $queryParams, $outputFormat);
    	} catch ( \System\Network\Exception $ex) {
    		if ($ex->getMessage() == 'NETWORK_INTERFACE_NOT_FOUND')  {
    			throw new \Core\Rest\Exception('NETWORK_INTERFACE_NOT_FOUND',404,null,'network_configuration');
    		}
    		throw $ex;
    	}
    	$this->generateSuccessOutput(200, 'network_configuration', $result, $outputFormat);
    }

    /**
     * \par Description:
     * Used for configuring network client to dhcp or static.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/network_configuration/{ifname}
     *
     * \param proto                 String {dhcp_client/static}  - required
     * \param ip                    String  - required only if proto is static
     * \param netmask               String  - required only if proto is static
     * \param gateway               String  - required only if proto is static
     * \param dns0                  String  - required only if proto is static
     * \param dns1                  String  - required only if proto is static
     * \param dns2                  String  - required only if proto is static
     * \param dhcp_mode				String  - Optional(value: renew)
     * \param gateway_mac_address   String  - Optional(Value MAC address of the AP)
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - In proto is dhcp_client: ip, netmask, gateway, dns0, dns1 and dns2 values are ignored even if passed
     * - ifname: The network interface name e.g. (eth0, ath0, wlan0).
     * - proto:  The network mode must be set to dhcp_client or static.
     * - ip:  The IP address can be any Class A, B or C address except 127.X.X.X and those with all zeros or ones in the host portion.
     * - netmask:  Is the number of leading binary 1s to make up mask.
     * - gateway:  If gateway is set, IP and gateway must be on the same network.
     * - dns0:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - dns1:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - dns2:  If set, the IP address of the domain name server must be entered in the form xxx.xxx.xxx.xxx
     * - dhcp_mode: Value 'renew'. If set, then lease timing of DHCP client will get renewed.
     * - gateway_mac_address: MAC address of Access Point
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of network config
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 500 - Internal server error
     *
     *\par Error Codes:
     * - 265 - NETWORK_CONFIGURATION_BAD_REQUEST - Network Configuration Bad request
     * - 266 - NETWORK_CONFIGURATION_SERVER_ERROR - Network Configuration Server Error
     *
     * \par XML Response Example:
     * \verbatim
<network_configuration>
  <status>success</status>
</network_configuration>
\endverbatim
     */
    function put($urlPath, $queryParams=null, $outputFormat='xml'){

        if( !isset($queryParams["proto"]) ){
            $this->generateErrorOutput(400, 'network_configuration', 'NETWORK_CONFIGURATION_BAD_REQUEST', $outputFormat);
            return;
        }

        if  ((strcasecmp($queryParams["proto"], "dhcp_client") !=0) &&
        ((!isset($queryParams["ip"])      ||
            !isset($queryParams["netmask"]) ||
            !isset($queryParams["gateway"]) ||
            !isset($queryParams["dns0"])    ||
            !isset($queryParams["dns1"])    ||
            !isset($queryParams["dns2"]) ))) {
            $this->generateErrorOutput(400, 'network_configuration', 'NETWORK_CONFIGURATION_BAD_REQUEST', $outputFormat);
            return;
        }

    	$infoObj = \System\Network\Configuration::getManager();
    	$result = $infoObj->putNetworkConfiguration($urlPath, $queryParams, $outputFormat);
    	switch($result){
    		case 'SUCCESS':
    			$results = array();
    			$results['status'] = 'Success';
    			$this->generateSuccessOutput(200, 'network_configuration', $results, $outputFormat);
    			break;
    		case 'BAD_REQUEST':
    			$this->generateErrorOutput(400, 'network_configuration', 'NETWORK_CONFIGURATION_BAD_REQUEST', $outputFormat);
    			break;
    		case 'SERVER_ERROR':
    			$this->generateErrorOutput(500, 'network_configuration', 'NETWORK_CONFIGURATION_SERVER_ERROR', $outputFormat);
    			break;
    	}
    }

    function post($urlPath, $queryParams=null, $outputFormat='xml'){
        header("Allow: GET, PUT");
        header("HTTP/1.0 405 Method Not Allowed");
    }

    function delete($urlPath, $queryParams=null, $outputFormat='xml'){
        header("Allow: GET, PUT");
        header("HTTP/1.0 405 Method Not Allowed");
    }

}