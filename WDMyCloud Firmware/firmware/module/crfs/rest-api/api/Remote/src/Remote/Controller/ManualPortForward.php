<?php

namespace Remote\Controller;

/**
 * \file remote/ManualPortForward.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class ManualPortForward
 * \brief Used to manage ports used by the device for communication.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 */
class ManualPortForward /* extends AbstractActionController */ {

    use \Core\RestComponent;

    function __construct() {
        require_once(COMMON_ROOT . '/includes/globalconfig.inc');
        require_once(COMMON_ROOT . '/includes/outputwriter.inc');
    }

    /**
     * \par Description:
     * Used for retrieving the state of the manual port forwarding configuration.
     *
     * \par Security:
     * - User auth required
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/manual_port_forward
     *
     * \retval manual port forward configuration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the manual port forward configuration
     * - 403 - Request is forbidden
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
		<manual_port_forward>
  			<manual_port_forward>false</manual_port_forward>
  			<manual_external_http_port></manual_external_http_port>
  			<manual_external_https_port></manual_external_https_port>
		</manual_port_forward>
     \endverbatim
     */
    function get($urlPath, $queryParams = null, $output_format = 'xml') {
        $manualportForward = getManualportForward();
        $manualExternalHttpPort = getManualExternalHttpPort();
        $manualExternalHttpsPort = getManualExternalHttpsPort();

        $manualportForward = strtolower($manualportForward);

        $results = array(
            'manual_port_forward' => $manualportForward,
            'manual_external_http_port' => $manualExternalHttpPort,
            'manual_external_https_port' => $manualExternalHttpsPort,
        );
        $this->generateSuccessOutput(200, 'manual_port_forward', $results, $output_format);
    }

    /**
     * \par Description:
     * Used for updating the state of the manual port forwarding configuration.
     *
     * \par Security:
     * - Admin auth required and request is from LAN
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/manual_port_forward
     *
     * \param manual_port_forward             Boolean - required
	 * \param manual_external_http_port       Integer - required
     * \param manual_external_https_port      Integer - required
     *
     * \par Parameter Details:
	 * - manual_port_forward - {true/false}
     * - manual_external_http_port  - {manually configured http port number}
     * - manual_external_https_port - {manually configured https port number}
     *
     * \retval manual port forward configuration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the manual port forward configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
		<manual_port_forward>
  			<status>success</status>
		</manual_port_forward>
     \endverbatim
     */
    function put($urlPath, $queryParams = null, $output_format = 'xml') {

        $manualPortForward = isset($queryParams['manual_port_forward']) ? trim($queryParams['manual_port_forward']) : null;

        if (empty($manualPortForward)) {
            $this->generateErrorOutput(400, 'manual_port_forward', 'PARAMETER_MISSING', $output_format);
            return;
        }

        if (strcasecmp($manualPortForward, "TRUE") == 0) {
            $manualExternalHttpPort = isset($queryParams['manual_external_http_port']) ? trim($queryParams['manual_external_http_port']) : null;
            $manualExternalHttpsPort = isset($queryParams['manual_external_https_port']) ? trim($queryParams['manual_external_https_port']) : null;

            if (empty($manualExternalHttpPort) || empty($manualExternalHttpsPort)) {
                $this->generateErrorOutput(400, 'manual_port_forward', 'PARAMETER_MISSING', $output_format);
                return;
            }

            //Check for http and https port numbers
            if (!is_numeric($manualExternalHttpPort) || !is_numeric($manualExternalHttpsPort)) {
                $this->generateErrorOutput(400, 'manual_port_forward', 'INVALID_PARAMETER', $output_format);
                return;
            }
            setManualPortForwardConfig($manualPortForward, $manualExternalHttpPort, $manualExternalHttpsPort);
        } else if (strcasecmp($manualPortForward, "FALSE") == 0) {
            clearManualPortForwardConfig();
        } else {
            $this->generateErrorOutput(400, 'manual_port_forward', 'INVALID_PARAMETER', $output_format);
            return;
        }

        $results = array('status' => 'success');
        $this->generateSuccessOutput(200, 'manual_port_forward', $results, $output_format);
    }

    /**
     * \par Description:
     * Used for deleting any configured port forwarding for manual port forwarding but retains the state of manual port forwarding.
     *
     * \par Security:
     * - Admin auth required and request is from LAN
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/manual_port_forward
     *
     * \retval manual port forward configuration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the manual port forward configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
     <manual_port_forward>
     <status>success</status>
     </manual_port_forward>
     \endverbatim
     */
    function delete($urlPath, $queryParams = null, $output_format = 'xml') {

    	setManualPortForwardConfig(getManualportForward(), '', '');

    	$results = array('status' => 'success');
    	$this->generateSuccessOutput(200, 'manual_port_forward', $results, $output_format);

    }

}