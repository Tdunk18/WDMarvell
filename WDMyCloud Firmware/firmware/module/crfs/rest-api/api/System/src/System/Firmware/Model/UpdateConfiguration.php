<?php

namespace System\Firmware\Model;

class UpdateConfiguration {

    protected $auto_install = '';
    protected $auto_install_day = '';
    protected $auto_install_hour = '';

    function getConfig() {
        //!!!This where we gather up response
        //!!!Return NULL on error

        $output=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/getAutoFirmwareUpdateConfig.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }

        $firmwareConfig = explode(" ", $output[0]);

        $this->auto_install = $firmwareConfig[0];
        $this->auto_install_day = $firmwareConfig[1];
        $this->auto_install_hour = $firmwareConfig[2];
        $this->auto_install = strcmp(strtolower($this->auto_install), 'disable') === 0 ? 'false' : (strcmp(strtolower($this->auto_install), 'enable') === 0 ? 'true' : $this->auto_install);

        return( array(
            'auto_install' => "$this->auto_install",
            'auto_install_day' => "$this->auto_install_day",
            'auto_install_hour' => "$this->auto_install_hour"));
    }

    function modifyConfig($changes) {
        $autoInstall = $changes["auto_install"] ? 'enable' : 'disable';

        //Actually do change
        $output=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/modAutoFirmwareUpdateConfig.sh \"$autoInstall\" \"{$changes["auto_install_day"]}\" \"{$changes["auto_install_hour"]}\"", $output, $retVal);
        if ($retVal !== 0) {
            throw new \System\Firmware\Exception('FIRMWARE_UPDATE_CONFIGURATION_INTERNAL_SERVER', 500);
        }
    }

}