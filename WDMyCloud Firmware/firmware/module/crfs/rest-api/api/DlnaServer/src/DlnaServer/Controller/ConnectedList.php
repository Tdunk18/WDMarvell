<?php

namespace DlnaServer\Controller;

use DlnaServer\Model;
/**
 * \file DlnaServer/ConnectedList.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class ConnectedList
 * \brief Returns list of connected devices and modify list of enabled devices.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class ConnectedList /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Returns list of devices which are DLNA enabled in network.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/media_server_connected_list
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval media_server_connected_list - Array of DLNA enabled devices
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of devices that are DLNA enabled
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <media_server_connected_list>
      <device>
      <mac_address>b8:ac:6f:96:76:35</mac_address>
      <ip_address>192.168.0.101</ip_address>
      <friendly_name>Generic Media Receiver</friendly_name>
      <device_description>Generic Media Receiver</device_description>
      <device_enable>true</device_enable>
      </device>
      </media_server_connected_list>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $connectedListObj = new Model\DlnaServer();
        $result = $connectedListObj->getConnectedList();

        if ($result !== NULL) {
            $output = new \OutputWriter(strtoupper($outputFormat));
            $output->pushElement('media_server_connected_list');
            $output->pushArray('device');
            foreach ($result as $device) {
                $output->pushArrayElement();
                $output->element('mac_address', $device['mac_address']);
                $output->element('ip_address', $device['ip_address']);
                $output->element('friendly_name', $device['friendly_name']);
                $output->element('device_description', $device['device_description']);
                if(($device['device_enable'] == 'enable')? $device['device_enable'] = 'true' : $device['device_enable'] = 'false');
                $output->element('device_enable', $device['device_enable']);
                $output->popArrayElement();
            }
            $output->popArray();
            $output->popElement();
            $output->close();
        } else {
            //Failed to collect info
            $this->generateErrorOutput(500, 'media_server_connected_list', 'MEDIA_SERVER_CONNECTED_LIST_INTERNAL_SERVER_ERROR', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Modify list of DLNA enabled devices. Devices can be enabled or disabled based on the device MAC address.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/media_server_connected_list
     *
     * \param device                Array of arrays of mac_address and device_enable  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - device: [mac_address - mac address, device_enable - {true, false}]
     * - example device[1][mac_address]=00:00:00:00:00:00&device[1][device_enable]=true&device[2][mac_address]=00:00:00:00:00:01&device[2][device_enable]=true
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of the list of DLNA enabled devices
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <media_server_connected_list>
      <status>success</status>
      </media_server_connected_list>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $connectedListObj = new Model\DlnaServer();
        $result = $connectedListObj->modifyMediaDevice($queryParams);

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'media_server_connected_list', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                $this->generateErrorOutput(400, 'media_server_connected_list', 'MEDIA_SERVER_CONNECTED_LIST_BAD_REQUEST', $outputFormat);
                break;
            case 'INVALID_PARAMETER':
                $this->generateErrorOutput(400, 'media_server_connected_list', 'INVALID_PARAMETER', $outputFormat);
                break;
            case 'DEVICE_NOT_FOUND':
                $this->generateErrorOutput(404, 'media_server_connected_list', 'MEDIA_SERVER_CONNECTED_LIST_NOT_FOUND', $outputFormat);
                break;
            case 'SERVER_ERROR':
                $this->generateErrorOutput(500, 'media_server_connected_list', 'MEDIA_SERVER_CONNECTED_LIST_INTERNAL_SERVER_ERROR', $outputFormat);
                break;
        }
    }

}
