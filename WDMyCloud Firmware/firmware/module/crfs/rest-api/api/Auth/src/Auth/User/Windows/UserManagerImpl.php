<?php

namespace Auth\User\Windows;

use Auth\User\UserManager;
use Auth\User\UserSecurity;
use Auth\User\User;

class UserManagerImpl extends UserManager {

    // WDWindowsOrionServer(.dll): WindowsPermissionCheck COM Interface
    //
    private $wdOrionCOMSrvrClsId = "{6C57A567-4F72-4196-A87F-F13FA5EA66D6}";
    private $wdOrionCOMSrvrProgId = "WindowsServerInfoProvider.1";

    // All remote users belong to this group on Sentinel
    //
    private $WinUserGroupName = "WSSUsers";

    function getWdOrionCOMinstance()
    {
        return new \COM($this->wdOrionCOMSrvrProgId);
    }

    /**
	 * getUser
	 *
	 * Returns information of specified user
	 *
	 * @param integer $username of the specified user. If null, returns all user objects
	 * @return array of User objects
	 */
	public  function getUser($username=null) {
        if(empty($username))
            return $this->getUserObjects();
        else
            return $this->getUserObject($username);
	}


	/**
	 * Creates a new user in the Users table
	 * @param string $username
	 * @param string $password
	 * @param string $fullname
	 * @param boolean $isAdmin
	 */
	public  function createUser($username, $password=null, $fullname=null, $isAdmin=false) {

	}

	/**
	 * updateUser
	 *
	 * Updates a single user row in the User table
	 *
	 * @param string $username the username of the user account to modify
	 * @param string $newUsername the newuser name, if it is being changed
	 * @param string $fullname holds the new full name of the user
	 * @param string $oldPassword holds the old password of the user
	 * @param string $newPassword holds the new password of the user
	 * @param boolean $isAdmin the new boolean status of whether this user is an admin
	 * @return boolean $status indicates whether the update succeeded
	 */
	public function updateUser($username, $newUsername=null, $fullname=null, $oldPassword=null, $newPassword=null, $isAdmin=null, $changePassword=false) {

	}


	/**
	 * deleteUser
	 *
	 * Deletes a user that is identified based on the userId
	 *
	 * @param integer $username
	 * @return boolean indicates whether the update succeeded
	*/
	public  function deleteUser($username) {

	}

	/**
	 * Updates the isAdmin status of the user identified by localUserName
	 * @param String $username identifies which user is to be updated
	 * @param boolean $is_admin the new boolean status of whether this user is an admin
	 */
	public  function updateLocalUser($username, $isAdmin) {

	}

	/**
	 * Returns the userId of the user identified by the supplied Local Username
	 * This is retained for backward-compatibility as we no longer maintain a seperate User ID
	 * @param String $username identifier of the user (column in the Users table)
	 * @return integer userId of the specified User
	 * @deprecated you no longer need to call this function as UserId and username are the same
	 */
	public function getUserId($username) {

	}

	/**
	 * deleteUserId
	 *
	 * Deletes a user that is identified based on the userId.
	 *
	 * @param integer $userId
	 * @return boolean indicates whether the delete succeeded
	 * @deprecated UserId and Username are now the same, use deleteUsername() instead
	*/
	public  function deleteUserId($username) {

	}

	/**
	 * deleteUsername
	 *
	 * Deletes a user that is identified based on the username.
	 *
	 * @param String $localUserName
	 * @return boolean indicates whether the delete succeeded
	*/
	public function deleteUsername($username) {

	}

	/**
	 * Deletes a user that is identified based on the localUserName (e.g. delete 'eric').
	 * @param String $username
	 * @return boolean indicates whether the update succeeded
	*/
	public function deleteLocalUser($username) {

	}

	/**
	 * Returns the admin status of the user identified by the supplied userId
	 * @param integer $userId identifier of the user (primary key of Users table)
	 * @return boolean admin status of the specified User
	*/
	public  function isAdmin($username=null) {
		if ($username == null) {
			$username = UserSecurity::getInstance()->getSessionUsername();
		}
        $userObj = $this->getUserObject($username);
        if(!isset($userObj) || $userObj == NULL)
            return false;
        else{
            return $userObj->getIsAdmin();
        }
	}

