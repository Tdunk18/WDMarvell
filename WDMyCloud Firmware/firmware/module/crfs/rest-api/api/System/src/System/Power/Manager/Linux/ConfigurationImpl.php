<?php

namespace System\Power\Manager\Linux;



class ConfigurationImpl extends \System\Power\Manager\AbstractConfiguration {

	private static $powerProfiles = array('max_life' => 'max_life',
    												'max_system_performance' => 'max_system_performance');

	private static $statuses = array('charging' => 'charging',
											'discharging' => 'charging');

    /**
     * Returns the status the battery
     *
     * @return 	array
     */
    public function getBatteryStatus() {
        $output = $retVal = null;
        exec_runtime(sprintf("sudo /usr/local/sbin/power_get_battery_status.sh"), $output, $retVal);
        if ($retVal !== 0 || !is_array($output) || !isset($output[0])) {
        	throw new \System\Power\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'battery_get_status');
        }
		//shell output validation
		$resultArray = explode(" ", $output[0]);
		if(!isset(self::$statuses[$resultArray[0]])
		|| !isset($resultArray[1])
		|| !is_numeric($resultArray[1])){
			throw new \System\Power\Exception('UNRECOGNISED_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'battery_status');
		}
		return array(	'state' => $resultArray[0],
								'percent_remaining' => $resultArray[1]);
    }

    /**
     * Returns information about all drives
     *
     * @return 	array
     */
    public function getPowerProfile() {
        $output = $retVal = null;
        exec_runtime(sprintf("sudo /usr/local/sbin/power_get_profile.sh"), $output, $retVal);
        if ($retVal !== 0 || !is_array($output) || !isset($output[0])) {
        	throw new \System\Power\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'power_profile');
        }
		//shell output validation
		if(!isset(self::$powerProfiles[$output['0']])){
			throw new \System\Power\Exception('UNRECOGNISED_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'power_profile');
		}
		return array(	'profile' => $output['0']);
    }


    /**
     * Returns the status of all drives
     *
     * @param 	string $profile
     * @return 	array
     */
    public function setPowerProfile($profile){
        $output = $retVal = null;
        exec_runtime(sprintf("sudo /usr/local/sbin/power_set_profile.sh $profile"), $output, $retVal);
        if (is_array($output) && isset($output['0'])) {
        	  return array('status' => 'fail');
        }
        return array('status' => 'success');
    }

}
