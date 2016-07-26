<?php
/**
 * \file filesystem\mediavolspdo.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/querymorphpdo.php');

use Core\Logger;

class MediaVolsPDO extends QueryMorphPDO {
	private $_volMgr;
	private $_orionDbPath;
	private $_mediaDbPathSet;
	public function __construct($volMgr, $dbPathSet=array()) {

		$dbFilePath = getOrionDBPath();
		$this->_orionDbPath = $dbFilePath;
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'dbFilePath', print_r($dbFilePath,true));
		if (file_exists($dbFilePath)) {
			$dsn = 'sqlite:' . $dbFilePath;
		} else {
			Logger::getInstance()->err(__FUNCTION__ . ", DB files does not exist: $dbFilePath");
			throw new Exception('DB file does not exist: ' . $dbFilePath);
		}

		parent::__construct($dsn, null, null, null);
		$this->_volMgr = $volMgr;
		$this->_mediaDbPathSet = $dbPathSet;
		$status = $this->_attach();

	}

	private function _attach() {
		$attach = " ATTACH DATABASE '$this->_orionDbPath' AS o; ";

		foreach($this->getVolInfos() as $dbElem) {
			$dbAlias = $dbElem['DbAlias'];

			$attach .= " ATTACH DATABASE '". $dbElem['DbPath'] . "' AS $dbAlias; ";
		}

		Logger::getInstance()->debug(__FUNCTION__ . ", attach: $attach");

		return $this->exec($attach);

	}

	public function getVolInfos() {
		$ret = array();

		if (empty($this->_mediaDbPathSet)) {
			$ret = $this->_volMgr->getSecureMediaVolumeInfo();
		} else {
			$ret = $this->_volMgr->getVolumeByDbPaths($this->_mediaDbPathSet);
		}

		return $ret;
	}

	/* replace DbAlias to real database name and checking physical database files
	 *
	 * */
	public function morphQuery($sql) {

		//extract common sql
		if (preg_match_all('/(.*){(.*)}(.*)/s', $sql, $matches, PREG_SET_ORDER)) {
			$prependSql = $matches[0][1];
			$commonSql  = $matches[0][2];
			$appendSql  = $matches[0][3];
		} else {
			$prependSql = '';
			$commonSql  = $sql;
			$appendSql  = '';
		}

		//get db object and attach all databases
		$sqlArray = array();
		foreach($this->getVolInfos() as $key => $dbElem) {
			$dbAlias    = $dbElem['DbAlias'];
			if(file_exists($dbElem["DbPath"])){
				if(isset($dbElem['Shares'])){
					$shareName  = isset($dbElem['Shares'][key($dbElem['Shares'])]['share_name']) ? $dbElem['Shares'][key($dbElem['Shares'])]['share_name'] : '';
					$sqlArray[] = preg_replace(array('/<db>|<wdmc.db>/', '/<volume>/', '/<volumeId>/', '/<shareName>/', '/<orionDb>|<orion.db>/'), array($dbAlias, $dbElem['DbPath'], $dbElem['Id'], $shareName, 'o'), $commonSql);
				}
			}
		}
		//generate combined sqls
		$sqlRet = $prependSql;
		$sqlRet .= implode(" union all ", $sqlArray);
		$sqlRet .= " $appendSql";

		Logger::getInstance()->debug(__FUNCTION__ . ", multi-query: $sqlRet");
		return $sqlRet;
	}

	public function morphResultSet($rows) {

	}

	public function morphResultRow($row) {

	}
}