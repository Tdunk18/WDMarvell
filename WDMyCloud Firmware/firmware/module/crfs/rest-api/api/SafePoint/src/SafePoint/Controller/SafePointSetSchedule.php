<?php

/**
 * \file SafePoint/Controller/SafePointSetSchedule.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointSetSchedule
 * \brief Set safepoint action schedule. The safe-point must be activated and in managed list of NSPT before invoking this operation.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointSetSchedule {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_setschedule';

    /**
     * \par Description:
     * - Set safepoint action schedule.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/safepoint_setschedule
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param action   String - required
     * \param minute   String - required
     * \param hour     String - required
     * \param dom      String - required
     * \param month    String - required
     * \param dow      String - required
     *
     * \par parameter details
     * - handle - handle of safepoint
     * - action - {create/update/destroy/restore}
     * - minute - {0..59}
     * - hour   - {0..23}
     * - dom    - {1..31/*}
     * - month  - {1..12/*}
     * - dow    - {0..6/*}
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
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $queryParams = filter_var_array($queryParams, array(
            'handle' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'name' => \FILTER_SANITIZE_STRING,
            'action' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('create', 'update', 'destroy', 'restore'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[action]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
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

        // Validate inputs
        if (empty($queryParams['handle'])) {
            throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
        }

        if (empty($queryParams['action'])) {
            throw new \Core\Rest\Exception('Bad queryParams[action]', 400, null, self::COMPONENT_NAME);
        }

        // Tricky cause 0 is a valid value, making empty() unusable. Boolean false means validation failed
        if($queryParams['minute'] === false || is_null($queryParams['minute']) ) {
            throw new \Core\Rest\Exception('Bad queryParams[minute]', 400, null, self::COMPONENT_NAME);
        }

        if($queryParams['hour'] === false || is_null($queryParams['hour']) ) {
            throw new \Core\Rest\Exception('Bad queryParams[hour]', 400, null, self::COMPONENT_NAME);
        }

        // Don't even try for "Only Feb 2nd that falls on Sundays"
        if ( $queryParams['month'] &&  $queryParams['dom'] ) {
            unset($queryParams['dow']);
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