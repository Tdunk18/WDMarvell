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
 * \class Scan
 * \brief REST API class runs the 'rescan' option on the itunes service.
 *
 * - This component uses Core\RestComponent.
 * - Supports xml response data.
 * - Admin Authentication on LAN required for all calls.
 */
class Scan /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'itunes_scan';

    /**
     * \par Description:
     * Runs the itunes init.d service with 'rescan' parameter.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/itunes_scan
     *
     * \param
     *  - scan  String - required
     *
     * \par Parameter Details:
     *  - parameter used only as a way to block accidental PUT calls.
     *  - only accepted value is 'now'; actual meaning is irrelevant.
     *
     * \retval success String - true
     *
     * \par HTTP Response Codes:
     * - 200 - On success, iTunes server status successfully updated.
     * - 400 - Bad request scan is not equal to "now" or not supplied.
     * - 500 - Internal server error, itunes scan script failed to run for one reason or another.
     *
     * \par Error Codes:
     * - [TBD] - ITUNES_CONFIGURATION_BAD_REQUEST - Bad Request
     * - [TBD] - ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR - Error in internal server.
     *
     * \par XML Response Example:
     * \verbatim
<itunes_scan>
    <status>success</status>
</ituns_scan>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

        /* All we do is insure scan is passed. It insures no accidental request. */
        if (!isset($queryParams['scan']) && !strcasecmp($queryParams['scan'], 'now')) {
            throw new \Core\Rest\Exception('ITUNES_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        try {
            (new Model\iTunes())->scan();
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ITUNES_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' =>
            'success'), $outputFormat);
    }

}
