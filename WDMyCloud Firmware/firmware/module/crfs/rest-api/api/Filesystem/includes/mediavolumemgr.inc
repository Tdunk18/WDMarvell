<?php
/**
 * \file filesystem\mediavolumemgr.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once (FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');
require_once (FILESYSTEM_ROOT . '/includes/mediavolspdo.inc');
require_once (COMMON_ROOT . '/includes/security.inc');

use \Shares\Model\Share\SharesDao;

/**
 *
 * Generic callback function for array filter.
 * @author Kai
 *
 */
class ArrayFilterCB {
	private $_colName;
	private $_filterSet;

	public function __construct($colName, $filterSet) {
		$this->_colName = $colName;
		$this->_filterSet = $filterSet;
	}

	public function callBack($vol) {
		return in_array($vol[$this->_colName], $this->_filterSet);
	}
}

/**
 *
 * Allow user to implement different share access policy when the default is not sufficient
 * @author kai
 *
 */
interface ShareAccessPolicy {
	public function isShareAccesible($shareName, $isWrite = false);
}

class MediaVolumeMgr {
	public static $dbConfig = null;

	private $_volumes = null;
	private $_secureVolumes = null;
	private $_secPolicy = null;
	//system wide, with no per user security applied
	//use this only in util function such as finding out base path ...etc.
	private $_adminShareVolMap = null;
	public static function staticInit() {
		self::$dbConfig = getGlobalConfig("db");

	}

	private function _filterBy($filterSet, $colName) {
		$cb = new ArrayFilterCB($colName, $filterSet);

		return array($cb, "callBack");

		/* //closure not supported until php 5.3
		 return function($vol) use ($filterSet, $colName) {
			return in_array($vol[$colName], $filterSet);
			};
			*/
	}

	function __construct() {
		//lazy init
		$this->getMediaVolumeInfo();
	}

	/**
	 *
	 * returns array of media volume information:
	 * Id       => volume id
	 * Path     => volume's absolute path on file system
	 * Name     => volume label
	 * DbPath   => media db's path on fs
	 * DbAlias  => unique alias used  for query generation
	 * Shares   => map of shares belong to this volume ie: {share1 => {usershares stuff....}, share2=> {usershares stuff....}}
	 */
	public function getMediaVolumeInfo()
	{
		if (empty($this->_volumes))
		{
			$shares          = (new SharesDao())->getAll();
			$this->_volumes     = [];

			$crawlerDbPath = $this->getCrawlerArtifactsPath();

			//initialize volumes
			foreach ((new VolumesDB())->getActiveVolumes() as $key => $vol)
			{
				if ($vol['is_connected'] === 'true')
				{
				    $basePath = $vol['base_path'];
				    $volumeId = $vol['volume_id'];
				    $ret      =
				    [
				        'Id'             => $volumeId,
				        'Path'           => $basePath,
				        'MountPath'      => $vol['mount_path'],
				        'Name'           => $vol['label'],
				        'DbPath'         => isset($crawlerDbPath[$basePath]) ? $crawlerDbPath[$basePath].DS.MediaVolumeMgr::$dbConfig['MEDIA_CRAWLER_DB_NAME'] : NULL,
				        'DbAlias'        => 'm' . $key,
				        'handle'         => $vol['handle'],
				        'FsType'         => $vol['file_system_type'],
				        'ReadOnly'      =>  $vol['read_only'],
				        'DynamicVolume'  => $vol['dynamic_volume'],
				        'Shares'     => [],
				    ];

					foreach ($shares as $share)
					{
						if ( ($share->getVolumeId() == $volumeId) && !($share->getRecycleBin())) /*Check if share is the "Recycle Bin", inwhich case ignore it.*/
						{
						    $shareName = $share->getName();

							$ret['Shares'][$shareName] = $share->toArray();

							$this->_adminShareVolMap[$shareName] = $ret;
						}
					}

					$this->_volumes[] = $ret;
				}
			}
		}

		return $this->_volumes;
	}

	public function setShareSecurityPolicy($policy) {
		$this->_secPolicy = $policy;
		$this->_volumes = null;
		//reinitialize volume based on new policy
		$this->getMediaVolumeInfo();
	}

