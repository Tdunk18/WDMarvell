<?php

/**
 * \file Status\StatusManager.php\
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 *
 *
 */

namespace System\Reporting\Status;

use \Core\SystemInfo;
use \Core\ClassFactory;


abstract class StatusManager {

    private static $instance = null;

	/**
	 * getInstance()
	 *
	 * Returns the Operating System-specific singleton instance of this abstract class
	 *
	 * @return StatusManager
	 */
	static public function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = ClassFactory::getImplementation('System\Reporting\Status\StatusManager', array("osname"=>SystemInfo::getOSName()));
		}
		return self::$instance;
	}

    /**
     * getServicesStatus()
     *
     * Returns the status of the processes running on the server.
     */

    abstract public function getServicesStatus();

}