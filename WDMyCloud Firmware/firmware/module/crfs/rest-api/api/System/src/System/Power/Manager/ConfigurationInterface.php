<?php

namespace System\Power\Manager;

interface ConfigurationInterface {

	/**
	 * Gets the status of the battery
	 *
	 * @return \System\Power\Model\Linux\ConfigurationImpl
	 */
    public function getBatteryStatus();

    /**
	 * Gets information about the battery power profile
	 *
	 * @return \System\Power\Model\Linux\ConfigurationImpl
	 */
    public function getPowerProfile();

    /**
	 * Sets the power profile
	 *
	 * @return \System\Power\Model\Linux\ConfigurationImpl
	 */
    public function setPowerProfile($profile);


}
