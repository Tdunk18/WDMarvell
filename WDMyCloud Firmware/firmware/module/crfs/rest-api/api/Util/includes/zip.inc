<?php
/**
 * \file zip.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(__DIR__ . '/zipstream.php');

function generateZipStream($zipFileName, $fileList) {
	if (isset($fileList) && sizeof($fileList) > 0) {
		//$options = array('large_file_size' => 2 * 1024 * 1024, 'large_file_method' => 'store');
		$zip = new ZipStream($zipFileName);
		$zip->addFiles($fileList);
		$zip->flush();
		return true;
	} else {
		return false;
	}
}