	private function _isShareAccesible($shareName, $adminOverRide = true) {
		if (!empty($this->_secPolicy)) {
			return $this->_secPolicy->isShareAccesible($shareName);
		}
		return (new SharesDao())->isShareAccessible($shareName, false, $adminOverRide);
	}

	public function getSecureMediaVolumeInfo() {

		if ($this->_secureVolumes == null) {
			$this->_secureVolumes = $this->getMediaVolumeInfo();

			foreach ($this->_secureVolumes as &$vol) {
				if (!empty($vol['Shares'])) {
					foreach ($vol['Shares'] as $idx => $shareRow) {
						if (! $this->_isShareAccesible($shareRow['share_name'], false)) {
							unset($vol['Shares'][$idx]);
						}
					}
				}
			}

		}
		return $this->_secureVolumes;
	}

	protected function getVolumeBy($filterSet, $colName) {
        \Core\Logger::getInstance()->info(__METHOD__, array('filterSet' => $filterSet, 'colName' =>  $colName));
		$ret = array();

		$vols = $this->getMediaVolumeInfo();
		if ($vols != null) {
			$ret = array_filter($vols, $this->_filterBy($filterSet, $colName));
		}

		return $ret;

	}

	/**
	 *
	 * Returns  array volumes based on array of db path passed in
	 * @param array  $dbPathArray
	 */
	public function getVolumeByDbPaths($dbPathArray) {
		return $this->getVolumeBy($dbPathArray, 'DbPath');
	}

	/**
	 *
	 * Returns  array volumes based on array of absolute volume path passed in
	 * @param array  $dbPathArray
	 */

	public function getVolumeByPaths($PathArray) {
		return $this->getVolumeBy($PathArray, 'Path');
	}


	/**
	 *
	 * Get Share's physical path on drive
	 * eg: /share
	 *     /mnt/vol1
	 * @param string $shareName
	 */
	public function getShareBasePath($shareName, $isAdmin = FALSE)
	{
		$volume = $this->getVolumeByShareName($shareName, $isAdmin);

		return !empty($volume) ? rtrim($volume['Path'], DS) : NULL;
	}

	/**
	 *
	 * Get Share's relative path to its root
	 * eg: Public (/shares/[Public])                 => 'Public'                 (current 3.5g shares)
	 *     Scott  (/shares/[Scott/Personal/phtotos]) => 'Scott/Personal/phtotos' (we might support this in the future)
	 *     vol1   (/mnt/vol1)                      => ''                       (bali drive)
	 * @param string $shareName
	 */
	public function getShareRelPath($shareName, $isAdmin = false)
	{
	    $sharePath = getSharePath($shareName) . DS . $shareName;

	    if (!is_link($sharePath))
	    {
	        return $shareName;
	    }
	    else
	    {
    		$volume = $this->getVolumeByShareName($shareName, $isAdmin);

    		return !empty($volume) ? mb_substr(readlink($sharePath), mb_strlen($volume['Path']) + 1, NULL, 'UTF-8') : NULL;
	    }
	}

	/**
	 *
	 * convert url request file path to path stored in db
	 *
	 * eg: Public/My Pictures/image1.jpg  => Public/My Pictures/image1.jpg
	 *     Vol1/My Pictures/image2.jpg    => My Pictures/image2.jpg
	 * @param unknown_type $requestPath
	 */

	public function uiToMediaPath($requestPath, $isAdmin = false) {
		$isFolder    = FALSE;
		$requestPath = trim($requestPath, DS);
		$pathArr     = explode(DS, $requestPath);  // 'Public/My Pics/'
		$shareName   = array_shift($pathArr);     // 'Public'
		$subDir      = implode(DS, $pathArr);  // 'My Pics'
		//get relative path for given share name
		$shareRelPath = $this->getShareRelPath($shareName, $isAdmin); // '/Public'
		$searchPath   = '';

		if (empty($shareName)) {
			//scan all shares
			$searchPath = '';
		} else {
			//specific share
			if (empty($shareRelPath)) {
				$searchPath = $subDir;
			} else {
				$searchPath = $shareRelPath . DS . $subDir;
			}

			$searchPath = empty($searchPath) ? '' : trim($searchPath, DS);

			if ($isFolder && !empty($searchPath)) {
				$searchPath .= '/';
			}
		}

		return $searchPath;
	}

