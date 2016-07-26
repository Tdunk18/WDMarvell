<?php

namespace Core\Controller;

/*
 * \file common/errorcodes.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/*
 * \class ErrorCodes
 * \brief Get list of error codes.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see CompCodes, Status, Version
 */

class ErrorCodes /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /*
     * \par Description:
     * Get status of processes.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/errors
     *
     * \param error_code String - optional
     * \param error_name String - optional
     * \param format     String - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval error_codes Array - list of error codes
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <errors>
      <error>
      <error_sub_code>0</error_sub_code>
      <error_name>UNKNOWN_ERROR</error_name>
      <error_message>Unknown error</error_message>
      </error>
      <error>
      <error_sub_code>1</error_sub_code>
      <error_name>ALBUM_GET_FAILED</error_name>
      <error_message>Failed to get album</error_message>
      </error>
      </errors>
      \endverbatim
     */

    public function get($urlPath, $queryParams = null, $output_format = 'xml') {
        if (isset($urlPath[0])) {
            if (is_numeric($urlPath[0])) {
                $errorCode = trim($urlPath[0]);
            } else {
                $errorName = trim($urlPath[0]);
            }
        } else {
            $errorCode = isset($queryParams['error_sub_code']) ? trim($queryParams['error_sub_code']) : '';
            $errorName = isset($queryParams['error_name']) ? trim($queryParams['error_name']) : '';
        }

        if (!getSessionUserId()) {
            $this->generateErrorOutput(401, 'errors', 'USER_LOGIN_REQUIRED', $output_format);
            return;
        }

        if (!isAdmin(getSessionUserId())) {
            $this->generateErrorOutput(401, 'errors', 'USER_NOT_AUTHORIZED', $output_format);
            return;
        }

        if (!empty($errorName)) {
            $errorCodes = getErrorCodes($errorName);
            if (!isset($errorCodes['error_sub_code'])) {
                $this->generateErrorOutput(404, 'errors', 'ERROR_NAME_NOT_FOUND', $output_format);
                return;
            }
        } else if (!empty($errorCode)) {
            $errorCodes = getErrorCodes(null, $errorCode);
            if (!isset($errorCodes['error_name'])) {
                $this->generateErrorOutput(404, 'errors', 'ERROR_CODE_NOT_FOUND', $output_format);
                return;
            }
        } else {
            $errorCodes = getErrorCodes('', '');
            $this->generateCollectionOutput(200, 'errors', 'error', $errorCodes, $output_format);
            return;
        }
        $this->generateItemOutput(200, 'errors', $errorCodes, $output_format);
        return;
    }

}