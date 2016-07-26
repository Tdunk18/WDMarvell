<?php

namespace Auth\User;

class User {
	private $username;
	private $fullName;
	private $isAdmin;
	private $isCloudholder;
	private $isPassword;
	private $groupNames;
	//constructors
	public function __construct($username, $fullName, $isAdmin, $isCloudholder, $isPassword, $groupNames) {
		$this->username = $username;
		$this->fullName = $fullName;
		$this->isAdmin = $isAdmin;
		$this->isCloudholder = $isCloudholder;
		$this->isPassword = $isPassword;
		$this->groupNames = $groupNames;
	}

	//getters
	public function getUsername() {
		return $this->username;
	}
	public function getFullName() {
		return $this->fullName;
	}
	public function getIsAdmin() {
		return $this->isAdmin;
	}
	public function getIsCloudholder() {
		return $this->isCloudholder;
	}
	public function getIsPassword() {
		return $this->isPassword;
	}
	public function getGroupNames() {
		return $this->groupNames;
	}
}