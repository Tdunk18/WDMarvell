<?php
/**
 * \file filesystem/filemanagerdescriptor.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */

class FileManagerDescriptor {

	private $type;   //e.g. Local, Dropbox
    private $params; //e.g. All the auth params of Dropbox

	function __construct($fileManagerDescriptorStr, $params) {
    	$this->type   = substr($fileManagerDescriptorStr, 1);
		$this->params = $params;
	}//__construct

	public function setType($type) {
		$this->type = $type;
	}

	public function getType() {
		return $this->type;
	}

	public function setParams($params) {
		$this->params = $params;
	}

	public function getParams() {
		return $this->params;
	}

}