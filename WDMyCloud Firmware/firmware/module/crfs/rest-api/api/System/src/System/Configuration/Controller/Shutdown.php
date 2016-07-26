<?php
/**
 * \file system_configuration/Shutdown.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Configuration\Controller;

use System\Configuration\Model;


/**
 * \class Shutdown
 * \brief Change the running state which will cause a reboot or shutdown (halt).
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Shutdown
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'shutdown';

    /**
     * \par Description:
     * Change the running state which will cause a reboot or shutdown (halt).
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/shutdown
     *
     * \param state                 String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - state:  reboot/halt
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful reboot or shutdown
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 167  - SHUTDOWN_BAD_REQUEST - Shutdown bad request.
     * - 168  - SHUTDOWN_INTERNAL_SERVER_ERROR - Shutdown internal server error.
     *
     * \par XML Response Example:
     * \verbatim
      <shutdown>
      <status>success</status>
      </shutdown>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $result = (new Model\System())->modifyState($queryParams);

        switch ($result)
        {
            case 'SUCCESS':

                $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);

                break;

            case 'BAD_REQUEST':

                throw new \Core\Rest\Exception('SHUTDOWN_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);

                break;

            case 'SERVER_ERROR':

                throw new \Core\Rest\Exception('SHUTDOWN_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);

                break;
        }
    }
}