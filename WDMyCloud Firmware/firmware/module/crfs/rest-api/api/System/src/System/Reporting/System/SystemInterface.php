<?php

namespace System\Reporting\System;

interface SystemInterface {
	
	/**
	 * Gets information about the system.
	 *
	 * @return \System\Reporting\System\Linux\SystemImpl
	 */
    public function getInfo();
	
    /**
     * Gets log details.
     *
     * @return \System\Reporting\System\Linux\SystemImpl
     */
    public function getLog();
	
    /**
     * Sends log details.
     *
     * @return \System\Reporting\System\Linux\SystemImpl
     */
    public function sendLog();
	
    /**
     * Gets state of the device.
     *
     * @return \System\Reporting\System\Linux\SystemImpl
     */
    public function getState();

}