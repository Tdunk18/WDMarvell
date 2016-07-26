<?php
/**
 * \file filesystem\transcoding.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once(COMMON_ROOT . "/includes/globalconfig.inc");
require_once(DB_ROOT . "/includes/dbaccess.inc");
require_once(COMMON_ROOT . "/includes/util.inc");
require_once(COMMON_ROOT . "/includes/category.inc");
require_once (METADATA_ROOT . '/includes/wdmc/wdmcserverproxy.inc');

use Core\Logger;

function getTranscodingExtensionStr($transcodingType)
{
    return in_array($transcodingType, ['tn96s1', 'tn96s2', 'i1024s1']) ? 'jpg' : FALSE;
}

/**
 * Miocrawler uses a string which contains the transcoding details in generating the hashed file name for transcoded contents.
 * This routine maps from a transcodingType to the string which contains the transcoding details.
 * @param String $transcodingType one of the standard types of transcoding (e.g. tn96s1)
 * @return String parameters of transcoding
 */
function getTranscodingParamStr($transcodingType) {
    switch($transcodingType) {
        case 'tn96s1':
            return 'type=imageScaling width=96 height=96 color=000000 format=jpg quality=0.80 canvas_width=96 canvas_height=96 fit=FIT_MINIMUM meta_data=MD_NO_META_DATA auto_orient=true';
        case 'tn96s2':
            return '--UNKNOWN--';
        case 'i1024s1':
            return 'type=imageScaling width=1024 height=1024 color=000000 format=jpg quality=0.85 fit=FIT_MAXIMUM meta_data=MD_NO_THUMBNAIL auto_orient=true';
    }
    return false;
}

/**
 * Returns the name of the transcoded file based on the original path and the type of transcoding (e.g. thumbnail1)
 * @param $fullFilePath the full path to the non-transcoded file (case sensitive)
 * @param $transcodingType the standard identifier for the type of transcoding
 * @return String $transcodedFileName the name of the transcoded file
 */
function getTranscodedFileName($fullFilePath, $transcodingType) {

    if (!getTranscodingExtensionStr($transcodingType)) {
        return 400;
    }

    if (!file_exists($fullFilePath)) {
        return false;
    }

    $fileStats = @stat($fullFilePath);
    $dateStr = $fileStats['mtime'];

    //The combination of the file path and the type of transcoding
    $directoriesConfig = getGlobalConfig("directories");
    $windowsDemo = $directoriesConfig["WINDOWS_DEMO"];
    if($windowsDemo == "true") {
        $fullFilePath = str_replace("c:"," ", $fullFilePath);
        $identifyingInfo = trim($fullFilePath).' '.getTranscodingParamStr($transcodingType);//TRANS_STRING[nametype];
    }else{
        $identifyingInfo = $fullFilePath.' '.getTranscodingParamStr($transcodingType);//TRANS_STRING[nametype];
    }
    //A hash of the identifying information
    $hashStr = substr(strtoupper(md5($identifyingInfo)), 0, 32);

    $transcodedFileName = $hashStr.'.'.strtoupper(dechex($dateStr)).'.'.getTranscodingExtensionStr($transcodingType);
    return $transcodedFileName;
}

/**
 * Returns the file path of the transcoded file based on the original path and the type of transcoding (e.g. thumbnail1)
 * This is the new version of this funciotn which returns transcoded file paths created by the new version of MediaCrawler.
 *
 * @param $transcodingType the standard identifier for the type of transcoding
 * @return String $transcodedFileName the name of the transcoded file
 */

