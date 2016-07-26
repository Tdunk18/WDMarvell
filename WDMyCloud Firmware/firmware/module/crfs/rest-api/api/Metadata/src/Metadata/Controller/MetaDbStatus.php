<?php

/**
 * \file Metadata/Controller/MetaDBStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once COMMON_ROOT . '/includes/globalconfig.inc';
require_once COMMON_ROOT . '/includes/outputwriter.inc';
require_once METADATA_ROOT . '/includes/metadb.inc';
require_once FILESYSTEM_ROOT . '/includes/db/multidb.inc';

use \Core\SystemInfo;

/**
 * \class MetaDbStatus
 * \brief Get last timestamps of specified media type.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MetaDBAlbum, MetaDBGroup, MetaDbInfo, MetaDBSummary
 */
class MetaDbStatus
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'metadb_status';

    /**
     * \par Description:
     * Get last timestamps of specified media type.
     *
     * \par Security:
     * - Verifies authorized share access and valid path name.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/metadb_status/{path}
     *
     * \param path            String  - required
     * \param media_type      String  - optional  (videos, music, photos, other)
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - If a path is specified, then the returned content will be restricted to only
     *   include files and directories that are contained within the specified path.
     *   Such a path will use the same syntax as other paths and thus include a share
     *   name optionally followed by subdirectories (e.g. Public/subdir1/subdir2).
     *   If no path is specified then, no additional filtering will be placed on the
     *   returned content (security filtering is always included).
     *   Already deleted files will be excluded.
     *
     * - The media_type parameter will filter the type of files to summarize.
     *   The acceptable values are photos, music, videos, or other.
     *   The default is all the files in the specified directory
     *
     * \retval metadb_status Array - media type listing
     *
     * \par HTTP Response Codes:
     * - 200 - On success for getting group list
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 93 - INVALID_PARAMETER - Invalid parameter value
     * - 126 - DB_ACCESS_FAILED - Database access failed
     *
     * \par XML Response Example:
     * \verbatim
      <metadb_status>
      <current_time>1304017279</current_time>
      <videos>
      <last_modified_time>1304017279</last_modified_time>
      <last_transcoded_time>1304017279</last_transcoded_time>
      </videos>
      <music>
      <last_modified_time>1304017279</last_modified_time>
      <last_transcoded_time>1304017279</last_transcoded_time>
      </music>
      <photos>
      <last_modified_time>1304017279</last_modified_time>
      <last_transcoded_time>1304017279</last_transcoded_time>
      </photos>
      <files>
      <last_modified_time>1304017279</last_modified_time>
      <last_transcoded_time>1304017279</last_transcoded_time>
      </files>
      </metadb_status>
      \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $shareName  = $this->_issetOrWithTrim($urlPath[0]);
        $mediaType  = $this->_issetOrWithTrim($queryParams['media_type']);
        $validTypes = ['videos', 'music', 'photos', 'other'];

        if (!empty($mediaType) && !in_array($mediaType, $validTypes))
        {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        }
        $sharesDao = new \Shares\Model\Share\SharesDao();
        if (!empty($shareName) && !$sharesDao->isShareAccessible($shareName, FALSE))
        {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
        }

        $dbPath = getShareCrawlerDbPath($shareName);

        \Core\Logger::getInstance()->info("DBPATH:: $dbPath");

        if (!file_exists($dbPath))
        {
        	throw new \Core\Rest\Exception('DB_PATH_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            if (SystemInfo::getOSName() === 'windows')
            {
                $metadb    = new \MetaDb(getShareCrawlerDbPath($shareName));
                $shareName = '';
            }
            else
            {
                $metadb = new \MetaDb();
            }

            $metadb->generateMetaDbStatus($shareName, $mediaType, $outputFormat);
        }
        catch (\Exception $e)
        {
            throw new \Core\Rest\Exception('DB_ACCESS_FAILED', 500, NULL, static::COMPONENT_NAME);
        }
    }
}