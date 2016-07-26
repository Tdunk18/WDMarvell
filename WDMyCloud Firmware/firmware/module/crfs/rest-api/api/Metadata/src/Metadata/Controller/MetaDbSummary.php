<?php
/**
 * \file Metadata/Controller/MetaDbSummary.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once implode(DS, [METADATA_ROOT, 'includes', 'db_info_definitions.inc']);
require_once implode(DS, [METADATA_ROOT, 'includes', 'db_util.inc']);
require_once implode(DS, [METADATA_ROOT, 'includes', 'db_filter.inc']);
require_once implode(DS, [COMMON_ROOT, 'includes', 'outputwriter.inc']);
require_once implode(DS, [METADATA_ROOT, 'includes', 'db_summary.inc']);
require_once implode(DS, [DB_ROOT, 'includes', 'dbutil.inc']);

/**
 * \class MetaDbSummary
 * \brief Returns information on files based on a DB query.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MetaDbInfo
 */
class MetaDbSummary
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'metadb_summary';

    /**
     * \par Description:
     * Get summary of files within the specified directory.
     *
     * \par Security:
     * - Verifies that the current use has read permission for the requested share name.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/metadb_summary/{path}
     *
     * \param path            String  - required
     * \param recursive       Boolean - optional (default is true)
     * \param include_hidden  Boolean - optional (default is false)
     * \param start_time      Integer - optional
     * \param modified_date   String  - optional
     * \param category        String  - optional (video, audio, image)
     * \param format          String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * - The parameters described above filter the summary returned by metadb_summary in the same way that metadb_info filters its results with the same parameters.
     * - See description of metadb_info GET for details.
     * - Metadb_summary only supports the filtering parameters described above since some filters do not apply to the summary (e.g. sorting order).
     *
     * \retval metadb_summary Array - path listing
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
     * - 94 - INVALID_START_TIME - Invalid start time
     * - 76 - INVALID_SHARE - Invalid share
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 85 - VOLUME_INFO_MISSING - Volume information missing
     * - 243 - DB_PATH_MISSING - Error in DB file location
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 93 - INVALID_PARAMETER - Invalid parameter value
     * - 126 - DB_ACCESS_FAILED - Database access failed
     * - 378 - INVALID_VOLUME_FOR_SCANNING - Crawler scanning is switched off for this external volume
     *
     * \par XML Response Example:
     * \verbatim
         <?xml version="1.0" encoding="utf-8"?>
         <metadb_summary>
            <file_count>5808</file_count>
            <size>10442449853</size>
            <path>/Public</path>
        </metadb_summary>
        \endverbatim
     */

    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $skipAccessibleCheck = FALSE;
        if (isset($queryParams['hmac'])) {
            try {
                \Auth\Model\Hmac::validatePacket($queryParams['hmac'], implode(DS, $urlPath));
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, $e, static::COMPONENT_NAME);
            }

            $skipAccessibleCheck = TRUE;
        }

        // Taking the sharename out and results sharename removed from urlpath
        $shareName =  array_shift($urlPath);
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
        $dynamicVolumeCheck = \RequestScope::getMediaVolMgr()->isDynamicVolume($shareName);
        if(($dynamicVolumeCheck) && (\Metadata\Model\ExternalVolumeMediaView::isScanEnabled() === '0')){
            throw new \Core\Rest\Exception('INVALID_VOLUME_FOR_SCANNING', 400, NULL, static::COMPONENT_NAME);
        }

        $dbPath = \RequestScope::getMediaVolMgr()->getVolumeByShareName($shareName)['DbPath'];

        if (empty($dbPath) || !file_exists($dbPath))
        {
            throw new \Core\Rest\Exception('DB_PATH_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        // Put all of the request parameters into a single structure
        $tf                            = ['true' => TRUE, 'false' => FALSE];
        $categories                    = getCategoryNamesFromRequest($queryParams['category']);
        $dbInfoRequest                 = new \DBInfoRequest();
        $dbInfoRequest->categories     = $categories;
        $dbInfoRequest->shareName      = $shareName;
        $dbInfoRequest->share          = $share;
        $dbInfoRequest->subpath        = rtrim(($shareName . DS) . implode(DS, $urlPath), DS);
        $dbInfoRequest->startTime      = $this->_issetOr($queryParams['start_time']);
        $dbInfoRequest->isRecursive    = getEnumerationValueByKey($this->_issetOr($queryParams['recursive']), 'true', $tf);
        $dbInfoRequest->includeHidden  = getEnumerationValueByKey($this->_issetOr($queryParams['include_hidden']), 'false', $tf);
        $dbInfoRequest->fileSqlFilters     = generateSqlFilters($queryParams, 'Files', 'file');
        $dbInfoRequest->categorySqlFilters = generateCategorySqlFilters($queryParams, $categories);
        $dbInfoRequest->debugSql           = getParameter($queryParams, 'debug_sql', \PDO::PARAM_BOOL, FALSE);

        set_time_limit(0);

        try {
            generateSummaryResponse(openMediaDb($dbPath), $dbInfoRequest, $outputFormat);
        } catch (\Exception $ex) {
            throw new \Core\Rest\Exception($ex->getMessage(), $ex->getCode(), $ex, static::COMPONENT_NAME);
        }

        set_time_limit(ini_get('max_execution_time'));
    }

    protected function _issetOr(&$var, $or = NULL)
    {
        return isset($var) ? $var : $or;
    }
}