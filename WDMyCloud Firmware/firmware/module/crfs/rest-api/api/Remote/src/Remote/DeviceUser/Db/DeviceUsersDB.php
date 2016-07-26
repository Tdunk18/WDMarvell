<?php
namespace Remote\DeviceUser\Db;
/**
 * \file db\deviceusersdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

use Core\Rest\Exception;
use Util\WebServerUtils;
use Remote\DeviceUser\DeviceUser;
use Core\Logger;

/**
 *
 *
 */
class DeviceUsersDB extends \DBAccess {

    const COL_DEVICE_USER_ID = "device_user_id";
    const COL_USER_ID = "username";
    const COL_AUTH = "auth";
    const COL_EMAIL = "email";
    const COL_NAME = "name";
    const COL_TYPE = "type";
    const COL_IS_ACTIVE = "is_active";
    const COL_DAC = "dac";
    const COL_DAC_EXPIRATION = "dac_expiration";
    const COL_ENABLE_WAN_ACCESS = "enable_wan_access";
    const COL_TYPE_NAME = "type_name";
    const COL_APPLICATION = "application";
    const COL_CREATED_DATE = "created_date";

    /**
     * @var \Remote\DeviceUser\Db\DeviceUsersDb
     */
    protected static $_instance;

    static $queries = array(
        'VALID_DEVICE_USER' => "SELECT COUNT(*) AS COUNT FROM DeviceUsers  WHERE device_user_id = :device_user_id and auth = :auth",
        'COUNT_DEVICE_USERS' => "SELECT COUNT(*) AS COUNT FROM DeviceUsers",
        'WAN_ACCESS_ENABLED' => "SELECT enable_wan_access, dac_expiration FROM DeviceUsers WHERE device_user_id = :device_user_id",
    	'DAC_NOT_EXPIRED' => "SELECT dac_expiration FROM DeviceUsers WHERE device_user_id = :device_user_id",
        'GET_ALL_DEVICE_USERS' => "SELECT * FROM DeviceUsers",
        'GET_DEVICE_USERS_FOR_USERNAME' => "SELECT * FROM DeviceUsers WHERE username = :username",
        'GET_DEVICE_USER_WITH_USERNAME' => "SELECT DISTINCT du.device_user_id, du.username, du.email, du.type, du.name, du.is_active, du.email, du.created_date, du.enable_wan_access, du.type_name, du.application FROM DeviceUsers du LEFT JOIN Users u ON u.username = du.username LEFT JOIN AlbumAccess aa ON aa.username = du.username LEFT JOIN Albums a ON a.album_id = aa.album_id WHERE du.username = :username AND a.owner = :owner",
        'GET_SHARED_USERS_FOR_USERNAME' => "SELECT distinct du.device_user_id, du.username, du.email, du.type, du.name, du.is_active, du.email, du.created_date, du.enable_wan_access, du.type_name, du.application FROM AlbumAccess aa LEFT JOIN DeviceUsers du ON du.username = aa.username LEFT JOIN Users u ON u.username = du.username LEFT JOIN Albums a ON a.album_id = aa.album_id WHERE a.owner = :username AND u.local_username = ''",
        'GET_DEVICE_USERS_FOR_EMAIL_PARTIAL' => "SELECT * FROM DeviceUsers WHERE email LIKE :email",
        'GET_DEVICE_USERS_FOR_EMAIL' => "SELECT * FROM DeviceUsers WHERE email = :email",
        'GET_USERS_FOR_EMAIL_PARTIAL' => "SELECT DISTINCT username FROM DeviceUsers WHERE email LIKE :email",
        'GET_USERS_FOR_EMAIL' => "SELECT DISTINCT username FROM DeviceUsers WHERE email = :email",
    	'GET_DEVICE_USERS_FOR_USER_WITH_EMAIL' => "SELECT * FROM DeviceUsers WHERE username = :username AND email = :email",
        'GET_DEVICE_USER' => "SELECT * FROM DeviceUsers WHERE device_user_id = :device_user_id",
        'INSERT_DEVICE_USER' => "INSERT INTO DeviceUsers (username, device_user_id, auth, email, type, name, is_active, created_date, enable_wan_access, dac, dac_expiration)
											VALUES (:username, :device_user_id, :auth, :email, :type, :name, :is_active, :now, :enable_wan_access, :dac, :dac_expiration)",
        'DELETE_DEVICE_USER' => "DELETE FROM DeviceUsers WHERE device_user_id = :device_user_id",
        'DELETE_DEVICE_USERS' => "DELETE FROM DeviceUsers WHERE username = :username",
        'DELETE_ALL_DEVICE_USERS' => "DELETE FROM DeviceUsers",
        'GET_POTENTIAL_COLLISIONS' => "SELECT COUNT(*) FROM DeviceUsers WHERE replace = :replace",
		'GET_POTENTIAL_EMAILS_COLLISIONS' => "SELECT COUNT(*) FROM DeviceUsers WHERE email IN (:emails)",
    );