function getTranscodedFilePathNew($shareName, $filePath, $transcodingType, $isBlocking = TRUE)
{
    $realPath = realpath($filePath);

    if(!$realPath){
        if(is_link($filePath)){ 
        	//using readlink here instead because realpath fails when php is compiled without large file support
            $realPath  = readlink($filePath);
        }else{
        	//using realpath on the parent dir in case we are dealing with a large file on a system where php is compiled without large file support
            $realPath  = realpath(dirname($filePath)).DS.basename($filePath);
        }
    }

    if ($realPath !== FALSE) {
        list($resolvedShareName, , $resolvedFilePath) = \Filesystem\Model\Link::resolveInShares($realPath);
        if ($resolvedShareName !== NULL) {
            $filePath = $resolvedFilePath;
            $shareName = $resolvedShareName;
        }
    }

    $transcodingGuids =
    [
        'tn96s1'  => 'cb62bbdd389b48898f2e5244977cb2c5',
        'i1024s1' => 'a76ef047d8d24c03823acdf41c4ee7c8'
    ];


    $transGUID   = $transcodingGuids[$transcodingType];
    //split path from filename
    $fileName  = basename(substr($filePath, 0, strrpos($filePath, '.'))); //get the name of the file without extension
    $extension = substr($filePath, (strpos($filePath, '.') + 1)); //get name of the file with extension
    $fullFilePath = substr($filePath, strpos($filePath, DS, 1)); //get the base path of the file for wdmc db query

    //determine the root of crawler artifacts
    $volumeArray = \RequestScope::getMediaVolMgr()->getVolumeByShareName($shareName);
    $mountPoint = $volumeArray['Path'];
    $transFileRoot = \RequestScope::getMediaVolMgr()->getTranscodedFilePath($mountPoint); //determine the root of crawler artifacts
	if(!isset($transFileRoot)){
		Logger::getInstance()->err(__FUNCTION__, "Invalid Transcoded file path received from Crawler: $transFileRoot");
		return [404, false];
	}

    //Determine if the volume is an dynamic volume
    if($volumeArray['DynamicVolume'] == 'true'){
        //Determine if scanning is turned on for this volume
        if(\Metadata\Model\ExternalVolumeMediaView::isScanEnabled() === '0'){
            throw new \Core\Rest\Exception('INVALID_VOLUME_FOR_SCANNING', 400, NULL, 'file_contents');
        }
        else{
            $fullFilePath = mb_substr($fullFilePath, mb_strlen($shareName, 'UTF-8')+1, NULL, 'UTF-8');
        }
        $basePath = $transFileRoot;
    }else{
        $basePath = $transFileRoot. $shareName. DS;
    }

    $transcodingFilePath =  substr($fullFilePath, 1, (strrpos($fullFilePath, DS))); //get the path of transcoding_files directory inside .wdmc folder

    list($categoryId, $status) = _getCategoryId($shareName, $fullFilePath);

    if($categoryId == 3){
        $transFilePath =  $transFileRoot . $transcodingFilePath . "transcoded_files/" . $fileName . "." . $transGUID . ".jpg";
    }
	else if ($categoryId == 1 || $categoryId == 2 ){

	     /*status of file : 1 = crawled, ie found on the filesystem and added to the db | 2 = metadata done | 3 = thumbnail generated*/
         if($status < 2){
	          (new \WDMCServerProxy())->extract($mountPoint, $fullFilePath);
	     }

	     if ($categoryId == 2) {
	       //return path to cover-art image, musics in an album to their cover art image is many to 1 relation
	       $newName = getMusicTransCodeFileName($shareName, $fullFilePath);
	           if (!empty($newName)) {
	                $fileName = rtrim($newName, ".");
	           }
	       }
	       $transFilePath =  $transFileRoot . $transcodingFilePath . "transcoded_files/" . $fileName . "." . $extension . "." . $transGUID . ".jpg";
	}
    else{
        return [404, false];
    }

    if (!file_exists($transFilePath)) {

        $wdmcSvr = new \WDMCServerProxy();
        $xncStat = getTranscodingStat($fullFilePath, $transGUID, $categoryId);
        if (!empty($xncStat))
        {
            switch ($xncStat[1])
            {
                case 0:

                    //BL ITR#75334 : Transcoding has to start for a particular file if not present already on demand
                    if (!$isBlocking) {
                        return [412, false];
                    } else {
                        $wdmcResp = $wdmcSvr->transcode($mountPoint.DS, $fullFilePath, $xncStat[0]);
                    }

                    break;

                case 1:
                    //ready to be served, should not be here
                    Logger::getInstance()->err(__FUNCTION__ . ", Can't locate transcoded file: $transFilePath");

                    break;

                case 2:

                    // failed: return error
                    Logger::getInstance()->err(__FUNCTION__ . ", Transcoding failed for file: $transFilePath");

                    break;
            }
        }

    }
    return [$transFilePath, $basePath];
}


//DEBUG - comment-out before commit!!!

