<?php

namespace Remote\Controller;

/**
 * \file Remote/Controller/InternAccess.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class InternetAccess
 * \brief Return current status of Internet connectivity.
 */
class InternetAccess /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'internet_access';
    const OPENDNS = '208.67.222.222';
    const GOOGLEDNS = '8.8.8.8';
    const TEST_PORT = '53'; // DNS port
    const TIMEOUT = '0.5'; // It connects, or it doesn't. Don't wait.
    
    protected $destinations = array(
        'wd2go' => 'www.wd2go.com:80',
        'opendns' => '208.67.222.222:53',
        'googledns' => '8.8.8.8:53'
    );

    /**
     * \par Description:
     * Return current status of Internet connectivity.
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/internet_access/{destination}
     *
     * \param destination  String - optional
     *
     * \par Parameter Details:
     * - destination can be any one of: wd2go, opendns, googledns
     * 
     * \retval connectivity Boolean If connectivity is successful
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the connectivity status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
		<internet_access>
    		<connectivity>true</connectivity>
		</internet_access>
      \endverbatim
     */

    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        
        $connectivity = true;
        if ( !empty($urlPath[0]) ) {
            $destination = filter_var($urlPath[0],\FILTER_SANITIZE_STRING);
            if ( !isset($this->destinations[$destination])) {
                throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
            }
        }

        $errno = $errstr = null; // kills uninitialized variable warnings.
        
        // New destination parameter
        if ( !empty($destination) ) {
            list($host, $port) = explode(':', $this->destinations[$destination]);
            \Core\Logger::getInstance()->info(sprintf('Manually testing host "%s" on port "%d"', $host, $port));
            if (($socket = fsockopen($host, $port, $errno, $errstr, self::TIMEOUT) ) == false) {
                $connectivity = false;
            }
        } else {
            // Left as interal if to make things simple.
            //   Default tests
            if (($socket = fsockopen(self::GOOGLEDNS, self::TEST_PORT, $errno, $errstr, self::TIMEOUT) ) == false) {
                if (($socket = fsockopen(self::OPENDNS, self::TEST_PORT, $errno, $errstr, self::TIMEOUT) ) == false) {
                    $connectivity = false;
                }
            }
        }

        fclose($socket);

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('connectivity' => \Core\Config::booleanToString($connectivity)), $outputFormat);
    }

}
