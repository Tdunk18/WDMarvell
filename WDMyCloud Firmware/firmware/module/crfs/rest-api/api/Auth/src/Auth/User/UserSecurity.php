<?php

namespace Auth\User;

require_once COMMON_ROOT . '/includes/requestscope.inc';

use Remote\DeviceUser\Db\DeviceUsersDB;
use Auth\Model\RequestAuth;
use Auth\Model\AuthContext;
use Common\Model\ConfigCache;
use Core\Logger;

/**
 * UserSecurity
 *
 * Provides abstract parent class for platform-specific User Authentication
 */
abstract class UserSecurity {

    private static $instance = null;

    private static $userTypeArray = [
							    'admin' => 2,
							    'cloudholder' => 3,
							    'regular'=>4
							    		];
    	
    /**
     * getInstance()
     *
     * Returns the Operating System-specific singleton instance of this abstract class
     *
     * @return UserSecurity   A UserManager implemantation class instance
     */
    static public function getInstance()
    {
    	if (empty(self::$instance))
    	{
    		self::$instance = \Core\ClassFactory::getImplementation('Auth\\User\\UserSecurity', ['osname' => \Core\SystemInfo::getOSName()]);
    	}
    
    	return self::$instance;
    }
    
    
    /**
     * Authenticate a local user's credentials
     *
     * @param string $username local username
     * @param string $passwordHash hash of users password
     * @return boolean true if valid credentials, else false
     */
    abstract protected function authenticateUserCredentials($username, $passwordHash);

    /**
     * Check if user with given username is the owner of the device.
     *
     * @param string $userName
     */
    abstract public function isDeviceOwner($userName);

    /**
     * Authenticate a Device User's credentials
     *
     * @param int $deviceUserId ID of Device User
     * @param string $deviceUserAuthCode Audh Code of Device User
     * @return boolean true if valid credentials, else false
     */

    protected function authenticateDeviceUserCredentials($deviceUserId, $deviceUserAuthCode) {
        $cache = ConfigCache::getConfigCache('DEVICE_USER');
        if ($cache == NULL) {
            //Since DeviceUser information is stored in the database, the cache will watch that file for changes
            $dbConfig = getGlobalConfig('db');
            $dbFilePath = $dbConfig['DATA_BASE_FILE_PATH'];
            $cache = ConfigCache::initializeConfigCache('DEVICE_USER', $dbFilePath, 1800);
        }
        $deviceUser = $cache->getValue($deviceUserId);
        //If the DeviceUser wasn't in the cache, then do the normal DB lookup and then store it in the cache for next time
        if($deviceUser == NULL) {
            $deviceUsersDb = DeviceUsersDB::getInstance();
            $deviceUser = $deviceUsersDb->getDeviceUser($deviceUserId);
            if($deviceUser == NULL) {
            	return false;
            }
            $cache->putValue($deviceUserId, $deviceUser);
        }

        $isValid = $deviceUser->getDeviceUserAuthCode() === $deviceUserAuthCode;

        if(!$isValid) {
            return false;
        }
        if (!isset($deviceUser)) {
            return false;
        }
        $username = $deviceUser->getParentUsername();
        //check we got a result set from the DB and it contained the userId
        if (!isset($username)) {
            //TO DO - add log message here - DB may be corrupt
            return false;
        }

        $userManager = UserManager::getInstance();
        $user = $userManager->getUser($username);
        if(!isset($user) || empty($user))
            return false;
        $ctxt = new LoginContext($user);
        $ctxt->setAuthType(LoginContext::DEVICE_USER_AUTH);
        $ctxt->setDeviceUserId($deviceUserId);
        \RequestScope::getInstance()->setLoginContext($ctxt);
        if($deviceUser instanceof \Remote\DeviceUser\DeviceUser){
            $this->_setActive($deviceUser);
        }
        return true;

    }

    protected function _setActive(\Remote\DeviceUser\DeviceUser $deviceUser)
    {
        if (!$deviceUser->getIsActive())
        {
            DeviceUsersDB::getInstance()->updateDeviceUserById($deviceUser->getDeviceUserId(), ['is_active' => 1]);
        }
    }


    /**
     * Returns the current username for this session.
     * @return string Username
     */
    public function getSessionUsername()
    {
        $loginContext = \RequestScope::getInstance()->getLoginContext();

        if (!empty($loginContext))
        {
            return $loginContext->getUserName();
        }

        return NULL;
    }

