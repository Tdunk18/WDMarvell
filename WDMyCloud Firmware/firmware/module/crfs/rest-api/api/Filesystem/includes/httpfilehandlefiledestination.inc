<?php
/**
 * \file filesystem/httpfilehandlefiledestination.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once FILESYSTEM_ROOT . '/includes/filehandlefiledestination.inc';

class HTTPFileHandleFileDestination extends FileHandleFileDestination {

	private $postFormFileData;

	public function __construct() {
	}

	public function writeHTTPPostBegin($postURL, $keepAlive = false, $fileName, $sourceFileInforation) {
		$httpMimeBoundary = md5(time());

		$preFormFileData  = $this->_constructPreFormFileData($httpMimeBoundary, $fileName, $sourceFileInforation);
		$this->postFormFileData = $this->_constructPostFormFileData($httpMimeBoundary);

		//$httpConentLength = strlen($preFormFileData) + $sourceFileInforation->getFileSize() +  strlen($this->postFormFileData);
		$httpConentLength = strlen($preFormFileData) + $sourceFileInforation->getFileSize();

		$httpPostDataHeaders = "POST $postURL HTTP/1.1\r\n";
		$httpPostDataHeaders .= "Host: api-content.dropbox.com\r\n";
		$httpPostDataHeaders .= "Content-Type: multipart/form-data; boundary=" . $httpMimeBoundary ."\r\n";
		$httpPostDataHeaders .= "Content-Length: $httpConentLength\r\n";
		if($keepAlive){
			$httpPostDataHeaders .= "Connection: keep-alive\r\n\r\n";
		}else{
			$httpPostDataHeaders .= "Connection: close\r\n\r\n";
		}

		//TODO handle any errors.
		fwrite($this->getFileHandle(), $httpPostDataHeaders);

		fwrite($this->getFileHandle(), $preFormFileData);
		//echo "  HTTP POST HEADERS\n";
		//echo "  $httpPostDataHeaders\n";
		//echo "  HTTP PRE FORM FILEDATA\n";
		//echo "  $preFormFileData\n";
		//echo "  HTTP POST FORM FILEDATA\n";
		//echo "  ".$this->postFormFileData."\n";
	}//writeHTTPPostBegin

	private function _constructPreFormFileData($httpMimeBoundary, $fileName, $sourceFileInforation) {
		$preFormFileData  = '--' . $httpMimeBoundary . EOL;
		$preFormFileData .= 'Content-Disposition: form-data; name="file"; filename="'.$fileName.'"'.EOL;
		$preFormFileData .= 'Content-Type: '.$sourceFileInforation->getMimeType().EOL.EOL;
		return $preFormFileData;
	}//_constructPreFormFileData

	private function _constructPostFormFileData($httpMimeBoundary) {
		return '--' . $httpMimeBoundary . EOL . EOL;
	}//_constructPostFormFileData

	public function writeHTTPPostEnd() {
		fwrite($this->getFileHandle(), $this->postFormFileData);
		fflush($this->getFileHandle());

		while (!feof($this->getFileHandle())) {
			$response .= fread($this->getFileHandle(), 1024);
		}//while

		if(!startsWithIgnoreCase($response, 'HTTP/1.1 200 OK')) {
			throw new \Exception('DROPBOX_HTTP_ERROR', getHTTPStatusCode($response));
		}//if
	}//writeHTTPPostEnd

}