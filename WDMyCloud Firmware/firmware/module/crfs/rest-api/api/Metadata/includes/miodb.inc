<?php
/**
 * \file miodb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(FILESYSTEM_ROOT . '/includes/contents.inc');
require_once(COMMON_ROOT . "/includes/globalconfig.inc");

/**
 *
 *
 *
 */
function getPhotoDbPath() {
	//Photo DB file config file is fixed.
	$photoDbConfPath = '/tmp/wdphotodbmerger.conf';
	if (file_exists($photoDbConfPath)) {
		$photoConf = parse_ini_file($photoDbConfPath, true);
		return $photoConf['wdphotos_db_path'];
	}
	return false;
}

/**
 *
 */
function readMioDBFile($compress) {

	//Get DB file path from config file
	$dbFilePath = getPhotoDbPath(); //get miodb path - works with MediaCrawler
	if ($dbFilePath === False) {
		//try getting legcay path to miodb
		$dbConfig = getGlobalConfig('db');
		$dbFilePath = $dbConfig['DATA_BASE_FILE_PATH'];
	}

	// TODO : Generate user specific db file.
	// Also add file cache for user specific DB files.
	// Check for valid file name.

	if(!file_exists($dbFilePath)) {
		// Generate error message.
		return array ("code" => 404, "msg" => "Database File Not Found, path: " . $dbFilePath);
	} else {
		//JS - take a copy of the DB file - so we don't slow down reads/writes
		//or risk causing a lock exception

		$dbFilePathDl = $dbFilePath . ".dl";
		if (!copy($dbFilePath, $dbFilePathDl )) {
			return array ("code" => 404,
						"msg" => "Database Copy Failed, path: " . $dbFilePath);
		} else {
			if ($compress) {
				//create zip file
				exec_runtime("sudo rm ".$dbFilePathDl . ".gz");
				$result = exec_runtime("sudo gzip " . $dbFilePathDl );
				$dbFilePathDl = $dbFilePathDl . ".gz";
				if (!file_exists($dbFilePathDl)) {
					return array ("code" => 404,
						"msg" => "Failed to compress Database file: " . $dbFilePath);
				}
			}
			// Read DB file copy - sends file to output stream

			readFileFromPath($dbFilePathDl, NULL);
			return true;
		}
	}
}