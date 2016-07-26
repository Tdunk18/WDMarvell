<?php
/**
 * \file filesystem/filehandlefiledestination.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class FileHandleFileDestination {

	private $fileHandle;

	public function __construct() {
	}

	public function write($data) {
		return fwrite($this->fileHandle, $data);
	}

	public function setFileHandle($fileHandle) {
		$this->fileHandle = $fileHandle;
	}

	public function getFileHandle() {
		return $this->fileHandle;
	}

}