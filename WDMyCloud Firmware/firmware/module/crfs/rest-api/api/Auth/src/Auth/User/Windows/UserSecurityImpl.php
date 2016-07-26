<?php

namespace Auth\User\Windows;

require_once(COMMON_ROOT . '/includes/securitydb.inc');

use Auth\User\UserSecurity;
use Auth\User\UserManager;
use Auth\User\LoginContext;

class UserSecurityImpl extends UserSecurity {

    // WDWindowsOrionServer(.dll): WindowsPermissionCheck COM Interface
    //
    private $wdOrionCOMSrvrClsId = "{6C57A567-4F72-4196-A87F-F13FA5EA66D6}";
    private $wdOrionCOMSrvrProgId = "WindowsServerInfoProvider.1";
    private $WdOrionCOMObject = null;

    function getWdOrionCOMinstance()
    {
//        if (is_null($this->WdOrionCOMObject)){
//            $this->WdOrionCOMObject = new \COM($this->wdOrionCOMSrvrProgId);
//        }
//        return $this->WdOrionCOMObject;
        return new \COM($this->wdOrionCOMSrvrProgId);
    }

    function authenticateWinUser($username, $password)
    {
        try
        {
            // TODO: remove the following "return" for release version
            //
            //return true; //-- for debugging only
            $domain = ".";
            $isAuth = $this->getWdOrionCOMinstance()->IsAuthenticationValid($username, $domain, $password);

            return $isAuth >= 1? true : false;
        }
        catch(Exception $e)
        {
            $errorMsg = $e->getMessage();
            \Core\Logger::getInstance()->err($errorMsg);
            return false;
        }
    }

	/**
	 * Authenticate a local user's credentials
	 *
	 * @param string $username local username
	 * @param string $passwordHash hash of users password
	 * @return boolean true if valid credentials, else false
	 */
	protected function authenticateUserCredentials($username, $passwordHash) {
        return $this->authenticateWinUser($username, $passwordHash);
	}



	/**
	 * Check if user with given username is the owner of the device.
	 *
	 * @param string $userName
	 */

	protected function isDeviceOwner($userName) {
		//On Windows return true if user is Administrator, as there is no concept of a device owner
	    return isAdmin($userName);
	}

}