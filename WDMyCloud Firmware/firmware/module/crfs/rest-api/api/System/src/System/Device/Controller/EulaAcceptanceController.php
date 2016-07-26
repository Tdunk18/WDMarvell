<?php

namespace System\Device\Controller;

use System\Device\Model;
use System\Device\Exception as DeviceException;

/**
 * \file device/EulaAcceptanceController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class EulaAcceptanceController
 * \brief Retrieve and create EULA acceptance.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - No authentication if request is from LAN
 *
 */

class EulaAcceptanceController /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = "eula_acceptance";

    /**
     * \par Description:
     * If EULA(End User License Agreement) has been accepted, HTTP status 200 will be returned.  If EULA not accepted, 'NOT Found' is returned
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/eula_acceptance
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval eula_acceptance - EULA acceptance
     * accepted:  {yes}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of eula acceptance
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example not accepted:
     * \verbatim
      <eula_acceptance>
      <error_code>404</error_code>
      <http_status_code>404</http_status_code>
      <error_id>140</error_id>
      <error_message>EULA not accepted</error_message>
      </eula_acceptance>
      \endverbatim
     *
     * \par XML Response Example accepted:
     * \verbatim
      <eula_acceptance>
      <accepted>yes</accepted>
      </eula_acceptance>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $eulaObj = new Model\Eula();

		if($eulaObj->getAcceptance()){
			$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('accepted' => 'yes'), $outputFormat);
		}else{
			throw new \Core\Rest\Exception('EULA_NOT_ACCEPTED', 404, null, self::COMPONENT_NAME);
		}
    }

    /**
     * \par Description:
     * Used to accept EULA(End User License Agreement).  This is a one time resource creation.
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/eula_acceptance
     *
     * \par HTTP POST Body
     * - accepted=yes
     *
     * \param accepted     String - required
     * \param format       String - optional
     *
     * \par Parameter Details:
     * - accepted:  {yes} Indicates user has accepted EULA.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 201 - On successful updation of eula acceptance
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <eula_acceptance>
      <accepted>yes</accepted>
      </eula_acceptance>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $eulaObj = new Model\Eula();

        //Verify values are valid
        if( !isset($queryParams["accepted"]) || ($queryParams['accepted'] !== 'yes')){
        	throw new \Core\Rest\Exception('EULA_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        try {
        	$eulaObj->accept();
        } catch (DeviceException $e) {
        	throw new \Core\Rest\Exception('EULA_INTERNAL_SERVER_ERROR', 400, null, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(201, self::COMPONENT_NAME, array('status' => 'success'), $outputFormat);
    }

}