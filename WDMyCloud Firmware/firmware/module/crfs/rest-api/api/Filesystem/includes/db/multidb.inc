<?php
/**
 * \file db\multidb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
use \Core\SystemInfo;

function mediaToAbsPath($filePathInDB, $shareName)
{
	return RequestScope::getMediaVolMgr()->getShareBasePath($shareName, true) . DS . $filePathInDB;
}

function mediaToUIPath($filePathInDB, $shareName)
{
	$volMgr   = RequestScope::getMediaVolMgr();
	$shareVol = $volMgr->getVolumeByShareName($shareName, TRUE);

	return $volMgr->getShareClientPath($filePathInDB, $shareVol['Path']);
}

function uiToMediaPath($uiPath) {
	$volMgr = RequestScope::getMediaVolMgr();
	$mediaPath = $volMgr->uiToMediaPath($uiPath, true);
	return $mediaPath;
}

function uiToAbsPath($uiPath) {
	$volMgr = RequestScope::getMediaVolMgr();
	$mediaPath = $volMgr->uiToMediaPath($uiPath, true);
	$pathArr = split('/', $uiPath);
	$shareName = '';
	if (isset($pathArr[0])) {
		$shareName = $uiPath[0];
	}
	mediaToAbsPath($mediaPath, $shareName);
}

//TODO : This function is not used by any. To be deleted in next checkin
/*
 * This function returns list of media crawler voulmes.
 * Each entry in the list contains volume name, volume path, media crawler db path.
 */
/*function getMediaVolumesInfo($share = null) {
	$volInfo = array();
	//$dbConfig = getGlobalConfig("db");
	$mediaCrawlerDbDir = "";
	$volMgr = RequestScope::getMediaVolMgr();
	//V2 media db
	if (!isMultiDb()) {
		// <>/share + /.wdmc + /wdmc.db
	    $mediaCrawlerDbPath = $volMgr->getCrawlerDBPath();
		\Core\Logger::getInstance()->info("Media CrawlerDB: $mediaCrawlerDbPath");
		$volInfo[] = array("Name"   => substr($mediaCrawlerDbPath, 1, strpos($mediaCrawlerDbPath, DS)),
						   "Path"   => substr($mediaCrawlerDbPath, 1, strpos($mediaCrawlerDbPath, DS)) . DS,
						   "DbPath" => $mediaCrawlerDbPath);
	} else {
		$volInfo = $volMgr->getMediaVolumeInfo();
	}
	return $volInfo;
}*/

/**
 * Getting a Crawler(wdmc.db) db file path base on share name for Windows environment
 * */
function getShareCrawlerDbPath($shareName) {
    if( SystemInfo::getOSName() === 'windows') {
    	$dbConfig = getGlobalConfig("db");
    	$dbPath = $dbConfig["MEDIA_CRAWLER_DEFAULT_PATH"] . $dbConfig["MEDIA_CRAWLER_DB_PATH"] . $dbConfig["MEDIA_CRAWLER_DB_NAME"];
    } else {
        $vol = RequestScope::getMediaVolMgr()->getVolumeByShareName($shareName);
        $dbPath = null;
        if (!empty($vol)) {
            $dbPath =  isset($vol['DbPath']) ? trim($vol['DbPath']) : null;
        }
    }

	return $dbPath;
}