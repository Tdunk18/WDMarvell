<?php

namespace Remote\Controller;

/**
 * \file remote/Device.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(UTIL_ROOT . '/includes/httpclient.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class Device
 * \brief Used to Register, retrieve, and update device info.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \see DeviceUser, Users
 */
use Remote\Device\DeviceControl;

class Device /* extends AbstractActionController */ {

    use \Core\RestComponent;

    private $booleanString = array('true', 'false');

    /**
     * \par Description:
     * Used to retrieve the device info.
     *
     * \par Security:
     * - Only the user or admin user can get the device info.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/device
     *
     * \param format   String - optional
     *
     * \retval device info
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the device info
     * - 403 - Request is forbidden
     *
     * \par XML Response Example:
     * \verbatim
      <device>
		  <device_id>498979</device_id>
		  <device_type>4</device_type>
		  <communication_status>disabled</communication_status>
		  <remote_access>true</remote_access>
		  <local_ip></local_ip>
		  <default_ports_only>false</default_ports_only>
		  <manual_port_forward>TRUE</manual_port_forward>
		  <manual_external_http_port></manual_external_http_port>
		  <manual_external_https_port></manual_external_https_port>
		  <internal_port>80</internal_port>
		  <internal_ssl_port>443</internal_ssl_port>
	  </device>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $deviceId = getDeviceId();
        $deviceType = getDeviceType();
        $commStatus = DeviceControl::getInstance()->getDeviceCount() <= 0 ? 'disabled' : getCommunicationStatus();
        $remoteAccess = getRemoteAccess();
        $ipsAndPorts = getIPAddresesAndPorts();
        $defaultPortsOnly = getDefaultPortsOnly();
        $remoteAccess = strtolower($remoteAccess);
        $defaultPortsOnly = strtolower($defaultPortsOnly);
        $manualportForward = getManualportForward();
        $manualExternalHttpPort = getManualExternalHttpPort();
        $manualExternalHttpsPort = getManualExternalHttpsPort();
        $results = array(
            'device_id' => $deviceId,
            'device_type' => $deviceType,
            'communication_status' => $commStatus,
            'remote_access' => $remoteAccess,
            'local_ip' => $ipsAndPorts['INTERNAL_IP'],
            'default_ports_only' => $defaultPortsOnly,
            'manual_port_forward' => $manualportForward,
            'manual_external_http_port' => $manualExternalHttpPort,
            'manual_external_https_port' => $manualExternalHttpsPort,
            'internal_port' => $ipsAndPorts['INTERNAL_PORT'],
            'internal_ssl_port' => $ipsAndPorts['DEVICE_SSL_PORT']
        );
        $this->generateSuccessOutput(200, 'device', $results, $outputFormat);
    }

    /**
     * \par Description:
     * Used for registering a device.
     *
     * \par Security:
     * - Only admin user can create a device user account.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/device
     *
     * \par HTTP POST Body
     * - name=myNAS
     * - email=user@wdc.com
     *
     * \param name   String - required
     * \param email  String - optional
     * \param format String - optional
     *
     * \par Parameter Details:
     * - name - The device name must be an alphanumeric value between 1 and 63 characters
     *   and cannot contain spaces; but is allowed to start with a letter or a number,
     *   and contain the hyphen character.
     * - email - If an email is not specified, the device will be registered with no central user.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful registration of the device
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <device>
      	<status>success</status>
      </device>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $name = isset($queryParams['name']) ? trim($queryParams['name']) : null;
        $email = isset($queryParams['email']) ? trim($queryParams['email']) : null;

        if (empty($name)) {
            $this->generateErrorOutput(400, 'device', 'DEVICE_NAME_MISSING', $outputFormat);
            return;
        }

        if (!preg_match('/^[a-zA-Z0-9-]+$/i', $name) || strlen($name) > 63 || substr($name, 0, 1) == '-' || substr($name, -1) == '-' || strpos($name, '--') !== false) {
            $this->generateErrorOutput(400, 'device', 'DEVICE_NAME_INVALID', $outputFormat);
            return;
        }
        
        //check email address
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL))
        {
            throw new \Remote\RemoteException('INVALID_PARAMETER', 400, NULL, 'device');
        }

        $status = false;
        try {
            $status = DeviceControl::getInstance()->registerDeviceWithName($name, $email);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception($e->getMessage(), $e->getCode(), $e, 'device');
        }
        if (!$status) {
            $this->generateErrorOutput(500, 'device', 'DEVICE_REG_FAILED', $outputFormat);
            return;
        }

        $results = array('status' => 'success');
        $this->generateSuccessOutput(201, 'device', $results, $outputFormat);
    }

    /**
     * Validates HTTP/HTTPS ports.
     *
     * @param int $port The port number to validate.
     * @return boolean
     */
    protected function _isValidPort($port)
    {
        return is_numeric($port) && $port > 0 && $port <= 65535;
    }

