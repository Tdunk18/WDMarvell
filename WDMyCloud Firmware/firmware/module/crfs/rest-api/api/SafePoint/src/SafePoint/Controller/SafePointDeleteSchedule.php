<?php

/**
 * \file SafePoint/Controller/SafePointSetSchedule.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointDeleteSchedule
 * \brief Set safepoint action schedule. The safe-point must be activated and in managed list of NSPT before invoking this operation.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointDeleteSchedule {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_deleteschedule';

    /**
     * \par Description:
     * - Delete safepoint action schedule.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/safepoint_deleteschedule
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param action   String - required
     *
     * \par parameter details
     * - handle - handle of safepoint
     * - action - {create/update/destroy/restore}
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Legacy Zermatt Error Names:
     *  - OK
     *  - FAILED
     *  - INVALID
     *  - NOTFOUND
     *
     * \par XML Response on Success:
     * \verbatim
<safepoint_setschedule>
    <status_code>{status code}</status_code>
    <status_name>OK</status_name>
</safepoint_setschedule>
      \endverbatim
     * \par XML Responce on Failure:
     * \verbatim
<safepoint_setschedule>
    <status_code>{status code}</status_code>
    <status_name>{error status name}</status_name>
    <status_desc>{any status description}</status_desc>
</safepoint_setschedule>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $queryParams = filter_var_array($queryParams, array(
            'handle' => \FILTER_SANITIZE_STRING,
            'action' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('create', 'update', 'destroy', 'restore'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[action]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            ));

        // Validate inputs
        if (empty($queryParams['handle'])) {
            throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
        }

        if (empty($queryParams['action'])) {
            throw new \Core\Rest\Exception('Bad queryParams[action]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if ($nsptPath === NULL) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('setschedule', $queryParams);

        $output=$retVal=null;
        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}