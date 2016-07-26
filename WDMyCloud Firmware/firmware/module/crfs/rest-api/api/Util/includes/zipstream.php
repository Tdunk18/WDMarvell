<?php
/**
 * \file zipstream.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

// A better approach for stream compressed zip download.  Refer:
// http://stackoverflow.com/questions/4357073/on-the-fly-zipping-streaming-of-large-files-in-php-or-otherwise
// for more details

class ZipStream {

	private $_fileList = array();
	private $_archiveName = "download.zip";
	function __construct($fileName = "download.zip") {
		$this->_archiveName = $fileName;
	}

	function addFiles($fileList) {
		$this->_fileList = $fileList;
	}

	function flush() {
		// make sure to send all headers first
		// Content-Type is the most important one (probably)
		//
		header('Content-Type: application/octet-stream');
		header("Content-disposition: attachment; filename*=UTF-8''".rawurlencode($this->_archiveName));

		// use popen to execute a unix command pipeline
		// and grab the stdout as a php stream
		// (you can use proc_open instead if you need to
		// control the input of the pipeline too)
		//
		$archiveList = "'" . implode("' '", $this->_fileList) . "'";
		$fp = popen('zip -0 - ' . $archiveList, 'r');

		// pick a bufsize that makes you happy (8192 has been suggested).
		$bufsize = 8192;
		while( !feof($fp) ) {
			$buff = fread($fp, $bufsize);
			echo $buff;
			flush();
		}
		pclose($fp);

	}

}