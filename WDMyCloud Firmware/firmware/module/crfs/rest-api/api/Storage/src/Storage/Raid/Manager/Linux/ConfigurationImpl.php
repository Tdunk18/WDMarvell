<?php

namespace Storage\Raid\Manager\Linux;



class ConfigurationImpl extends \Storage\Raid\Manager\AbstractConfiguration {

	private $driveStatusDescMap = array(	
			'drive_raid_already_formatted' => 'RAID is already formatted',
			'drive_raid_ready' => 'the drives  are compatible with the device',
			'no_drives_found' => 'no drives are in the chassis, or drives are unusable',
			'restricted_drives_found' => 'invalid drive type in one or more locations',
			'incorrect_drive_order' => 'drives not in correct locations or not in correct order',
			'drive_raid_incompatible_configuration' => 'drive configuration does not allow the default modes supported',
			'failed_drive_raid_mode' => 'raid mode failed',
			'stopped' => 'configuration was stopped',
			'rebuilding' => 'rebuilding RAID array',
			'busy' => 'fetching inserted drives data');
			
		private $userRaidStatusMap = array(	
			'drive_raid_already_formatted' => 'GOOD',
			'drive_raid_ready' => 'GOOD',
			'no_drives_found' => 'STOPPED',//to maintain compatibility with legacy behavior of MyBookLiveDuo
			'restricted_drives_found' => 'FAILED',
			'incorrect_drive_order' => 'FAILED',
			'drive_raid_incompatible_configuration' => 'FAILED',
			'failed_drive_raid_mode' => 'FAILED_DRIVE', //could be turned into FAILED if all drives failed
			'stopped' => 'STOPPED',
			'rebuilding' => 'REBUILDING',
			'busy' => 'UNKNOWN');
	
	private $configStatusDescMap = array(
			'in-progress' => 'RAID is getting configured',
			'success' => 'RAID was successfully configured',
			'fail' => 'RAID configuration failed');

    /**
     * Returns the status of all drives
     *
     * @return 	array 
     */
    public function getDriveStatus() {     
    	$statusDescMap = $this->driveStatusDescMap;
        $output = $retVal = null;
        exec_runtime(sprintf("sudo /usr/local/sbin/raid_get_drives_status.sh"), $output, $retVal);
        if ($retVal !== 0 || !is_array($output) || !isset($output[0])) {
        	throw new \Storage\Raid\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_get_drive_status');
        }
        //shell output validation
        if(isset($statusDescMap[$output[0]])){
        	return array('status' => $output[0],
        				 'status_desc' => $statusDescMap[$output[0]]);
        }else{
        	throw new \Storage\Raid\Exception('UNRECOGNISED_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_get_drive_status');
        }
    }
    
    /**
     * Returns information about all drives
     *
     * @return 	array
     */
	public function getDrivesInfo(){
    	$output = $retVal = null;
    	exec_runtime(sprintf("sudo /usr/local/sbin/raid_get_drives_info.sh"), $output, $retVal);
    	if ($retVal !== 0 || !is_array($output) || !isset($output[0])) {
    		throw new \Storage\Raid\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_get_drive_status');
    	}
    	$filePath = (strpos($output[0], 'raid_drives_info.conf') === false) ? $output[0].'/raid_drives_info.conf' : $output[0];
    	if (isset($filePath) && file_exists($filePath) && !is_dir($filePath)) {
    		$drivesInfo = parse_ini_file($filePath, true);
    		if(empty($drivesInfo)){
    			return array('drives' => array('drive'=> array()));
    		}
    	}else{
    		return array('drives' => array('drive'=> array()));
    	}
    	$driveArray = $busyLocations = array();
    	foreach($drivesInfo as $drivesInfoK => $drivesInfoV){
			if(isset($drivesInfoV['busy'])){
				if($drivesInfoV['busy']==true){
					$busyLocations['location'][] = substr($drivesInfoK, -1);
				}
				unset($drivesInfoV['busy']);
				if(empty($drivesInfoV)){
					continue;
				}
			}
    		if(strpos($drivesInfoK, 'raid_partition')===false){
				$tempArray = array('location' => substr($drivesInfoK, -1));
    			$driveArray[]=$tempArray + $drivesInfoV;
    		}else{
    			$driveArray[$drivesInfoK]=$drivesInfoV;
    		}
    	}
    	return array('busy_drive_location' => $busyLocations) + array('drives' => array('drive'=> $driveArray));
    }
    
    /**
     * Returns the configuration status of all drives
     *
     * @return 	array
     */
    public function getConfigurationStatus(){
    	$statusDescMap = $this->configStatusDescMap;
    	$output = $retVal = null;
    	exec_runtime(sprintf("sudo /usr/local/sbin/raid_configuration_status.sh"), $output, $retVal);
    	if ($retVal !== 0 || !is_array($output) || !isset($output[0])) {
    		throw new \Storage\Raid\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_init');
    	}
    	$tempArray = explode(' ', $output[0]); 
		
    	//if the output is stage idle there are no other parameters
    	if($tempArray[0] == 'idle'){
    		return array('stage' => $tempArray[0]);
    	}
    	
    	//shell output validation
    	if(!isset($statusDescMap[$tempArray[1]])) {
    		throw new \Storage\Raid\Exception('UNRECOGNISED_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_get_drive_status');
    	}

    	return array('stage' => $tempArray[0],
    				 'status' => $tempArray[1],
    				 'status_desc' => $statusDescMap[$tempArray[1]],
    				 'progress' => $tempArray[2],
    				 'elapsed_time' => $tempArray[3]);
    }
    
    /**
     * Returns the status of all drives
     *
     * @param 	string $raidMode
     * @return 	array
     */
    public function initRaid($raidMode=''){
        $output = $retVal = null;
        exec_runtime(sprintf("sudo /usr/local/sbin/raid_init.sh $raidMode"), $output, $retVal);
        if (!is_array($output) || !isset($output[0])) {
        	throw new \Storage\Raid\Exception('NO_OUTPUT_FROM_SHELL_SCRIPT', 500, null, 'raid_init');
        }
        return array('status' => $output[0]);
    }
    
    /**
     * Returns the  status of all drives for old api
     *
     * @return 	array
     */
    public function getDriveStatusOld($version=null){
    	$resultStatus = $this->getDriveStatus();
    	$resultDrivesInfo = $this->getDrivesInfo();   		
    	
    	if ( 1.0 == $version ) {
            $userRaidStatusMap = $this->userRaidStatusMap;
            $status = $userRaidStatusMap[$resultStatus['status']];
            if('failed_drive_raid_mode'  == $resultStatus['status']){
				$functioningDriveDoesNotExist = true;
				if(isset($resultDrivesInfo['drives']['drive'])){
					foreach($resultDrivesInfo['drives']['drive'] as $resultDrivesInfoK => $resultDrivesInfoV){
						//if at least one drive has no errors in smart status status is FAILED_DRIVE otherwise FAILED
						if(isset($resultDrivesInfoV['smart_status']) && trim($resultDrivesInfoV['smart_status']) == ''){
							$functioningDriveDoesNotExist = false;
						} 
					}
				}
				if($functioningDriveDoesNotExist){
					$status = 'FAILED';
				}	
			}
        }else{
			$status = in_array($resultStatus['status'], array('drive_raid_already_formatted', 'drive_raid_ready' , 'rebuilding')) ? 'GOOD' : 'BAD';
		}
	
    	$resultConfigurationStatus = $this->getConfigurationStatus();
    	$result =  array('raid_status' => $status);
    	if(isset($resultConfigurationStatus['progress'])){
    		$result['raid_rebuilding_progress' ] = $resultConfigurationStatus['progress'];
    	}
		return $result;
    }
}