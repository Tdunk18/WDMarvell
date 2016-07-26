<?php

/**
 * \file SafePoint/Controller/SafePointGetStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointUpdate
 * \brief Update safe-point.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointUpdate /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_update';

    /**
     * \par Description:
     * Update safe-point
     *
     * Note: This operation should be invoked after executing create/update/destroy/restore
     * operations to determine current status of the action.
     *
     * "OK" status not required for successful PUT operation
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_update
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param priority String - optional
     *
     * \par Parameter Details:
     *  - option can only be one of: abort.
     *  - handle is the handle of safe-point.
     *  - priority can only be one of: normal, below, above (default:  normal)
     *
     * \retval status String - success
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
     *  - NOSPACE
     *  - UNREACHABLE
     *
     * \par XML Response Example if option=none:
     * \verbatim
<safepoint_update>
    <status_code>{status code}</status_code>
    <status_name>OK/INPROGRESS</status_name>
    <status_desc>{any status description}</status_desc>
</safepoint_update>
      \endverbatim
     *
     * \par XML Response Example if option=dryrun:
     * \verbatim
<safepoint_update>
    <dryrun>
        <total_size>{total size of updated safe-point in MB}</total_size>
        <size_processed>{size of safe-point to be updated}</size_processed>
        <ts_end>{estimated time to complete}</ts_end>
    </dryrun>
</safepoint_update>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'handle' => \FILTER_SANITIZE_STRING,
            'priority' => array('filter' => \FILTER_CALLBACK,
                'options' => 'strtolower',
            ),
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ($string) {
                                    $string = strtolower($string);
                        if (!in_array($string, array('abort'))) {
                            throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                        }
                    return $string;

                }),
                ));

        if (empty($queryParams['handle'])) { // Typo in message was there originally; leaving incase they check against string.
            throw new \Core\Rest\Exception('Bad input handle', 400, null, self::COMPONENT_NAME);
        }

        if ($queryParams['priority'] && !in_array($queryParams['priority'], array('normal', 'below', 'above'))) {
            throw new \Core\Rest\Exception('Bad input priority', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('update', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            switch($queryParams['option']) {
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