<?php
	namespace Auth\User\Linux;

	use Auth\User\Linux\UserSystemUtils;
	use Auth\User\UserSecurity;
	use Auth\User\UserManager;
	use Auth\User\User;
	use Auth\User\DeviceUser;
	use Filesystem\Model\Link;
	use Auth\Model;
	use Util\Lock;

	class UserManagerImpl extends UserManager {

		static $adminGroupName = 'administrators';
		static $cloudholdersGroupName = 'cloudholders';
		
		static $AUTH_LOCK_TIMEOUT = 5000; //milliseconds
		static $SMB_CONF_WRITE_LOCK = "__smb_conf_write_";
		
		public function __construct() {
			//if testing, add default Admin user if neecessary
			if  ('testing' == $_SERVER['APPLICATION_ENV']) {
				if (!$this->isValid('admin'))  {
						$this->createUser('admin', '', 'Administrator', true);
				}
			}
		}

		/**
		 * getUser
		 *
		 * Returns information of specified user
		 *
		 * @param integer $findUsername username of the specified user. If null, returns all user objects
		 * @return array of User objects
		 */
		public function getUser($findUsername=null) {
			$userSystemUtils = UserSystemUtils::getInstance();
			if (empty($findUsername)) {
				$systemUsernames = $userSystemUtils->getUsernames();
				$strUsername = null;
			}
			else {
				$systemUsernames = array();
				$systemUsernames[] = $findUsername;
				$strUsername = $findUsername;
			}
			
			$groupMemberships = $this->getGroupMemberships($strUsername, null);
			$usersArray = array();
			
			$adminGroupInfo = posix_getgrnam(self::$adminGroupName);
			$cloudholdersGroupInfo = posix_getgrnam(self::$cloudholdersGroupName);
			
			if (empty($adminGroupInfo)) {
				throw new \Exception(self::$adminGroupName . " group does not exist");
			}
			foreach($systemUsernames as $username) {
				$userInfoArray = posix_getpwnam($username);
				if (!$userInfoArray) {
					continue; //user does not exist
				}
				$pwdHash = $userSystemUtils->getUserPasswordHash($username);
				$hasPassword=true;
				if ( isset($pwdHash) && empty($pwdHash) ) {
					$hasPassword=false;
				}

                $groupNames = [];
                foreach ($groupMemberships as $groupMembership) {
                    if ($groupMembership['username'] === $username) {
                        $groupNames[] = $groupMembership['group_name'];
                    }
                }

				$gecosArray = explode(',',$userInfoArray['gecos']);
				$isAdmin = in_array($username, $adminGroupInfo['members']);
				$isCloudholder = in_array($username, $cloudholdersGroupInfo['members']);
				$usersArray[] = 
						new User($username, 
								 $gecosArray[0], //full name
								 $isAdmin, //is user in admin group?
								 $isCloudholder,
							     $hasPassword, //has password?
							     $groupNames);
			}
			if (empty($findUsername)) {
				return $usersArray; //if no users then this will return an empty array
			}
			//return requested user
			if (!empty($usersArray)) { 
				return $usersArray[0];
			}
			//user does not exist
			return null;
		}

		/**
		 * Creates a new user in the Users table
		 * @param string $username
		 * @param string $password
		 * @param string $fullname
		 * @param string $groupMembership string group membership
		*/
		public function createUser($username, $password=null, $fullname=null, $groupMembership=null) {
			$lockObj = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
			// lock all operations which can change common resources
			if (!$lockObj->acquire(self::$AUTH_LOCK_TIMEOUT, 250, $userName)) {
				//unable to acquire lock
				throw new \Auth\Exception('Failed to acquire lock', 500);
			}
			$userSystemUtils = UserSystemUtils::getInstance();
			$deviceType = getDeviceTypeName();
			try {
				if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
					$resultUpdateSystem = $userSystemUtils->createUser($username, $password, $fullname, $groupMembership);
					$resultUpdateAlpha = $userSystemUtils->createUserAlpha($username, $password, $fullname, $groupMembership);
					$lockObj->release();
					return $resultUpdateSystem && $resultUpdateAlpha;
				}else{
					$result = $userSystemUtils->createUser($username, $password, $fullname, $groupMembership);
					$lockObj->release();
					return $result;
				}
			}catch (Exception $ex) {
				$lockObj->release();
				throw $ex;
			}

		}

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
		public function updateUser($username, $newUsername=null, $fullname=null, $oldPassword=null, $newPassword=null, $isAdmin=null, $changePassword=false) {
			$lockObj = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
			// lock all operations which can change common resources
			if (!$lockObj->acquire(self::$AUTH_LOCK_TIMEOUT, 250, $userName)) {
				//unable to acquire lock
				throw new \Auth\Exception('Failed to acquire lock', 500);
			}
			try {
				$userSystemUtils = UserSystemUtils::getInstance();
				$deviceType = getDeviceTypeName();
				if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
					$resultUpdateSystem = $userSystemUtils->modifyUser($username, $fullname, $newPassword, $isAdmin, $changePassword, $newUsername);
					$resultUpdateAlpha = $userSystemUtils->modifyUserAlpha($username, $fullname, $newPassword, $isAdmin, $changePassword, $newUsername);
					$lockObj->release();
					return $resultUpdateSystem && $resultUpdateAlpha;
				}else{
					$result =  $userSystemUtils->modifyUser($username, $fullname, $newPassword, $isAdmin, $changePassword, $newUsername);
					$lockObj->release();
					return $result;
				}
			}catch (Exception $ex) {
				$lockObj->release();
				throw $ex;
			}
		}

		/**
		 * deleteUsers
		 *
		 * Deletes a set of user that are identified based on the username
		 *
		 * @param array $usernames - an array of usernames of user accounts to delete
		 * @return boolean indicates whether the update succeeded
		 */
		public function deleteUsers(array $usernames){
			$ret = false;
			foreach($usernames as $username){
				$ret = $this->deleteUser($username['username']);
			}
			return $ret;
		}

		/**
		 * deleteUser
		 *
		 * Deletes a user that is identified based on the userId
		 *
		 * @param string $username username of user account to delete
		 * @return boolean indicates whether the update succeeded
		*/
		public function deleteUser($username) {
			$lockObj = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
			// lock all operations which can change common resources
			if (!$lockObj->acquire(self::$AUTH_LOCK_TIMEOUT, 250, $userName)) {
				//unable to acquire lock
				throw new \Auth\Exception('Failed to acquire lock', 500);
			}
			try {
				$userSystemUtils = UserSystemUtils::getInstance();
				$deviceType = getDeviceTypeName();
	
				$userIsCloudholder = UserSecurity::getInstance()->isCloudholder($username);
				
				if($userIsCloudholder){
					$colaborativeSpacesAndPLSsOwned = array();
					$usersModelObj = new Model\Users();
					
					$colaborativeSpacesAndPLSsOwned = $usersModelObj->getColabSpacesAndPLSForUser($username, true);
				}
				if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
					$resultUpdateSystem = $userSystemUtils->deleteUser($username);
					$resultUpdateAlpha = $userSystemUtils->deleteUserAlpha($username);
					$result = $resultUpdateSystem && $resultUpdateAlpha;
				}else{
					$result = $userSystemUtils->deleteUser($username);
				}
				if($result == false){
					$lockObj->release();
					return false;
				}
				$lockObj->release();
				if($userIsCloudholder){
					Link::deleteLinksBy($username, NULL, TRUE);
					
					$sharesDao = new \Shares\Model\Share\SharesDao();
					foreach($colaborativeSpacesAndPLSsOwned as $shareName){
						$sharesDao->delete($shareName);
					}
				}
				return true;
			}catch (Exception $ex) {
				$lockObj->release();
				throw $ex;
			}
		}

		/**
		 * Returns the userId of the user identified by the supplied Local Username
		 * This is retained for backward-compatibility as we no longer maintain a seperate User ID
		 * @param String $username identifier of the user (column in the Users table)
		 * @return string userId of the specified User
		 * @deprecated you no longer need to call this function as UserId and username are the same
		*/
		public function getUserId($username=null) {
			if ($this->isValid($username)) {
				return $username;
			}
			return false;

		}

		/**
		 * Returns the admin status of the user identified by the supplied userId
		 * @param integer $username username of the user (primary key of Users table)
		 * @return boolean admin status of the specified User
		*/
		public function isAdmin($username=null) {
			$user = $this->getUser($username);
			if (!empty($user)) {
				return $user->getIsAdmin();
			}
			return false;
		}

		/**
		 * Returns the cloudholder status of the user identified by the supplied userId
		 * @param integer $username username of the user (primary key of Users table)
		 * @return boolean admin status of the specified User
		 */
		public function isCloudholder($username=null) {
			$user = $this->getUser($username);
			if (!empty($user)) {
				return $user->getIsCloudholder();
			}
			return false;
		}

		/**
		 * Determines whether an account with the specified Local Username exists in the OS
		 * @param String $username identifies the user being checked for validity
		 * @return boolean indicates if such a user exists.
		*/
		public function isValid($username=null) {
			$userSystemUtils = UserSystemUtils::getInstance();
			$usernames = $userSystemUtils->getUsernames();
			if (!empty($usernames)) {
				return in_array($username, $usernames);
			}
			return false;
		}

        /**
         * Generates username from the email
         * @param String $email
         * @return String username
         */
         public function generateUserNameFromEmail($email){
            $maxLength = 32;
            $email = strtolower($email);
            $userName = preg_replace('/@.*$/', '', $email); // take everything before first '@'

            //if starts with anything but an alphabetical character or an '_', prefix with '_'
            if(preg_match('/[^a-z_]/',substr($userName , 0, 1))){
                $userName = '_'.$userName;
            }

            $userName = preg_replace('/[^a-z0-9-]+/', '_', $userName); //replace unacceptable characters with underscore
            $userName = substr($userName , 0, $maxLength); // limit username to $maxLength characters

            if (!($this->isReservedUsername($userName)) && !($this->isValid($userName))){ //if not reserved and doesn't yet exist
                return $userName;
            }

             //try appending domain
             if (strlen($userName) < $maxLength){
                 $domain = preg_replace('/^.*@/', '', $email); // everything after @
                 $subdomain = preg_replace('/\..*$/', '', $domain ); // everything in the domain before the first dot
                 $userName = $userName.'_'.$subdomain;
                 $userName = preg_replace('/[^a-z0-9-]+/', '_', $userName); //replace unacceptable characters with underscore

                 $userName = substr($userName , 0, $maxLength); // limit username to $maxLength characters
                 if (!($this->isReservedUsername($userName)) && !($this->isValid($userName))){ //if not reserved and doesn't yet exist
                     return $userName;
                 }
             }

            // if username is shorter than max length, append with a number until a valid username is generated
            if (strlen($userName) < $maxLength){
                 $num = 1;
                 $testUserName = $userName.$num;
                 while( strlen($testUserName) <= $maxLength){
                     if (!($this->isReservedUsername($testUserName)) && !($this->isValid($testUserName))){ //if not reserved and doesn't yet exist
                         return $testUserName;
                     } else {
                         $num++;
                         $testUserName = $userName.$num;
                     }
                 }
            }

            // if haven't found an available username by now
            // start trimming the username from the end and appending it with a number
            // until an available username is found or until there is nothing left to trim
            $num=1;
            $userName = substr($userName, 0, -1);
            $testUserName = $userName.$num;
            while (strlen($userName) > 0){
                if (strlen($testUserName) > $maxLength){
                   if (strlen($userName) > 1){
                       $userName = substr($userName, 0, -1);
                       $num = 1;
                       $testUserName = $userName.$num;
                   } else {
                       break;
                   }
                }
                if (!($this->isReservedUsername($testUserName)) && !($this->isValid($testUserName))){ //if not reserved and doesn't yet exist
                    return $testUserName;
                } else {
                    $num++;
                    $testUserName = $userName.$num;
                }
            }

            throw new \Exception("Failed to generate a username from e-mail");
         }



        /**
         * Checks if username is reserved
         * @param String $username
         * @return Bool true if username is reserved
         */
         public function isReservedUsername($username){
            $userSystemUtils = UserSystemUtils::getInstance();
            return $userSystemUtils->isReservedUsername($username);
         }

        /**
         * Checks if username conforms to the allowed format
         * @param String $username
         * @return Bool true if username conforms to the allowed format
         */
         public function isValidUsernameFormat($username){
            return ((strlen($username) >= 1) && (strlen($username) <= 32) && (preg_match('/^[a-z_][a-z0-9_-]*$/i', $username)));
         }

        /**
         * Checks if fullname conforms to the allowed format
         * @param String $fullname
         * @return Bool true if fullname conforms to the allowed format
         */
         public function isValidFullnameFormat($fullname){
            return (preg_match('/^[-0-9_.\' \p{L}]*[$]?+$/u', $fullname) && (strlen($fullname) <= 255));
         }

		/**
		 * Determines whether the specified Group exists
		 * @param String $groupName identifies the group being checked for validity
		 * @return boolean indicates if such a group exists.
		 */
		 public function isValidGroup($groupName) {
			return UserSystemUtils::getInstance()->isValidGroup($groupName);
	 	 }
		
		/**
		 * Returns information about all group memeberships or filters
		 * them by username or group name
		 *
		 * @param String $username  - username of the specified user, array of users or null. If null, returns all user objects
		 * @param String $groupName  -  group name  of the specified group or null. If null, returns all user objects
		 * @return array of Group objects
		 */
		public function getGroupMemberships($username, $groupName){
			return UserSystemUtils::getInstance()->getGroupMemberships($username, $groupName);
		}
		
		/**
		 * Create a record about group memeberships
		 * for the username or group name combination passed
		 *
		 * @param String $username  - username of the specified user
		 * @param String $groupName  - group name of the specified group
		 * @return true indicates if the creation was succesful
		 */
		public function createGroupMembership($username, $groupName){
			return UserSystemUtils::getInstance()->createGroupMembership($username, $groupName);
		}
		
		
		/**
		 * Delete a record about group memeberships
		 * for the username or group name combination passed
		 *
		 * @param String $username  - username of the specified user
		 * @param String $groupName  - group name of the specified group
		 * @return true indicates if the deletion was succesful
		 */
		public function deleteGroupMembership($username, $groupName){
			return UserSystemUtils::getInstance()->deleteGroupMembership($username, $groupName);
		}
		
	};

?>