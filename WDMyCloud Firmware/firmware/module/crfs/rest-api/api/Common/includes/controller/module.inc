<?php
/**
 * \file module.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
class Module{

	private	$name;
	private $version;
	private $description;
	private $components;
	private $depends;

	function __construct() {

	}

	public function setName($name) {
		$this->name = $name;
	}

	public function getName() {
		return $this->name;
	}

	public function setVersion($version) {
		$this->version = $version;
	}

	public function getVersion() {
		return $this->version;
	}

	public function setDescription($description) {
		$this->description = $description;
	}

	public function getDescription() {
		return $this->description;
	}

	public function addDependsModules($modules) {
		$this->depends = $modules;
	}

	public function getDependsModules() {
		return 	$this->depends;
	}

	public function addComponent($component) {
		$this->components[] = $component;
	}

	public function getComponents() {
		return $this->components;
	}
}