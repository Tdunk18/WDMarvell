<?php
/**
 * \file social\socialnetworksdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

class SocialNetworksDB extends DBAccess {

	private static $queries = array (
		'GET_ALL_SOCIAL_NETWORKS'  => "SELECT * FROM SocialNetworks",
		'GET_USER_SOCIAL_NETWORKS' => "SELECT * FROM SocialNetworks WHERE username = :username",
		'GET_USER_SOCIAL_NETWORK'  => "SELECT * FROM SocialNetworks WHERE username = :username AND network = :network",
		'GET_SOCIAL_NETWORK'       => "SELECT * FROM SocialNetworks WHERE network = :network",
		'ADD_SOCIAL_NETWORK'       => "INSERT INTO SocialNetworks ( username, network, auth_type, auth_code)
														   VALUES (:username,:network,:auth_type,:auth_code)",
		'DELETE_SOCIAL_NETWORKS'   => "DELETE FROM SocialNetworks WHERE username = :username",
		'DELETE_SOCIAL_NETWORK'    => "DELETE FROM SocialNetworks WHERE username = :username AND network = :network",

	);

	public function __construct() {
	}

	/* Select social network for user.
	 * @param string  $network
	 * @param integer $username
	 */
	public function select($network, $username) {
		if (!empty($username) && !empty($network)) {
			$key = 'GET_USER_SOCIAL_NETWORK';
			$bindVarNVTArray = array(
			array(':network', getSafeDatabaseText((string)$network), PDO::PARAM_STR),
			array(':username', $username, PDO::PARAM_STR),
			);
		} else if (!empty($username) && empty($network)) {
			$key = 'GET_USER_SOCIAL_NETWORKS';
			$bindVarNVTArray = array(
			array(':username', $username, PDO::PARAM_INT),
			);
		} else if (empty($username) && !empty($network)) {
			$key = 'GET_SOCIAL_NETWORK';
			$bindVarNVTArray = array(
			array(':network', getSafeDatabaseText((string)$network), PDO::PARAM_STR),
			);
		} else {
			$key = 'GET_ALL_SOCIAL_NETWORKS';
			$bindVarNVTArray = null;
		}
		$sql = self::$queries[$key];
		$results = $this->executeQuery($sql, $key, $bindVarNVTArray);
		$SocialNetworks = new SocialNetworks();
		for($i=0; $i < count($results); $i++) {
			$network     = isset($results[$i]['network'])   ? $results[$i]['network']   : null;
			$username     = isset($results[$i]['username'])   ? $results[$i]['username']   : null;
			$auth_code   = isset($results[$i]['auth_code']) ? $results[$i]['auth_code'] : null;
			$expires     = isset($results[$i]['expires'])   ? $results[$i]['expires']   : null;
			$expire_date = !empty($expires) ? date('Y-m-d H:i:s', $expires) : '';
			$expire_secs = $expires - time() > 0 ? $expires - time() : null;
			$valid       = $expire_secs > 0 ? 'true' : 'false';
			$results[$i]['expire_date'] = $expire_date;
			$results[$i]['expire_secs'] = $expire_secs;
			$results[$i]['valid']       = $valid;
			$results[$i]['auth_url']    = $SocialNetworks->getSocialAuthUrl($network, $username);
			$results[$i]['access_url']  = $SocialNetworks->getSocialAccessUrl($network, $username, $auth_code);
		}
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'results', print_r($results,true));
		return $results;
	}

	/* Insert social network for user.
	 * @param string  $network
	 * @param integer $username
	 * @param string  $auth_type
	 * @param string  $auth_code
	 */
	public function insert($network, $username, $auth_type, $auth_code) {
		$bindVarNVTArray = array(
		array(':network', getSafeDatabaseText((string)$network), PDO::PARAM_STR),
		array(':username', $username, PDO::PARAM_INT),
		array(':auth_type', getSafeDatabaseText((string)$auth_type), PDO::PARAM_STR),
		array(':auth_code', getSafeDatabaseText((string)$auth_code), PDO::PARAM_STR),
		);
		return $this->executeInsert(self::$queries['ADD_SOCIAL_NETWORK'], 'ADD_SOCIAL_NETWORK', $bindVarNVTArray);
	}

	/* Update social network for user.
	 * @param string  $network
	 * @param integer $username
	 * @param string  $auth_type
	 * @param string  $access_token
	 * @param integer $expires
	 */
	public function update($network, $username, $auth_type, $access_token, $expires) {
		$params = array();
		if ($access_token) {
			$params['access_token'] = getSafeDatabaseText((string)$access_token);
		}
		if ($expires) {
			$params['expires'] = getSafeDatabaseText((string)$expires);
		}
		if (count($params > 0 )) {
			$sql = $this->generateUpdateSql('SocialNetworks', array('network','username'), array($network,$username), $params);
			$status = $this->executeUpdate($sql);
			return $status;
		}
	}

	/* Delete social network for user.
	 * @param string  $network
	 * @param integer $username
	 */
	public function delete($network, $username) {
		if (!empty($network)) {
			$bindVarNVTArray = array(
			array(':network', getSafeDatabaseText((string)$network), PDO::PARAM_STR),
			array(':username', $username, PDO::PARAM_INT),
			);
			return $this->executeDelete(self::$queries['DELETE_SOCIAL_NETWORK'], 'DELETE_SOCIAL_NETWORK', $bindVarNVTArray);
		} else {
			$bindVarNVTArray = array(
			array(':username', $username, PDO::PARAM_INT),
			);
			return $this->executeDelete(self::$queries['DELETE_SOCIAL_NETWORKS'], 'DELETE_SOCIAL_NETWORKS', $bindVarNVTArray);
		}
	}
}