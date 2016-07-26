<?php
/*
 * @author WDMV - Mountain View - Software Engineering
* @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

namespace Shares\Model\Share;

use \Auth\User\UserSecurity;
use Util\Lock;
use Filesystem\Model\Link;

class SharesDao {
	 use SharesDaoTrait;
	 use AccessDaoTrait;

	 const ADD_SHARE = 1;
	 const UPDATE_SHARE = 2;
	 const DELETE_SHARE = 3;

	 const ADD_SHARE_ACCESS = 4;
	 const UPDATE_SHARE_ACCESS = 5;
	 const DELETE_SHARE_ACCESS = 6;

	 const MAX_LISTENERS = 100;

	 private static $shareListeners = array();
	 
	 static $SMB_CONF_WRITE_LOCK = "__smb_conf_write_";
	 static $SMB_LOCK_TIMEOUT = 5000; //milliseconds
	 
	 static $FORBIDEN_SHARE_NAMES = array(
			"CON"=> true,
			"PRN"=> true,
			"AUX"=> true,
			"NUL"=> true,
			"COM1"=> true,
			"COM2"=> true,
			"COM3"=> true,
			"COM4"=> true,
			"COM5"=> true,
			"COM6"=> true,
			"COM7"=> true,
			"COM8"=> true,
			"COM9"=> true,
			"LPT1"=> true,
			"LPT2"=> true,
			"LPT3"=> true,
			"LPT4"=> true,
			"LPT5"=> true,
			"LPT6"=> true,
			"LPT7"=> true,
			"LPT8"=> true,
			"LPT9"=> true,
			"VOLUME_1"=> true,
			"VOLUME_2"=> true,
			"VOLUME_3"=> true,
			"VOLUME_4"=> true,
			"P2P"=> true,
			"AMULE"=> true);
	 
	 private function notifyShareListeners($action, $share = null, $oldShareName=null) {

	 	foreach(self::$shareListeners as $handle => $listener) {
		 	switch ($action) {
		 		case self::ADD_SHARE :
		 			$listener->shareAdded($share);
		 		break;

		 		case self::UPDATE_SHARE :
		 			$listener->shareModified($oldShareName, $share);
		 		break;

		 		case self::DELETE_SHARE :
		 			$listener->shareDeleted($share);
		 		break;
		 	}
	 	}
	 }

	 private function notifyAccessListeners($action, $share, $username, $accessLevel = null) {

	 	foreach(self::$shareListeners as $handle => $listener) {
	 		switch ($action) {
		 		case self::ADD_SHARE_ACCESS :
		 			if ( empty($accessLevel) ) {
		 				throw new Exception("SharesDao::notifyAccessListener - accessLevel must be set for action: ADD_SHARE_ACCESS");
		 			}
		 			$listener->accessAdded($share, $username, $accessLevel);
		 		break;

		 		case self::UPDATE_SHARE_ACCESS :
	 				if ( empty($accessLevel) ) {
		 				throw new Exception("SharesDao::notifyAccessListener - accessLevel must be set for action: UPDATE_SHARE_ACCESS");
		 			}
		 			$listener->accessModified($share, $username, $accessLevel);
		 		break;

		 		case self::DELETE_SHARE_ACCESS :
		 			$listener->accessDeleted($share, $username);
		 		break;
		 	}
	 	}
	 }

	 public function __construct() {
	 	if ( empty(self::$shareListeners) ) {
	 		//add default listener from class-factory definitions for the current flavor of OS + platform type
	 		$osname = \Core\SystemInfo::getOSName() . getPlatformType();
	 		try {
	 			$shareListener = \Core\ClassFactory::getImplementation('Shares\Model\Share\Listener\ShareListenerInterface', ['osname' => $osname]);
	 			if ($shareListener != null) {
	 				$this->addListener($shareListener);
	 			}
	 		} catch (\ClassFactory\Exception $ex) {
	 			//we can just ignore it if there is no listener implementation for this platform
	 		}
	 	}
	 }

	 public function addListener(Listener\ShareListenerInterface $listener) {
	 	if ( sizeof(self::$shareListeners)+1 > self::MAX_LISTENERS) {
	 		throw new Exception("SharesDao::addListener - max listeners exceeded");
	 	}
	 	$handle = null;
	 	$tries = self::MAX_LISTENERS;
	 	while($tries--) {
		 	$handle = mt_rand();
		 	if (!isset(self::$shareListeners[$handle])) {
		 		break;
		 	}
	 	}
	 	if (isset(self::$shareListeners[$handle])) {
	 		throw new Exception("SharesDao::addListener - unable to allocate a free listener handle");
	 	}
	 	self::$shareListeners[$handle] = $listener;
	 	return $handle;
	 }

	 public function removeListener($handle) {
	 	if (!isset(self::$shareListeners[$handle])) {
	 		throw new Exception("SharesDao::removeListener - listener with handle: " . $handle . " does not exist");
	 	}
	 	unset(self::$shareListeners[$handle]);
	 }

	 public function getAll() {
	 	return $this->_getShares();
	 }

	 public function getAllNames() {
	 	return $this->_getShareNames();
	 }

	public function shareExists($shareName) {
		return $this->_shareExists($shareName);
	}

    /**
     * @param $shareName
     * @return Share
     */
     public function get($shareName) {
	 	return $this->_getShareByName($shareName);
	 }

	 public function add(Share $share) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$SMB_LOCK_TIMEOUT)) {
	 		throw new \Shares\Exception("SharesDao::add() - failed to aquire SMB CONF write lock");
	 	}
	 	try {
		 	if (!$this->_shareExists($share->getName()) && $this->_add($share)) {
		 	 	$this->notifyShareListeners(self::ADD_SHARE, $share);
		 	 	$lock->release();
		 	 	return true;
		 	}
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	return false;
	 }

	 public function update($oldShareName, $share) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$SMB_LOCK_TIMEOUT)) {
	 		throw new \Exception("SharesDao::update() - failed to aquire SMB CONF write lock");
	 	}
	 	try {
		 	if ($this->_update($oldShareName, $share)) {
		 		$this->notifyShareListeners(self::UPDATE_SHARE, $share, $oldShareName);
		 		$lock->release();
		 		return true;
		 	}
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	return false;
	 }

	 public function delete($shareName) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$SMB_LOCK_TIMEOUT)) {
	 		throw new \Exception("SharesDao::delete() - failed to acquire SMB CONF write lock");
	 	}	 	
	 	try {
			$share = $this->_getShareByName($shareName);
		 	if ($share != null && ($this->_delete($shareName))) {
				 $this->notifyShareListeners(self::DELETE_SHARE, $share);
				 $lock->release();
				 return true;
			}
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	return false;
	 }

	 public function getAccessToShare($shareName, $username = null) {
	 	return $this->_getShareAccess($shareName, $username);
	 }

     /**
      * Add access levels for users to a share.
      *
      * @param string $shareName the share to add accesses to.
      * @param array $accesses array with the username keys and values as access levels. Both strings. See AccessDaoTrait::_addAccesses().
      * @return boolean true on success, false otherwise.
      */
     public function addAccessesToShare($share, array $accesses) {
     	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
     	if (!$lock->acquire(self::$LOCK_TIMEOUT, 250)) {
     		throw new \Exception("SharesDao::addAccessesToShare() - failed to acquire SMB CONF write lock");
     	}
     	try {
	        if (!$this->_addAccesses($share->getName(), $accesses)) {
	        	$lock->release();
	            return false;
	        }
	
	        foreach ($accesses as $username => $accessLevel) {
	            $this->notifyAccessListeners(self::ADD_SHARE_ACCESS, $share, $username, $accessLevel);
	        }
        }catch (Exception $ex) {
        	$lock->release();
        	throw $ex;
        }
        $lock->release();
        return true;
     }

	 public function setAccessToShare($shareName, $username, $accessLevel) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$LOCK_TIMEOUT, 250)) {
	 		throw new \Exception("SharesDao::setAccessToShare() - failed to acquire SMB CONF write lock");
	 	}
	 	$status = false;
	 	try {
		 	$share = $this->_getShareByName($shareName);
		 	if (!empty($share)) {
		            $status = $this->_updateAccess(new Access($shareName, $username, $accessLevel));
		            $this->notifyAccessListeners(self::UPDATE_SHARE_ACCESS, $share, $username, $accessLevel);
		 	}
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	if (UserSecurity::getInstance()->isCloudholder($username) &&
	 	$accessLevel != \Shares\Model\Share\AccessLevel::READ_WRITE) {
	 		$usersModelObj = new \Auth\Model\Users();
	 		$colaborativeSpacesAndPLSsOwned = $usersModelObj->getColabSpacesAndPLSForUser($username, false, $shareName);
	 	
	 		Link::deleteLinksBy($username, $shareName, TRUE);
	 	
	 		foreach($colaborativeSpacesAndPLSsOwned as $shareName){
	 			$this->delete($shareName);
	 		}
	 	}
	 	return $status;
	 }

	 public function deleteAccessToShare($shareName, $username) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$LOCK_TIMEOUT, 250)) {
	 		throw new \Exception("SharesDao::deleteAccessToShare() - failed to acquire SMB CONF write lock");
	 	}
	 	$status = false;
	 	try {
		 	$share = $this->_getShareByName($shareName);
		 	if (!empty($share)) {
				$status = $this->_deleteAccess(new Access($shareName, $username));
				$this->notifyAccessListeners(self::DELETE_SHARE_ACCESS, $share, $username);
		 	}
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	if (UserSecurity::getInstance()->isCloudholder($username)) {
	 		$usersModelObj = new \Auth\Model\Users();
	 		$colaborativeSpacesAndPLSsOwned = $usersModelObj->getColabSpacesAndPLSForUser($username, false, $shareName);
	 	
	 		Link::deleteLinksBy($username, $shareName, TRUE);
	 	
	 		foreach($colaborativeSpacesAndPLSsOwned as $shareName){
	 			$this->delete($shareName);
	 		}
	 	}
	 	return $status;
	 }

	 public function updateUsername($oldUsername, $newUsername) {
	 	$lock = new Lock(self::$SMB_CONF_WRITE_LOCK, 5);
	 	if (!$lock->acquire(self::$LOCK_TIMEOUT, 250)) {
	 		throw new \Exception("SharesDao::updateUsername() - failed to acquire SMB CONF write lock");
	 	}
	 	try {
	 		$result = $this->_renameUser($oldUsername, $newUsername);
	 	}catch (Exception $ex) {
	 		$lock->release();
	 		throw $ex;
	 	}
	 	$lock->release();
	 	return $result;
	 }

	 /**
	  * Returns value indicates whether the session's currently authenticated user (or passed $username) can access the specified share.
	  *
	  * @param String $shareName The name of the share to be accessed
	  * @param boolean $isWriteRequested Is the user trying to modify the share (add/remove/modify)
          * @param String $username A username to check share access with. Or NULL to use the session user.
	  * @return boolean Is the access allowed
	  */
	 public function isShareAccessible($shareName, $isWriteRequested, $allowAdminOverride = true, $username = NULL) {
                if ($username === NULL) {
                    // Admin always has access
                    $username = UserSecurity::getInstance()->getSessionUsername();
                }

	 	if (empty($username)) {
	 		return FALSE;
	 	}

	 	if ($allowAdminOverride && UserSecurity::getInstance()->isAdmin($username)) {
	 		return true;
	 	}

	 	// Check if shareName is the public share
	 	$share = $this->_getShareByName($shareName);

	 	if (empty($share)) {
	 		return false;
	 	}

        //public shares
        if ($share->getPublicAccess()) {
            //do not allow access for public shares to non cloudholders
            if (!UserSecurity::getInstance()->isCloudholder($username)) {
                return false;
            }

            return true;
        }

	 	$access = $this->_getShareAccess($shareName, $username);

	 	if (!empty($access)) {
	 		$accessLevel = $access->getAccess();
	 		if ($accessLevel == AccessLevel::READ_WRITE) {
	 			return true;
	 		}
	 		if ($accessLevel == AccessLevel::READ_ONLY && !$isWriteRequested) {
	 			return true;
	 		}
	 	}
	 	return false;
	 }

    public static function isShareNameValid($shareName) {
        //ok to use trim here for utf8 string because the whitespace characters that are trimmed will never be found
        //as a byte in a multi byte character
        /*Special character restrictions imposed on Share names to match Alpha requirements:
         *Do not allow special characters: % < > * ? | / \ + = ; : " @ # ! ~ [ ] space
          The first character of the Share Name cannot be '.' , '&' '
          The last character of the Share Name cannot be '$' or '.
         * */
        if (trim($shareName) === '' || mb_strlen($shareName, 'UTF-8') > 80 || preg_match('=^[^\[\]\=\s\\\/%<>*?+;:"@#!~|.&]+([^\[\]\=\s\\\/%<>*?+;:"@#!~|]*[^\[\]\=\s\\\/%<>*?+;:"@#!~|.])?$=u', $shareName) === 0 ||
        isset(self::$FORBIDEN_SHARE_NAMES[strtoupper($shareName)]) || substr($shareName, -1) == "$") {//can not make "endining in dollar sign" part work in any other way
            return false;
        }

        return true;
    }
}