    /**
     * Returns the current username for this session.
     * @deprecated use getSessionUsername() as userId is obsolete and is now the same as username
     * @return string UserName
     */
    public function getSessionUserId()
    {
        return $this->getSessionUsername();
    }

    /**
     * isAdmin - checks if given user has Admin privilege
     *
     * @param string $userName local username
     * @throws Exception 'Unknown User', if use is not found
     */

    function isAdmin($userName) {
        //return from LoginContext if it is for session user
        if (empty($userName)) {
            return false;
        }
        $loginContext = \RequestScope::getInstance()->getLoginContext();
        if (!empty($loginContext) && ($loginContext->getUserName() == $userName)) {
            return $loginContext->isAdmin();
        }
        //not session user, so look-up user object

        return UserManager::getInstance()->isAdmin($userName);
    }

    /**
     * isCloudholder - checks if given user has Cloudholder privilege
     *
     * @param string $userName local username
     * @throws Exception 'Unknown User', if use is not found
     */
    function isCloudholder($userName) {
        //return from LoginContext if it is for session user
        if (empty($userName)) {
            return false;
        }
        $loginContext = \RequestScope::getInstance()->getLoginContext();
        if (!empty($loginContext) && ($loginContext->getUserName() == $userName)) {
            return $loginContext->isCloudholder();
        }
        //not session user, so look-up user object

        return UserManager::getInstance()->isCloudholder($userName);
    }
    
    /**
     * userTypeRemote - returns the value for group privelege user_type
     *
     * @param string $userName local username
     * @return false if user is not found, 2- for admin, 3- for cloudholder., 4-  for regular user
     */
    function userTypeRemote($userName) {
    	//return from LoginContext if it is for session user
    	if (empty($userName)) {
    		return false;
    	}
    
    	//not session user, so look-up user object
    	$userManager = UserManager::getInstance();
    	if($userManager->isAdmin($userName)){
    		$userType = self::$userTypeArray['admin'];
    	}elseif($userManager->isCloudholder($userName)){
    		$userType = self::$userTypeArray['cloudholder'];
    	}else{
    		$userType = self::$userTypeArray['regular'];
    	}
    	return $userType;
    }

    /**
     * Authenticates the Local User
     *
     * @param string $username user name
     * @param string $passwordHash hash of user's password
     * @return boolean true if user is authenticated, else false
     */
    public function authenticateLocalUser($username, $passwordHash) {
        $isAuth = $this->authenticateUserCredentials($username, $passwordHash);
        if ($isAuth === true) {
            $user = UserManager::getInstance()->getUser($username);
            if (empty($user) || sizeof($user) > 1) {
                throw new Exception('User not found');
            }
            $ctxt = new LoginContext($user);
            \RequestScope::getInstance()->setLoginContext($ctxt);
            return $username;
        }
        return false;
    }

    /**
     * Authenticates the provided device user based on the DeviceUserId and the DeviceUserAuthCode.
     * After authentication it sets the appropriate session parameters.
     *
     * @param int $deviceUserId Identifier that is stored locally which matches the same identifier stored centrally.
     * @param string $auth AuthenticationCode that is to be verified against the local database.
     * @return boolean true if device user is authenticated, otherwise false.
     */

    public function authenticateDeviceUser($deviceUserId, $deviceUserAuthCode)
    {
        return $this->authenticateDeviceUserCredentials($deviceUserId,$deviceUserAuthCode);
    }

    protected function _checkUsernameAndPassword(AuthContext $authContext)
    {
        $errorPrefix = "Authentication with 'auth_username/auth_password': ";
        $requestUri  = $authContext->getRequestUri();
        $requestObj  = $authContext->getRequestObject();
        $queryParams = $authContext->getQueryParams();

        if (!isLanRequest())
        {
            Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because not LAN request for " . $requestUri, $requestObj);

            return FALSE;
        }

        if ($this->authenticateLocalUser($queryParams['auth_username'], $queryParams['auth_password']))
        {
            if ($authContext->isAdminRequired() && !$this->isAdmin($this->getSessionUsername()))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required admin user for " . $requestUri, $requestObj);

                return FALSE;
            }
            elseif ($authContext->isCloudholderRequired() && !$this->isCloudholder($this->getSessionUsername()))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required cloudholder user for " . $requestUri, $requestObj);

                return FALSE;
            }

