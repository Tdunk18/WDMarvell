<?php
/**
 * \file common\security.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

/**
 *
 */
class SecurityDB extends DBAccess {

		static $queries = array (
			'SELECT_USERS'       => "SELECT user_id,local_username as username,fullname,is_admin,is_password FROM Users",
			'SELECT_USER'        => "SELECT user_id,local_username as username,fullname,is_admin,is_password FROM Users WHERE user_id=:user_id",
			'VALID_DEVICE_USER'  => "SELECT COUNT(*) AS COUNT FROM DeviceUsers  WHERE device_user_id = :device_user_id and auth = :auth",
			'GET_DEVICE_USER'    => "SELECT * FROM DeviceUsers WHERE device_user_id = :device_user_id",
			'WAN_ACCESS_ENABLED' => "SELECT enable_wan_access FROM DeviceUsers WHERE device_user_id = :device_user_id",
			'GET_NAMED_SHARE'    => "SELECT * FROM UserShares WHERE share_name = :share_name",
			'GET_ACL_FOR_SHARE_AND_USER' => "SELECT share_name, user_id, access_level, created_date FROM UserShareAccess WHERE share_name=:share_name AND user_id=:user_id",
		);

	function __construct() {
	}

	/**
	 * Returns the userId of the user identified by the supplied Local Username
	 * @param String $localUsername identifier of the user (column in the Users table)
	 * @return integer userId of the specified User
	 */
	function getUserId($username) {
		$sql = "SELECT user_id
				FROM Users
				WHERE lower(local_username) = :local_username";
		$bindVarNVTArray = array( array(':local_username', strtolower($username), PDO::PARAM_STR));
		$rows = $this->executeQuery($sql, 'GET_USER_ID', $bindVarNVTArray);
		if (isset($rows[0]['user_id'])) {
			return $rows[0]['user_id'];
		} else {
			return null;
		}
	}

	public function getUser($userId=null) {
		if (empty($userId)) {
			$users = $this->executeQuery(self::$queries['SELECT_USERS'],'SELECT_USERS');
			return $users;
		} else {
			$bindVarNVTArray = array(array(':user_id', $userId, PDO::PARAM_INT));
			$users = $this->executeQuery(self::$queries['SELECT_USER'], 'SELECT_USER', $bindVarNVTArray);
			if (isset($users) && sizeof($users) > 0) {
				$users = $users[0];
			} else {
				$users = null;
			}
		}
		if (!$users) {
			return false;
		}
		return $users;
	}

	function isValid($device_user_id, $auth) {

		$bindVarNVTArray = array(array(':device_user_id', getSafeDatabaseText($device_user_id), PDO::PARAM_INT),
								 array(':auth', getSafeDatabaseText($auth), PDO::PARAM_STR));
		$rows = $this->executeQuery(self::$queries['VALID_DEVICE_USER'], 'VALID_DEVICE_USER', $bindVarNVTArray);
		$retVal = false;
		foreach ($rows as $row) {
			$count = $row['COUNT'];
			if($count == 1) {
				$retVal = true;
			}
			break;
		}
		return $retVal;
	}

	function getDeviceUser($device_user_id) {
		$bindVarNVTArray = array( array(':device_user_id', $device_user_id, PDO::PARAM_INT));
		return $this->executeQueryAndFetchOneRow(self::$queries['GET_DEVICE_USER'], 'GET_DEVICE_USER', $bindVarNVTArray);
	}

	function isWanAccessEnabled($device_user_id) {
		$bindVarNVTArray = array( array(':device_user_id', $device_user_id, PDO::PARAM_INT));
		$rows = $this->executeQuery(self::$queries['WAN_ACCESS_ENABLED'], 'WAN_ACCESS_ENABLED', $bindVarNVTArray);
		$retVal = false;
		foreach ($rows as $row) {
			$retVal = $row['enable_wan_access'];
			break;
		}
		return $retVal;
	}

	function isAdmin($userId) {
		$sql = "SELECT COUNT(*) as count
		FROM Users
		WHERE user_id = :user_id
		 AND is_admin = 'true'";
		$bindVarNVTArray = array(array(':user_id', $userId, PDO::PARAM_INT));
		$rows = $this->executeQuery($sql, 'IS_ADMIN', $bindVarNVTArray);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', print_r($sql,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));
		$results = false;
		foreach ($rows as $row) {
			$count = $row['count'];
			if ($count > 0) {
				 $results = true;
			}
			break;
		}
		return $results;
	}

	function getLocalUsername($userId) {
		$sql = "SELECT local_username
				FROM Users
				WHERE user_id = :user_id";
		$bindVarNVTArray = array( array(':user_id', $userId, PDO::PARAM_INT));
		$rows = $this->executeQuery($sql, 'GET_LOCAL_USERNAME', $bindVarNVTArray);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));
		$username = null;
		foreach ($rows as $row) {
			$username = $row['local_username'];
			break;
		}
		return $username;
	}

	public function getShareForName($shareName) {
        // for testing, return true
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return true;
        }

		$bindVarNVTArray = array(
			array(':share_name', $shareName, PDO::PARAM_STR)
		);
		return $this->executeQuery(self::$queries['GET_NAMED_SHARE'], 'GET_NAMED_SHARE', $bindVarNVTArray);
	}

	public function getAclForShare($shareName,$userId=NULL) {
		if (isset($userId)) {
			$queryName = 'GET_ACL_FOR_SHARE_AND_USER';
			$bindVarNVTArray = array( array(':share_name', $shareName, PDO::PARAM_STR),
									 array(':user_id', $userId, PDO::PARAM_STR));
		} else {
			$queryName = 'GET_ACL_FOR_SHARE';
			$bindVarNVTArray = array( array(':share_name', $shareName, PDO::PARAM_STR));
		}
		return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
	}
}