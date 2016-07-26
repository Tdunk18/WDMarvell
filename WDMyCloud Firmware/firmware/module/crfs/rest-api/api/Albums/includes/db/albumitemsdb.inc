<?php
/**
 * \file db\albumitemsdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
/**
 * AlbumItemsDB
 *
 * DAO class for Album Items
 *
 */

use Auth\User\UserSecurity;
use Core\Logger;

class AlbumItemsDB extends DBAccess {

	const ALBUM_ITEM_ID="album_item_id";
	const PATH         ="path";
	const ALBUM_ID     ="album_id";
	const ITEM_ORDER   ="item_order";
	const SHARE_NAME   ="share_name";

	function __construct(){}

	/**
	 * Get Album Item
	 * @param $albumItemId
	 */
	function getAlbumItem($albumItemId){
		$sql = "SELECT  album_item_id, album_id, item_order, path, share_name
				FROM AlbumItems
				WHERE album_item_id = :album_item_id";
		$bindVarNVTArray = array(
			array(':album_item_id', $albumItemId, PDO::PARAM_INT)
		);
		$albumItem = $this->executeQuery($sql, 'GET_ALBUM_ITEM', $bindVarNVTArray);
		return $albumItem;
	}

	/**
	 * Get Album Item by path
	 * @param $albumItemId
	 */
	private function _getAlbumItemByPathMDB($albumId, $path){
		$volMgr = \RequestScope::getMediaVolMgr();
		$pathArr = explode('/', $path);
		$shareName = trim($pathArr[0]);
		$filePath = $volMgr->uiToMediaPath($path);

		$sql = "SELECT  album_item_id, album_id, item_order, path, share_name
				FROM AlbumItems
				WHERE album_id = :album_id
				AND path = :path
				AND share_name = :share_name";
		$bindVarNVTArray = array(
			array(':album_id', $albumId, PDO::PARAM_INT),
			array(':path', $filePath, PDO::PARAM_STR),
			array(':share_name', $shareName, PDO::PARAM_STR),
		);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		$albumItem = $this->executeQuery($sql, 'GET_ALBUM_ITEM_BY_PATH', $bindVarNVTArray);
		return $albumItem;
	}

	/**
	 * Get Album Item by path
	 * @param $albumItemId
	 */
	function getAlbumItemByPath($albumId, $path){
		if (isMultiDb()) {
			return $this->_getAlbumItemByPathMDB($albumId, $path);
		}

		$sql = "SELECT  album_item_id, album_id, item_order, path, share_name
				FROM AlbumItems
				WHERE album_id = :album_id
				AND path = :path";
		$bindVarNVTArray = array(
			array(':album_id', $albumId, PDO::PARAM_INT),
			array(':path', $path, PDO::PARAM_STR),
		);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		$albumItem = $this->executeQuery($sql, 'GET_ALBUM_ITEM_BY_PATH', $bindVarNVTArray);
		return $albumItem;
	}

	/**
	 *
	 * @param $albumId Album Id
	 */
	function getAlbumItems($albumId){
		$username = UserSecurity::getInstance()->getSessionUsername();
		$sql = "SELECT  album_item_id, album_id, item_order, path, a.share_name
				FROM AlbumItems a
				JOIN UserShares s
				  ON a.share_name = s.share_name
				LEFT OUTER JOIN UserShareAccess sa
				  ON s.share_name = sa.share_name
				 AND sa.username = :username
				WHERE album_id = :album_id
				  AND  (s.public_access = 'true' OR sa.access_level NOT LIKE 'NA')
				ORDER BY item_order ASC";
		$bindVarNVTArray = array(
			array(':username', $username, PDO::PARAM_STR),
			array(':album_id', $albumId, PDO::PARAM_INT)
		);
		Logger::getInstance()->debug(__FUNCTION__ . ", album item sql: $sql", $bindVarNVTArray);
		$albumItems = $this->executeQuery($sql, 'GET_ALBUM_ITEMS', $bindVarNVTArray);
		return $albumItems;
	}

