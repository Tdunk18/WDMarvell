<?php

/**
 * \file SafePoint/Controller/SafePointRestore.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointRestore
 * \brief Restore safe-point.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointRestore /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_restore';

    /**
     * \par Description:
     * Restore safe-point. The safe-point must be
     * activated and in managed list of NSPT before invoking the restore operation.
     *
     * Note: This operation should be invoked after executing create/update/destroy/restore
     * operations to determine current status of the action.
     *
     * "OK" status not required for successful POST operation
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_restore
     *
     * \param handle   String - required
     * \param option   String - optional
     * \param priority String - optional
     * \param share    String - optional
     * \param ip_addr  String - optional
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be one of: abort, dryrun.
     *  - handle is the handle of safe-point.
     *  - action can only be one of: create, update, destroy, restore.
     *  - priority can only be one of: normal, below, above.
     *  - share and ip_addr are required if option != abort.
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     *
     * \par Legacy Zermatt Error Names:
     *  - FAILED
     *  - INVALID
     *  - NOTFOUND
     *  - BUSY
     *  - NOSPACE
     *  - UNREACHABLE
     *  - NOTALLOWED
     *  - NOTUSABLE
     *
     * \par XML Response Example if option=none:
     * \verbatim
<safepoint_restore>
    <status_code>{status code}</status_code>
    <status_name>OK/INPROGRESS</status_name>
    <status_desc>{any status description}</status_desc>
</safepoint_restore>
      \endverbatim
     *
     * \par XML Response Example if option=dryrun:
     * \verbatim
<safepoint_restore>
    <dryrun>
        <total_size>{total size of safe-point in MB}</total_size>
        <ts_end>{estimated time to complete}</ts_end>
    </dryrun>
</safepoint_restore>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'version' => \FILTER_VALIDATE_FLOAT,
            'ip_addr' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if ( strtolower($string)  == 'usb' ) {
                        return 'local'; // Translation from 'usb' to 'local' for Perl script.
                    }
                    return filter_var($string, \FILTER_VALIDATE_IP);
                }),
            'handle' => \FILTER_SANITIZE_STRING,
            'priority' => \FILTER_SANITIZE_STRING,
            'user' => \FILTER_SANITIZE_STRING,
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => 'base64_decode'),
            'share' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ($string) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort', 'dryrun'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
                ));

        if (empty($queryParams['handle'])) { // Typo in message was there originally; leaving incase they check against string.
            throw new \Core\Rest\Exception('Bad input handle]', 400, null, self::COMPONENT_NAME);
        }

        /* share and ip_addr are required unless you're aborting an existing restore */
        if ($queryParams['option'] !== 'abort') {
            if (empty($queryParams['ip_addr'])) {
                throw new \Core\Rest\Exception('Bad queryParams[ip_addr]', 400, null, self::COMPONENT_NAME);
            }

            if (empty($queryParams['share'])) {
                throw new \Core\Rest\Exception('Bad queryParams[share]', 400, null, self::COMPONENT_NAME);
            }
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('restore', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            switch ($queryParams['option']) {
                case 'dryrun':
                    $this->generateCollectionOutput(200, self::COMPONENT_NAME, 'dryrun', $this->parseNSPTResponse($output), $outputFormat);
                    break;
                default:
                    $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
                    break;
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}
