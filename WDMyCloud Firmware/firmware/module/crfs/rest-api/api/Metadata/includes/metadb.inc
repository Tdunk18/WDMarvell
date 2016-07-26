<?php
/**
 * \file metadb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */


require_once(DB_ROOT . '/includes/dbaccess.inc');
require_once(COMMON_ROOT . '/includes/category.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(FILESYSTEM_ROOT . '/includes/mediavolumemgr.inc');
require_once (METADATA_ROOT . '/includes/wdmc/wdmcserverproxy.inc');

/*
 * query result map
 * TODO : Check on Reflection ????
 */
class ResultMapEnum {

	const IMAGE_MI_RESULT_MAP = "IMAGE_MI_RESULT_MAP";
	const AUDIO_MI_RESULT_MAP = "AUDIO_MI_RESULT_MAP";
	const VIDEO_MI_RESULT_MAP = "VIDEO_MI_RESULT_MAP";
	const OTHER_MI_RESULT_MAP = "OTHER_MI_RESULT_MAP";
	const IMAGE_AI_RESULT_MAP = "IMAGE_AI_RESULT_MAP";
	const AUDIO_AI_RESULT_MAP = "AUDIO_AI_RESULT_MAP";
	const VIDEO_AI_RESULT_MAP = "VIDEO_AI_RESULT_MAP";
	const OTHER_AI_RESULT_MAP = "OTHER_AI_RESULT_MAP";

	private static $enums = array();
	public static function getEnums() {
		if (empty(self::$enums)) {
			$refl = new ReflectionClass('ResultMapEnum');
			self::$enums = array_keys($refl->getConstants());
		}
		return self::$enums;
	}

}

//we create this policy because the securities for metadb album are handled in album queries
class AlbumSharePolicy implements ShareAccessPolicy {
	public function isShareAccesible($shareName, $isWrite = false) {
		return true;
	}
}


function getDBResultMap($enum) {
	$dbConfig = getGlobalConfig("db");

	if(in_array($enum, ResultMapEnum::getEnums()) && isset($dbConfig[$enum])) {
		return $dbConfig[$enum];
	}
	return null;
}

function getPhotosMetaInfoResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["IMAGE_MI_RESULT_MAP"])) {
		return $dbConfig["IMAGE_MI_RESULT_MAP"];
	}
	return null;
}




class MetaDb extends DBAccess {

	private $db;
	public  $mediaTypes = array('videos','music','photos','other');
	public  $categories = array('all', 'videos', 'music', 'photos', 'other');

