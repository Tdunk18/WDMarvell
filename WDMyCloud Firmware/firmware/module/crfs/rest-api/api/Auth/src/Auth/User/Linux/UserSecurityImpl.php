<?php

namespace Auth\User\Linux;

require_once(COMMON_ROOT . '/includes/requestscope.inc');

use Auth\User\UserSecurity;

class UserSecurityImpl extends UserSecurity
{
    /**
     * A reference to an instance of the UserSystemUtils
     *
     * @var UserSystemUtils
     */
    protected $_userSystemUtils;

    public function __construct()
    {
        $this->_userSystemUtils = UserSystemUtils::getInstance();
    }

	/**
	 * Authenticate a local user's credentials
	 *
	 * @param string $username local username
	 * @param string $passwordHash Base 64 encoded password
	 * @return boolean true if valid credentials, else false
	 */
	protected function authenticateUserCredentials($username, $passwordHash) {
		return $this->_userSystemUtils->authenticateLocalUser($username, $passwordHash);
	}

	/**
	 * Check if user with given username is the owner of the device.
	 *
	 * @param string $username username
	 * @return true if username is the device owner's username, else false
	 */

	public function isDeviceOwner($username) {
		return $this->_userSystemUtils->isOwner($username);
	}


}