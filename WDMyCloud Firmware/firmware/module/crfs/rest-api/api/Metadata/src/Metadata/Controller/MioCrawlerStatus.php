<?php
/**
 * \file metadata/miocrawlerstatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once COMMON_ROOT . '/includes/outputwriter.inc';
require_once COMMON_ROOT . '/includes/security.inc';
require_once DB_ROOT . '/includes/statusdb.inc';
require_once COMMON_ROOT . '/includes/util.inc';
require_once METADATA_ROOT . '/includes/miodb.inc';

/**
 * \class MioCrawlerStatus
 * \brief Get status of the MioCrawler process.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MioDB, MetaDbInfo, MetaDBSummary
 */
class MioCrawlerStatus
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'miocrawler_status';

    /**
     * \par Description:
     * Get status of the MioCrawler process.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/miocrawler_status
     *
     * \param volume_id - optional, the id of the volume. If this is omitted, the status for all volumes is returned
     *
     * \param format String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for getting mioclawler status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 253 - MIOCRAWLER_STATUS_FAILED - Error in getting MioCrwaler status failed
     *
     * \par XML Response Example:
     * \verbatim

      <miocrawler_status>
          <mdate>1368737853</mdate>
          <desc/>
          <etype>0</etype>
          <mc_version>2.0</mc_version>
      </miocrawler_status>
      \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        //For Bali device get photo DB path
        $statusdb = new \StatusDB();

        //Get DB file path from config file
        $photoDbPath = getPhotoDbPath(); //get miodb path - works with MediaCrawler

        if ($photoDbPath === FALSE)
        {
            //not using mediaCrawler.
            $status = $statusdb->getStatus();
        }
        else
        {
            if (!file_exists($photoDbPath))
            {
                throw new \Core\Rest\Exception('MIOCRAWLER_STATUS_FAILED', 404, NULL, static::COMPONENT_NAME);
            }

            $db     = openDbwithPath($photoDbPath);
            $status = $statusdb->getStatusWithDb($db);
        }

        if (empty($status))
        {
            throw new \Core\Rest\Exception('MIOCRAWLER_STATUS_FAILED', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateItemOutput(200, 'miocrawler_status', $status, $outputFormat);
    }
}