//$transPath = getTranscodedFilePathNew("Public","/Shared Photos/Vacation/holiday fun 12345.jpg","tn96s1");
//$transPath = getTranscodedFilePathNew("Public/Shared Music/AnAlbum/Maid_Flaxen.mp3","tn96s1");
//$transPath = getTranscodedFilePathNew("/shares/Public/Shared Videos/Deepa_200.flv","i170s1");
//var_dump($transPath);

//END DEBUG

/**
 * Returns the full path to the transcoded file based on the original path and the type of transcoding
 * @param $fullFilePath the full path to the non-transcoded file (case sensitive)
 * @param $transcodingType the standard identifier for the type of transcoding
 * @return String $transcodedFilePath the full path to the transcoded file
 */
function getTranscodedFilePath($fullFilePath, $transcodingType) {
    $transcodedFileName = getTranscodedFileName($fullFilePath, $transcodingType);

    //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'transcodedFileName', $transcodedFileName);

    if ($transcodedFileName == 400) {
        return 400;
    }
    if (empty($transcodedFileName)) {
        return false;
    }
    //Look up path to transcoded files
    $directoriesConfig = getGlobalConfig("directories");
    $transcodedFilesPath = $directoriesConfig["TRANSCODED_FILES_PATH"];
    return $transcodedFilesPath.'/'.$transcodedFileName;
}


function _getCategoryId($shareName, $fileName)
{
    $pdo             = openMediaDbByShare($shareName);
    $db              = new DBAccess($pdo);
    $bindVarNVTArray = [[':file_name', $fileName, PDO::PARAM_STR]];
    $sql             = 'SELECT category, status FROM Files WHERE path = :file_name';
    $row             = $db->executeQueryAndFetchOneRow($sql, __FILE__.__FUNCTION__, $bindVarNVTArray);

    return isset($row[0]) ? $row : FALSE;
}

function getTranscodingStat($fileName, $profileId, $categoryId)
{
    $shareName       = getShareNameFromRequest();
    $pdo             = openMediaDbByShare($shareName);
    $db              = new DBAccess($pdo);
    $bindVarNVTArray =
    [
        [':file_name', $fileName, PDO::PARAM_STR],
        [':profile_id', $profileId, PDO::PARAM_STR],
    ];

    switch ($categoryId)
    {
        case 1: // video

            $sql = 'SELECT id, status
                      FROM Transcodings t
                     WHERE sourceType = 1
                       AND sourceId = (SELECT M.coverArtFileId
                                        FROM Files F
                                        JOIN VideoMetadata M
                                          ON F.id = M.sourceId
                                       WHERE path = :file_name)
                       AND profile = :profile_id';
            break;

        case 2: // music

            $sql = 'SELECT id, status
                      FROM Transcodings
                     WHERE sourceType = 1
                       AND sourceId = (SELECT M.coverArtFileId
                                        FROM Files F
                                        JOIN AudioMetadata M
                                          ON F.id = M.sourceId
                                       WHERE path = :file_name)
                       AND profile = :profile_id';

            break;

        default:

            $sql = 'SELECT id, status
                    FROM Transcodings
                    WHERE sourceType = 1
                      AND sourceId = (SELECT id FROM Files WHERE path = :file_name)
                      AND profile = :profile_id';

            break;
    }

    $row = $db->executeQueryAndFetchOneRow($sql, __FILE__.__FUNCTION__, $bindVarNVTArray);

    return isset($row[0]) ? $row : FALSE;
}


function getMusicTransCodeFileName($shareName, $fileName) {
    $pdo = openMediaDbByShare($shareName);
    $db = new DBAccess($pdo);
    $bindVarNVTArray = [[':file_name', $fileName, PDO::PARAM_STR]];

    $sql = "SELECT dst.name
              FROM Files src
              JOIN AudioMetaData m
                ON m.sourceId = src.id
               AND src.path = :file_name
              LEFT JOIN Files dst
                ON m.coverArtFileId = dst.id";

    $row = $db->executeQueryAndFetchOneRow($sql, __FILE__.__FUNCTION__, $bindVarNVTArray);
    if (empty($row)) {
        Logger::getInstance()->debug(__FUNCTION__ . ", no cover art for music, status: " . $row[1]);

        return false;
    }

    $extractedFile = $row[0];
    $fileName = substr($extractedFile, 0, strpos($extractedFile, '.'));

    return $fileName;
}