	/**
	 *
	 * @param $albumId
	 * @param $fileId
	 * @param $itemOrder
	 */
	private function _createAlbumItemMDB($albumId, $path, $itemOrder=null){
		$volMgr = \RequestScope::getMediaVolMgr();
		$pathArr = explode('/', $path);
		$shareName = trim($pathArr[0]);
		$filePath = $volMgr->uiToMediaPath($path);

		$results = -1;

		if (empty($itemOrder)) {
			$sql = "INSERT
					INTO AlbumItems (album_id, path, item_order, share_name)
					SELECT :album_id, :path, ifnull(max(item_order),0) + 1, :share_name
					FROM AlbumItems
					WHERE album_id = :album_id";
			$bindVarNVTArray = array(
				array(':album_id', $albumId, PDO::PARAM_INT),
				array(':path', $filePath, PDO::PARAM_STR),
				array(':share_name', $shareName, PDO::PARAM_STR),
			);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
			$results = $this->executeInsert($sql, 'INSERT_ALBUM_ITEM', $bindVarNVTArray);
		} else if ($itemOrder > 0) {
			$sql = "INSERT
					INTO AlbumItems (album_id, item_order, path, share_name)
					SELECT :album_id, :item_order, :path, :share_name
					WHERE 0 < (SELECT COUNT(*)
								FROM AlbumItems
								WHERE album_id = :album_id
								AND (item_order >= :item_order OR item_order = :item_order - 1)
							)
					OR 1 = (SELECT COUNT(*) + :item_order FROM AlbumItems WHERE album_id = :album_id)
					";
			$bindVarNVTArray = array(
				array(':album_id', $albumId, PDO::PARAM_INT),
				array(':path', $filePath, PDO::PARAM_STR),
				array(':item_order', $itemOrder, PDO::PARAM_INT),
				array(':share_name', $shareName, PDO::PARAM_STR),
			);
			$results = $this->executeInsert($sql, 'INSERT_ALBUM_ITEM', $bindVarNVTArray);
			if ($results > 0) {
				$rowId = $results;
				$this->shiftAlbumItemsUp(null, $rowId);
			}
		}

		return $results;
	}

	/**
	 *
	 * @param $albumId
	 * @param $fileId
	 * @param $itemOrder
	 */
	function createAlbumItem($albumId, $path, $itemOrder=null){

		if (isMultiDb()) {
			return $this->_createAlbumItemMDB($albumId, $path, $itemOrder);
		}

		$results = -1;

		if (empty($itemOrder)) {
			$sql = "INSERT
					INTO AlbumItems (album_id, path, item_order)
					SELECT :album_id, :path, ifnull(max(item_order),0) + 1
					FROM AlbumItems
					WHERE album_id = :album_id";
			$bindVarNVTArray = array(
				array(':album_id', $albumId, PDO::PARAM_INT),
				array(':path', $path, PDO::PARAM_STR),
			);
			$results = $this->executeInsert($sql, 'INSERT_ALBUM_ITEM', $bindVarNVTArray);
		} else if ($itemOrder > 0) {
			$sql = "INSERT
					INTO AlbumItems (album_id, item_order, path)
					SELECT :album_id, :item_order, :path
					WHERE 0 < (SELECT COUNT(*)
								FROM AlbumItems
								WHERE album_id = :album_id
								AND (item_order >= :item_order OR item_order = :item_order - 1)
							)
					OR 1 = (SELECT COUNT(*) + :item_order FROM AlbumItems WHERE album_id = :album_id)
					";
			$bindVarNVTArray = array(
				array(':album_id', $albumId, PDO::PARAM_INT),
				array(':path', $path, PDO::PARAM_STR),
				array(':item_order', $itemOrder, PDO::PARAM_INT),
			);
			$results = $this->executeInsert($sql, 'INSERT_ALBUM_ITEM', $bindVarNVTArray);
			if ($results > 0) {
				$rowId = $results;
				$this->shiftAlbumItemsUp(null, $rowId);
			}
		}

		return $results;
	}