    function __construct() {

    }

    /**
     * Returns a singleton instance of the DeviceUsersDb
     *
     * @return \Remote\DeviceUser\Db\DeviceUsersDb
     */
    public static function &getInstance()
    {
        if (!isset(static::$_instance))
        {
            static::$_instance = new static;
        }

        return static::$_instance;
    }

    private function resultsToDeviceUsers($results) {
    	$deviceUsers = array();
    	foreach ($results as $resultsArray) {
    		 $deviceUsers[] = new DeviceUser($resultsArray);
    	}
    	return $deviceUsers;
    }

    /**
     *
     * @param $username
     */
    function getDeviceUsersForUser($username = null) {
        if (empty($username)) {
            $bindVarNVTArray = null;
            $results =  $this->executeQuery(self::$queries['GET_ALL_DEVICE_USERS'], 'GET_ALL_DEVICE_USERS', $bindVarNVTArray);
        } else {
            $bindVarNVTArray = array(
                array(':username', $username, \PDO::PARAM_STR),
            );

            $results = $this->executeQuery(self::$queries['GET_DEVICE_USERS_FOR_USERNAME'], 'GET_DEVICE_USERS_FOR_USERNAME', $bindVarNVTArray);
        }
        return  $this->resultsToDeviceUsers($results);
    }

    /**
     *
     * @param $username
     */
    function getOwnedDeviceUsersForUser($username = null) {
        $bindVarNVTArray = array(
            array(':username', $username, \PDO::PARAM_STR),
        );
        $results =  $this->executeQuery(self::$queries['GET_DEVICE_USERS_FOR_USERNAME'], 'GET_DEVICE_USERS_FOR_USERNAME', $bindVarNVTArray);
        return  $this->resultsToDeviceUsers($results);
    }

    /**
     *
     * @param $username
     */
    function getDeviceUserWithUser($username) {
        $owner = getSessionUserId();
        if (empty($username) || isAdmin($username)) {
            $bindVarNVTArray = null;
            $results = $this->executeQuery(self::$queries['GET_ALL_DEVICE_USERS'], 'GET_ALL_DEVICE_USERS', $bindVarNVTArray);
        } else {
            $bindVarNVTArray = array(
                array(':username', $username, \PDO::PARAM_STR),
                array(':owner', $owner, \PDO::PARAM_INT),
            );
             $results = $this->executeQuery(self::$queries['GGET_DEVICE_USER_WITH_USERNAME'], 'GGET_DEVICE_USER_WITH_USERNAME', $bindVarNVTArray);
        }
        return  $this->resultsToDeviceUsers($results);
    }

