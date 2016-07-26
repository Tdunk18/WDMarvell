<?php

namespace System\Reporting\Controller;

use System\Reporting\System;

/**
 * \file system_reporting/State.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class State
 * \brief Get system state
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class State /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'system_reporting';

    /**
     * \par Description:
     * Returns system status (EULA not required, owner password not required).
     * RAID status is only reported for units with RAIDed user data.
     * RAID status of bad is only returned for failed drive or failed RAID.
     * If any of the statuses listed are bad, reported_status maybe set bad based on a policy.
     * This is meant as a hint to UIs as to when to indicate ‘bad’.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/system_state
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval system_state - System state
     * status:  {initializing/ready}
     * temperature:  {good/bad}
     * smart:  {good/bad}
     * volume:  {good/bad}
     * free_space:  {good/bad}
     * raid_status:  {good/bad}
     * reported_status:  {good/bad}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the system state
     * - 500 - Internal server error
     *
     * \par Error codes:
     * - 172 - SYSTEM_STATE_INTERNAL_SERVER_ERROR - System state internal server error
     *
     * \par XML Response Example:
     * \verbatim
<system_state>
    <status>ready</status>
    <temperature>good</temperature>
    <smart>good</smart>
    <volume>good</volume>
    <free_space>good</free_space>
    <reported_status>good</reported_status>
</system_state>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $infoObj = \System\Reporting\SystemReporting::getManager();
        try {
            $result = $infoObj->getState();
            if ($result !== NULL) {
                $this->generateSuccessOutput(200, 'system_state', $result, $outputFormat);
            } else {
                //Failed to collect info
                $this->generateErrorOutput(500, 'system_state', 'SYSTEM_STATE_INTERNAL_SERVER_ERROR', $outputFormat);
            }
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SYSTEM_STATE_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }
    }

}