	/**
	 *
	 * @param $albumItemId
	 * @param $itemOrder
	 */
	function updateAlbumItem($albumItemId, $itemOrder){
		$items = $this->albumItemRangeTo($albumItemId,1);
		$albumId = $items[0]['album_id'];
		$curItemOrder = $items[0]['item_order'];
		$sql = "UPDATE AlbumItems SET ";
		$colAdded = false;
		$colArray = $this->addColumnToUpdateSQL('item_order', getSafeDatabaseText($itemOrder), $sql, $colAdded);
		$albumItemId = getSafeDatabaseText($albumItemId);
		$sql = $colArray['sql']. " WHERE  album_item_id = $albumItemId
									AND 0 <= ( SELECT COUNT(*)
												FROM AlbumItems
												WHERE album_id = $albumId
												AND (
												  (item_order >= $itemOrder)
												))
									";
		$status = $this->executeUpdate($sql);
		if (!$status) {
			return false;
		}
		if ($itemOrder < $curItemOrder) {
			$this->shiftAlbumItemsUp($curItemOrder, $albumItemId);
		} else if ($itemOrder > $curItemOrder) {
			$this->shiftAlbumItemsDown($curItemOrder, $albumItemId);
		}
		return $status;
	}

	function updateAlbumItemByShare($shareName, $updateArgs) {
		$count = $this->updateTableByX("AlbumItems", "share_name", $shareName, $updateArgs);
		return $count >= 0;
	}

	/**
	 *
	 * @param $fileId
	 * @param $filePath
	 */
	function deleteAlbumItem($albumItemId){
		$this->shiftAlbumItemsDown(null, $albumItemId);
		$sql = "DELETE
				FROM AlbumItems
				WHERE album_item_id = :album_item_id ";
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$ret = $this->executeDelete($sql, 'DELETE_ALBUM_ITEM', $bindVarNVTArray);
		return $ret;
	}

	/**
	 * Given the albumItemId, the parent albumId will be returned.
	 * @param $albumItemId primary key of the AlbumItems table
	 * @return integer albumId which is the primary key of the Albums table.
	 */
	function getAlbumId($albumItemId){
		//SELECT album_id FROM AlbumItems WHERE album_item_id=42
		$sql = "SELECT album_id
				FROM AlbumItems
				WHERE album_item_id=:album_item_id ";
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$retVal = false;
		$arrayResult = $this->executeQueryAndFetchOneRow($sql, 'GET_ALBUM_ID', $bindVarNVTArray);
		if(isset($arrayResult[0])){
			$retVal = $arrayResult[0];
		}
		return $retVal;
	}

	/**
	 * Returns boolean indicating whether the user for the current session has read permission for the specified AlbumItem.
	 * Albums are accessible to the owner of the album as well as anybody with which the album has been shared.
	 * @param $albumItemId primary key of the AlbumItems table which indicates a particular item to be accessed.
	 * @return unknown_type
	 */
	function isAlbumItemAccessible($albumItemId){
		//Get the owner and the id of the album to which this albumItem belongs

		$sql = "SELECT a.owner, ai.album_id
				FROM Albums a, AlbumItems ai
				WHERE a.album_id = ai.album_id AND ai.album_item_id = :album_item_id ";
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$arrayResult = $this->executeQueryAndFetchOneRow($sql, 'GET_ALBUM_INFO', $bindVarNVTArray);
		if(isset($arrayResult[0])){
			$owner = $arrayResult[0];
			$albumId = $arrayResult[1];
			//The owner is definitely allowed to access content within the album
			$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
			if($owner == $sessionUsername || isAdmin($sessionUsername))
				return true;
			$sql = "SELECT count(*)
					FROM AlbumAccess
					WHERE album_id = :album_id AND username=:username";
			$bindVarNVTArray = array(
				array(':album_id', $albumId, PDO::PARAM_INT),
				array(':username', $sessionUsername, PDO::PARAM_STR),
			);
			$results = $this->executeQueryAndFetchOneRow($sql, 'GET_ALBUM_SHARE', $bindVarNVTArray);
			if(isset($results[0])){
				$shareExists = $results[0] > 0;
				return $shareExists;
			}
		}
		return false;
	}

	/**
	 * Check if specified albumItemId exists.
	 * @param integer $albumItemId primary key of the AlbumItems table
	 */
	function isAlbumItemValid($albumItemId){
		$sql = "SELECT album_id
				FROM AlbumItems
				WHERE album_item_id = :album_item_id ";
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$arrayResult = $this->executeQueryAndFetchOneRow($sql, 'GET_ALBUM_ID', $bindVarNVTArray);
		$status = isset($arrayResult[0]) ? true : false;
		return $status;
	}

