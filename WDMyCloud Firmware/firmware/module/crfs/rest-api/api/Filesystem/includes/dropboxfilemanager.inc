<?php
/**
 * \file filesystem/dropboxfilemanager.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */
require_once(FILESYSTEM_ROOT . '/includes/httpfilehandlefiledestination.inc');
require_once(FILESYSTEM_ROOT . '/includes/filehandlefilesource.inc');

class DropboxFileManager extends FileManager {

	private $fileHandleFileSource;
	private $fileHandleFileDestination;

	function __construct($fileManagerDescriptor) {
		parent::__construct($fileManagerDescriptor);
		$this->_validateDropboxParams();
	}//__construct

	private function _validateDropboxParams(){
		$dropboxParams = $this->getFileManagerDescriptor()->getParams();

		$error = false;
		if (   !array_key_exists('access_token',$dropboxParams)
		|| !array_key_exists('token_type',$dropboxParams)
		|| !array_key_exists('uid',$dropboxParams)
		) {
			$error = true;
		}

		if($error){
			throw new \Exception('DROPBOX_REQUEST_PARAM_ERROR', 400);
		}
	}// _validateDropboxParams()

	public function openFileForReading($sourceFilePath, $offset=0) {
		$isContent = true;
		$component = 'files';
		$dropboxURL = $this->_constructDropboxURL($isContent,$component,$sourceFilePath);
		$fileHandle = fopen($dropboxURL, 'r');
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

	public function openFileForWriting($destinationFilePath, $sourceFileInforation) {
		$isContent  = true;
		$component  = 'files';
		$dropboxURL = $this->_constructDropboxURL($isContent, $component, dirname($destinationFilePath));
		$keepAlive = false;
		$fileHandleSocket = fsockopen("ssl://api-content.dropbox.com", 443, $errno, $errstr);
		if(!$fileHandleSocket) {
			throw new \Exception('ERROR_OPENING_DEST_FILE_HANDLE', 500);
		}

		$this->fileHandleFileDestination = new HTTPFileHandleFileDestination();
		$this->fileHandleFileDestination->setFileHandle($fileHandleSocket);
		$this->fileHandleFileDestination->writeHTTPPostBegin($dropboxURL, $keepAlive, basename($destinationFilePath), $sourceFileInforation);

		return $this->fileHandleFileDestination;
	}

	public function fileExists($relativeFilePath) {
		try {
			$fileInformation = $this->getFileInformation($relativeFilePath);
		} catch (\Exception $oe) {
			if(strcmp($oe->getMessage(), DROPBOX_FILE_NOT_FOUND) === 0){
				return false;
			}
			throw $oe;
		}
		return !empty($fileInformation);
	}

	public function closeFileForWriting() {
		$this->fileHandleFileDestination->writeHTTPPostEnd();
		fclose($fileHandle);
	}

	private function _constructDropboxURL($isContent, $component, $requestPath) {
		$dropboxURI = null;
		if($isContent) {
			$dropboxURI = "https://api-content.dropbox.com/1/";
		} else {
			$dropboxURI = "https://api.dropbox.com/1/";
		}
		$requestPath = addForwardSlashIfNotAtFront($requestPath);
		$parametersPassed = $this->getFileManagerDescriptor()->getParams();
                /* Populate dropbox parameters array */
                if($isContent) {
                    $dropboxParams['access_token'] = $parametersPassed['access_token'];
                    $dropboxParams['token_type'] = $parametersPassed[token_type];
                    $dropboxParams['uid'] = $parametersPassed['uid'];
                }
                else {
                    // metadata call needs only access_token
                    $dropboxParams['access_token'] = $parametersPassed['access_token'];
                }

		$dropboxURI  = $dropboxURI.$component.$requestPath.'?'.http_build_query($dropboxParams);
		return $dropboxURI;
	}//constructDropboxURL

	public function getFileInformation($sourceRelativePath) {
		$isContent  = false;
		$component  = 'metadata';
		$dropboxURL = $this->_constructDropboxURL($isContent, $component, $sourceRelativePath);
		$dropboxURL .= "&list=false";
		$fileHandle = fopen($dropboxURL, 'r');
		// In this case the connection cannot be opened if the file is not on the server.
		if(!$fileHandle) {
			throw new \Exception('DROPBOX_FILE_NOT_FOUND', 404);
		}

		$response = '';
		while (!feof($fileHandle)) {
			$response .= fread($fileHandle, 1024);
		}//while
		$metaData = json_decode($response);

		if($metaData->is_deleted) {
			throw new \Exception('DROPBOX_FILE_NOT_FOUND', 404);
		}

		$fileInformation = new FileInformation();
		$fileInformation->setFileName(basename($sourceRelativePath));
		$fileInformation->setIsDir($metaData->is_dir);
		$fileInformation->setRelativePath(dirname($sourceRelativePath));
		$fileInformation->setMimeType($metaData->mime_type);
		$fileInformation->setFileSize($metaData->bytes);
		return $fileInformation;
	}//getFileInformation

	public function getDirChildrenInformation($sourceDirRelativePath) {
		$directoryChildrenInformation = array();
		$isContent  = false;
		$component  = 'metadata';
		$dropboxURL = $this->_constructDropboxURL($isContent, $component, $sourceDirRelativePath);
		$fileHandle = fopen($dropboxURL, 'r');
		// In this case the connection cannot be opened if the file is not on the server.
		if(!$fileHandle) {
			throw new \Exception('DROPBOX_FILE_NOT_FOUND', 404);
		}

		$response = '';
		while (!feof($fileHandle)) {
			$response .= fread($fileHandle, 1024);
		}//while

		$metaData = json_decode($response);
		foreach ($metaData->contents as $file) {
			$fileInformation = new FileInformation();
			$fileInformation->setFileName(basename($file->path));
			$fileInformation->setIsDir($file->is_dir);
			$fileInformation->setRelativePath($sourceDirRelativePath);
			$fileInformation->setMimeType($file->mime_type);
			$fileInformation->setFileSize($file->bytes);

			$directoryChildrenInformation[] = $fileInformation;
		}
		return $directoryChildrenInformation;
	}//getDirInformation


	public function createDir($dirPath) {
		$dirPath = ltrim($dirPath,'/');
		$dirPath = rtrim($dirPath,'/');

		$isContent  = false;
		$component  = 'fileops/create_folder';
		$dropboxURL = $this->_constructDropboxURL($isContent, $component, "");
		$root = substr($dirPath, 0, strpos($dirPath,'/'));
		$path = ltrim(substr($dirPath,strpos($dirPath,'/')),'/');
		$dropboxURL .= "&root=$root";
		$dropboxURL .= "&path=$path";

		$fileHandleSocket = fsockopen("ssl://api.dropbox.com", 443, $errno, $errstr);
		if(!$fileHandleSocket) {
			throw new \Exception('DROPBOX_SERVER_CONNECTION_ERROR', 500);
		}

		$this->_writeHTTPBeginFormEncoded($fileHandleSocket, "api.dropbox.com", $dropboxURL, 0);
		$response = '';
		while (!feof($fileHandleSocket)) {
			$response .= fread($fileHandleSocket, 1024);
		}//while

		fclose($fileHandleSocket);
		//403 implies dir already exists.
		if(!(!startsWithIgnoreCase($response, 'HTTP/1.1 200 OK') || !startsWithIgnoreCase($response, 'HTTP/1.1 403 Forbidden'))) {
			throw new \Exception('DROPBOX_HTTP_ERROR', getHTTPStatusCode($response));
		}
	}//createDir

	function _writeHTTPBeginFormEncoded($fileHandleSocket, $host, $dropboxUploadURL, $httpConentLength) {
		$httpPostDataHeaders = "POST $dropboxUploadURL HTTP/1.1\r\n";
		$httpPostDataHeaders .= "Host: ".$host."\r\n";
		$httpPostDataHeaders .= "Content-Type: application/x-www-form-urlencoded\r\n";
		$httpPostDataHeaders .= "Content-Length: $httpConentLength\r\n";
		$httpPostDataHeaders .= "Connection: close\r\n\r\n";
		fwrite($fileHandleSocket, $httpPostDataHeaders);
	}//_writeHTTPBegin

}