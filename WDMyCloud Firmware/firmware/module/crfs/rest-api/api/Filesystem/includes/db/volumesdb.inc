<?php
/**
 * \file db\volumesdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(DB_ROOT . '/includes/dbutil.inc');

use Common\Model\ConfigCache;
use Core\Logger;

/**
 *
 *
 */
class VolumesDB extends DBAccess {

	const VOLUME_ID        = 'volume_id';
	const LABEL            = 'label';
	const BASE_PATH        = 'base_path';
	const DRIVE_PATH       = 'drive_path';
	const IS_CONNECTED     = 'is_connected';
	const CAPACITY         = 'capacity';
	const DYNAMIC_VOLUME   = 'dynamic_volume';
	const FILE_SYSTEM_TYPE = 'file_system_type';
	const READ_ONLY        = 'read_only';
	const HANDLE           = 'handle';
	const CRAWLER_STATUS   = 'crawler_status';
	const CREATED_DATE     = 'created_date';
	const MOUNTED_DATE     = 'mounted_date';
	const DB_READY         = 'db_ready';
	const MOUNT_PATH       = 'mount_path';
	const STORAGE_TYPE     = 'storage_type';

	static $queries = array (
		'SELECT_VOLUME'  => "SELECT * FROM Volumes WHERE volume_id = :volume_id",
		'SELECT_VOLUMES' => "SELECT * FROM Volumes",
		'SELECT_CONNECTED_VOLUMES' => "SELECT v.volume_id, v.label, v.base_path, v.drive_path, v.is_connected, v.handle, v.file_system_type, v.mount_path, v.read_only, v.dynamic_volume
									   FROM Volumes v
									   WHERE is_connected = 'true'",
		'GET_VOLUME_BY_SHARE' => "SELECT s.volume_id,label,base_path,drive_path,is_connected, s.rel_path, file_system_type
								  FROM Volumes v, UserShares s
								  WHERE v.volume_id = s.volume_id
								  AND s.share_name = :share_name ",
		'GET_VOLUME_BY_BASE_PATH' => "SELECT v.volume_id, v.label, v.base_path, v.drive_path, v.is_connected, file_system_type
									  FROM Volumes v
									  WHERE v.base_path = :base_path",
		'INSERT_VOLUME'  => "INSERT INTO Volumes   ( volume_id, label, base_path, drive_path, is_connected, db_ready, capacity, dynamic_volume, file_system_type, read_only, handle, crawler_status, created_date, mounted_date, mount_path, storage_type)
											VALUES (:volume_id,:label,:base_path,:drive_path,:is_connected,   0    ,:capacity,:dynamic_volume,:file_system_type,:read_only,:handle,:crawler_status,:created_date,:mounted_date,:mount_path,:storage_type)",
		'DELETE_LABEL'   => "DELETE FROM Volumes WHERE label = :label",
		'DELETE_VOLUME'  => "DELETE FROM Volumes WHERE volume_id = :volume_id",
		'DELETE_ALL'     => "DELETE FROM Volumes",
	);

	/**
	 * Select and return information of all or a specific volume
	 *
	 * @param integer $uuid of a specified volume
	 * @return array $volumes information of the volumes
	 */
	public function getVolume($volumeId=null) {
        $cache = ConfigCache::getConfigCache('VOLUMES');
        if ($cache == NULL) {
            //Since Volume information is stored in the database, the cache will watch that file for changes
            $dbConfig = getGlobalConfig('db');
            $dbFilePath = $dbConfig['DATA_BASE_FILE_PATH'];
            $cache = ConfigCache::initializeConfigCache('VOLUMES', $dbFilePath);
        }
        //Since there aren't that many volumes and we always need to cache all of the volumes, the cache stores all volumes under a single fixed key of 'ALL'.
        $volumes = $cache->getValue("ALL");
        if($volumes == NULL) {
            //If the info on the volumes was not in the cache, then do the normal database query and then store it in the cache for next time
            $volumes = $this->executeQuery(self::$queries['SELECT_VOLUMES'],'SELECT_VOLUMES');
            $cache->putValue("ALL", $volumes);
        }

		if (empty($volumeId)) {
            //Return all volumes
			return $volumes;
		} else {
            //Return only the matching volume
            foreach ($volumes as $volume) {
                if($volume['volume_id'] == $volumeId) {
                    return $volume;
                }
            }
            //Return false when no volumes match the requested id
            return false;
		}
	}