    /**
     *
     * @param $device_user_id
     * @param $auth
     */
    function isValid($device_user_id, $auth) {

        $bindVarNVTArray = array(array(':device_user_id', getSafeDatabaseText($device_user_id), \PDO::PARAM_INT),
            array(':auth', getSafeDatabaseText($auth), \PDO::PARAM_STR));
        $rows = $this->executeQuery(self::$queries['VALID_DEVICE_USER'], 'VALID_DEVICE_USER', $bindVarNVTArray);
        $retVal = false;
        foreach ($rows as $row) {
            $count = $row['COUNT'];
            if ($count == 1) {
                $retVal = true;
            }
            break;
        }
        return $retVal;
    }

    /**
     *
     * @return Ambigous <number, unknown>
     */
    function getNumberOfDeviceUsers() {
        $count = 0;
        $rows = $this->executeQuery(self::$queries['COUNT_DEVICE_USERS'], 'COUNT_DEVICE_USERS');
        foreach ($rows as $row) {
            $count = $row['COUNT'];
            break;
        }
        return $count;
    }

    /**
     *
     * @param $device_user_id
     * @param $auth
     */
    function isWanAccessEnabled($device_user_id) {
        $bindVarNVTArray = array(array(':device_user_id', $device_user_id, \PDO::PARAM_INT));
        $rows = $this->executeQuery(self::$queries['WAN_ACCESS_ENABLED'], 'WAN_ACCESS_ENABLED', $bindVarNVTArray);
        foreach ($rows as $row) {
            if ( $row['dac_expiration'] == NULL ||
            	 ($row['enable_wan_access'] && ($row['dac_expiration'] > (new \DateTime())->getTimestamp()))
            	)
                return true;
        }
        return false;
    }

    /**
     *
     * @param $device_user_id
     */
    function isDACNotExpired($device_user_id) {
    	$bindVarNVTArray = array(array(':device_user_id', $device_user_id, \PDO::PARAM_INT));
    	$rows = $this->executeQuery(self::$queries['DAC_NOT_EXPIRED'], 'DAC_NOT_EXPIRED', $bindVarNVTArray);
    	foreach ($rows as $row) {
    		if ( $row['dac_expiration'] == NULL ||
    				($row['dac_expiration'] > (new \DateTime())->getTimestamp())
    		)
    			return true;
    	}
    	return false;
    }

    /**
     *
     * @param $username
     */
    function getSharedUsersForUsername($username) {
        if (empty($username)) {
            $bindVarNVTArray = null;
            $results = $this->executeQuery(self::$queries['GET_ALL_DEVICE_USERS'], 'GET_ALL_DEVICE_USERS', $bindVarNVTArray);
        } else {
            $bindVarNVTArray = array(
                array(':username', $username, \PDO::PARAM_STR),
            );
            $results =  $this->executeQuery(self::$queries['GET_SHARED_USERS_FOR_USERNAME'], 'GET_SHARED_USERS_FOR_USERNAME', $bindVarNVTArray);
        }
        return $this->resultsToDeviceUsers($results);
    }

    /**
     * Returns an array of Device Users where the Email address is an exact or partial match for the given e-mail address string.
     * Example: 'ralph' will match: 'ralph@gmail.com','ralph@aol.com', whereas: 'josey@yahoo.com' will only match 'josey@yahoo.com'
     * @param $email full or partial e-maikl address to match
     * @param $partialMatch = if true perform a partial match, default is false
     */
    function getDeviceUsersForEmail($email, $partialMatch=false) {
        $bindVarNVTArray = array(
            array(':email', $email, \PDO::PARAM_STR)
        );
       if (!partialMatch) {
	       $results =  $this->executeQuery(self::$queries['GET_DEVICE_USERS_FOR_EMAIL'], 'GET_DEVICE_USERS_FOR_EMAIL', $bindVarNVTArray);
       }
       else {
	       	$results =  $this->executeQuery(self::$queries['GET_DEVICE_USERS_FOR_EMAIL_PARTIAL'], 'GET_DEVICE_USERS_FOR_EMAIL_PARTIAL', $bindVarNVTArray);
       }
       return $this->resultsToDeviceUsers($results);
    }

