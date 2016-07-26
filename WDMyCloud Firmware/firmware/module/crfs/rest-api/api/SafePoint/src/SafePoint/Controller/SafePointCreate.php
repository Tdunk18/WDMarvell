<?php

namespace SafePoint\Controller;

// Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file SafePoint/Controller/SafePointCreate.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SafePointCreate
 * \brief Create a safe-point on a target share on a target device.
 *
 */
class SafePointCreate {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_create';

    /**
     * \par Description:
     * Create a safe-point on a target share on a target device. The safe-point create operation can be executed with the following options
     * - none - Create the safe-point instantaneously. Since creating a safe-point can be a time-consuming operation, NSPT must return this call before initiating the actual data copy process.
     * - precreate - Schedule the safe-point creation at a later time.
     * - dryrun - Perform a trial run of the safe-point creation. Do not actually create one.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_create
     *
     * \param ip_addr       String - required
     * \param name          String - required
     * \param share         String - required
     * \param option        String - optional
     * \param user          String - optional
     * \param pswd          String - optional
     * \param handle        String - optional
     * \param priority      String - optional
     * \param minute        String - optional
     * \param hour          String - optional
     * \param dom           String - optional
     * \param month         String - optional
     * \param dow           String - optional
     * \param description   String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'precreate' or 'abort'
     *  - option will default to 'none'.
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *  - user empty for public or device username (e.g. Windows user)
     *  - pswd empty for public or device password (e.g. Windows password)
     *  - share - share name
     *  - handle - handle of safe-point
     *  - name={name of safe-point}
     *  - description={empty/description of safe-point}
     *  - priority=normal/below/above
     *  - minute={0..59}
     *  - hour={0..23}
     *  - dom={1..31/*}
     *  - month={1..12/*}
     *  - dow={0..6/*}
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Status Codes:
     *  - OK
     *  - INPROGRESS
     *  - FAILED
     *  - INVALID
     *  - UNAUTHORIZED
     *  - NOTFOUND
     *  - BUSY
     *  - NOSPACE
     *  - DUPLICATE
     *
     * \par XML Response Example: success with option = none
     * \verbatim
<safepoint_create>
    <status_code>{status code}</status_code>
    <status_name>OK/INPROGRESS</status_name>
    <status_desc>{any status description}</status_desc>
    <safepoint>
        <handle>{handle of safe-point}</handle>
    </safepoint>
</safepoint_create>
      \endverbatim
     * \par XML Response Example: success with option = precreate
     * \verbatim
<safepoint_create>
    <safepoint>
        <handle>{handle of safe-point}</handle>
    </safepoint>
</safepoint_create>
      \endverbatim
     * \par XML Response Example: success with option = dryrun
     * \verbatim
<safepoint_create>
    <dryrun>
        <total_size>{total size of safe-point in MB}</total_size>
        <ts_end>{estimated time to complete}</ts_end>
    </dryrun>
</safepoint_create>
      \endverbatim
     * \par XML Response Example: failure
     * \verbatim
<safepoint_create>
    <status_code>{status code}</status_code>
    <status_name>{error status name}</status_name>
    <status_desc>{any status description}</status_desc>
</safepoint_create>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'version' => \FILTER_VALIDATE_FLOAT,
            'ip_addr' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if ( strtolower($string)  == 'usb' ) {
                        return 'local'; // Translation from 'usb' to 'local' for Perl script.
                    }
                    return filter_var($string, \FILTER_VALIDATE_IP);
                }),
            'user' => \FILTER_SANITIZE_STRING,
            'share' => \FILTER_SANITIZE_STRING,
            'handle' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('precreate', 'abort'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'name' => \FILTER_SANITIZE_STRING,
            'description' => \FILTER_SANITIZE_STRING,
            'priority' => \FILTER_SANITIZE_STRING,
            'minute' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
					if($string!=='*') {
						$string = (int) $string;
					}
                    if ( $string > 59 ) {
                        throw new \Core\Rest\Exception('Bad queryParams[minute]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'hour' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if($string!=='*') {
						$string = (int) $string;
					}
                    if ( $string > 23 ) {
                        throw new \Core\Rest\Exception('Bad queryParams[hour]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'dom' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                   	if($string!=='*') {
						$string = (int) $string;
					}
                    if ( $string > 31 ) {
                        throw new \Core\Rest\Exception('Bad queryParams[dom]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'month' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                   	if($string!=='*') {
						$string = (int) $string;
					}
                    if ( $string > 12 ) {
                        throw new \Core\Rest\Exception('Bad queryParams[month]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'dow' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if($string!=='*') {
						$string = (int) $string;
					}
                    if ( $string > 6 ) {
                        throw new \Core\Rest\Exception('Bad queryParams[dow]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
                ));

        // Required Fields
        if (empty($queryParams['ip_addr'])) {
            throw new \Core\Rest\Exception('Bad queryParams[ip_addr]', 400, null, self::COMPONENT_NAME);
        }

        if (empty($queryParams['share'])) {
            throw new \Core\Rest\Exception('Bad queryParams[share]', 400, null, self::COMPONENT_NAME);
        }

        if (empty($queryParams['name'])) {
            throw new \Core\Rest\Exception('Bad queryParams[name]', 400, null, self::COMPONENT_NAME);
        }

        // Required only if Option is "abort"
        if ($queryParams['option'] == 'abort' && empty($queryParams['handle'])) {
            throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
        }

        // Required only if Option is "precreate"s
        if ($queryParams['option'] == 'precreate') {
            // Tricky cause 0 is a valid value, making empty() unusable. Boolean false means validation failed
            if ($queryParams['minute'] === false || is_null($queryParams['minute'])) {
                throw new \Core\Rest\Exception('Bad queryParams[minute]', 400, null, self::COMPONENT_NAME);
            }

            if ($queryParams['hour'] === false || is_null($queryParams['hour'])) {
                throw new \Core\Rest\Exception('Bad queryParams[hour]', 400, null, self::COMPONENT_NAME);
            }

            // Don't even try for "Only Feb 2nd that falls on Sundays"
            if ($queryParams['month'] && $queryParams['dom']) {
                unset($queryParams['dow']);
            }
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');

        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('create', $queryParams);

        $output=$retVal=null;

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0 || $retVal == NSPT_INPROGRESS) {

            $info = $this->parseNSPTResponse($output);

            switch ($queryParams['option']) {
                case 'precreate':
                    $this->generateCollectionOutput(200, self::COMPONENT_NAME, 'safepoint', $info, $outputFormat);
                    break;
                default:
                    $status = $this->getStatusCode($retVal);
                    $output = new \OutputWriter(strtoupper($outputFormat));
                    $output->pushElement('safepoint_create');
                    $output->element('status_code', $status['status_code'] + NSPT_BASE_ERROR);
                    $output->element('status_name', $status['status_name']);
                    $output->element('status_desc', $status['status_desc']);
                    $output->pushElement('safepoint');
                    $output->element('handle', $info[0]['handle']);
                    $output->popElement();
                    $output->popElement();
                    $output->close();
                    break;
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}