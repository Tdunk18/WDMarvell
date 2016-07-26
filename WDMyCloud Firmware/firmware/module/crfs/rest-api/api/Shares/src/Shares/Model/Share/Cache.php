<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Shares\Model\Share;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');

use \Shares\Model\Share\Share;
use \Shares\Model\Share\ShareList;
use \Shares\Model\Smb\SmbConf;
use Util\Lock;

class Cache {
		
	const SMB_CACHED_TIME_KEY = "__smb_cached_time";
	const SHARES_KEY = "__shares_mapkey";
	const SHARE_NAMES_KEY = "__share_names_mapkey";
	const VOLUMES_KEY = "__volumes_mapkey";
	const ACCESS_LIST_KEY = "__access_list_mapkey";
	const CACHE_STALE_KEY = "__smb_cache_stale";	
	const SMB_FILE_LOCK_NAME = "__smb_file_lock";
	
	/**
	 * Tests if the Shares info in the Cache is stale vs. current state of smb.conf.
	 * @return boolean true if the Shares info in the cache is older than the current state of smb.conf
	 */
	private function _cacheIsStale() {
		//synchronize this test to prevent a race condition
		$cacheIsStale = false;
		$lock = new Lock(self::SMB_FILE_LOCK_NAME, 2);
		if ($lock->acquire()) {
			$cacheIsStale =  \apc_fetch(self::CACHE_STALE_KEY);
			if (!$cacheIsStale) {
				$smbCachedTime = \apc_fetch(self::SMB_CACHED_TIME_KEY);
				$smbModTime = filemtime(\getSmbFilePath());
			}
			$lock->release();
		}
		else {
			//we do not know the state of smb.conf, so it is better to assume it has changed
			$smbModTime = $smbCachedTime+1;
		}
		return ($cacheIsStale || ($smbModTime > $smbCachedTime));
	}
	
	private function _refreshCache($force = false, $smbConf = null) {
		$refreshed = false;
		$lock = new Lock(self::SMB_FILE_LOCK_NAME, 2);
		if ($lock->acquire()) {
			if (!$smbConf) {
				//get new instance and parse configuration file
				try {
					$smbConf = new SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
				}
				catch (Exception $ex) {
					Logger::getInstance()->err("Shares Cache::_refreshCache, SmbConf construction exception: " . $ex->getMessage()); 
					$lock->release();
					return false;	
				}
			}
			//check if smb.conf has changed since we last refreshed the Cache
			$smbCachedTime = \apc_fetch(self::SMB_CACHED_TIME_KEY);
			$smbModTime = filemtime(\getSmbFilePath());
			if ($force || ($smbModTime > $smbCachedTime)) {
				\apc_store(self::SMB_CACHED_TIME_KEY, $smbModTime);
				\apc_store(self::SHARES_KEY, $smbConf->getShares());
				\apc_store(self::SHARE_NAMES_KEY, $smbConf->getShareNames());
				\apc_store(self::ACCESS_LIST_KEY, $smbConf->getAccessListForAllShares());
				$refreshed =true;
			}
			$lock->release();
		}
		return $refreshed;
	}
	
	public function __construct() {
		if ($this->_cacheIsStale()) {
			$this->_refreshCache(true);
			
			\apc_delete(self::CACHE_STALE_KEY);
		}
	}
	
	public function refresh($force = false, $smbConf = null) {
		$this->_refreshCache($force, $smbConf);
	}
	
	public function getShares()  {
		return \apc_fetch(self::SHARES_KEY);
	}
	
	public function getShareNames()  {
		return \apc_fetch(self::SHARE_NAMES_KEY);
	}
	
	public function getVolumes() {
		return \apc_fetch(self::VOLUMES_KEY);
	}
	
	public function getAccessListForShare($shareName) {
		$accessList = \apc_fetch(self::ACCESS_LIST_KEY);
		if (!empty($accessList)) {
			return $accessList[$shareName];
		}
		return null;
	}
	
	public function getAccessForAllShares() {
		return \apc_fetch(self::ACCESS_LIST_KEY);
	}
	
	public function setStale() {
		$stale = \apc_exists(self::CACHE_STALE_KEY);
		if (!$stale) {
			$stale = true;
			\apc_add(self::CACHE_STALE_KEY, $stale);
		}
	}
	
}




