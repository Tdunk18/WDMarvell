<?php
/**
 * \file filesystem/filemanager.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */
require_once(FILESYSTEM_ROOT . '/includes/filemanagerdescriptor.inc');
require_once(FILESYSTEM_ROOT . '/includes/localfilemanager.inc');
require_once(FILESYSTEM_ROOT . '/includes/dropboxfilemanager.inc');

abstract class FileManager {

	private $fileManagerDescriptor; // Type of FileManagerDescriptor

	function __construct($fileManagerDescriptor) {

		$this->fileManagerDescriptor = $fileManagerDescriptor;
	}

	public function getFileManagerDescriptor() {
		return $this->fileManagerDescriptor;
	}

	public function setFileManagerDescriptor(FileManagerDescriptor $fileManagerDescriptor) {
		$this->fileManagerDescriptor = $fileManagerDescriptor;
	}

	static function getFileManager(FileDescriptor $fileDescriptor) {
		$fileManagerDescriptor = $fileDescriptor->getFileManagerDescriptor();
		$type = $fileManagerDescriptor->getType();
		if ( strcasecmp('Local', $fileManagerDescriptor->getType()) === 0 ) {
			return new LocalFileManager($fileManagerDescriptor);
		} else if ( strcasecmp('Dropbox', $fileManagerDescriptor->getType()) === 0 ) {
			return new DropboxFileManager($fileManagerDescriptor);
		} else {
			throw new Exception("Unknown File Manager Descriptor type. File Manager not found.");
		}
	}//getFileManager

	public function copyFile(FileDescriptor $srcFileDescriptor, FileDescriptor $destFileDescriptor) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function deleteFile(RelativePath $relativePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function openFileForReading($filePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function closeFileForReading() {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function openFileForWriting($destinationFilePath, $offset) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function closeFileForWriting() {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function getFileInformation($fileHandleFileSource) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function fileExists($relativeFilePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function deleteDir($filePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function createDir($filePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function getDirChildrenInformation($sourceDirRelativePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

}