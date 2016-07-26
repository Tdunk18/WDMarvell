<?php

namespace DlnaServer\Controller;

use DlnaServer\Model;

/**
 * \file DlnaServer/Configuration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class Configuration
 * \brief Retrieve and update media server configuration.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Configuration /* extends AbstractActionController */ {

    use \Core\RestComponent;

    protected $logObj;

    public function __construct() {
      	//$this->logObj = new \LogMessages();
    }

    /**
     * \par Description:
     * Return DLNA configuration.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/media_server_configuration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval enable_media_server  {true/false}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the configuration
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <media_server_configuration>
      <enable_media_server>true</enable_media_server>
      </media_server_configuration>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $dlnaServerConfigObj = new Model\DlnaServer();
        $result = $dlnaServerConfigObj->getConfig();

        if ($result !== NULL) {
            $results = array('enable_media_server' => $result['enable_media_server']);
            $this->generateSuccessOutput(200, 'media_server_configuration', $results, $outputFormat);
            //$this->logObj->LogData('OUTPUT', __CLASS__, __FUNCTION__, 'SUCCESS');
        } else {
            //Failed to collect info
            //$this->logObj->LogData('OUTPUT', __CLASS__, __FUNCTION__, 'INTERNAL SERVER ERROR');
            $this->generateErrorOutput(500, 'media_server_configuration', 'MEDIA_SERVER_CONFIGURATION_INTERNAL_SERVER_ERROR', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Modify DLNA configuration.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/media_server_configuration
     *
     * \param enable_media_server   Boolean - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - enable_media_server:  true/false
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of the configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <media_server_configuration>
      <status>success</status>
      </media_server_configuration>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        //$this->logObj->LogParameters(__CLASS__, __FUNCTION__, $queryParams);

        $dlnaServerConfigObj = new Model\DlnaServer();
        $result = $dlnaServerConfigObj->modifyConfig($queryParams);

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'media_server_configuration', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                $this->generateErrorOutput(400, 'media_server_configuration', 'MEDIA_SERVER_CONFIGURATION__BAD_REQUEST', $outputFormat);
                break;
            case 'SERVER_ERROR':
                $this->generateErrorOutput(500, 'media_server_configuration', 'MEDIA_SERVER_CONFIGURATION_INTERNAL_SERVER_ERROR', $outputFormat);
                break;
        }
        //$this->logObj->LogData('OUTPUT', __CLASS__, __FUNCTION__, $result);
    }

}
