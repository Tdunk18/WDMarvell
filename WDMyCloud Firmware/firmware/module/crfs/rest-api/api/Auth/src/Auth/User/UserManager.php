<?php
/**
 * \file User\UserManager.php\
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 *
 *
 */

namespace Auth\User;

use \Remote\DeviceUser\Db\DeviceUsersDB;
use \Core\SystemInfo;
use \Core\ClassFactory;

abstract class UserManager  {

	private static $instance = null;

	/**
	 * getInstance()
	 *
	 * Returns the Operating System-specific singleton instance of this abstract class
	 *
	 * @return \Auth\User\UserManager
	 */
	static public function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = ClassFactory::getImplementation('Auth\\User\\UserManager', array("osname"=>SystemInfo::getOSName()));
		}
		return self::$instance;
	}

	/**
	 * getUser
	 *
	 * Returns information of specified user
	 *
	 * @param integer $username of the specified user. If null, returns all user objects
	 * @return array of User objects
	 */
	abstract public  function getUser($username=null);

	/**
	 * Creates a new user in the Users table
	 * @param string $username
	 * @param string $password
	 * @param string $fullname
	 * @param boolean $isAdmin
	 */
	abstract public function createUser($username, $password=null, $fullname=null, $isAdmin=false);

	/**
	 * updateUser
	 *
	 * Updates a single user row in the User table
	 *
	 * @param string $username the username of the user account to modify
	 * @param string $newUsername the new username, if it is being changed
	 * @param string $fullname holds the new full name of the user
	 * @param string $oldPassword holds the old password of the user
	 * @param string $newPassword holds the new password of the user
	 * @param boolean $isAdmin the new boolean status of whether this user is an admin
	 * @return boolean $status indicates whether the update succeeded
	 */
	abstract public function updateUser($username, $newUsername=null, $fullname=null, $oldPassword=null, $newPassword=null, $isAdmin=null, $changePassword=false);

	/**
	 * deleteUser
	 *
	 * Deletes a user that is identified based on the userId
	 *
	 * @param string $username username of user account to delete
	 * @return boolean indicates whether the update succeeded
	 */
	abstract public function deleteUser($username);

	/**
	 * deleteUsers
	 *
	 * Deletes a set of user that are identified based on the username
	 *
	 * @param array $usernames an array usernames of user accounts to delete
	 * @return boolean indicates whether the update succeeded
	 */
	abstract public function deleteUsers(array $usernames);

	/**
	 * Returns the userId of the user identified by the supplied Local Username
	 * This is retained for backward-compatibility as we no longer maintain a seperate User ID
	 * @param String $username identifier of the user (column in the Users table)
	 * @return integer userId of the specified User
	 * @deprecated you no longer need to call this function as UserId and username are the same
	 */
	abstract public function getUserId($username);

	/**
	 * Returns the admin status of the user identified by the supplied userId
	 * @param string $username username of the user (primary key of Users table)
	 * @return boolean admin status of the specified User
	 */
	abstract public function isAdmin($username=null);

	/**
	 * Returns the cloudholder status of the user identified by the supplied userId
	 * @param string $username username of the user
	 * @return boolean cloudholder status of the specified User
	 */
	abstract public function isCloudholder($username=null);

	/**
	 * Determines whether the specified Local Username exists
	 * @param String $localUsername identifies the user being checked for validity
	 * @return boolean indicates if such a user exists.
	 */
	abstract function isValid($username=null);

    /**
     * Generates username from the email
     * @param String $email
     * @return String username
     */
    abstract function generateUserNameFromEmail($email);

    /**
     * Checks if username is reserved
     * @param String $username
     * @return Bool true if username is reserved
     */
    abstract function isReservedUsername($username);

    /**
     * Checks if fullname conforms to the allowed format
     * @param String $fullname
     * @return Bool true if fullname conforms to the allowed format
     */
    abstract function isValidFullnameFormat($fullname);

    /**
     * Checks if username conforms to the allowed format
     * @param String $username
     * @return Bool true if username conforms to the allowed format
     */
    abstract function isValidUsernameFormat($username);
	
	/**
	 * Determines whether the specified Group exists
	 * @param String $groupName identifies the group being checked for validity
	 * @return boolean indicates if such a group exists.
	 */
	abstract function isValidGroup($groupName);
	
	/**
	 * Returns information about all group memeberships or filters
	 * them by username or group name
	 *
	 * @param String $username  - username of the specified user or null. If null, returns all user objects
	 * @param String $groupName  -  group name  of the specified group or null. If null, returns all user objects
	 * @return array of Group objects
	 */
	abstract function getGroupMemberships($username, $groupName);
	
	/**
	 * Create a record about group memeberships 
	 * for the username or group name combination passed
	 *
	 * @param String $username  - username of the specified user
	 * @param String $groupName  - group name of the specified group
	 * @return true indicates if the creation was succesful
	 */
	abstract function createGroupMembership($username, $groupName);
	
	
	/**
	 * Delete a record about group memeberships
	 * for the username or group name combination passed
	 *
	 * @param String $username  - username of the specified user
	 * @param String $groupName  - group name of the specified group
	 * @return true indicates if the deletion was succesful
	 */
	abstract function deleteGroupMembership($username, $groupName);
	
	/**
	 * Returns the local username of the user identified by the supplied userId
	 * This is retained for backward-compatibility as we no longer maintain a seperate User ID,
	 * so userId is the same as $username
	 * @param integer $userId identifier of the user (primary key of Users table)
	 * @return String local username of the specified User
	 * @deprecated you no longer need to call this function as UserId and username are the same
	 */
	public function getUsername($userId) {
		return $userId;
	}

	/**
	 * Returns the local username of the user identified by the supplied userId
	 * This is retained for backward-compatibility as we no longer maintain a seperate User ID,
	 * so userId is the same as $username
	 * @param integer $userId identifier of the user (primary key of Users table)
	 * @return String local username of the specified User
	 * @deprecated you no longer need to call this function as UserId and username are the same
	 */
	public function getLocalUsername($userId) {
		return $userId;
	}


	/**
	 * getUsersWithEmail - Returns users with specified partial email
	 *
	 * @param $email
	 */
	public function getUsersWithEmail($email, $partialMatch = false){
		$usernames = DeviceUsersDB::getInstance()->getUsersForEmail($email, $partialMatch);
		$users = array();
		foreach ($usernames as $username) {
			$user = $this->getUser($username);
			if (!empty($user)) {
				$users[] = $user;
			}
		}
		return $users;
	}
}
