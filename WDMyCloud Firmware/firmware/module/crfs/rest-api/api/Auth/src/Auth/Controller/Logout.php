<?php
/**
 * \file auth/logout.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Auth\Controller;

require_once COMMON_ROOT . '/includes/outputwriter.inc';

/**
 * \class Logout
 * \brief Clear current login session on the device.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Login, LocalLogin
 */
class Logout
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'logout';

    /**
     * \par Description:
     * Clear current login (invalidate) session on the device.
     *
     * \par Security:
     * - All users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/logout
     *
     * \param format String - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful logout of the user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <logout>
      <status>success</status>
      </logout>
      \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        session_start();

        unset($_SESSION['LOGIN_CONTEXT']);
        unset($_SESSION['last_accessed_time']);

        session_destroy();

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
    }
}