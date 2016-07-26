<?php

namespace SafePoint\Controller;

// Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file SafePoint/Controller/SafePointGetList.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SafePointGetList
 * \brief Get list of safe-points managed by NSPT on the local NAS device.
 *
 */
class SafePointGetList {

	use \Core\RestComponent;
	use SafePointTraitController;

	const COMPONENT_NAME = 'safepoint_getlist';

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
	 * http://localhost/api/@REST_API_VERSION/rest/safepoint_getlist
	 *
	 * \param option   String - optional
	 *
	 * \par Parameter Details:
	 *  - option can be 'inprogress' or 'failed' or 'abort'
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
<safepoint_getlist>
    <safepoints>
        <safepoint>
            <handle>{handle to the safe-point}</handle>
            <name>{name of the safe-point}</name>
            <description>{description of the safe-point}</description>
            <state>{ok/invalid/notcreated}</state>
            <compatibility>{owned/compatible}</compatibility>
            <n_files>{number of files in safe-point}</n_files>
            <total_size>{total size of safe-point in MB}</total_size>
            <device_name>{target of safe-point}</device_name>
            <ip_addr>{target ip of safe-point}</ip_addr>
            <share>{target share name}</share>
            <action>{none/create/destroy/update/restore}</action>
            <action_state>{ok/failed/aborted/inprogress}</action_state>
            <ts_start>{timestamp action started}</ts�_start>
            <ts_end>{timestamp action ended}</ts_end>
            <priority>{priority of the action}</priority>
        </safepoint>
    ...
    ...
    </safepoints>
</safepoint_getlist>
	 \endverbatim
	 */
	public function get($urlPath, $queryParams=null, $outputFormat='xml'){

		\Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

		$queryParams = filter_var_array($queryParams, array(
            'version' => \FILTER_VALIDATE_FLOAT,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort', 'inprogress', 'failed'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
                ));


        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
		if (empty($nsptPath)) {
			throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
		}

        $opts = $this->_getOpts('getlist', $queryParams);

		$output=$retVal=null;

		$INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

		// Parameters hardcoded and escaped above.
		exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
		\Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

		if($retVal == 0) {
			if($queryParams['option'] !== 'abort') {
				$safepoints = $this->parseNSPTResponse($output);
				$collectionList = array('safepoints' => array('safepoint' => $safepoints));
				$this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, 'safepoint_getlist', $collectionList, $outputFormat);
			} else {
				$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status_code' => (NSPT_BASE_ERROR + $retVal), 'status_name' => 'OK'), $outputFormat);
			}
		} else {
			throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
		}
	}
}