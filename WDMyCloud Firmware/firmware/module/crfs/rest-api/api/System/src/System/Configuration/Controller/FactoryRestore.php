<?php
/**
 * \file system_configuration/FactoryRestore.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Configuration\Controller;

use System\Configuration\Model;

/**
 * \class FactoryRestore
 * \brief Supports restoring device to factory defaults.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class FactoryRestore
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'system_factory_restore';

    /**
     * \par Description:
     * Returns the progress of factory restore (EULA not required for this call).
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/system_factory_restore
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval system_factory_restore - System factory restore
     * - percent: {0 -100}
     * - status: {idle/inprogress/complete}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the status of the restore
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 170  - SYSTEM_FACTORY_RESTORE_INTERNAL_SERVER_ERROR - System factory restore internal server error.
     *
     * \par XML Response Example:
     * \verbatim
      <system_factory_restore>
      <percent></percent>
      <status>idle</status>
      </system_factory_restore>
      \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $result = (new Model\Configuration())->getStaus();

        if ($result !== NULL)
        {
            $results =
            [
                'percent' => $result['completion_percent'],
                'status'  => $result['status']
            ];

            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $results, $outputFormat);
        }
        else
        {
            // Failed to collect info
            throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Cause NAS to restore to factory defaults with zero fill or format of user data.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/system_factory_restore
     *
     * \par HTTP POST Body
     * - erase=format
     *
     * \param erase  String - required
     *
     * \par Parameter Details:
     * - erase: {systemOnly/format/zero}.
     *         - The "systemOnly" factory restore sets all of the settings back to their defaults, but leaves the users data (and shares) intact.
     *         - The "format" factory restore sets all of the settings back to their defaults, then deletes all the data and shares (leaving an empty Public shares).
     *         - The "zero" factory restore sets all of the settings back to their defaults, then zeros-fill (deletes) all the data and shares (leaving an empty Public shares).
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful restore with user specified format
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Operation is not permitted either because of insufficient power, or because not plugged in
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 170  - SYSTEM_FACTORY_RESTORE_INTERNAL_SERVER_ERROR - System factory restore internal server error.
     * - 169  - SYSTEM_FACTORY_RESTORE_BAD_REQUEST - System factory restore bad request.
     * - 2400 - SYSTEM_FACTORY_RESTORE_ERROR_ON_BATTERY_POWER - That operation is not allowed while on battery power.
     * - 2401 - SYSTEM_FACTORY_RESTORE_ERROR_INSUFFICIENT_POWER - That operation requires more than 50% battery life.
     *
     * \par XML Response Example:
     * \verbatim
      <system_factory_restore>
      <status>success</status>
      </system_factory_restore>
      \endverbatim
     */
    public function post($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        switch ((new Model\Configuration())->restore($queryParams))
        {
            case Model\Configuration::SUCCESS:

                $this->generateSuccessOutput(201, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);

                break;

            case Model\Configuration::BAD_REQUEST:

                throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);

                break;

            case Model\Configuration::SERVER_ERROR:

                throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);

                break;

            case Model\Configuration::ERROR_ON_BATTERY_POWER:

                throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_ERROR_ON_BATTERY_POWER', 403, NULL, static::COMPONENT_NAME);

                break;

            case Model\Configuration::ERROR_INSUFFICIENT_POWER:

                throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_ERROR_INSUFFICIENT_POWER', 403, NULL, static::COMPONENT_NAME);

                break;

            default:

                throw new \Core\Rest\Exception('SYSTEM_FACTORY_RESTORE_INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);

                break;
        }
    }
}