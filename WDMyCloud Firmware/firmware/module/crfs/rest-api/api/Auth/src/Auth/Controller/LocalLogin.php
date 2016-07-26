<?php
/**
 * \file auth/locallogin.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Auth\Controller;

require_once COMMON_ROOT . '/includes/outputwriter.inc';
require_once COMMON_ROOT . '/includes/util.inc';
require_once COMMON_ROOT . '/includes/requestscope.inc';
require_once COMMON_ROOT . '/includes/security.inc';

use \Auth\User\UserManager;
use \Auth\User\UserSecurity;

/**
 * \class LocalLogin
 * \brief Authenticate user through the Local Area Network.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Login, Logout
 */
class LocalLogin
{
	use \Core\RestComponent;

	const COMPONENT_NAME = 'local_login';

    /**
     * \par Description:
     * Validate username and password for authentication.
     *
     * \par Security:
     * - Only LAN users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/local_login?username={username}&password={password}
     *
     * \param username String - required
     * \param password String - required
     * \param format   String - optional
     *
     * \par Parameter Details:
     * - Refer to main page for what is a valid username and password.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful login of the user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 60 - WAN_LOGIN_NOT_ALLOWED - Remote login is not allowed
     * - 31 - INVALID_LOGIN - Invalid login
     * - 112 - UNAUTHENTICATED_LOGIN - Unauthenticated login
     *
     * \par XML Response Example:
     * \verbatim
      <local_login>
      <status>success</status>
      </local_login>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $username = $this->_issetOrWithTrim($queryParams['username'], $this->_issetOrWithTrim($queryParams['owner']));
        $password = $this->_issetOrWithTrim($queryParams['password'], $this->_issetOrWithTrim($queryParams['pw']));

        if (is_null($username) || is_null($password))
        {
        	throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        }

        if (!isLanRequest())
        {
        	throw new \Core\Rest\Exception('WAN_LOGIN_NOT_ALLOWED', 401, NULL, static::COMPONENT_NAME);
        }

        if (!UserManager::getInstance()->isValid($username))
        {
        	throw new \Core\Rest\Exception('INVALID_LOGIN', 401, NULL, static::COMPONENT_NAME);
        }

        if (!UserSecurity::getInstance()->authenticateLocalUser($username, $password))
        {
        	throw new \Core\Rest\Exception('UNAUTHENTICATED_LOGIN', 401, NULL, static::COMPONENT_NAME);
        }

        session_start();

        $_SESSION['LOGIN_CONTEXT'] = \RequestScope::getInstance()->getLoginContext();
        $_SESSION['last_accessed_time'] = time();

        session_write_close();

        $results = ['status' => 'success', 'wd2go_server' => getCentralServerHost()];

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $results, $outputFormat);
    }
}