    /**
     * \par Description:
     * Used for updating the device attributes.
     *
     * \par Security:
     * - Only the user or admin user can create a device user account.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/device
     *
     * \param name             				String  - optional
     * \param remote_access					Boolean - optional
     * \param default_ports_only            Boolean - optional
     * \param manual_port_forward           Boolean - optional
     * \param manual_external_http_port     Integer - optional
     * \param manual_external_https_port    Integer - optional
     * \param format           				String -  optional
     *
     * - Note: At least one of the seven parameters should be provided.
     *   If manual_port_forward is false, both manual_external_http_port and manual_external_https_port will be unset.
     *   If manual_port_forward is true, must provide both manual_external_http_port and manual_external_https_port.
     *
     * \par Parameter Details:
     * - name - name of the device
     * - remote_access - {true/false} to specify remote access allowed or not
     * - default_ports_only - {true/false} specifies whether to use default ports only
     * - manual_port_forward - {true/false} specifies whether manual port forwarding is allowed
     * - manual_external_http_port - specifies what port should be used for http comunication
     * - manual_external_https_port - specifies what port should be used for https comunication
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of the device info
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Device Not Registered
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <device>
      	<status>success</status>
      </device>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $name = isset($queryParams['name']) ? trim($queryParams['name']) : null;
        $remote_access = isset($queryParams['remote_access']) ? strtolower(trim($queryParams['remote_access'])) : null;
        $default_ports_only = isset($queryParams['default_ports_only']) ? strtolower(trim($queryParams['default_ports_only'])) : null;
        $manualPortForward = isset($queryParams['manual_port_forward']) ? strtolower(trim($queryParams['manual_port_forward'])) : null;
        $manualExternalHttpPort = isset($queryParams['manual_external_http_port']) ? trim($queryParams['manual_external_http_port']) : null;
        $manualExternalHttpsPort = isset($queryParams['manual_external_https_port']) ? trim($queryParams['manual_external_https_port']) : null;

        if (!isset($name) && !isset($remote_access) && !isset($default_ports_only) &&
                !isset($manualPortForward) && !isset($manualExternalHttpPort) && !isset($manualExternalHttpsPort)) {
            $this->generateErrorOutput(400, 'device', 'PARAMETER_MISSING', $outputFormat);
            return;
        }

        if (isset($remote_access) && !in_array($remote_access, $this->booleanString)) {
            $this->generateErrorOutput(400, 'device', 'INVALID_PARAMETER', $outputFormat);
            return;
        }
        if (isset($default_ports_only) && !in_array($default_ports_only, $this->booleanString)) {
            $this->generateErrorOutput(400, 'device', 'INVALID_PARAMETER', $outputFormat);
            return;
        }
        if (isset($manualPortForward) && !in_array($manualPortForward, $this->booleanString)) {
            $this->generateErrorOutput(400, 'device', 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        if (!empty($name)) {
            if (!preg_match('/^[a-zA-Z0-9-]+$/i', $name) || strlen($name) > 63 || substr($name, 0, 1) == '-' || substr($name, -1) == '-' || strpos($name, '--') !== false) {
                $this->generateErrorOutput(400, 'device', 'DEVICE_NAME_INVALID', $outputFormat);
                return;
            }
            $deviceId = getDeviceId();
            if (empty($deviceId)) {
                $this->generateErrorOutput(403, 'device', 'DEVICE_NOT_REGISTERED', $outputFormat);
                return;
            }
            $status = $this->updateDevice($urlPath, $queryParams);
            if ($status === false) {
                $this->generateErrorOutput(500, 'device', 'DEVICE_UPDATE_FAILED', $outputFormat);
                return;
            }
        }

        if (!empty($remote_access)) {
            $status = setRemoteAccess($remote_access);
            if ($status === false) {
                $this->generateErrorOutput(500, 'device', 'DEVICE_UPDATE_FAILED', $outputFormat);
                return;
            }
        }

        if ((strcasecmp($default_ports_only, "TRUE") == 0) && (strcasecmp($manualPortForward, "TRUE") == 0)) {
            $this->generateErrorOutput(500, 'device', 'DEFAULT_AND_MANUAL_PORTS', $outputFormat);
            return;
        }

        // if manualPortForward is not passed in, get it from the current setting
        if (empty($manualPortForward)) {
            $manualPortForward = getManualportForward();
        }
        if (!empty($manualPortForward)) {
            if (strcasecmp($manualPortForward, "TRUE") == 0) {
                $manualExternalHttpPort = isset($queryParams['manual_external_http_port']) ? trim($queryParams['manual_external_http_port']) : null;
                $manualExternalHttpsPort = isset($queryParams['manual_external_https_port']) ? trim($queryParams['manual_external_https_port']) : null;

                if (empty($manualExternalHttpPort) ||
                    empty($manualExternalHttpsPort)) {
                    $this->generateErrorOutput(400, 'manual_port_forward', 'PARAMETER_MISSING', $outputFormat);
                    return;
                }

                //Check for http and https port numbers
                if (!$this->_isValidPort($manualExternalHttpPort) ||
                    !$this->_isValidPort($manualExternalHttpsPort)) {
                    $this->generateErrorOutput(400, 'manual_port_forward', 'INVALID_PARAMETER', $outputFormat);
                    return;
                }
                setManualPortForwardConfig($manualPortForward, $manualExternalHttpPort, $manualExternalHttpsPort);
            } else if (strcasecmp($manualPortForward, "FALSE") == 0) {
                clearManualPortForwardConfig();
            } else {
                $this->generateErrorOutput(400, 'manual_port_forward', 'INVALID_PARAMETER', $outputFormat);
                return;
            }
        }

        // Call changing dynamicconfig only one time
        if (!empty($default_ports_only) && ($manualPortForward != 'true')) {
            $status = setDefaultPortsOnly($default_ports_only);
            if ($status === false) {
                $this->generateErrorOutput(500, 'device', 'DEVICE_UPDATE_FAILED', $outputFormat);
                return;
            }
        }

        //start or stop orion remote access services depending on remote access setting
        DeviceControl::getInstance()->updateRemoteServices();
        $results = array('status' => 'success');
        $this->generateSuccessOutput(200, 'device', $results, $outputFormat);
    }

    private function updateDevice($urlPath, $queryParams) {
        return DeviceControl::getInstance()->updateDeviceName($queryParams['name']);
    }

}