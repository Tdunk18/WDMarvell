<?php
/**
 * \file filesystem/filehandlefilesource.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class FileHandleFileSource {

	private $fileHandle;

	public function read($length = MAX_BYTES) {
		return fread($this->fileHandle, $length);
	}

	public function setFileHandle($fileHandle) {
		$this->fileHandle = $fileHandle;
	}

	public function getFileHandle() {
		return $this->fileHandle;
	}

	public function eof(){
		return feof($this->fileHandle);
	}

}