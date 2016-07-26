<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/Events.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use Alerts\Alert\Db\AlertDB;

/**
 * \class Events
 * \brief Returns a complete set of alert events catalogue which gives comprehensive information about all alert events available in the system.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Events /*extends RestComponent*/ {

	use \Core\RestComponent;

    const COMPONENT_NAME = 'alert_events';

    /**
     * \par Description:
     * Returns a complete set of alert events catalogue which gives comprehensive information about all alert events available in the system.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/alert_events
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - format:  Refer main page for details
     * - code: {alert code, check AlertDesc table in wd-alert-desc.db or alertmessages.txt to get this number}
     *
     * \retval alert_events - Array of alerts
     * - code: {alert code} optional
     * - severity: {error/warning/info}
     * - scope: {all/specific/admin}
     * - admin_ack_only: >{0/1}
     * - description>: {alert description}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of alert events catalogue
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 236 - ERROR_NOT_FOUND - Requested resource not found.
     *
     * \par XML Response Example:
     * \verbatim
<alert_events>
  <alerts>
    <alert>
      <code>0201</code>
      <severity>critical</severity>
      <scope>all</scope>
      <admin_ack_only>1</admin_ack_only>
      <description>Drive failed</description>
    </alert>
    <alert>
      <code>1202</code>
      <severity>warning</severity>
      <scope>all</scope>
      <admin_ack_only>0</admin_ack_only>
      <description>Drive too small</description>
    </alert>
    <alert>
      <code>2203</code>
      <severity>Info</severity>
      <scope>admin</scope>
      <admin_ack_only>1</admin_ack_only>
      <description>Drive is being initialized</description>
    </alert>
  </alerts>
</alert_events>
\endverbatim
     */
    function get($urlPath, $queryParams=null, $outputFormat='xml') {
       // $this->logObj->LogData('OUTPUT', __CLASS__,  __FUNCTION__,  "PARAMS: (queryParams=$queryParams)");
        $code = (isset($queryParams['code'])) ? ($queryParams['code']) : '';

        $alertdb = new AlertDB();
        $rows = $alertdb->queryAlertDesc($code);

        if(count($rows) <= 0) {
            throw new \Core\Rest\Exception('ERROR_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        $output = new \OutputWriter(strtoupper($outputFormat));
        $output->pushElement("alert_events");
        $output->pushElement('alerts');
        $output->pushArray('alert');
        foreach($rows as $row) {
            $output->pushArrayElement();
            $output->element('code', $row['code']);
            $output->element('severity', $row['severity']);
            $output->element('scope', $row['scope']);
            $output->element('admin_ack_only', $row['admin_ack_only']);
            $output->element('description', $row['description']);
            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->popElement();
        $output->close();
    }
}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */