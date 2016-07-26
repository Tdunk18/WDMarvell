<?php
/**
 * \file auth/login.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Auth\Controller;

require_once COMMON_ROOT . '/includes/globalconfig.inc';
require_once COMMON_ROOT . '/includes/outputwriter.inc';
require_once COMMON_ROOT . '/includes/security.inc';
require_once COMMON_ROOT . '/includes/util.inc';

use Auth\User\UserSecurity;

/**
 * \class Login
 * \brief Authenticate user through the Wide Area Network.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see LocalLogin, Logout, RemoteAccount, VerifyRemoteUser
 */
class Login
{
	use \Core\RestComponent;

	const COMPONENT_NAME = 'login';

    /**
     * \par Description:
     * Validate device user id and device auth code for authentication.
     *
     * \par Security:
     * - WAN users must use this component to login.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/login?device_user_id={device_user_id}&device_user_auth_code={device_user_auth_code}
     *
     * \param device_user_id        String - required
     * \param device_user_auth_code String - required
     * \param format                String - optional
     *
     * \par Parameter Details:
     * - The device_user_id is linked with a user id in DeviceUser.
     * - The device user auth code is the code that is used to bind the device with the user. One user account can have multiple device user ids.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful authentication of user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 30 - INVALID_AUTH_CODE - Invalid device user id or auth code
     *
     * \par XML Response Example:
     * \verbatim
      <login>
      <status>success</status>
      <username>fred</user_id>
      <user_id>fred</user_id>
      </login>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $output_format = 'xml')
    {
        if (!UserSecurity::getInstance()->authenticateDeviceUser($queryParams['device_user_id'],
                $queryParams['device_user_auth_code']))
        {
        	throw new \Core\Rest\Exception('INVALID_AUTH_CODE', 401, NULL, static::COMPONENT_NAME);
        }

        // Get User ID and update http session (php session)
        session_start();

        $_SESSION['LOGIN_CONTEXT'] = $ctxt = \RequestScope::getInstance()->getLoginContext();
        $_SESSION['last_accessed_time'] = time();

        session_write_close();

        $results = ['status' => 'success', 'username' => $ctxt->getUserName(), 'user_id' => $ctxt->getUserName()];

        $this->generateSuccessOutput(200, 'login', $results, $output_format);
    }
}