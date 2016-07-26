<?php
/**
 * \file filesystem/filedescriptor.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */
require_once FILESYSTEM_ROOT . '/includes/filemanagerdescriptor.inc';

class FileDescriptor {

	private $fileManagerDescriptor;// type of FileManagerDescriptor
	private $relativePath;         // File with relative path.
	private $fileName;             // File name if isDir=false.
	private $isDir;				   // true or false

	function __construct($fileManagerDescriptorStr, $params, $relativePath, $isDir) {
		$this->fileManagerDescriptor = new FileManagerDescriptor($fileManagerDescriptorStr, $params);
		$this->relativePath = $relativePath;
		if(!$isDir){
			$this->fileName = basename($relativePath);
		}
		$this->isDir = $isDir;
	}//__construct

	public function setRelativePath($relativePath) {
		$this->relativePath = $relativePath;
	}

	public function getRelativePath() {
		return $this->relativePath;
	}

	public function setFileName($fileName) {
		$this->fileName = $fileName;
	}
	public function getFileName() {
		return $this->fileName;
	}

	public function setIsDir($isDir) {
		$this->isDir = $isDir;
	}

	public function getIsDir() {
		return $this->$isDir;
	}

	public function setFileManagerDescriptor($fileManagerDescriptor) {
		$this->fileManagerDescriptor = $fileManagerDescriptor;
	}

	public function getFileManagerDescriptor() {
		return $this->fileManagerDescriptor;
	}

}