<?php

namespace Core\Controller;

/*
 * \file common/compcodes.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/*
 * \class CompCodes
 * \brief Get list of component codes.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see ErrorCodes, Status, Version
 */

class CompCodes /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /*
     * \par Description:
     * Get status of processes.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/comp_codes
     *
     * \param comp_code String - optional
     * \param comp_name String - optional
     * \param format    String - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval comp_codes Array - list of component codes
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
      <comp_codes>
      <comp_code>
      <code>0</code>
      <name>comp_codes</name>
      <file>compcodes/compcodes.php</file>
      <title>CompCodes</title>
      <auth>1</auth>
      </comp_code>
      <comp_code>
      <code>1</code>
      <name>config</name>
      <file>config/config.php</file>
      <title>Config</title>
      <auth></auth>
      </comp_code>
      </comp_codes>
      \endverbatim
     */

    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        if (isset($urlPath[0])) {
            if (is_numeric($urlPath[0])) {
                $compCode = trim($urlPath[0]);
            } else {
                $compName = trim($urlPath[0]);
            }
        } else {
            $compCode = isset($queryParams['comp_code']) ? trim($queryParams['comp_code']) : '';
            $compName = isset($queryParams['comp_name']) ? trim($queryParams['comp_name']) : '';
        }
        if (!getSessionUserId()) {
            $this->generateErrorOutput(401, 'comp_codes', 'USER_LOGIN_REQUIRED', $outputFormat);
            return;
        }
        if (!isAdmin(getSessionUserId())) {
            $this->generateErrorOutput(401, 'comp_codes', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }
        if (!empty($compName)) {
            $compCodes = getComponentCodes($compName);
            if (!isset($compCodes['code'])) {
                $this->generateErrorOutput(404, 'comp_codes', 'COMP_NAME_NOT_FOUND', $outputFormat);
                return;
            }
        } else if (!empty($compCode)) {
            $compCodes = getComponentCodes(null, $compCode);
            if (!isset($compCodes['name'])) {
                $this->generateErrorOutput(404, 'comp_codes', 'COMP_CODE_NOT_FOUND', $outputFormat);
                return;
            }
        } else {
            $compCodes = getComponentCodes('', '');
            $this->generateCollectionOutput(200, 'comp_codes', 'comp_code', $compCodes, $outputFormat);
            return;
        }
        $this->generateItemOutput(200, 'comp_codes', $compCodes, $outputFormat);
        return;
    }

}