	/**
	 * Get file path of file id.
	 * @return integer $fileId
	 * @return string $filePath
	 */
	function getBasePath(){
		$volInfo = getMediaVolumesInfo();
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'volInfo', print_r($volInfo,true));
		$basePath = $volInfo[0]['Path'];
		$dbPath   = $volInfo[0]['DbPath'];
		return $basePath;
	}

	/**
	 * Get file path of album item.
	 * @param integer $albumItemId
	 * @return string $filePath
	 */
	function getFilePath($albumItemId){
		$sql = "SELECT *
				FROM AlbumItems
				WHERE album_item_id=:album_item_id";
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$row = $this->executeQueryAndFetchOneRow($sql, 'GET_FILE_PATH', $bindVarNVTArray);
		if (isset($row['path'])) {
			$path = $row['path'];
		} else {
			$path = '';
		}
		$filePath = mediaToAbsPath($path, $row['share_name']);

		//$basePath = $this->getBasePath();
		//$filePath = $basePath.$path;
		$filePath = str_replace('//', '/', $filePath);

		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'row', print_r($row,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'basePath', $basePath);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'path', $path);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'filePath', $filePath);

		return $filePath;
	}

	/**
	 * Get file path of album item.
	 * @param integer $albumItemId
	 * @return string $filePath
	 */
	function getFilePath_OLD($albumItemId){
		$fileId = $this->getFileId($albumItemId);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'fileId', $fileId);
		if (empty($fileId)) return false;
		$filePath = $this->getFileIdPath($fileId);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'filePath', $filePath);
		return $filePath;
	}

	/**
	 * Given the albumItemId, the parent albumId will be returned.
	 * @param $albumItemId primary key of the AlbumItems table
	 * @return integer albumId which is the primary key of the Albums table.
	 */
	function getFilePath_OBSOLETE($albumItemId){
		$sql = "SELECT Folders.name||Files.name
				FROM AlbumItems, Files, Folders
				WHERE album_item_id=:album_item_id And AlbumItems.file_id = Files.file_id
				And Folders.folder_id=Files.folder_id";
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$arrayResult = $this->executeQueryAndFetchOneRow($sql, 'GET_FILE_PATH', $bindVarNVTArray);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'arrayResult', print_r($arrayResult,true));
		if(isset($arrayResult[0])){
			$retVal = $arrayResult[0];
		} else {
			$retVal = false;
		}

		return $retVal;
	}

	/**
	 * Get file id of album item.
	 * @param integer $albumItemId
	 * @return integer $fileId
	 */
	function getFileId($albumItemId){
		$sql = "SELECT *
				FROM AlbumItems
				WHERE album_item_id=:album_item_id";
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		$bindVarNVTArray = array( array(':album_item_id', $albumItemId, PDO::PARAM_INT));
		$row = $this->executeQueryAndFetchOneRow($sql, 'GET_FILE_ID', $bindVarNVTArray);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'row', print_r($row,true));
		if (isset($row['file_id'])) {
			$fileId = $row['file_id'];
		} else {
			$fileId = false;
		}
		return $fileId;
	}

	/**
	 * Get file path of file id.
	 * @return integer $fileId
	 * @return string $filePath
	 */
	function getFileIdPath($fileId){
		$volInfo = getMediaVolumesInfo();
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'volInfo', print_r($volInfo,true));
		$volPath = $volInfo[0]['Path'];
		$dbPath  = $volInfo[0]['DbPath'];
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'dbPath', print_r($dbPath,true));
		$mediaDb = openMediaDb($dbPath);
		//$sql = "SELECT ".$columns." FROM Files WHERE file_id = ".$fileId;
		$sql = "SELECT * FROM Files WHERE file_id = ".$fileId;
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//$dbaccess = new DBAccess();
		//$rows = $dbaccess->executeQueryWithDb($mediaDb, $sql);
		$rows = $this->executeQueryWithDb($mediaDb, $sql);
		closeMediaDb($mediaDb);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));
		if(isset($rows[0]['path'])){
			$path = $rows[0]['path'];
			$file = $rows[0]['name'];
			//$filePath = $volPath.$path.'/'.$file;
			$filePath = $volPath.$path;
			$filePath = str_replace('//', '/', $filePath);
		} else {
			$filePath = false;
		}
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'filePath', $filePath);
		return $filePath;
	}

	function shiftAlbumItemsUp($itemOrderTo, $fromAlbumId){
		if (isset($itemOrderTo)) {
			$sql = "UPDATE AlbumItems
					SET item_order = item_order + 1
					WHERE album_item_id != :album_item_id
					AND item_order >= (SELECT item_order
										FROM  AlbumItems
										WHERE album_item_id = :album_item_id)
					AND item_order < :item_order
					";
			$bindVarNVTArray = array(
				array(':album_item_id', $fromAlbumId, PDO::PARAM_INT),
				array(':item_order', $itemOrderTo, PDO::PARAM_INT)
			);
			return $this->executeUpdateWithPreparedStatements($sql, 'SHIFT_ALBUM_ITEMS_UP_RANGE', $bindVarNVTArray);
		} else {
			$sql = "UPDATE AlbumItems
					SET item_order = item_order + 1
					WHERE album_item_id != :album_item_id
					AND item_order >= (SELECT item_order
										FROM  AlbumItems
										WHERE album_item_id = :album_item_id)
					";
			$bindVarNVTArray = array(
				array(':album_item_id', $fromAlbumId, PDO::PARAM_INT)
			);
			return $this->executeUpdateWithPreparedStatements($sql, 'SHIFT_ALBUM_ITEMS_UP', $bindVarNVTArray);
		}
	}

	function shiftAlbumItemsDown($itemOrderFrom, $toAlbumId){
		if (isset($itemOrderFrom)) {
			$sql = "UPDATE AlbumItems
						SET item_order = item_order - 1
						WHERE album_item_id != :album_item_id
						AND item_order <= (SELECT item_order
											FROM  AlbumItems
											WHERE album_item_id = :album_item_id)
						AND item_order > :item_order
					";
			$bindVarNVTArray = array(
				array(':album_item_id', $toAlbumId, PDO::PARAM_INT),
				array(':item_order', $itemOrderFrom, PDO::PARAM_INT)
			);
			return $this->executeUpdateWithPreparedStatements($sql, 'SHIFT_ALBUM_ITEMS_DOWN_RANGE', $bindVarNVTArray);
		} else {
			$sql = "UPDATE AlbumItems
						SET item_order = item_order - 1
						WHERE album_item_id != :album_item_id
						AND item_order >= (SELECT item_order
											FROM  AlbumItems
											WHERE album_item_id = :album_item_id)
					";
			$bindVarNVTArray = array(
				array(':album_item_id', $toAlbumId, PDO::PARAM_INT),
			);
			return $this->executeUpdateWithPreparedStatements($sql, 'SHIFT_ALBUM_ITEMS_DOWN', $bindVarNVTArray);
		}
	}

	/**
	 * Get list of albums up to (includes) specified album Item
	 * @param $albumItemId
	 * @param $limit number of record to be returned, if not specified, then all results are returned
	 */
	function albumItemRangeTo($albumItemId, $limit){
		if (!isset($limit)) {
			$limit = -1;
		}
		$sql = "SELECT album_item_id, path, album_id, item_order
				  FROM (SELECT * FROM AlbumItems WHERE album_id = (SELECT album_id FROM AlbumItems WHERE album_item_id = :album_item_id)) otr
				  WHERE exists (SELECT 1
				  FROM AlbumItems inr
				 WHERE inr.album_id = otr.album_id
				   AND inr.item_order >= otr.item_order
				   AND inr.album_item_id = :album_item_id)
				 ORDER BY item_order DESC
				 LIMIT :limit
				";
		$bindVarNVTArray = array(
			array(':album_item_id', $albumItemId, PDO::PARAM_INT),
			array(':limit', $limit, PDO::PARAM_INT),
		);
		$ret = $this->executeQuery($sql, 'ALBUM_ITEM_RANGE_TO', $bindVarNVTArray);
		return $ret;
	}
}