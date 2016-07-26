<?php

namespace Remote\Controller;

/**
 * \file remote/PortTest.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class PortTest
 * \brief Test WAN access by retrieving the device id.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MioDB, MioCrawlerStatus
 */
class PortTest /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Test WAN access by retrieving the device id.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/port_test
     *
     * \param format String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval deviceid Integer - id of device
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the device id
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <port_test>
      <deviceid>27258</deviceid>
      </port_test>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $deviceId = getDeviceId();
        if (isset($deviceId)) {
            $results = array('deviceid' => $deviceId);
            $this->generateSuccessOutput(200, 'port_test', $results, $outputFormat);
        } else {
            $this->generateErrorOutput(404, 'port_test', 'DEVICE_ID_NOT_FOUND', $outputFormat);
        }
    }

}