            return TRUE;
        }

        Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure for " . $requestUri, $requestObj);

        return FALSE;
    }

    protected function _checkOldApiForCompatibility(AuthContext $authContext)
    {
        $errorPrefix = "Authentication with 'owner/pw': ";
        $requestUri  = $authContext->getRequestUri();
        $requestObj  = $authContext->getRequestObject();
        $queryParams = $authContext->getQueryParams();
        $owner       = $queryParams['owner'];

        if (!isLanRequest())
        {
            Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because it's not LAN request for " . $requestUri, $requestObj);

            return FALSE;
        }

        if ($this->isDeviceOwner($owner) && $this->authenticateLocalUser($owner, base64_decode($queryParams['pw'], TRUE)))
        {
            // Set current user/owner as session user.
            if ($authContext->isAdminRequired() && !$this->isAdmin($owner))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required admin user for " . $requestUri, $requestObj);

                return FALSE;
            }
            elseif ($authContext->isCloudholderRequired() && !$this->isCloudholder($owner))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required cloudholder user for " . $requestUri, $requestObj);

                return FALSE;
            }

            $user = UserManager::getInstance()->getUser($owner);
            $ctxt = new LoginContext($user);
            \RequestScope::getInstance()->setLoginContext($ctxt);

            return TRUE;
        }

        Logger::getInstance()->err(__FUNCTION__ . ', failure for ' . $requestUri, $requestObj);

        return FALSE;
    }

    protected function _checkDeviceUserIdAndDeviceUserAuthCode(AuthContext $authContext)
    {
        $errorPrefix = "Authentication with 'device_user_id/device_user_auth_code': ";
        $requestUri  = $authContext->getRequestUri();
        $requestObj  = $authContext->getRequestObject();
        $queryParams = $authContext->getQueryParams();

        if ($this->authenticateDeviceUserCredentials($queryParams['device_user_id'], $queryParams['device_user_auth_code']))
        {
            if ($authContext->isAdminRequired() && !$this->isAdmin(getSessionUserId()))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required admin user for " . $requestUri, $requestObj);

                return FALSE;
            }
            elseif ($authContext->isCloudholderRequired() && !$this->isCloudholder(getSessionUserId()))
            {
                Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required cloudholder user for " . $requestUri, $requestObj);

                return FALSE;
            }

            return TRUE;
        }

        Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure for " . $requestUri, $requestObj);

        return FALSE;
    }

    protected function _checkDeviceUserIdAndRequestAuthCode(AuthContext $authContext)
    {
        $errorPrefix     = "Authentication with 'device_user_id/request_auth_code': ";
        $requestUri      = $authContext->getRequestUri();
        $requestObj      = $authContext->getRequestObject();
        $queryParams     = $authContext->getQueryParams();
        $deviceUserId    = $queryParams['device_user_id'];
        $requestAuthCode = $queryParams['request_auth_code'];
        $deviceUser      = DeviceUsersDB::getInstance()->getDeviceUser($deviceUserId);

        if (!isset($deviceUser))
        {
            Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix deviceUserId not found " . $requestUri, $requestObj);

            return FALSE;
        }

        $result = parse_url($requestUri);

        // BL ITR#75019:parse_url() removes the special character '#' from URI, it is an issue for file/folder name with #,
        // decoding HTML encoded array values created through parse_url() eliminates this problem
        $requestParts = array();
        array_walk_recursive($result, function($value, $key) use(&$requestParts)
        {
            $requestParts[$key] = urldecode($value);
        });

        $requestAuthHashStr = $deviceUser->getDeviceUserAuthCode() . $requestParts["path"] . "?"
                            . substr($requestParts["query"], 0, strpos($requestParts["query"], "&request_auth_code"));
        $requestAuthHash    = hash('sha256', $requestAuthHashStr);

        if ($requestAuthCode === $requestAuthHash)
        {
            if ($this->authenticateDeviceUserCredentials($deviceUserId, $deviceUser->getDeviceUserAuthCode()))
            {
                if ($authContext->isAdminRequired() && !$this->isAdmin($this->getSessionUsername()))
                {
                    Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required admin user for " . $requestUri, $requestObj);

                    return FALSE;
                }
                elseif ($authContext->isCloudholderRequired() && !$this->isCloudholder($this->getSessionUsername()))
                {
                    Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure because required cloudholder user for " . $requestUri, $requestObj);

                    return FALSE;
	            }

                Logger::getInstance()->debug(__FUNCTION__ . ", $errorPrefix success for " . $requestUri, $requestObj);

                return TRUE;
            }
        }

        Logger::getInstance()->err(__FUNCTION__ . ", $errorPrefix failure for " . $requestUri, $requestObj);

        return FALSE;
    }

    protected function _checkHmac(AuthContext $authContext)
    {
        if ($authContext->isAdminRequired() && !$this->isAdmin($this->getSessionUsername())) {
            return FALSE;
        } elseif ($authContext->isCloudholderRequired() && !$this->isCloudholder($this->getSessionUsername())) {
            return FALSE;
        }

        if (!$authContext->isHmacAllowed()) {
            return FALSE;
        }

        return TRUE;
    }

    /**
     * Authenticate user from query parameters.<p>
     *
     * This function accepts the following parameter pairs for username and password (some for backwards compataility) <br/>
     * <ul>
     * <li>auth_username, auth_password </li>
     * <li>owner, pw</li>
     * <li>device_user_id, device_user_password</li>
     * </ul>
     *
     * @param array $urlPath array of url path parts
     *    @param array queryParams array of URL query parameters
     *  @param boolean isAdminRequired set to true if user must have admin provileges
     *  @param boolean cloudholderRequired set to true if user must have cloudholder provileges
     * @param boolean $hmacAllowed whether hmac auth is allowed
      * @return true if a user is authenticated, otherwise false.
 */
    public function isAuthenticated(array $urlPath, $queryParams, $isAdminRequired, $cloudholderRequired, $hmacAllowed)
    {
        $requestUri  = $_SERVER['REQUEST_URI'];
        $requestObj  = $_REQUEST;
        $authContext = new AuthContext($urlPath, $queryParams, $requestUri, $requestObj, $isAdminRequired, $cloudholderRequired, $hmacAllowed);

        // Check for user name and password.
        if (isset($queryParams['auth_username']) && isset($queryParams['auth_password']))
        {
            return $this->_checkUsernameAndPassword($authContext);
        }
        elseif (isset($queryParams['owner']) && isset($queryParams['pw'])) // Check for old API for compatability
        {
            return $this->_checkOldApiForCompatibility($authContext);
        }
        elseif (isset($queryParams['device_user_id']) && isset($queryParams['device_user_auth_code'])) // Device User Id and Auth code checking
        {
            return $this->_checkDeviceUserIdAndDeviceUserAuthCode($authContext);
        }
        elseif (isset($queryParams['device_user_id']) && isset($queryParams['request_auth_code']))
        {
            return $this->_checkDeviceUserIdAndRequestAuthCode($authContext);
        }
        elseif (isset($queryParams['hmac']))
        {
            return $this->_checkHmac($authContext);
        }

        session_start();
        //check if user is not logged in through session
        if (empty($_SESSION['LOGIN_CONTEXT'])) {
            //we might have just created an empty session or opened an empty one, either way useless and should go away
            unset($_SESSION['LOGIN_CONTEXT']);
            unset($_SESSION['last_accessed_time']);
            session_destroy();
            return FALSE;
        }

        if (time() - $_SESSION['last_accessed_time'] >= \getGlobalConfig('global')['SESSION_TIMEOUT']) {
            //session timed out, remove
            unset($_SESSION['LOGIN_CONTEXT']);
            unset($_SESSION['last_accessed_time']);
            session_destroy();
            throw new \Core\Rest\Exception('Session Expired', 401, null, 'core');
        }

        \RequestScope::getInstance()->setLoginContext($_SESSION['LOGIN_CONTEXT']);
        $_SESSION['last_accessed_time'] = time();

        session_write_close();

        if ($isAdminRequired)
        {
            return $this->isAdmin($this->getSessionUsername());
        }
        elseif ($cloudholderRequired)
        {
            return $this->isCloudholder($this->getSessionUsername());
        }
        else
        {
            return TRUE;
        }

        Logger::getInstance()->err(__FUNCTION__ . ', Authentication failure for ' . $requestUri, $requestObj);
        return FALSE;
    }

    /**
     * Function to set login session context for a user if user exists
     * Useful when trying to set session context in a non-interactive environemnt
     * such as Job Execution.
     * @param type $username
     * @return boolean
     */
    public function setUserContext($username) {
        $context_success = false;
        $user = UserManager::getInstance()->getUser($username);
        if (!empty($user) || sizeof($user) == 1) {
            $ctxt = new LoginContext($user);
            \RequestScope::getInstance()->setLoginContext($ctxt);
            $context_success = true;
        }
        return $context_success;
    }
}