	/**
	 * Select and return information of all or a specific volume
	 *
	 * @param integer $uuid of a specified volume
	 * @return array $volumes information of the volumes
	 */
	public function getActiveVolumes() {
		$volumes = $this->executeQuery(self::$queries['SELECT_CONNECTED_VOLUMES'],'SELECT_CONNECTED_VOLUMES');
		if ($volumes === false) {
			Logger::getInstance()->err(__FUNCTION__ . ', attach database failed: ' . self::$queries['SELECT_CONNECTED_VOLUMES']);
			$volumes = array();
		}
		return $volumes;
	}

	public function getVolumeByShare($shareName) {
		$bindVarNVTArray = array(
		array(':share_name', getSafeDatabaseText((string)$shareName), PDO::PARAM_STR));
		$volumes = $this->executeQuery(self::$queries['GET_VOLUME_BY_SHARE'],'GET_VOLUME_BY_SHARE', $bindVarNVTArray);
		return $volumes;
	}



	/**
	 * Creates a new volume in the Volumes table
	 *
	 * @param string  $uuid holds the unique unit id
	 * @param string  $label holds the volume label
	 * @param string  $basePath holds the volume moint point
	 * @param string  $drivePath holds the drive path
	 * @param integer $isConnected indicates if volume is connected
	 * @return boolean $status indicates success of operation
	 */
	public function createVolume($volumeId, $label, $basePath, $drivePath, $isConnected, $capacity=null, $dynamicVolume=null, $fileSystemType=null, $readOnly=null, $handle=null, $crawlerStatus=null, $mountedDate=null, $mountPath=null, $storageType=null) {
		Logger::getInstance()->info(__FUNCTION__ . ", PARAMS: (volumeId=$volumeId, label=$label, basePath=$basePath, drivePath=$drivePath, isConnected=$isConnected, capacity=$capacity, dynamicVolume=$dynamicVolume, fileSystemType=$fileSystemType, readOnly=$readOnly, handle=$handle, crawlerStatus=$crawlerStatus, mountedDate=$mountedDate, mountPath=$mountPath, storage_type=$storageType)");
		$isConnected = ($isConnected === 'true' || $isConnected === '1' || $isConnected === 1) ? 'true' : 'false';
		$createdDate = $mountedDate !== null ? $mountedDate : time();

		$bindVarNVTArray = array(
		array(':volume_id', getSafeDatabaseText((string)$volumeId), PDO::PARAM_STR),
		array(':label', getSafeDatabaseText((string)$label), PDO::PARAM_STR),
		array(':base_path', getSafeDatabaseText((string)$basePath), PDO::PARAM_STR),
		array(':drive_path', getSafeDatabaseText((string)$drivePath), PDO::PARAM_STR),
		array(':is_connected', $isConnected, PDO::PARAM_STR),
		array(':capacity', $capacity, PDO::PARAM_INT),
		array(':dynamic_volume', $dynamicVolume, PDO::PARAM_STR),
		array(':file_system_type', $fileSystemType, PDO::PARAM_STR),
		array(':read_only', $readOnly, PDO::PARAM_STR),
		array(':handle', $handle, PDO::PARAM_STR),
		array(':crawler_status', $crawlerStatus, PDO::PARAM_STR),
		array(':created_date', $createdDate, PDO::PARAM_INT),
		array(':mounted_date', $mountedDate, PDO::PARAM_INT),
		array(':mount_path', getSafeDatabaseText((string)$mountPath), PDO::PARAM_STR),
		array(':storage_type', getSafeDatabaseText((string)$storageType), PDO::PARAM_STR),
		);

		$status = $this->executeInsert(self::$queries['INSERT_VOLUME'], 'INSERT_VOLUME', $bindVarNVTArray);

		if ($status < 1) {
			Logger::getInstance()->info(__FUNCTION__ . ", STATUS: $status (error)");
			$this->logVolumes();
			$status = false;
		}

		return $status;
	}

