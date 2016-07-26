<?php

/**
 * LoginContext - provides persistent storage of User Properties for current session
 *
 * @author joesapsford
 *
 */

namespace Auth\User;

class LoginContext {

    /**
     * @var int
     */
    protected $userId;

    /**
     * @var string
     */
    protected $userName;

    /**
     * @var boolean
     */
    protected $admin = false;

    /**
     * @var boolean
     */
    protected $cloudholder = false;

    /**
     * @var int
     */
    protected $deviceUserId;

    /**
     * @var string
     */
    protected $authType;

    /**
     * @var boolean
     */
    protected $requestBasedAuth = false;

    const LOCAL_AUTH = 1;
    const DEVICE_USER_AUTH = 2;

    function __construct($user) {
        $this->setUserId($user->getUserName());
        $this->setUserName($user->getUserName());
        $this->setAdmin($user->getIsAdmin());
        $this->setCloudholder($user->getIsCloudholder());
        $this->setRequestBasedAuth(true);
    }

    public function getUserId() {
        return $this->userId;
    }

    /**
     * @param type $userId
     * @return \Auth\User\LoginContext
     * @deprecated U
     * 
     *  User ID is no longer used, use setUserName instead
     */
    public function setUserId($userId) {
        $this->userId = $userId;
        return $this;
    }

    public function getUserName() {
        return $this->userName;
    }

    /**
     *
     * @param type $userName
     * @return \Auth\User\LoginContext
     */
    public function setUserName($userName) {
        $this->userName = $userName;
        return $this;
    }

    public function isAdmin() {
        return $this->admin;
    }

    /**
     *
     * @param type $admin
     * @return \Auth\User\LoginContext
     */
    public function setAdmin($admin) {
        $this->admin = $admin;
        return $this;
    }

    public function isCloudholder() {
        return $this->cloudholder;
    }

    public function setCloudholder($cloudholder) {
        $this->cloudholder = $cloudholder;
        return $this;
    }

    public function getDeviceUserId() {
        return $this->deviceUserId;
    }

    /**
     *
     * @param type integer
     * @return \Auth\User\LoginContext
     */
    public function setDeviceUserId($deviceUserId) {
        $this->deviceUserId = $deviceUserId;
        return $this;
    }

    public function getAuthType() {
        return $this->authType;
    }

    /**
     *
     * @param type $authType
     * @return \Auth\User\LoginContext
     */
    public function setAuthType($authType) {
        $this->authType = $authType;
        return $this;
    }

    public function getRequestBasedAuth() {
        return $this->requestBasedAuth;
    }

    /**
     *
     * @param type boolean
     * @return \Auth\User\LoginContext
     */
    public function setRequestBasedAuth($requestBasedAuth) {
        $this->requestBasedAuth = $requestBasedAuth;
        return $this;
    }

    /**
     * Backwards compatible method to catch any junk "getIsAdmin()" calls.
     *
     * @return boolean
     */
    public function getIsAdmin() {
        return $this->isAdmin();
    }

    /**
     * Backwards compatible method to catch any junk "setIsAdmin()" calls.
     *
     * @return \Auth\User\LoginContext
     */
    public function setIsAdmin($admin) {
        return $this->setAdmin($admin);
    }

}