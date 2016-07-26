<?php

namespace Alerts\Alert\Db;

use PDO;
use Core\Logger;

//require_once("/PHPUnit/Util/PDO.php");

class AlertDB {
	var $db;
	var $queryAttach;
	var $defdb_key;

	function __construct($dbpath="/CacheVolume/.wd-alert/wd-alert.db")
	{
		$this->queryAttach = array('def'=>'/CacheVolume/.wd-alert/wd-alert-desc.db');
		$this->defdb_key = "def";

		try {
			$this->db = new PDO("sqlite:".$dbpath);
		}
		catch(\PDOException $e) {
			Logger::getInstance()->info(__FUNCTION__ . ", Failed to connect to database: " . $e->getMessage());
			die($e->getMessage());
		}
	}

	function execute($sql)
	{
		//echo "$sql<br>\n";
		try {
			$result = $this->db->prepare($sql);
			if(!$result)
				return $result;
			Logger::getInstance()->info("Executing query: $sql");
			return $result->execute();

		} catch (\PDOException $e) {
			Logger::getInstance()->info("Failed to execute query: $sql");
			return false;
		}
	}

	function query($sql)
	{
		//echo "$sql<br>\n";
		try {
			$result = $this->db->query($sql);
			if($result){
				Logger::getInstance()->info("Executing Query: $sql");
				$rows = $result->fetchall(PDO::FETCH_ASSOC);}
			else
				$rows = array();
			return $rows;
		} catch (\PDOException $e) {
			Logger::getInstance()->info("Failed Query: $sql");
			return array();
		}
	}

	//function insertAlert($code, $desc="N/A", $scope="all", $user=0, $level=10, $ack_scope="all")
	function insertAlert($code, $desc="N/A", $user=0)
	{
		//$sql = "INSERT INTO AlertHistory (alert_code, desc, alert_scope, user, ack_scope, acknowledged) VALUES ('$code', '$desc', '$scope', '$user', '$ack_scope', 0)";
		//$sql = "INSERT INTO AlertHistory (alert_code, desc, alert_scope, user, ack_scope, acknowledged) VALUES (";
		$sql = "INSERT INTO AlertHistory (alert_code, desc, user, acknowledged) VALUES (";
		$sql .= $this->db->quote($code).", ";
		$sql .= $this->db->quote($desc).", ";
		//$sql .= $this->db->quote($scope).", ";
		$sql .= $this->db->quote($user).", ";
		//$sql .= $this->db->quote($ack_scope).", ";
		$sql .= "0)";
		$res = $this->execute($sql);
		//echo "last insertid:".$this->db->lastInsertId()."\n";
		return $res;
	}

	function markAlertAck($id, $ack)
	{
		$sql = 	"UPDATE AlertHistory SET acknowledged=";
		$sql .= $ack? "1":"0";
		$sql .= " WHERE id=".$this->db->quote($id);
		return $this->execute($sql);
	}

	function deleteAllAlerts()
	{
		$sql = "DELETE FROM AlertHistory WHERE id>0";
		return $this->execute($sql);
	}

	function queryAlertDesc($code='') {
	    $def = $this->defdb_key;
	    $sql = "SELECT $def.AlertDesc.code, $def.AlertScopes.value AS scope, $def.AlertSeverities.value AS severity, $def.AlertDesc.admin_ack_only, $def.AlertDesc.description FROM $def.AlertDesc, $def.AlertSeverities, $def.AlertScopes";
	    $sql .= " WHERE $def.AlertSeverities.id = $def.AlertDesc.severity AND $def.AlertScopes.id = $def.AlertDesc.scope";
	    if($code) {
	        $sql .= " AND $def.AlertDesc.code='$code'";
	    }

	    if($this->attachDB($this->queryAttach))
			return $this->query($sql);
		else
			return array();
	}

	function queryAlert($id=0, $admin=false, $all=true, $specific=false, $hide_ack=true, $level=10, $id_newer_than=0, $limit=20, $offset=0, $descending=true, $code='', $timestamp=0)
	{
		$def_db_key = $this->defdb_key;
		$sql = "SELECT DISTINCT AlertHistory.id, datetime(AlertHistory.log_time, 'localtime') AS timestamp, $def_db_key.AlertDesc.code, $def_db_key.AlertSeverities.value, $def_db_key.AlertDesc.description, AlertHistory.desc, $def_db_key.AlertDesc.scope, AlertHistory.user, AlertDesc.admin_ack_only, AlertHistory.acknowledged FROM AlertHistory, $def_db_key.AlertDesc, $def_db_key.AlertSeverities WHERE ";
		//$sql = "SELECT DISTINCT AlertHistory.id, AlertHistory.log_time AS timestamp, AlertDesc.code, AlertSeverities.value, AlertHistory.desc, AlertHistory.alert_scope, AlertHistory.user FROM AlertHistory, AlertDesc, AlertSeverities WHERE ";
		$whereclause = "$def_db_key.AlertDesc.code = AlertHistory.alert_code AND $def_db_key.AlertDesc.severity = $def_db_key.AlertSeverities.id";
		$filter = "";

		if($id > 0) {
			$whereclause .= " AND AlertHistory.id = $id";
			$sql .= $whereclause;
			if($this->attachDB($this->queryAttach)) {
				return $this->query($sql);
			}
			else {
				return array();
			}
		}

		if(!$admin && !$all && !$specific) {
			// filter scope to something that does not exists if all 3 scopes are false
			$filter .= "$def_db_key.AlertDesc.scope='0'";
		}

		if($admin) {
			$filter .= "$def_db_key.AlertDesc.scope='2'";
		}
		if($all) {
			if($filter)
				$filter .= " OR ";

			$filter .= "$def_db_key.AlertDesc.scope='1'";
		}
		if($specific) {
			$userid = getSessionUserId();
			if($userid > 0) {
				if($filter)
					$filter .= " OR ";

				$filter .= "($def_db_key.AlertDesc.scope='3'";
				$filter .= " AND user = ".$this->db->quote($userid).")";
			}
		}

		if($filter)
			$whereclause .= " AND ( $filter )";


		if($hide_ack) {
			$whereclause .= " AND AlertHistory.acknowledged=0";
		}
		if($code) {
		    $whereclause .= " AND AlertHistory.alert_code='$code'";
		}
		if($timestamp>0) {
		    $whereclause .= " AND AlertHistory.log_time >= datetime($timestamp, 'unixepoch')";
		}

		$whereclause .= " AND $def_db_key.AlertDesc.severity<=$level";

		if($id_newer_than > 0) {
			$whereclause .= " AND AlertHistory.id > $id_newer_than";
		}

		$sql .= $whereclause;

		$sql .= " ORDER BY AlertHistory.id";
		if($descending)
			$sql .= " DESC";
		else
			$sql .= " ASC";

		if($limit > 0)
			$sql .= " LIMIT $limit";
		if($offset > 0)
			$sql .= " OFFSET $offset";

		if($this->attachDB($this->queryAttach))
		{
			Logger::getInstance()->info("$sql");
			return $this->query($sql);
		}
		else
			return array();
	}

	function attachDB($dbarray) {
		$sql = "";
		foreach($dbarray as $key => $db) {
			$sql  .= "ATTACH DATABASE '$db' AS $key; ";
		}
		return $this->execute($sql);
	}

	function searchCode($code){
		$def = $this->defdb_key;
		$sql = "Select id from $def.AlertDesc where $def.AlertDesc.code = ". $this->db->quote($code) . ';';
		if($this->attachDB($this->queryAttach))
			return $this->query($sql);
		else
			return array();
	}
}