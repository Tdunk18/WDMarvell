<?php
/**
 * \file db\dbutil.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');




/* Attach Orion database when you access Orion DB only
 *
 *
 * */
function getDB() {
	if(!array_key_exists('db', $GLOBALS)){
		$db = openDB();
		if ($db) {
			$GLOBALS['db'] = $db;
		}
	}
	return $GLOBALS['db'];
}

function openDB() {
	$dbConfig = getGlobalConfig('db');
	$dbFilePath = $dbConfig['DATA_BASE_FILE_PATH'];
	//JS - if db file does not exist it will be created by validateVersion.
	$pdo = new PDO('sqlite:' . $dbFilePath);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Turn on exceptions.

    \Db\Update::validateVersion($pdo);
	return $pdo;
}


/**
 * utils for managing media volumes
 */

function openMediaDbByShare($shareName) {
	$shareDBPath = getShareCrawlerDbPath($shareName);
	if(!file_exists($shareDBPath)){
		throw new Exception('DB_PATH_MISSING', 400);
	}
	return openMediaDbWithPolicy($shareDBPath, null);
}


function openMediaDb($mediaDbFilePath = null) {
    //echo 'DB: '.$mediaDbFilePath;
    if(\Core\SystemInfo::getOSName() === 'windows'){
        return openMediaDbByShare(null);
    }
	return openMediaDbWithPolicy($mediaDbFilePath, null);
}

/**
 * Opening wdmc.db Volume database file
 *
 * */
function openMediaDbWithPolicy($mediaDbFilePath=null, $policy=null) { //TODO: why use defaults here?
	if (isMultiDb()) { // for wdmc.db has been placed multi location such usb connection or multi volume drive
		$mediaVolMgr = RequestScope::getMediaVolMgr();
		if (!empty($policy)) {
			$mediaVolMgr->setShareSecurityPolicy($policy);
		}
		$dbPathArr = $mediaDbFilePath == null ? array(): array($mediaDbFilePath);

		$pdo =  new MediaVolsPDO($mediaVolMgr, $dbPathArr);
		$stmt = $pdo->prepare("PRAGMA CASE_SENSITIVE_LIKE=ON");
		$ret = $stmt->execute();
		return $pdo;

	} else {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'mediaDbFilePath', $mediaDbFilePath);
		if(!file_exists($mediaDbFilePath)) {
			throw new Exception("Media file doesn't exist:" . $mediaDbFilePath);
		}

		$pdo =  new PDO('sqlite:' . $mediaDbFilePath);
		$stmt = $pdo->prepare("PRAGMA CASE_SENSITIVE_LIKE=ON");
		$ret = $stmt->execute();
		return $pdo;

	}
}

function closeMediaDb($mediaDb) {
	$mediaDb = null;
}

function openDbwithPath($dbFilePath = null) {
	$pdo =  new PDO('sqlite:' . $dbFilePath);
	$stmt = $pdo->prepare("PRAGMA CASE_SENSITIVE_LIKE=ON");
	$ret = $stmt->execute();
	return $pdo;
}