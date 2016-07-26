<?php

namespace SafePoint\Controller;

// Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file SafePoint/Controller/SafePointGetSchedule.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SafePointGetSchedule
 * \brief Get safe-point action schedule.
 *
 */
class SafePointGetSchedule {

	use \Core\RestComponent;
	use SafePointTraitController;

	const COMPONENT_NAME = 'safepoint_getschedule';

	/**
	 * \par Description:
	 * Get list of safe-points managed by NSPT on the local NAS device.
	 * Note that the discover operation above retrieves only the list of safe-points residing on a target share.
	 * Unlike discover the get list operation involves retrieving only the list of safe-points that are being
	 * internally managed by NSPT on local device. Note If option is "inprogress" NSPT (NAS safepoint) shall return only
	 * 1 safe-point in the list as NSPT allows only one action to be processed on a safe-point.
	 *
	 * \par Security:
     * - Admin LAN request only.
	 *
	 * \par HTTP Method: POST
	 * http://localhost/api/@REST_API_VERSION/rest/safepoint_getschedule
	 *
	 * \param option   String - optional
	 * \param handle   String - required
	 * \param action   String - required
	 *
	 * \par Parameter Details:
	 *  - option can be 'abort'
	 *  - handle={handle of safe-point}
	 *  - action={create/update/destroy/restore}
	 *
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 400 - Bad request
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
<safepoint_getschedule>
    <schedule>
        <minute>{0..59}</minute>
        <hour>{0..23}</hour>
        <dom>{1..31/*}</dom>
        <month>{1..12/*}</month>
        <dow>{0..6/*}</dow>
    </schedule>
</safepoint_getschedule>
	 \endverbatim
	 */
    public function get($urlPath, $queryParams=null, $outputFormat='xml'){

        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'version' => \FILTER_VALIDATE_FLOAT,
            'handle' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
            'action' => \FILTER_SANITIZE_STRING,
                ));

        if(empty($queryParams['handle'])) {
			throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
		}

		if(!in_array($queryParams['action'], array('create', 'update', 'destroy', 'restore'))) {
			throw new \Core\Rest\Exception('Bad queryParams[action]', 400, null, self::COMPONENT_NAME);
		}

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
    	if (empty($nsptPath)) {
			throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
		}

        $opts = $this->_getOpts('getschedule', $queryParams);
        $output = $retVal = null;

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            if($queryParams['option'] !== 'abort') {
                $schedules = $this->parseNSPTResponse($output);
                $this->generateCollectionOutput(200, 'safepoint_getschedule', 'schedule', $schedules, $outputFormat);
            } else {
                $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status_code' => (NSPT_BASE_ERROR + $retVal), 'status_name' => 'OK'), $outputFormat);
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }
}