<?php
/**
 * \file component.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
class Component{
	private	$name;
	private $id;
	private $classFile;
	private $className;
	private $authSecurity;
	private $parentModuleName;
	private $parentModuleVersion;

	function __construct() {

	}

	public function setName($name) {
		$this->name = $name;
	}

	public function getName() {
		return $this->name;
	}

	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setClassFile($classFile) {
		$this->classFile = $classFile;
	}

	public function getClassFile() {
		return $this->classFile;
	}

	public function setClassName($className) {
		$this->className = $className;
	}

	public function getClassName() {
		return $this->className;
	}

	public function setParentModuleName($parentModule) {
		return $this->parentModuleName = $parentModuleName;
	}

	public function getParentModuleName() {
		return $this->parentModuleName;
	}

	public function setParentModuleVersion($parentModuleVersion) {
		return $this->parentModuleVersion = $parentModuleVersion;
	}

	public function getParentModuleVersion() {
		return $this->parentModuleVersion;
	}

	public function setAuthSecurity($authSecurity) {
		$this->authSecurity = $authSecurity;
	}

	public function getAuthSecurity() {
		return $this->authSecurity;
	}
}