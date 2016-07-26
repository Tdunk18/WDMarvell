<?php

namespace System\Reporting\Controller;

/**
 * \file common/Status.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class Status
 * \brief Get status of the processes.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 *
 * \see MioCrawlerStatus, Version
 */

use System\Reporting\Status\StatusManager;

class Status /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Get status of the processes.
     *
     * \par Security:
     * - User authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/status
     *
     * \param format String - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval status Array - status of processes
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the status
     *
     * \par XML Response Example:
     * \verbatim
      <status>
      <communicationmanager>running</communicationmanager>
      <mediacrawler>running</mediacrawler>
      <miocrawler>running</miocrawler>
      </status>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $statusMgr = StatusManager::getInstance();
        $results = $statusMgr->getServicesStatus();

        $this->generateSuccessOutput(200, 'status', $results, $outputFormat);
    }

}