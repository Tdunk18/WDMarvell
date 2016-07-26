<?php

namespace Util\Windows;

use Util\WebServerUtils;
use \Common\Exception\NotImplementedException;

class WebServerUtilsImpl extends WebServerUtils {

	public function startServer() {
		throw new NotImplementedException();
	}

	public function stopServer() {
		throw new NotImplementedException();
	}

	public function restartServer() {
		throw new NotImplementedException();
	}

	public function reloadServerConfig() {
		throw new NotImplementedException();
	}

	public function createWebUser($deviceUserId, $parentUsername, $deviceUserAuth) {
		return true;
	}

	public function deleteWebUser($deviceUserId, $parentUsername=null) {
		throw new NotImplementedException();
	}

}