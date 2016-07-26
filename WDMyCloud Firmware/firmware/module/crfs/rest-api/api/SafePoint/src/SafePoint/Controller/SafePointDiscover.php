<?php

/**
 * \file SafePoint/Controller/SafePointDiscover.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointDiscover
 * \brief Discover safe-points on a share.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointDiscover /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_discover';

    /**
     * \par Description:
     * Discover safe-points on a share.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_discover
     *
     * \param option   String - optional
     * \param share    String - required
     * \param ip_addr  String - required
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be one of: owned, compatible, inprogress, failed, abort
     *  - share is the share name
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *  - user empty for public or device username (e.g. Windows user)
     *  - pswd empty for public or device password (e.g. Windows password)
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Legacy Zermatt Error Names:
     *  - FAILED
     *  - INVALID
     *  - UNAUTHORIZED
     *  - NOTFOUND
     *
     * \par XML Response Example:
     * \verbatim
<safepoint_discover>
    <safepoints>
        <safepoint>
            <handle>{handle to the safe-point}</handle>
            <name>{name of the safe-point}</name>
            <description>{description of the safe-point}</description>
            <state>{ok/invalid/notcreated}</state>
            <compatibility>{none/owned/compatible}</compatibility>
            <n_files>{number of files in safe-point}</n_files>
            <total_size>{total size of safe-point in MB}</total_size>
            <device_name>{source device of safe-point}</device_name>
            <ip_addr>{source ip of safe-point}</ip_addr>
            <action>{none/create/destroy/update/restore}</action>
            <action_state>{ok/failed/aborted/inprogress}</action_state>
            <ts_start>{timestamp action started}</ts¬_start>
            <ts_end>{timestamp action ended}</ts_end>
            <priority>{priority of the action}</priority>
        </safepoint>
    </safepoints>
</safepoint_discover>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'ip_addr' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if ( strtolower($string)  == 'usb' ) {
                        return 'local'; // Translation from 'usb' to 'local' for Perl script.
                    }
                    return filter_var($string, \FILTER_VALIDATE_IP);
                }),
            'user' => \FILTER_SANITIZE_STRING,
            'share' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                        if (!in_array($string, array('owned', 'compatible', 'inprogress', 'failed', 'abort'))) {
                            throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                        }
                    return $string;
                }),
                ));

        if (empty($queryParams['ip_addr'])) {
            throw new \Core\Rest\Exception('Bad queryParams[ip_addr]', 400, null, self::COMPONENT_NAME);
        }

        if (empty($queryParams['share'])) {
            throw new \Core\Rest\Exception('Bad queryParams[share]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('discover', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0) {
            if ($queryParams['option'] != 'abort') {
                $collectionList = array('safepoints' => array('safepoint' => $this->parseNSPTResponse($output)));
                $this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, self::COMPONENT_NAME, $collectionList, $outputFormat);
            } else {
                $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}