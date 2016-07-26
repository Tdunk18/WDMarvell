<?php

/**
 * \file iTunes/Controller/Configuration.php
 * \module iTunes
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace iTunes\Controller;

use iTunes\Model;

/**
 * \class Configuration
 * \brief REST API class for checking the status, and disabling or enabling the itunes service.
 *
 * - This component uses Core\RestComponent.
 * - Supports xml response data.
 * - Authentication required for all calls:
 * -  POST enabled for Admin and LAN only
 */
class Configuration /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'itunes_configuration';

    /**
     * \par Description:
     * Gets the current itune service state.
     *
     * \par Security:
     * - User must be authenticated to use this component (lan and wan)
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/itunes_configuration
     *
     * \retval enable_itunes_server    boolean
     *
     * \par HTTP Response Codes:
     * - 200 - On success, returns itunes server status.
     * - 500 - Internal server error, failed to run script required to check itunes server status.
     *
     * \par Error Codes:
     * - 250 - ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR - Error in internal server.
     *
     * \par XML Response Example:
     * \verbatim
		<itunes_configuration>
    	<enable_itunes_server>true</enable_itunes_server>
		</itunes_configuration>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        try {
            $status = (new Model\iTunes())->getServiceStatus();
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('enable_itunes_server' => $status), $outputFormat);
    }

    /**
     * \par Description:
     * Sets the iTunes service enabled or disabled on start up.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/itunes_configuration
     *
     * \param
     *  - enable_itunes_server   boolean - required
     *
     * \par Parameter Details:
     *  - Any value other than "true" will assume "false."
     *
     * \retval success String - true
     *
     * \par HTTP Response Codes:
     * - 200 - On success, iTunes server status successfully updated.
     * - 400 - Bad request, enabled_itunes_server is not supplied
     * - 500 - Internal server error, failed to run script required to update itunes server status.
     *
     * \par Error Codes:
     * - 249 - ITUNES_CONFIGURATION_BAD_REQUEST - Bad Request.
     * - 250 - ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR - Error in internal server.
     *
     * \par XML Response Example:
     * \verbatim
		<itunes_configuration>
    	<status>success</status>
		</itunes_configuration>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

        if (!isset($queryParams['enable_itunes_server'])) {
            throw new \Core\Rest\Exception('ITUNES_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }
        //$status = ! (boolean) strcasecmp($queryParams['enable_itunes_server'], 'true'); // A cleaver way of converting "matches" (0) to boolean true.
		$status = $queryParams['enable_itunes_server'];
        try {
            (new Model\iTunes())->setService($status);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' =>
            'success'), $outputFormat);
    }

}