	/**
	 * Determines whether the specified Local Username exists in the Users table
	 * @param String $localUsername identifies the user being checked for validity
	 * @return boolean indicates if such a user exists.
	*/
	public  function isValid($username=null) {
        //return true;
		if ($username == null) {
			$username = UserSecurity::getInstance()->getSessionUsername();
		}
        return $this->userNameExists($username);
	}

    /**
     * Generates username from the email
     * @param String $email
     * @return String username
     */
     public function generateUserNameFromEmail($email){
     }

    /**
    * Checks if username is reserved
    * @param String $username
    * @return Bool true if username is reserved
    */
     public function isReservedUsername($username){
     }

     /**
     * Checks if username conforms to the allowed format
     * @param String $username
     * @return Bool true if username conforms to the allowed format
     */
     public function isValidUsernameFormat($username){
     }

     /**
     * Checks if fullname conforms to the allowed format
     * @param String $fullname
     * @return Bool true if fullname conforms to the allowed format
     */
     public function isValidFullnameFormat($fullname){
     }

    /**
	 * Creates a deviceUser and returns and instance of the DeviceUser class
	 *
	 * @param string parentUserName username of account that DeviceUser is linked to
	 * @param string emailAddress email address linked to device user, defaults to null if
	 * deviceUser has no email address (e.g. mobile devices).
	 * @return DeviceUser populated instance of DeviceUser class
	 *
	 */
	public function createDeviceUser($parentUsername, $emailAddress=null) {

	}

	/**
	 * Gets a deviceUser instance matching the given deviceUserId
	 *
	 * @param int deviceUserId
	 * @return DeviceUser populated instance of DeviceUser class mathcing the deviceUserId
	 */
	public function getDeviceUser($deviceUserId) {

	}

	/**
	 * Deletes the device user identified by the device ID and Auth code. You must supply a valid
	 * device user auth code.
	 *
	 * @param unknown $deviceUserId
	 * @param unknown $deviceUserAuthCode
	 */
	public function deleteDeviceUser($deviceUser) {

	}

	/**
	 * Gets an array of deviceUser instances belonging to the user identified by username
	 *
	 * @param string parentUserName
	 * @return array array of deviceUser instances
	 */
	public function getDeviceUsersForUser($parentUserName) {

	}

    function getUserObjects(){
        return $this->getWinUsers();
    }

    function getUserObject($username){
        $winUsers = $this->getWinUsers();
        if(empty($winUsers) || count($winUsers) == 0)
            return NULL;
        else{
            foreach ($winUsers as $key => $curUser){
                if(strcasecmp($curUser->getUsername(), $username) == 0)
                    return $curUser;
            }
            return NULL;
        }
    }

    function userNameExists($username){
        $winUsers = $this->getWinUsers();
        if(empty($winUsers) || count($winUsers) == 0)
            return false;
        else{
            foreach ($winUsers as $curUser){
                if(strcasecmp($curUser->getUsername(), $username) == 0){
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * getWinUsers - returns list of valid Windows Users, if $username is null
     * else return info for the requested username.
     * @return array
     */
    function getWinUsers()
    {
        //return $this->getDummyWinUsers(); //for debug only
        $users = array();
        try
        {
            $listUsers = $this->getWdOrionCOMinstance()->GetUsers($this->WinUserGroupName);

            foreach($listUsers as $winUser)
            {
                // IsPassword should always = true for Sentinel
                $UserObj = new User($winUser->userName, $winUser->fullName, $winUser->isAdmin, 1);

                $users[] = $UserObj;
            }
            return $users;
        }
        catch(Exception $e)
        {
            $errorMsg = $e->getMessage();
            \Core\Logger::getInstance()->err($errorMsg);
            return $users;
        } // catch
    }
    // Dummy helper method to avoid NetBeans debug issues with creating COM components.
    // Should not be used in release version, ever!!
    function getDummyWinUsers()
    {
        /*return $users = array(
            0 => new User("Administrator", "Built-in account for administering the computer/domain", 1, 1),
            1 => new User("Guest", "Built-in account for guest access to the computer/domain", 0, 1),
            2 => new User("vijayD", "vijayD", 0, 1),
            3 => new User("Eric", "Eric", 0, 1),
            );*/
    }

}