	/* Class constructor.
	 * @param string $dbPath
	 */
	public function __construct($dbPath=null) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'dbPath', $dbPath);

		$this->db = openMediaDb($dbPath);
	}

	private function _buildResultMapper($mappings) {
		$ret = array();
		foreach ($mappings as $fieldName => $elementName ) {
			if (preg_match_all('/(.*)\s+AS\s+(.*)/si', $fieldName, $matches, PREG_SET_ORDER)) {
				$fieldName = $matches[0][2];
			} else if (preg_match_all('/(.*)\.(.*)/si', $fieldName, $matches, PREG_SET_ORDER)) {
				$fieldName = $matches[0][2];
			}
			$ret[$fieldName]=$elementName;
		}
		return $ret;
	}

	/* Output meta info item.
	 * @param array  $metaInfo
	 * @param array  $resultColumns
	 * @param string $output
	 */
	public function outputMetaInfoItem($volume, $metaInfo, $resultColumns, OutputWriter $output) {
		$volMgr = RequestScope::getMediaVolMgr();

		if (!empty($metaInfo)) {
			### EXCLUDE WDMC TRANSCODED SYSTEM FILES
			if (strpos($metaInfo['path'], '.wdmc') !== false) {
				return;
			}

			$count = 0;

			//get type of meta info
			$category = $metaInfo['category'];
			$mediaColumns = isset($resultColumns[$category]) ? $resultColumns[$category] : null;
			if (empty($mediaColumns)) {
				$mediaColumns = $resultColumns[getCategoryId(MediaTypeEnum::OTHER)];
			} else {
				$mediaColumns = array_merge($resultColumns[getCategoryId(MediaTypeEnum::OTHER)], $mediaColumns);
			}
			$mediaColumns = $this->_buildResultMapper($mediaColumns);

			$output->pushArrayElement();
			unset($metaInfo['volume']);
			foreach($mediaColumns as $fieldName => $elementName) {
				//FIX ME: fix up folder path to include volume path - this needs to be chnaged to get the
				//path for the mounted volume
				$miVal = isset($metaInfo[$fieldName]) ? $metaInfo[$fieldName] : null;
				if ($fieldName == 'path') {
					### PATH SHOULD CONTAIN THE SHARE PATH OR FILE NAME
					//$miVal = dirname($sharePath . $miVal);
					//$miVal = rtrim($miVal, '/');
					//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'miVal', print_r($miVal,true));
					$miVal = $volMgr->getShareClientPath($miVal, $volume);
					$miVal = rtrim($miVal, '/');
					$miVal = empty($miVal) ? '/':$miVal;
				} else if ($fieldName == 'category') {
					$miVal = getMediaType($miVal);
				}

				if (is_numeric($miVal)) {
					$output->numberElement($elementName, $miVal);
				} else{
					$output->element($elementName, $miVal);
				}
				++$count;
			}
			$output->popArrayElement();
		}
	}

	/* Get all items accessible of specified album.
	 * @param integer $albumId
	 */
	public function getAlbumItems($albumId, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {

        $start_time = microtime(true);

        //build result mapping
		$baseMap = getDBResultMap(ResultMapEnum::OTHER_AI_RESULT_MAP);
		$videoMap = getDBResultMap(ResultMapEnum::VIDEO_AI_RESULT_MAP);
		$photoMap = getDBResultMap(ResultMapEnum::IMAGE_AI_RESULT_MAP);
		$audioMap = getDBResultMap(ResultMapEnum::AUDIO_AI_RESULT_MAP);
		$resultMap[getCategoryId(MediaTypeEnum::VIDEO)] = $videoMap;
		$resultMap[getCategoryId(MediaTypeEnum::MUSIC)] = $audioMap;
		$resultMap[getCategoryId(MediaTypeEnum::PHOTOS)] = $photoMap;
		$resultMap[getCategoryId(MediaTypeEnum::OTHER)] = $baseMap;

		//build tables
		$leftJoinClause = array('Files'=>array());
		$leftJoinClause['Files']['Folders'] =       'Files.folderId = Folders.id';
		$leftJoinClause['Files']['VideoMetaData'] = 'Files.id = VideoMetadata.sourceId';
		$leftJoinClause['Files']['AudioMetaData'] = 'Files.id = AudioMetaData.sourceId';
		$leftJoinClause['Files']['ImageMetaData'] = 'Files.id = ImageMetaData.sourceId';

		$tables = array('<orionDb>.UserShares', '<orionDb>.AlbumItems' ,  $leftJoinClause);

		//build where clause
		$where  = " 1 = 1 "
		. " & @UserShares.share_name = @AlbumItems.share_name "
		. " & @AlbumItems.path = @Files.path "
		. " & @AlbumItems.album_id = '$albumId' "
		. " & @UserShares.volume_id = '\<volumeId\>' ";

		if (!empty($order_by)) {
			$order_by = ($order_by == 'item_order') ? 'AlbumItems.'.$order_by : 'Files.'.$order_by;
		} else {
			$order_by = 'AlbumItems.item_order';
		}

		$columns = array();
		foreach ($resultMap as $mediaMap) {
			$columns = array_merge($columns, array_keys($mediaMap));
		}

		array_push($columns, " '<volume>' AS volume ");

		$sqlQuery = '';

		//copy
		//var_dump($sqlQuery);
		$output = new OutputWriter(RequestScope::getInstance()->getOutFormat());
		$output->pushElement('metadb_album');

		if ($sqlQuery) {
			$secPolicy = new AlbumSharePolicy();
			$db = openMediaDbWithPolicy(null, $secPolicy);
			$dbAccess = new DBAccess();
			$stmt = $dbAccess->executeQueryWithDbCursor($db, $sqlQuery);

			if ($stmt) {
				$output->pushArray('item');
				//$volumesInfo = getMediaVolumesInfo();

				$name = null;
				while ($row = $dbAccess->getNextRow($stmt)) {
					//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'row', print_r($row,true));
					### REMOVE DUPLICATES
					//if ($row && $row['name'] != $name) {
					$volumePath = $row['volume'];
					$this->outputMetaInfoItem($volumePath, $row, $resultMap, $output);
					$name = $row['name'];
					//}
				}

				/*
				 do {
					$row = $dbaccess->getNextRow($stmt);
					//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'row', print_r($row,true));
					if ($row) {
					$this->outputMetaInfoItem($volumePath, $row, $resultColumns, $output);
					}
					} while ($row);
					*/

				$output->popArray();
			} else {
				//error
			}
			closeMediaDb($db);
		} else {
			//error
		}
		$end_time = microtime(true);
		$total_time = $end_time - $start_time;
		$output->element('total_time', sprintf("%.2f", $total_time));
		$output->popElement();
		$output->close();
		//end copy

		//return $rows;  Commented out since this variable doesn't exist
	}

	/* Get all items accessible of specified album.
	 * @param integer $albumId
	 */
	public function getAlbumSummary($albumId, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {
		//$status = $this->_attach();
		//if (!$status) return false;
		$select = "COUNT(ai.album_id) AS count, SUM(f.size) AS size";
		$from   = "o.UserShares s
				   JOIN o.AlbumItems ai
				     ON s.share_name = ai.share_name
		           JOIN <db>.Files f
		             ON f.path = ai.path";
		// The where clause f.isDeleted = '0' takes too long.
		//$where  = "f.isDeleted = '0' AND ai.album_id = '$albumId'";
		$where  = " '<volumeId>' = s.volume_id
				   AND ai.album_id = '$albumId'";
		$groupBy = null;
		$orderBy = null;
		$order    = null;
		$offset   = null;
		$limit    = null;

		$sql = $this->_genCommonSql($select, $from, $where, $groupBy, $orderBy, $order, $offset, $limit);

		$sql = "SELECT SUM(count) count, SUM(size) size FROM ($sql) " . $this->_genAppendSql(null, null, null, null, $orderBy, $order, $offset, $limit);

		$rows    = $this->_query($sql);

		return $rows;
	}

	private function _genSql($select, $from, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {
		return $this->_genCommonSql($select, $from, $where, $group_by, $order_by, $order, $offset, $limit) . $this->_genAppendSql($select, $from, $where, $group_by, $order_by, $order, $offset, $limit);
	}

	private function _genCommonSql($select, $from, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {

		$sql = isMultiDb() ? '{' : '';
		$sql .= 'SELECT '.$select.' FROM '.$from;
		$sql .= !empty($where)  ? ' WHERE '.$where    : '';
		$sql .= !empty($group_by)  ? ' GROUP BY '.$group_by : '';
		$sql .= isMultiDb() ? '}' : '';

		return $sql;
	}

	private function _genAppendSql($select, $from, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {
		$sql = !empty($order_by)  ? ' ORDER BY '.$order_by.' '.$order : '';
		$sql .= !empty($offset) && !empty($limit) ? ' LIMIT '.$offset.','.$limit : '';
		$sql .=  empty($offset) && !empty($limit) ? ' LIMIT '.$limit : '';
		$sql .=  empty($offset) &&  empty($limit) ? ' LIMIT 1000' : '';
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s</PRE>\n", $sql);
		return $sql;

	}

	private function _select($select, $from, $where=null, $group_by=null, $order_by=null, $order=null, $offset=null, $limit=null) {
		$sql = $this->_genSql($select, $from, $where, $group_by, $order_by, $order, $offset, $limit);

		return $this->_query($sql);
	}

	private function _query($sql) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		return $this->executeQueryWithDb($this->db, $sql);
	}

	public function __destruct() {
		closeMediaDb($this->db);
	}

}
