<?php
/**
 * \file filesystem/fileinformation.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */

class FileInformation {

	private $fileName;
	private $fileSize;
	private $mimeType;
	private $isDir;
	private $relativePath;

	public function setFileName($fileName) {
		$this->fileName = $fileName;
	}
	public function getFileName() {
		return $this->fileName;
	}

	public function setFileSize($fileSize) {
		$this->fileSize = $fileSize;
	}
	public function getFileSize() {
		return $this->fileSize;
	}

	public function setMimeType($mimeType) {
		$this->mimeType = $mimeType;
	}
	public function getMimeType() {
		return $this->mimeType;
	}

	public function setIsDir($isDir) {
		$this->isDir = $isDir;
	}
	public function getIsDir() {
		return $this->isDir;
	}

	public function setRelativePath($relativePath) {
		$this->relativePath = $relativePath;
	}
	public function getRelativePath() {
		return $this->relativePath;
	}

}