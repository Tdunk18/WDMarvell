<?php
/**
 * \file filesystem/localfilemanager.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */
require_once(FILESYSTEM_ROOT . '/includes/dir.inc');
require_once(FILESYSTEM_ROOT . '/includes/filehandlefiledestination.inc');
require_once(FILESYSTEM_ROOT . '/includes/filehandlefilesource.inc');

class LocalFileManager extends FileManager {

	private $fileHandleFileSource;
	private $fileHandleFileDestination;


	public function copyFile(FileDescriptor $srcFileDescriptor, FileDescriptor $destFileDescriptor) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function deleteFile(RelativePath $relativePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

	public function openFileForReading($sourceFilePath, $offset = 0) {
		//As of now, we have no use for params for Local File Manager, but can be used in the future.
		//$localFileParams = $this->getFileManagerDescriptor()->getParams();
		$sourceFilePath = getSharePath() . DS .$sourceFilePath;
		$fileHandle = fopen($sourceFilePath, 'r');

		if(!$fileHandle) {
			throw new \Exception('ERROR_OPENING_SOURCE_FILE_HANDLE', 500);
		}

		$this->fileHandleFileSource = new FileHandleFileSource();
		$this->fileHandleFileSource->setFileHandle($fileHandle);
		return $this->fileHandleFileSource;
	}

	public function closeFileForReading() {
		$fileHandle = $this->fileHandleFileSource->getFileHandle();
		fclose($fileHandle);
	}

	public function openFileForWriting($destinationFilePath, $offset=-1) {
		$localFileParams = $this->getFileManagerDescriptor()->getParams();
		$destinationFilePath = getSharePath() . DS . $destinationFilePath;
		$fileHandle = fopen($destinationFilePath, 'w');
		\Core\Logger::getInstance()->info($destinationFilePath);
		if(!$fileHandle) {
			throw new \Exception('ERROR_OPENING_DEST_FILE_HANDLE', 500);
		}
		$this->fileHandleFileDestination = new FileHandleFileDestination();
		$this->fileHandleFileDestination->setFileHandle($fileHandle);
		return $this->fileHandleFileDestination;
	}

	public function closeFileForWriting() {
		$fileHandleFileDestination = $this->fileHandleFileDestination;
		$fileHandle = $fileHandleFileDestination->getFileHandle();
		fclose($fileHandle);
	}

	/**
	 * @return \FileInformation
	 */
	public function getFileInformation($sourceRelativePath)
	{
	    $sourceSharePath     = \Filesystem\Model\SharePathObject::createFromSharePath($sourceRelativePath);
	    $lastDsPos           = mb_strrpos($sourceRelativePath, DS);
	    $sourceShareBaseName = mb_substr($sourceRelativePath, $lastDsPos + 1);
		$fileInformation     = new FileInformation();

		$fileInformation->setFileName($sourceShareBaseName);

		if ($sourceSharePath->isFile())
		{
		    $absolutePath = $sourceSharePath->getAbsolutePath();

            $fileStats = \fstatLfs($absolutePath);
			$fileInformation->setFileSize($fileStats["size"]);
			$fileInformation->setMimeType(mime_content_type($absolutePath));
			$fileInformation->setIsDir(false);
		}
		else
		{
			$fileInformation->setIsDir(true);
		}

		$fileInformation->setRelativePath(mb_substr($sourceRelativePath, 0, $lastDsPos));

		return $fileInformation;
	}

	public function fileExists($relativeFilePath) {
		return file_exists(getSharePath() . DS . $relativeFilePath);
	}

	public function getDirChildrenInformation($sourceDirRelativePath) {
		$directoryChildrenInformation = array();
		$fullLocalPath = getSharePath() . DS . $sourceDirRelativePath;
		$directory = dir( $fullLocalPath );
		while ( FALSE !== ( $dirItem = $directory->read() ) ) {
			if ( $dirItem == '.' || $dirItem == '..' ) {
				continue;
			}
			$fullDirItemPath = $fullLocalPath . DS . $dirItem;
			$fileInformation = new FileInformation();
			if ( is_dir( $fullDirItemPath ) ) {
				$fileInformation->setFileName($dirItem);
				$fileInformation->setIsDir(true);
				$fileInformation->setRelativePath($sourceDirRelativePath);
			} else {
				$fileInformation->setFileName($dirItem);
                $fileStats = \fstatLfs($fullDirItemPath);
				$fileInformation->setFileSize($fileStats["size"]);
				$fileInformation->setMimeType(mime_content_type($fullLocalPath));
				$fileInformation->setIsDir(false);
				$fileInformation->setRelativePath($sourceDirRelativePath);
			}
			$directoryChildrenInformation[] = $fileInformation;
		}//while
		$directory->close();
		return $directoryChildrenInformation;
	}//getDirInformation

	public function createDir($filePath) {
		$fileFullPath = getSharePath() . DS . $filePath;
		//TODO see file_Exists should be part of the file manager interface?
		if ( !file_exists($fileFullPath) ) {
			@mkdir( $fileFullPath );
		}
	}//createDir

	public function deleteDir($filePath) {
		throw new Exception("Method not yet implemented.");
		return;
	}

}