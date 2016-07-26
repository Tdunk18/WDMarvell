<?php

namespace DlnaServer\Model;

class DlnaServer {

    static protected $enable_media_server = "enable";

    function getConnectedList() {
        //!!!This where we gather up response
        //!!!Return NULL on error

        $dlnaServerList = array();
        $output = array();
        $retVal = null;
        exec_runtime("sudo /usr/local/sbin/getDlnaServerConnectedList.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }

        $index = 0;

        foreach ($output as $mediaConnected) {

            $deviceWithBlanks = explode('"', $mediaConnected);

            //strip the spaces from the device array
            foreach ($deviceWithBlanks as $key => $value) {
                //if ($value == "" || $value == " ") {
                if ($value == " ") {
                    unset($deviceWithBlanks[$key]);
                }
            }

            // unset the leading blank string
            unset($deviceWithBlanks[0]);

            $device = array_values($deviceWithBlanks);

            $macAddress = trim($device[0], '"');
            $ipAddress = trim($device[1], '"');
            $friendlyName = trim($device[2], '"');
            $deviceDesc = trim($device[3], '"');
            $deviceEnable = trim($device[4], '"');

            $dlnaServerList[$index] = array('mac_address' => $macAddress, 'ip_address' => $ipAddress, 'friendly_name' => $friendlyName,
                'device_description' => $deviceDesc, 'device_enable' => $deviceEnable);
            $index++;
        }

        return $dlnaServerList;
    }

    function modifyMediaDevice($changes) {
        //Require entire representation and not just a delta to ensure a consistant representation
        if (!isset($changes)) {
            return 'BAD_REQUEST';
        }

        //Verify changes are valid
        if (FALSE) {
            return 'BAD_REQUEST';
        }

        if (isset($changes['device'])) {
            if (!is_array($changes['device']) || empty($changes['device'])) {
                return 'BAD_REQUEST';
            }
        }

        foreach ($changes['device'] as $device) {
            //$deviceEnabled = ($device['device_enable'] === 'enable') ? 'enabled' : 'disabled';
            //if(($device['device_enable'] == 'true') ? $device['device_enable'] = 'enable' : $device['device_enable'] = 'disable');
            //Back up files in case of failure
        	if ($_SERVER['APPLICATION_ENV'] == 'testing') { //For testing purpose
            	return 'SUCCESS';
        	}
        	if (!isset($device['mac_address']) || !isset($device['device_enable'])) {
                return 'BAD_REQUEST';
            }
            
            $isEnable = strtolower($device['device_enable']);
            if (!in_array($isEnable, array('true', 'false'))) {
                return 'INVALID_PARAMETER';
            }
            $mediaDeviceEnable = ($isEnable === 'true') ? 'enable' : 'disable';
            $output=$retVal=null;
        	exec_runtime("sudo /usr/local/sbin/modDlnaServerEnable.sh \"{$device["mac_address"]}\" \"$mediaDeviceEnable\" ", $output, $retVal);
            if ($retVal !== 0) {

                return 'DEVICE_NOT_FOUND';
            }
        }
        return 'SUCCESS';
    }

    function getConfig() {
    	//!!!This where we gather up response
        //!!!Return NULL on error
		$mediaServiceOutput=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh dlna_server", $mediaServiceOutput, $retVal);
		if($retVal !== 0) {
			return NULL;
		}

        if ($mediaServiceOutput[0] === 'enabled') {
            $mediaService = "true";
        } else {
            $mediaService = "false";
        }

        return( array(
            'enable_media_server' => "$mediaService",
                ));
    }

    function modifyConfig($changes) {

        if (file_exists("/etc/nas/service_startup/access")) {
            $media_service = "access";
        } else {
            $media_service = "twonky";
        }

        if (!isset($changes["enable_media_server"])) {
            return 'BAD_REQUEST';
        }
        //Verify changes are valid
        if (!$this->_isValidServiceState($changes["enable_media_server"])) {

            return 'BAD_REQUEST';
        }

        //Actually do change
        $mediaServiceStateRequested = ($changes["enable_media_server"] === 'true') ? 'enabled' : 'disabled';

        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh $media_service", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }

        // if the service is currently in the requested state then exit with sucess
        if ($mediaServiceStateRequested === $output[0]) {
            return 'SUCCESS';
        }

        exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh $media_service \"$mediaServiceStateRequested\"", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }
        return 'SUCCESS';
    }

    protected function _isValidServiceState($serviceState) {
        if ((strcasecmp($serviceState, 'true') == 0) ||
                (strcasecmp($serviceState, 'false') == 0)) {
            return TRUE;
        } else {
            return FALSE;
        }
    }

}