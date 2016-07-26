<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/Configuration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use Alerts\Alert;

/**
 * \class Configuration
 * \brief Used to Retrieve or Update alert configuration. An alert configuration is a data store that holds a set of email addresses that can be
 *  used to notify user.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Configuration /*extends RestComponent*/ {

	use \Core\RestComponent;
    const COMPONENT_NAME = 'alert_configuration';

    /**
     * \par Description:
     * Returns the complete set of alert configuration from /etc/alert_email.conf.
     *
     * \par Security:
     * - Requires Admin authentication and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/alert_configuration
     *
     * \param format  String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - format:  Refer main page for details
     *
     * \retval alert_configuration - alert configuration details
     *
     * \par HTTP Response Codes:
     * - 200 - On successusful return of alert configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to retrieve alerts.
     * - 239 - ERROR_INTERNAL_SERVER - Error in internal server.
     *
     * \par XML Response Example:
     * \verbatim
<alert_configuration>
  <email_enabled>false</email_enabled>
  <email_returnpath>wdmycloud.alerts@wdc.com</email_returnpath>
  <min_level_email>10</min_level_email>
  <min_level_rss>10</min_level_rss>
  <email_recipient_0></email_recipient_0>
  <email_recipient_1></email_recipient_1>
  <email_recipient_2></email_recipient_2>
  <email_recipient_3></email_recipient_3>
  <email_recipient_4></email_recipient_4>
</alert_configuration>
\endverbatim
     */
    function get($urlPath, $queryParams=null, $outputFormat='xml'){

        try {
            $alertConfigObj = new Alert\AlertConfiguration();
            $result = $alertConfigObj->getConfig();
            $this->generateSuccessOutput(200, 'alert_configuration', $result, $outputFormat);
        } catch ( \Exception $e ) {
            throw new \Core\Rest\Exception('ERROR_INTERNAL_SERVER', 500, $e, self::COMPONENT_NAME);
        }

    }

    /**
     * \par Description:
     * Used to Modify alert configuration located at /etc/alert_email.conf.
     *
     * \par Security:
     * - Requires Admin authentication and request allowed in LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/alert_configuration
     *
     * \param email_enabled          Boolean  - required
     * \param min_level_email        Integer  - required
 	 * \param min_level_rss          Integr   - required
     * \param email_recipient_0      String   - required
     * \param email_recipient_1      String   - required
     * \param email_recipient_2      String   - required
     * \param email_recipient_3      String   - required
     * \param email_recipient_4      String   - required
     * \param format                 String   - optional (default is xml)
     *
     * \par Parameter Details:
     * - email_enabled:  true/false
     * - min_level_email: Minimum Email Alert Severity
     * - min_level_rss: Minimum RSS Alert Severity
     * - email_recipient_0:  {email address}
     * - email_recipient_1:  {email address}
     * - email_recipient_2:  {email address}
     * - email_recipient_3:  {email address}
     * - email_recipient_4:  {email address}
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success update of alert configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to retrieve alerts.
     * - 238 - ERROR_BAD_REQUEST - Bad Request.
     *
     * \par XML Response Example:
     * \verbatim
<alert_configuration>
  <status>SUCCESS</status>
</alert_configuration>
\endverbatim
     */
    function put($urlPath, $queryParams=null, $outputFormat='xml'){

    	if (!empty($queryParams['email_enabled']) && 
    				(filter_var($queryParams['email_enabled'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === null)) {
    		throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
    	}        
    	if (!empty($queryParams['min_level_email']) && !filter_var($queryParams['min_level_email'], FILTER_VALIDATE_INT)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['min_level_rss']) && !filter_var($queryParams['min_level_rss'], FILTER_VALIDATE_INT)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['email_recipient_0']) && !filter_var($queryParams['email_recipient_0'], FILTER_VALIDATE_EMAIL)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['email_recipient_1']) && !filter_var($queryParams['email_recipient_1'], FILTER_VALIDATE_EMAIL)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['email_recipient_2']) && !filter_var($queryParams['email_recipient_2'], FILTER_VALIDATE_EMAIL)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['email_recipient_3']) && !filter_var($queryParams['email_recipient_3'], FILTER_VALIDATE_EMAIL)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        if (!empty($queryParams['email_recipient_4']) && !filter_var($queryParams['email_recipient_4'], FILTER_VALIDATE_EMAIL)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        try {
            $alertConfigObj = new Alert\AlertConfiguration();
            
            $result = $alertConfigObj->modifyConfig($queryParams);

            switch($result){
            case 'SUCCESS':
                $this->generateSuccessOutput(200, 'alert_configuration', array( 'status' => $result ), $outputFormat);
                break;
            case 'BAD_REQUEST':
                //header("HTTP/1.0 400 Bad Request");
                $this->generateErrorOutput(400, 'alert_configuration', 'ERROR_BAD_REQUEST', $outputFormat);
                break;
            case 'SERVER_ERROR':
                //header("HTTP/1.0 500 Internal Server Error");
                $this->generateErrorOutput(500, 'alert_configuration', 'ERROR_INTERNAL_SERVER', $outputFormat);
                break;
            }
        } catch ( \Exception $e ) {
            throw new \Core\Rest\Exception('ERROR_INTERNAL_SERVER', 500, $e, self::COMPONENT_NAME);
        }

	}
}