<?php

namespace Remote\Device;

/**
 * Singleton to obtain teh device serial number
 * @author joesapsford
 *
 */

use \Core\ClassFactory;
use \Core\SystemInfo;

abstract class SerialNumber {

	private static $instance;

	static public function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = ClassFactory::getImplementation('Remote\\Device\\SerialNumber', array("osname"=>SystemInfo::getOSName()));
		}
		return self::$instance;
	}

	abstract public function getSerialNumber();

}