	/**
	 * Update a volume with specified uuid
	 *
	 * @param string  $uuid holds the unique unit id
	 * @param string  $label holds the volume label
	 * @param string  $basePath holds the volume moint point
	 * @param string  $devPath holds the device path
	 * @param string  $drivePath holds the drive path
	 * @param string  $fsType holds the file system type
	 * @param integer $isConnected indicates if volume is connected
	 * @return boolean $status indicates success of operation
	 */
	public function updateVolume($volumeId, $label=null, $basePath=null, $drivePath=null, $isConnected=null, $capacity=null, $dynamicVolume=null, $fileSystemType=null, $readOnly=null, $handle=null, $crawlerStatus=null, $mountedDate=null, $mountPath=null, $storageType=null) {
		Logger::getInstance()->info(__FUNCTION__ . ", PARAMS: (volumeId=$volumeId, label=$label, basePath=$basePath, drivePath=$drivePath, isConnected=$isConnected, capacity=$capacity, dynamicVolume=$dynamicVolume, fileSystemType=$fileSystemType, readOnly=$readOnly, handle=$handle, crawlerStatus=$crawlerStatus, mountedDate=$mountedDate, mountPath=$mountPath, storage_type=$storageType)");
		$params = array();
		if ($label !== null) {
			$params['label'] = getSafeDatabaseText((string)$label);
		}
		if ($basePath !== null) {
			$params['base_path'] = getSafeDatabaseText((string)$basePath);
		}
		if ($drivePath !== null) {
			$params['drive_path'] = getSafeDatabaseText((string)$drivePath);
		}
		if ($isConnected !== null) {
			$params['is_connected'] = ($isConnected === 'true' || $isConnected === '1' || $isConnected === 1) ? 'true' : 'false';
			$params['db_ready'] = 0;
		}
		if ($capacity !== null) {
			$params['capacity'] = getSafeDatabaseText((string)$capacity);
		}
		if ($dynamicVolume !== null) {
			$params['dynamic_volume'] = getSafeDatabaseText((string)$dynamicVolume);
		}
		if ($fileSystemType !== null) {
			$params['file_system_type'] = getSafeDatabaseText((string)$fileSystemType);
		}
		if ($readOnly !== null) {
			$params['read_only'] = getSafeDatabaseText((string)$readOnly);
		}
		if ($usbHandle !== null) {
			$params['handle'] = getSafeDatabaseText((string)$handle);
		}
		if ($crawlerStatus !== null) {
			$params['crawler_status'] = getSafeDatabaseText((string)$crawlerStatus);
		}
		if ($mountedDate !== null) {
			$params['mounted_date'] = getSafeDatabaseText((string)$mountedDate);
		}
		if ($mountPath !== null) {
			$params['mount_path'] = getSafeDatabaseText((string)$mountPath);
		}
		if ($storageType !== null) {
		    $params['storage_type'] = getSafeDatabaseText((string)$storageType);
		}

		if (count($params) > 0) {
			$sql    = $this->generateUpdateSql('Volumes', 'volume_id', $volumeId, $params);
			$status = $this->executeUpdate($sql);

			if ($status != true) {
				Logger::getInstance()->info(__FUNCTION__ . ", STATUS: error");
				$this->logVolumes();
			}
			return $status;
		} else {
			return false;
		}
	}

	public function updateVolumeById($id, $updateArgs) {
		$params = array();
		$logParam = ", PARAMS: (";
		foreach ($updateArgs as $colName => $colValue) {
			$logParam .= "$colName=$colValue,";
			if ($colValue != null) {

				if ($colName === self::IS_CONNECTED) {
					$params[self::IS_CONNECTED] = ($colValue === 'true' || $colValue === '1' || $colValue === 1) ? 'true' : 'false';
					$params[self::DB_READY] = 0;
				} else {

					if (is_string($colValue)) {
						$params[$colName] = getSafeDatabaseText((string) $colValue);
					} else {
						$params[$colName] = $colValue;
					}
				}

			}
		}
		$logParam .= ')';
		Logger::getInstance()->info(__FUNCTION__ . $logParam);

		if (count($params) > 0) {
			$sql    = $this->generateUpdateSql('Volumes', 'volume_id', $id, $params);
			$status = $this->executeUpdate($sql);

			if ($status != true) {
				Logger::getInstance()->info(__FUNCTION__ . ", STATUS: error for sql: $sql");
				$this->logVolumes();
			}
			return $status;
		} else {
			return false;
		}

	}


	/**
	 * Deletes a volume with specified uuid
	 *
	 * @param integer $uuid
	 * @return boolean $status indicates whether the update succeeded
	 */
	public function deleteVolume($volumeId) {
		if (!empty($volumeId)) {
			$bindVarNVTArray = array(array(':volume_id', $volumeId, PDO::PARAM_STR));
			$status = $this->executeDelete(self::$queries['DELETE_VOLUME'], 'DELETE_VOLUME', $bindVarNVTArray);
		} else {
			$status = $this->executeDelete(self::$queries['DELETE_ALL'], 'DELETE_ALL');
		}
		return $status;
	}

	private function logVolumes() {
		$volumes = $this->getVolume();
		foreach ($volumes as $volume) {
			$volumeId = $volume['volume_id'];
			$label = $volume['label'];
			$basePath = $volume['base_path'];
			Logger::getInstance()->info(__FUNCTION__ . ", VOLUME: volume_id=$volumeId, label=$label, basePath=$basePath");
		}
	}
}