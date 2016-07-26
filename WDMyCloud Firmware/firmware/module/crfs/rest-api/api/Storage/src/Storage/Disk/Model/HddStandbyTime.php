<?php

namespace Storage\Disk\Model;

class HddStandbyTime {

    protected $enable_hdd_standby = '';
    protected $hdd_standby_time_minutes = '';

    public function getConfig() {
        //!!!This where we gather up response
        //!!!Return NULL on error
        // get the network configuration
        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/getHddStandbyConfig.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }

        $hddStandby = explode(" ", $output[0]);
        $this->enable_hdd_standby = ($hddStandby[0] === 'enabled') ? 'true' : 'false';

        ;
        $this->hdd_standby_time_minutes = $hddStandby[1];

        return( array('enable_hdd_standby' => "$this->enable_hdd_standby",
            'hdd_standby_time_minutes' => "$this->hdd_standby_time_minutes"));
    }

    public function modifyConfig($changes) {
		//Require entire representation and not just a delta to ensure a consistant representation

        $hddEnable = $changes["enable_hdd_standby"] ? 'enabled' : 'disabled';

        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/modHddStandbyConfig.sh \"$hddEnable\" \"{$changes["hdd_standby_time_minutes"]}\"", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }

        return 'SUCCESS';
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */
