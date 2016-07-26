<?php

namespace Storage\Raid\Manager;

interface ConfigurationInterface {
	/**
	 * Gets the status of the drives
	 * 
	 * @return \Storage\Raid\Model\Linux\ConfigurationImpl
	 */
    public function getDriveStatus();
    
    /**
	 * Gets information about all the drives
	 *
	 * @return \Storage\Raid\Model\Linux\ConfigurationImpl
	 */
    public function getDrivesInfo();
    
    /**
	 * Gets information about the configuration status
	 *
	 * @return \Storage\Raid\Model\Linux\ConfigurationImpl
	 */
    public function getConfigurationStatus();
    
    /**
     * Starts RAID. The mode is defined as a parameter the default one is used
     *
	 * @return \Storage\Raid\Model\Linux\ConfigurationImpl
     */
    public function initRaid($raidMode = '');
    
    /**
     * Gets the status of the drives for old api
     *
     * @return \Storage\Raid\Model\Linux\ConfigurationImpl
     */
    public function getDriveStatusOld();
}