    /**
     * Returns an array of Usernames where the Email address is an exact or partial match in the DeviceUsers table for the given e-mail address string.
     * Example: 'ralph' will match: 'ralph@gmail.com','ralph@aol.com', whereas: 'josey@yahoo.com' will only match 'josey@yahoo.com'
     * @param $email full or partial e-maikl address to match
     * @param $partialMatch = if true perform a partial match, default is false
     */
    function getUsersForEmail($email, $partialMatch=false) {
    	$bindVarNVTArray = array(
    			array(':email', $email, \PDO::PARAM_STR)
    	);
    	if (!partialMatch) {
    		$results =  $this->executeQuery(self::$queries['GET_USERS_FOR_EMAIL'], 'GET_USERS_FOR_EMAIL', $bindVarNVTArray);
    	}
    	else {
    		$results =  $this->executeQuery(self::$queries['GET_USERS_FOR_EMAIL_PARTIAL'], 'GET_USERS_FOR_EMAIL_PARTIAL', $bindVarNVTArray);
    	}
    	$usernames = array();
    	foreach($results as $result) {
    		$usernames[] = $result['username'];
    	}
    	return $usernames;
    }

    /**
     *
     *
     * @param unknown $username
     * @param unknown $email
     */
    function getDeviceUsersForUsernameWithEmail($username, $email) {
    	$bindVarNVTArray = array(
    			array(':username', $username, \PDO::PARAM_STR),
    			array(':email', $email, \PDO::PARAM_STR)
    	);
    	$results =  $this->executeQuery(self::$queries['GET_DEVICE_USERS_FOR_USER_WITH_EMAIL'], 'GET_DEVICE_USERS_FOR_USER_WITH_EMAIL', $bindVarNVTArray);
    	return $this->resultsToDeviceUsers($results);
    }

    /**
     *
     * @param $device_user_id
     * @return Remote\DeviceUser\DeviceUser
     */
    function getDeviceUser($device_user_id) {
        $bindVarNVTArray = array(array(':device_user_id', $device_user_id, \PDO::PARAM_INT));
        $results = $this->executeQueryAndFetchOneRow(self::$queries['GET_DEVICE_USER'], 'GET_DEVICE_USER', $bindVarNVTArray);
        if (!empty($results)) {
	        return new DeviceUser($results);
        }
        return null;
    }

