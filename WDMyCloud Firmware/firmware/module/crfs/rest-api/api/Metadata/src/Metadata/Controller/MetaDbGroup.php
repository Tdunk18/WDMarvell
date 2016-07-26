<?php

namespace Metadata\Controller;

/**
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
require_once(COMMON_ROOT . "/includes/outputwriter.inc");
require_once METADATA_ROOT . '/includes/db_group_definitions.inc';
require_once METADATA_ROOT . '/includes/db_group.inc';
require_once METADATA_ROOT . '/includes/db_group_updater.inc';
require_once METADATA_ROOT . '/includes/db_util.inc';
require_once METADATA_ROOT . '/includes/db_filter.inc';

/**
 * \class MetaDbGroup
 * \brief Groups files based on requested type (e.g. genre) and returns information on each such group.
 */
class MetaDbGroup
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'metadb_group';

    /**
     * \par Description:
     * This GET request groups files based on requested type (e.g. genre) and returns information on each such group.
     *
     * \par Security:
     * - Verifies that the current use has read permission for the requested share name.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/metadb_group/{share_name}?category={category}&group_by={group_by}
     * - http://localhost/api/@REST_API_VERSION/rest/metadb_group/Public?category={category}&group_by=year
     * - http://localhost/api/@REST_API_VERSION/rest/metadb_group/Public?category={category}&group_by=year&subgroup_by=month&group_name=2014
     *
     * - This component extends the Rest Component.
     * - Supports xml and json formats for response data. Default format is xml.
     * - This component can be executed from browser, flash UI app or any script.
     * - User must be authenticated to use this component.
     * - User must have authorization to access the share that is requested.
     * - Hidden files are always excluded from the results presented by this API.
     * - If this API is executed soon after uploading large amount of data in a device, this API can take longer time to display the new output,
     *   as it's output depends on media crawler DB changes.
     *
     * \param share_name  String  - required
     * \param format      String  - optional (supports json and xml.  default is xml)
     * \param category    String  - required
     * \param group_by    String  - required
     * \param subgroup_by String  - optional
     * \param group_name  String  - optional (applies to group_by)
     * \param order       String  - optional (supports asc and desc. default is asc)
     * \param row_offset  integer - optional (default is 0)
     * \param row_count   integer - optional (default is to return all rows)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - category - must be: video, audio, or image
     * - group_by - specifies the type by which grouping will be done.
     *    When category=video, group_by can be: year, genre, or folder
     *    When category=audio, group_by can be: year, album, artist, genre, or folder
     *    When category=image, group_by can be: year, or folder
     * - subgroup_by - specifies a second level of grouping that will be done.  This is optional and only applies when two levels of grouping are needed.
     *    When category=video and group_by=year, subgroup_by can be month
     *    When category=audio and group_by=artist, subgroup_by can be album
     *    When category=image and group_by=year, subgroup_by can be month
     * - group_name - If a subgroup_by is provided, then "group_name" can be included which limits the first column to only the specified name.
     *       e.g. category=video&group_by=year&subgroup_by=month&group_name=2001 (When grouped by year and month, only include those groups whose year is 2001)
     *       e.g. category=audio&group_by=artist&subgroup_by=album&group_name=Jackson (When grouped by artist and album, only include those groups whose artist is Jackson)
     *      - Filetering by group_name is different for NULL and empty.
     *      - If NULL need to be searched a special defined constatnt @NULL must be used. it is case sensitive. e.g. group_name=@NULL
     *      - If empty need to be searched an empty resuest parameter must be passed as part of request. e.g. group_name=
     * - order - can be either "asc" or "desc" and defaults to "asc".  The column(s) for sorting are always the column(s) by which the grouping was done.
     * - row_offset - the first row to include in the results
     * - row_count - the maximum number of rows to include in the results
     *
     * \par Error Codes:
     * - 2500 - INVALID_GROUP_BY - The group_by paramater is invalid.
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $skipAccessibleCheck = FALSE;
        if (isset($queryParams['hmac'])) {
            try {
                \Auth\Model\Hmac::validatePacket($queryParams['hmac'], implode(DS, $urlPath));
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
            }

            $skipAccessibleCheck = TRUE;
        }

        $category   = $this->_issetOrWithTrim($queryParams['category']);
        $groupBy    = $this->_issetOrWithTrim($queryParams['group_by']);
        $subgroupBy = $this->_issetOrWithTrim($queryParams['subgroup_by']);
        $groupName  = $this->_issetOr($queryParams['group_name']);
        $order      = $this->_issetOrWithTrim($queryParams['order']);
        $shareName  = $urlPath[0];
        $rowOffset  = getParameter($queryParams, 'row_offset', \PDO::PARAM_INT, 0, FALSE);
        $rowCount   = getParameter($queryParams, 'row_count' , \PDO::PARAM_INT, 0, FALSE);
        $sharePath  = implode(DS, $urlPath);
        // debug_sql: A debug flag to dump SQL queries & query plans. Not a required param
        $debugSql   = getParameter($queryParams, 'debug_sql', \PDO::PARAM_BOOL, FALSE);

        // Make sure that the input is one of the valid enumerated values
        $order = getEnumerationValue($order, 'asc', ['asc', 'desc']);

        // Convert from the three separate parameters into a single identifier of the type of grouping that is being requested
        $groupingType = $category . '_' . $groupBy;

        if (!empty($subgroupBy))
        {
            $groupingType .= '_' . $subgroupBy;
        }

        if (trim($shareName) == '') {
            throw new \Core\Rest\Exception('SHARE_NAME_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        $sharesDao = new \Shares\Model\Share\SharesDao();

        $share = $sharesDao->get($shareName);
        if (!$share) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        if(!$skipAccessibleCheck && !($sharesDao->isShareAccessible($shareName, false, false))){
            throw new \Core\Rest\Exception('SHARE_NOT_ACCESSIBLE', 403, NULL, static::COMPONENT_NAME);
        }

        //Check if share-volume is dynamic, if so, check if scanning is switched on for that volume
        $isDynamicVolume = \RequestScope::getMediaVolMgr()->isDynamicVolume($shareName);
        if(($isDynamicVolume) && (\Metadata\Model\ExternalVolumeMediaView::isScanEnabled() === '0')){
            throw new \Core\Rest\Exception('INVALID_VOLUME_FOR_SCANNING', 400, NULL, static::COMPONENT_NAME);
        }

        // Lookup the requested type of grouping to make sure that it is valid
        $groupingType = getEnumerationKey($groupingType, NULL, getGroupingInfos());

        if (empty($groupingType))
        {
            throw new \Core\Rest\Exception('INVALID_GROUP_BY', 400, NULL, static::COMPONENT_NAME);
        }

        if ($rowOffset < 0)
        {
            throw new \Core\Rest\Exception('INVALID_FILE_ROW_OFFSET', 400, NULL, static::COMPONENT_NAME);
        }

        if ($rowCount < 0)
        {
            throw new \Core\Rest\Exception('INVALID_FILE_ROW_COUNT', 400, NULL, static::COMPONENT_NAME);
        }

        set_time_limit(0);

        try{
            $dbAccess = new \DBAccess();
            // In the final system, this will be run separately
            // todo: Critical: Get this to execute separately based on a cron job which checks for changes to the database
            updateGroupingTableIfChanged($shareName, $dbAccess, $debugSql);

            generateGroupingResponse($dbAccess, openDbwithPath(getGroupingDbPath($shareName)), $shareName,
                $sharePath, $groupingType, $groupName, ($order === 'asc'), $rowOffset,
                $rowCount, $debugSql, new \OutputWriter(strtoupper($outputFormat)));
        } catch (\Exception $ex) {
            throw new \Core\Rest\Exception($ex->getMessage(), $ex->getCode(), $ex, static::COMPONENT_NAME);
        }

        set_time_limit(ini_get('max_execution_time'));
    }
}