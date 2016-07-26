<?php

namespace Auth\User;

class DeviceUser {

	private $deviceUserId;
	private $deviceUserAuth;
	private $ownerUsername;

	public function __construct($deviceUserId, $deviceUserAuth, $ownerUsername)  {

		$this->deviceUserId = $deviceUserId;
		$this->deviceUserAuth = $deviceUserAuth;
		$this->ownerUsername = $ownerUsername;

	}

	public function getDeviceUserId() {
		return $this->deviceUserId;
	}

	public function getDeviceUserAuthCode() {
		return $this->deviceUserAuth;
	}

	public function getOwnerUsername() {
		return $this->ownerUsername;
	}
}