	/**
	 *
	 * convert database file.path under the context of appropriate share,
	 * The result is what
	 *
	 * eg: My Pictures to ExtVol1/My Pictures
	 *     Public/My Pictures to Public/My Pictures
	 *     Scott's Home/Personal/Public/My Pictures to Public/My Pictures
	 * @param string $filePath: the path field returned from database
	 * @param string $volumePath: the fs path of the volume
	 */
	public function getShareClientPath($filePath, $volumePath) {
		$retPath = $filePath;
		$vols = $this->getVolumeByPaths(array($volumePath));
		if (!empty($vols)) {

			foreach ($vols as $vol) {
				$shareArr = $vol['Shares'];
				foreach($shareArr as $shareName => $shareRow) {
					$shareRelPath = trim($shareRow['rel_path'], '/'); // '/Public'
					$shareName = trim($shareName, '/');
					if (empty($shareRelPath)) {
						$retPath = "$shareName/$filePath";
						break;
					} else {
						if ( 0 === strpos($filePath, $shareRelPath)) {
							//match
							$retPath = $shareName . substr($filePath, strlen($shareRelPath));
						}
					}
				}

			}

		}

		return $retPath;
	}

	//TODO: Below function and its usage needs to be refactored regarding unused variable $isAdmin.
	public function getVolumeByShareName($shareName, $isAdmin = FALSE)
	{
	    return isset($this->_adminShareVolMap[$shareName]) ? $this->_adminShareVolMap[$shareName] : NULL;
	}

	//Crawler status response XML gives the details of crawler satus, crawler DB path and crawler DB mount point
	public function getCrawlerStatusDetails(){
	    //Open UNIX domain socket
	    $requestSocket = getWdmcRequestSocket();
		$timeOutSeconds = 1;
	    $fp = @stream_socket_client($requestSocket, $errno, $errstr);
	    if($fp){
	        //Send XML request to get status from crawler
	        $reqXml = '<?xml version = "1.0"?>'.'<WDMCRequest Subsystem = "system" RequestName = "GetStatus" Requester = "Orion"/>';
	        $reqXml = $reqXml."\0\0\0\0";
	        $result  = fwrite($fp, $reqXml);
	        fflush($fp);

	        //Read response from crawler
	        stream_set_timeout($fp,$timeOutSeconds); // Timeout on 1 second
	        $respXml = "";
	        while(true){
	            $str = fread($fp, 1024);
	            $respXml = $respXml.$str;
	            if(preg_match("/\\0\\0\\0\\0/", $respXml)){
	                break;
	            }
				if(isset($respXml['timed_out'])){
					break;
				}
	        }
	        // Close socket
	        fclose($fp);
			if(isset($respXml['timed_out'])){
				\Core\Logger::getInstance()->err(__FUNCTION__ . ", Timed out reading response from Crawler in $timeOutSeconds seconds.");
				return false;
			}
	        return $respXml;
	    }
	    else{
	        return false;
	    }
	}

	/*Rertrieve crawler artifacts path from "crawler_status" API's response XML and save same details in APC cache*/
	public function getCrawlerArtifactsPath(){

        if($respXml = $this->getCrawlerStatusDetails()){
            $mediadbPath = array();
        	//Obtain the DB path from response XML
        	$respObj = new SimpleXMLElement($respXml);
        	foreach ($respObj->xpath('//Volume') as $vol) {
        	   $attrs = $vol->attributes();
        	   $mediadbPath[(string)$attrs['mountPoint']] = (string)$attrs['artifacts'];
        	}
        	return $mediadbPath;
	    }
		return array(); // else Crawler hasn't responded back in a timely manner so return emptry array.
	}

	/*Return path for transcoded files*/
	public function getTranscodedFilePath($mountPoint){
	    return isset($this->getCrawlerArtifactsPath()[$mountPoint]) ?
			$this->getCrawlerArtifactsPath()[$mountPoint]. DS : NULL;
	}

	public function isDynamicVolume($shareName){
	    $volume = $this->getVolumeByShareName($shareName);
	    return ($volume['DynamicVolume'] === 'true') ? true : false;
	}
}

MediaVolumeMgr::staticInit();