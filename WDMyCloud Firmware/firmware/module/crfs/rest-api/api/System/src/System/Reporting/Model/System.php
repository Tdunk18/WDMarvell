<?php

namespace System\Reporting\Model;

class System {

    protected $status;
    protected $temperature;
    protected $smart;
    protected $volume;
    protected $free_space;

    function getInfo() {
        $nasConfig = parse_ini_file('/etc/nas/config/wd-nas.conf', true);
        $systemConfig = parse_ini_file('/etc/system.conf', true);

        $success = null;

        $capacity = apc_fetch('_SYSTEM_disk_capacity', $success);
        if (!$success) {
            $diskTotalSpace = disk_total_space($nasConfig['settings']['DATA_VOLUME']);
            $size = ceil((float) $diskTotalSpace / 1024 / 1024 / 1024);
            $size += 500;
            $remainder = $size % 1000;
            $whole = (int) ($size / 1000);
            if ($remainder > 500) {
                $capacity = $whole . '.5TB';
            } else {
                $capacity = $whole . 'TB';
            }
            apc_store('capacity', $capacity);
        }

        $serial_number = apc_fetch('serial_number', $success);
        if (!$success) {
        	$retVal=null;
            exec_runtime("sudo /usr/local/sbin/getSerialNumber.sh", $serial_number, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            apc_store('serial_number', $serial_number);
        }

        $mac_address = apc_fetch('mac_address', $success);
        if (!$success) {
        	$retVal=null;
            exec_runtime("sudo /usr/local/sbin/getMacAddress.sh", $mac_address, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            apc_store('mac_address', $mac_address);
        }

        $uuid = apc_fetch('uuid', $success);
        if (!$success) {
        	$retVal=null;
            exec_runtime("sudo /usr/local/sbin/getUpnp_uuid.sh", $uuid, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            apc_store('uuid', $uuid);
        }

        return( array(
            'manufacturer' => "$systemConfig[manufacturer]",
            'manufacturer_url' => "$systemConfig[manufacturerURL]",
            'model_description' => "$systemConfig[modelDescription]",
            'model_name' => "$systemConfig[modelName]",
            'model_url' => "$systemConfig[modelURL]",
            'model_number' => "$systemConfig[modelNumber]",
            'capacity' => "$capacity[0]",
            'serial_number' => "$serial_number[0]",
            'mac_address' => "$mac_address[0]",
            'uuid' => "$uuid[0]",
            'wd2go_server' => "$systemConfig[wd2go_server]",
                )
                );
    }

    function getLog() {
        //Create a file of all logs and return it/put it someplace where upper layer can get to it

        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/getSystemLog.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }
        return (array('path_to_log' => $output[0]));
    }

    function sendLog() {
        //Create a file of all logs and return it/put it someplace where upper layer can get to it

        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/sendLogToSupport.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }
        if ($output[0] === 'server_connection_failed') {
            return (array('transfer_success' => "failed", 'logfilename' => ''));
        } else {
            return (array('transfer_success' => "succeeded", 'logfilename' => $output[0]));
        }
    }

    function getState() {

        //!!!This where we gather up response
        //!!!Return NULL on error

        $output = $retVal = null;

        if (is_file("/usr/local/sbin/getSystemState.sh")) {

            exec_runtime("sudo /usr/local/sbin/getSystemState.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            $this->status = $output[0];
        } else {
            $this->status = "ready";
        }

        if (strcasecmp($this->status, "ready") === 0) {

            exec_runtime("sudo /usr/local/sbin/getTemperatureStatus.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            $this->temperature = $output[0];

            exec_runtime("sudo /usr/local/sbin/getSmartStatus.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            $this->smart = $output[0];

            exec_runtime("sudo /usr/local/sbin/getFreeSpaceStatus.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }
            $this->free_space = $output[0];

            exec_runtime("sudo /usr/local/sbin/getVolumeStatus.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }

            $this->volume = $output[0];
        }
        return( array(
            'status' => "$this->status",
            'temperature' => "$this->temperature",
            'smart' => "$this->smart",
            'volume' => "$this->volume",
            'free_space' => "$this->free_space"
                ));
    }

}