<?php

namespace Util;

use \Core\SystemInfo;
use \Core\ClassFactory;

/**
 * Abstract parent class for controlling teh web server
 *
 * This class should have platform and web-server specific implementations
 *
 * @author joesapsford
 *
 */
abstract class WebServerUtils {

	private static $instance = null;

	/**
	 * getInstance()
	 *
	 * Returns the Operating System-specific singleton instance of this abstract class
	 *
	 * @return a WebServerUtils implemantation class instance
	 */

	static public function getInstance() {
        if (is_null(self::$instance)) {
        	$osname = \Core\SystemInfo::getOSName() . getPlatformType();
        	self::$instance = \Core\ClassFactory::getImplementation('Util\WebServerUtils', ['osname' => $osname]);
        }
		return self::$instance;
	}

	/**
	 * Starts the web server
	 */
	abstract public function startServer();

	/**
	 * Stops the Web server
	 */
	abstract public function stopServer();

	/**
	 * Performs a restart of the web server
	 */
	abstract public function restartServer();

	/**
	 * Reloads teh web server configuration (performs a restart if necessary)
	 */
	abstract public function reloadServerConfig();

	/**
	 * Creates a web-server user account with username = $deviceUserId and password = $deviceUserAuth
	 *
	 * @param int $deviceUserId ID of device User
	 * @param string $parentUsername username of User that Devie User belongs to
	 * @param string $deviceUserAuth Device User Authentication Code
	 */
	abstract public function createWebUser($deviceUserId, $parentUsername, $deviceUserAuth);

	/**
	 * Deletes a web-server user account with username = $deviceUserId and password = $deviceUserAuth
	 *
	 * @param int $deviceUserId ID of device User
	 * @param string $parentUsername username of User that Devie User belongs to
	 * @param string $deviceUserAuth Device User Authentication Code
	 */
	abstract public function deleteWebUser($deviceUserId, $parentUsername=null);

}