	/**
	 * CrateDeviceUsers: Bulk-Inserts an array of Device Users in a single transaction. The method does guarantee
	 * the transactional integrity.
	 * @param array $dacUsers - a multidimensional associative array to insert into deviceusers table.
	 * The format of the array should be:
	 * 	[ 0 =>
	 * 		{'username' => '', 'email' => '', 'device_user_id' => 1234567, 'device_user_auth' => '12ebf5d211b61c5bb2cd20153d84a7b1',
	 * 			'type_name' => 'webuser', 'type' => '', 'is_active' => 1, 'enable_wan_access' => 1, 'dac' => '', 'dac_expiration' => null},
	 * 	  1 => {}
	 * 	]
	 *  Note:
	 *  - username, device_user_id and device_user_auth - are required. However, this method assumes validation checks done
	 *     at higher level and does NOT perform any validation at this level and let the Db errors escalate, if any. If
	 *  - key/value not provided, defaulted to null.
	 *  - type_name - defaulted to an empty string.
	 *  - type - defaulted to 'webuser'
	 *  - is_active & enable_wan_access are defaulted to 1, if not provided.
	 *  - dac & dac_expiration - if not provided, defaulted to null values.
	 * @throws Exception
	 */
	function createDeviceUsers(array $dacUsers)
	{
		// The method may appear performing individual inserts however the parameter binding and prepared statement are done only
		// once saving on statement parsing and internal data transfers. This approach of Bulk-Insert saves time from 2.95 seconds
		// to 200-300ms (Sequoia) & 20-40ms (Alpha) to insert 25 rows (users) - consistently and at the same cost as it takes to
		// insert a single row. Poorman's (PHP's) way of bulk-insert.
		$username = ''; $device_user_id = -1; $device_user_auth = ''; $email = '';
		$typename = ''; $type = ''; $active = 1; $enableWanAccess = 1;
		$dac = null; $dacExpiration = null; $created_date = time();

		if(ORION_DEBUG) {
			// This array to satisfy logging if/when enabled.
			$bindVarNVTArray =
				[
					[':username', $username, \PDO::PARAM_STR],
					[':device_user_id', $device_user_id, \PDO::PARAM_INT],
					[':auth', $device_user_auth, \PDO::PARAM_STR],
					[':email', $email, \PDO::PARAM_STR],
					[':name', $typename, \PDO::PARAM_STR],
					[':type', $type, \PDO::PARAM_STR],
					[':is_active', $active, \PDO::PARAM_BOOL],
					[':enable_wan_access', $enableWanAccess, \PDO::PARAM_BOOL],
					[':now', $created_date, \PDO::PARAM_INT],
					[':dac', $dac, \PDO::PARAM_STR],
					[':dac_expiration', $dacExpiration, \PDO::PARAM_INT]
				];
		}

		$sql = self::$queries['INSERT_DEVICE_USER'];
		$db = $this->_getDb();
		try {
			$stmt = $db->prepare($sql);
			// Bind first - yes, it looks counter-intuitive to bind like this but this is the only way it works.
			// Do NOT attempt to foreach on the array then the binding gets messed up (Welcome to PHP!!!).
			$stmt->bindParam(':username', $username, \PDO::PARAM_STR);
			$stmt->bindParam(':device_user_id', $device_user_id, \PDO::PARAM_INT);
			$stmt->bindParam(':auth', $device_user_auth, \PDO::PARAM_STR);
			$stmt->bindParam(':email', $email, \PDO::PARAM_STR);
			$stmt->bindParam(':name', $typename, \PDO::PARAM_STR);
			$stmt->bindParam(':type', $type, \PDO::PARAM_STR);
			$stmt->bindParam(':is_active', $active, \PDO::PARAM_BOOL);
			$stmt->bindParam(':enable_wan_access', $enableWanAccess, \PDO::PARAM_BOOL);
			$stmt->bindParam(':now', $created_date, \PDO::PARAM_INT);
			$stmt->bindParam(':dac', $dac, \PDO::PARAM_STR);
			$stmt->bindParam(':dac_expiration', $dacExpiration, \PDO::PARAM_INT);

			$start = microtime(true);
			$db->beginTransaction();
			foreach ($dacUsers as $dacUser) {
				// Looks like un-used/referenced variables but don't worry it works.
				$username = isset($dacUser['username']) ? $dacUser['username'] : null;
				$device_user_id = isset($dacUser['device_user_id']) ? $dacUser['device_user_id'] : null;
				$device_user_auth = isset($dacUser['device_user_auth']) ? getSafeDatabaseText($dacUser['device_user_auth']) : null;
				$email = isset($dacUser['email']) ? getSafeDatabaseText($dacUser['email']) : '';
				$typename = isset($dacUser['type_name']) ? getSafeDatabaseText($dacUser['type_name']) : '';
				$type = isset($dacUser['type']) && !empty($dacUser['type']) ? getSafeDatabaseText($dacUser['type']) : 'webuser';
				$active = isset($dacUser['active']) ? $dacUser['active'] : 1;
				$enableWanAccess = isset($dacUser['enable_wan_access']) ? $dacUser['enable_wan_access'] : 1;
				$created_date = time();
				$dac = isset($dacUser['dac']) ? $dacUser['dac'] : null;
				$dacExpiration = isset($dacUser['dac_expiration']) ? $dacUser['dac_expiration'] : null;

				$ret = $stmt->execute();
				//Logger::getInstance()->info(__FUNCTION__ . ", Insert sql: $sql, return: " . $ret);
			}
			$db->commit();
			$totalTime = (microtime(true) - $start);
			Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);
			Logger::getInstance()->info(__FUNCTION__ . ': Number of Device Users Bulk-Inserted: ' . count($dacUsers) . ' and Time taken: '. $totalTime);

		} catch(PDOException $pdoEx) {
			$db->rollBack();
			//var_dump($e);
			Logger::getInstance()->err(__FUNCTION__ . ", Exception in bulk-insert sql: $sql, exception: " . $pdoEx);
			throw new Exception('Bulk-insert Sql Exception' . $pdoEx->getMessage(), $pdoEx->getCode(), 'DeviceUsersDB');
		}
	}

    /**
     *
     * @param $username
     * @param $device_user_id
     * @param $auth
     * @param $email
     */
    function createDeviceUser($username, $device_user_id, $auth, $email, $name, $type, $active, $enableWanAccess,
        $dac = null, $dacExpiration = null)
    {
        $bindVarNVTArray =
        [
            [':username', $username, \PDO::PARAM_STR],
            [':device_user_id', $device_user_id, \PDO::PARAM_INT],
            [':auth', getSafeDatabaseText($auth), \PDO::PARAM_STR],
            [':email', getSafeDatabaseText($email), \PDO::PARAM_STR],
            [':name', getSafeDatabaseText($name), \PDO::PARAM_STR],
            [':type', getSafeDatabaseText($type), \PDO::PARAM_STR],
            [':is_active', $active, \PDO::PARAM_BOOL],
            [':enable_wan_access', $enableWanAccess, \PDO::PARAM_BOOL],
            [':now', time(), \PDO::PARAM_INT],
        ];

        array_push($bindVarNVTArray, isset($dac) ? [':dac', $dac, \PDO::PARAM_STR] : [':dac', NULL, \PDO::PARAM_NULL]);
        array_push($bindVarNVTArray, isset($dacExpiration) ? [':dac_expiration', $dacExpiration, \PDO::PARAM_INT]
                                                           : [':dac_expiration', NULL, \PDO::PARAM_NULL]);

        return $this->executeInsert(self::$queries['INSERT_DEVICE_USER'], 'INSERT_DEVICE_USER', $bindVarNVTArray);
    }

    // Update device user
    function updateDeviceUser($deviceUserId, $type, $name, $email, $isActive, $typeName, $application) {

        $rowValues =
        	array('type' => getSafeDatabaseText($type),
        	  	  'name' => getSafeDatabaseText($name),
        		  'email' => getSafeDatabaseText($email),
        		  'is_active' => getSafeDatabaseText((int)$isActive),
        		  'type_name' => getSafeDatabaseText($typeName),
        		  'application' => getSafeDatabaseText($application));
		if ($isActive) {
			//clear DAC expiration time if Device User is activated
			$rowValues['dac_expiration'] = "";
		}

        $sql = $this->generateUpdateSql('DeviceUsers', 'device_user_id', (int) $deviceUserId, $rowValues);
        return $this->executeUpdate($sql);
    }

    function updateDeviceUserUsername($deviceUserId, $userName) {
    	$userName = getSafeDatabaseText($userName);
    	$sql = $this->generateUpdateSql('DeviceUsers', 'device_user_id', (int) $deviceUserId, array('username' => $userName));
    	return $this->executeUpdate($sql);
    }


    function updateDeviceUserById($deviceUserId, $updateArgs) {
        return $this->_updateDeviceUserByX("device_user_id", $deviceUserId, $updateArgs);
    }

    private function _updateDeviceUserByX($colFilter, $filterValue, $updateArgs) {
        $params = array();
        $logParam = "PARAMS: (";
        foreach ($updateArgs as $colName => $colValue) {
            $logParam .= "$colName=$colValue,";
            if ($colValue != null) {

                if (is_string($colValue)) {
                    $params[$colName] = getSafeDatabaseText((string) $colValue);
                } else {
                    $params[$colName] = $colValue;
                }
            }
        }
        $logParam .= ')';

        if (count($params) > 0) {
            $sql = $this->generateUpdateSql('DeviceUsers', $colFilter, $filterValue, $params);
            $status = $this->executeUpdate($sql);

            //printf("<PRE>%s.%s[%s]</PRE>\n", __METHOD__, 'sql', $sql);
            //printf("<PRE>%s.%s[%s]</PRE>\n", __METHOD__, 'status', $status);

            if ($status != true) {
                Logger::getInstance()->err(__FUNCTION__ . "Error executing sql update: $sql");
            }
            return $status;
        } else {
            return false;
        }
    }

    function deleteDeviceUser($device_user_id) {
        $bindVarNVTArray = array(array(':device_user_id', $device_user_id, \PDO::PARAM_INT));
        //
        // Delete corresponding apache user
        //
		WebServerUtils::getInstance()->deleteWebUser($device_user_id);
        return $this->executeDelete(self::$queries['DELETE_DEVICE_USER'], 'DELETE_DEVICE_USER', $bindVarNVTArray);
    }

    function deleteDeviceUsers($userId) {
        $bindVarNVTArray = array(array(':username', $userId, \PDO::PARAM_INT));

        return $this->executeDelete(self::$queries['DELETE_DEVICE_USERS'], 'DELETE_DEVICE_USERS', $bindVarNVTArray);
    }

    function deleteAllDeviceUser() {
        return $this->executeUpdate(self::$queries['DELETE_ALL_DEVICE_USERS']);
    }

    function checkIfExistsDeviceUser($params){
		$paramMap = array(	'dac' => 'dac',
							'auth' => 'auth',
							'device_user_id' => 'device_user_id');
		reset($params);
		$column = key($params);
		if(count($params) !== 1 || !isset($paramMap[$column])){
			return false;
		}

		$query = self::$queries['GET_POTENTIAL_COLLISIONS'];

		$query = str_replace('replace', $column, $query);

		$bindVarNVTArray = array(
                array(':'.$column, $params[$column], \PDO::PARAM_STR)
            );

        $rows = $this->executeQuery($query, 'GET_POTENTIAL_COLLISIONS'.$column, $bindVarNVTArray);

        return (isset($rows[0]) &&  isset($rows[0]['COUNT(*)'])) ? (int)$rows[0]['COUNT(*)'] : false;
	}

	/**
	 * Method to check if the given set of emailIds exists in the database. To avoid a different implementation,
	 * the second parameter can be used to get the count of matched records or a boolean (true|false) per caller needs.
	 *
	 * @param array $emailIds - an array of email Ids to check
	 * @param bool $returnCountInstead - If set to true the the method returns the matched count
	 * 									else returns boolean value. The default is false.
	 * @return bool|int - based on the second parameter the return type could be count of matching emails or boolean flag.
	 */
	function checkIfExistsEmailIds(array $emailIds, $returnCountInstead = false){
		if(empty($emailIds) || !is_array($emailIds))
			return false;

		// Create a string for the parameter placeholders filled to the number of emailIds given.
		// e.g. (?,?,?.....?)
		$place_holders = implode(',', array_fill(0, count($emailIds), '?'));

		$query = self::$queries['GET_POTENTIAL_EMAILS_COLLISIONS'];
		$query = str_replace(':emails', $place_holders, $query);

		$rows = $this->executeSelectIn($query, 'GET_POTENTIAL_EMAILS_COLLISIONS', $emailIds);

		// get Count
		$ret = (isset($rows[0]) &&  isset($rows[0]['COUNT(*)'])) ? (int)$rows[0]['COUNT(*)']: 0;

		if($returnCountInstead)
			return $ret;

		return $ret == 0 ? false : true;
	}
}