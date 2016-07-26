<?php

namespace Metadata\Controller;

/**
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

require_once FILESYSTEM_ROOT . '/includes/db/multidb.inc';
require_once COMMON_ROOT     . '/includes/outputwriter.inc';
require_once METADATA_ROOT   . '/includes/db_info.inc';
require_once METADATA_ROOT   . '/includes/db_util.inc';
require_once METADATA_ROOT   . '/includes/db_info_definitions.inc';
require_once METADATA_ROOT   . '/includes/db_filter.inc';


/**
 * \class MetaDbInfo
 * \brief Returns information on files based on a DB query.
 */
class MetaDbInfo
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'metadb_info';

    /**
     * \par Description:
     * Get listing of files and folders in specified directory.
     *
     * \par Security:
     * - Verifies that the current use has read permission for the requested share name.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/metadb_info/{path}
     *
     * \param path            String  - required
     * \param recursive       Boolean - optional (default is true)
     * \param include_hidden  Boolean - optional (default is false)
     * \param start_time      Integer - optional
     * \param files           Boolean - optional (default is true)
     * \param dirs            Boolean - optional (default is true)
     * \param category        String  - optional (video, audio, image)
     * \param file_row_offset Integer - optional
     * \param file_row_count  Integer - optional
     * \param dir_row_offset  Integer - optional
     * \param dir_row_count   Integer - optional
     * \param order_by        String  - optional  (name or date; default is name)
     * \param order           String  - optional (asc or desc; default is asc)
     * \param format          String  - optional
     * \param show_is_linked  Boolean - optional (default is false)
     *
     * \par Parameter Details:
     *
     * - If a path is specified, then the returned content will be restricted to only
     *   include files and directories that are contained within the specified path.
     *   Such a path will use the same syntax as other paths and thus include a share
     *   name optionally followed by subdirectories (e.g. Public/subdir1/subdir2).
     *   The path must contain at least the name of the share.
     *   Already purged files will be excluded.
     *
     * - The recursive parameter is a boolean that may have a value of true or false
     *   and defaults to true.  When this is true, subdirectories of the applicable
     *   path will also be included in the returned content.
     *
     * - The start_time parameter is the date of which files have been last updated in the crawler database.
     *   The last updated time in the crawler Db changes when: the file is first crawled, the file has changed,
     *   an image file is transcoded or meta-data has been extracted.
     *
     *   Periodically, the meta database is purged of deleted files. If the start_time is less than the last purge
     *   time then an error is returned.
     *
     * - The files and dirs flags parameters are used to control output.
     *   Default value is true for both. If user want only files, set dir to false.
     *
     * - The only filtering that applies to directories is the included path.  All other filters described below only apply to files.
     * - The category parameter will filter the type of files to summarize.
     *   The acceptable values are video, audio, image.
     *   The default is that all of the files will be included regardless of their category.
     *   For the following categories, additional metadata will be included in the fields provided for each file:
     *      - video: date, genre
     *      - audio: genre, artist, album, date
     *      - image: date, width, height
     *   For version greater than 2.6, additional tags will be included in the fields:
     *      - image: date (INTEGER), width (INTEGER), height (INTEGER), title (STRING), longitude (FLOAT - degrees), latitude (FLOAT - degrees), keywords (STRING - comma separated keywords), camera_make (STRING), camera_model (STRING), orientation (INTEGER - Between 1 to 8), copyright (STRING), exposure_time (FLOAT - in Seconds), iso_speed (INTEGER), focal_length (FLOAT - in mm), f_number (FLOAT), flash (INTEGER), elevation (FLOAT - in meters)
     *
     * - If multiple filters are used, the results with be the AND of all specified filters
     * - The only filter listed below that applies to folders is "search_name".  "search_name" applies to BOTH files and folders.
     *      All other filters will only affect the files that are included.
     * - Any filtering type that contains the word "search_" finds case-insensitive matches that are contained anywhere within the identified field.
     *      - Example: "search_name=HeLLo" would find a file or folder with the name "My Hello Kitty.jpg"
     *      - Searching cannot find matches by doing an OR for multiple columns
     *      - Searching can find matches by doing an OR for multiple values that are separated by "|" (e.g. "search_name=happy|sad")
     *      - Searching for null and empty is different.
     *      - If null need to be searched a special defined constant \@NULL must be used. it is case sensitive. e.g. search_name=\@NULL
     *      - If empty need to be searched an empty request parameter must be passed as part of request. e.g. search_name=
     * - Any filtering type that contains the word "range" finds numeric values inclusively contained within a specified range whose min and max are separated with "-"
     *      - Ranges for timestamps (e.g. date) require numbers be formatted as unix time values
     *      - Example: "date_range=1114567-3334567" would find a file with a date of 2224567
     * - Any filtering type that contains the word date_year or date_month finds matches based on a date range. The month is extracted from the same date field which the year is also extracted. So the following conditions apply on both filter parameters.
     *      - The date_month can only be specified if the date_year has also been specified
	 * 		- The date_year and date_month should be numeric or \@NULL if search involves filtering files that don't have date available
	 * 		- The date_month should also be \@NULL or don't specify the date_month if date_year is specified as \@NULL
     *      - Example: "date_year=2005&date_month=8" will find files whose date is in the 8th month of the year 2005
     *      - Example: "date_year=2008" will find files whose date is in the year 2008 (any month)
	 * 		- Example: "date_year=@NULL" will find files whose date (both Year and Month) is not available. Filter date_month is meaningless.
     * - Any filtering type that contains the GPS coordinates (lat and lon) forms the bounding box to return photos taken within that range.
     *       - The min_lat and min_lon are coordinates for SW corner. The max_lat and max_lon are the coordinates for NE corner.
     *       - Example: "min_lat=36.304059&min_lon=-113.950193&max_lat=44.46025&max_lon=-91.823728" will return photos taken within the bounding box
     * - Filtering options support the following types of filtering:
     *      - For all files and folders: search_name
     *      - In addition, when category=video: "genre", "date_year"/"date_month", "date_range"
     *      - In addition, when category=audio: "genre", "artist", "album", "date_year"/"date_month", "date_range", "search_album", "search_artist"
     *      - In addition, when category=image: "date_year"/"date_month", "date_range", "min_lat", "min_lon", "max_lat", "max_lon"
     *
     * - The file_row_offset and file_row_count parameters allows subsets of the file content
     *   to be retrieved. For example: file_row_offset=3000&file_row_count=1000 would not
     *   include the first 3000 files and would limit the response to only include up
     *   to 1000 files.
     *
     * - The dir_row_offset and dir_row_count parameters allows subsets of the file content
     *   to be retrieved. For example: dir_row_offset=3000&dir_row_count=1000 would not
     *   include the first 3000 dirs and would limit the response to only include up
     *   to 1000 dirs.
     *
     * - The order_by parameter will sort the files by either name or date.  The default is sorting by name.  The order_by affects both files and folders.
     *
     * - The order parameter specifies how the listings should be sorted (asc or desc) and defaults to asc.  The order affects both files and folders.
     *
     * - The show_is_linked parameter will insert an is_linked node within each dir/file.
     *   is_linked will contain a boolean that when true, the file/dir is the target of a link, and false when it is not.
     *
     * \par Parameter Usages:
     *
     * - Photos Listing of Specified Date - Sort by Name:\n
     * http://10.101.60.33/api/2.3/rest/metadb_info/Public?file_row_offset=30&file_row_count=30&dir_row_count=30&category=audio&search_name=hello&order_by=date
     *
     * \retval metadb_info Array - path listing
     *
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
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 85 - VOLUME_INFO_MISSING - Volume information missing
     * - 76 - INVALID_SHARE - Invalid share
     * - 93 - INVALID_PARAMETER - Invalid parameter value
     * - 275 - INVALID_FILE_ROW_OFFSET - Value provided for file_row_offset is not valid
     * - 276 - INVALID_DIR_ROW_OFFSET - Value provided for dir_row_offset is not valid
     * - 277 - INVALID_FILE_ROW_COUNT - Value provided for file_row_count is not valid
     * - 278 - INVALID_DIR_ROW_COUNT - Value provided for dir_row_count is not valid
     * - 290 - INVALID_START_TIME_VALUE - Value provided for start time is not valid
     * - 291 - INVALID_MODIFIED_DATE_VALUE - Value Provided for modifed date is not valid
     * - 340 - INVALID_ORDER_BY - Value Provided for order or date_month is not valid
     * - 341 - INVALID_YEAR_MONTH - Value Provided for date_year or date_month is not valid
     * - 378 - INVALID_VOLUME_FOR_SCANNING - Crawler scanning is switched off for this external volume
     *
     *
     * \par XML Response Example:
     * \verbatim
    <metadb_info>
    <generated_time>1304017387</generated_time>
    <last_purge_time>1303337020</last_purge_time>
    <last_updated_db_time>1304017279</last_updated_db_time>
    <files>
    <deleted>false</deleted>
    <path>/Public/test1</path>
    <name>stars.jpg</name>
    <size>1318</size>
    <modified>1268357320</modified>
    </files>
    <dirs>
    <deleted>false</deleted>
    <path></Public>
    <name>test1</name>
    <modified>1301696440</modified>
    </dirs>
    </metadb_info>
    \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml', $apiVersion)
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

        $startTime        = $this->_issetOr($queryParams['start_time']);
        $filterValueYear  = $this->_issetOr($queryParams['date_year']); //find the requested year
        $filterValueMonth = $this->_issetOr($queryParams['date_month']); //find the requested month

        //Read the offset and count as optional integers with default value of zero
        $fileRowOffset = getParameter($queryParams, 'file_row_offset', \PDO::PARAM_INT, 0, FALSE);
        $fileRowCount  = getParameter($queryParams, 'file_row_count', \PDO::PARAM_INT, 0, FALSE);
        $dirRowOffset  = getParameter($queryParams, 'dir_row_offset', \PDO::PARAM_INT, 0, FALSE);
        $dirRowCount   = getParameter($queryParams, 'dir_row_count', \PDO::PARAM_INT, 0, FALSE);

        //Make sure that the input is one of the valid enumerated values
        $orderBy  = getEnumerationValueByKey($this->_issetOr($queryParams['order_by']), 'name', ['name' => 'name', 'date' => 'lastModifiedDate']);
        $order    = getEnumerationValue($this->_issetOr($queryParams['order']), 'asc', ['asc', 'desc']);

        if (($filterValueYear != \FilterType::$__NULL__ && isset($filterValueMonth) && $filterValueMonth == \FilterType::$__NULL__) ||
            ($filterValueYear == \FilterType::$__NULL__ && isset($filterValueMonth) && $filterValueMonth != \FilterType::$__NULL__) ||
            (isset($filterValueYear) && $filterValueYear != \FilterType::$__NULL__ && !is_numeric($filterValueYear)) ||
            (isset($filterValueMonth) && $filterValueMonth != \FilterType::$__NULL__ && !is_numeric($filterValueMonth)))
        {
            throw new \Core\Rest\Exception('INVALID_YEAR_MONTH', 400, NULL, static::COMPONENT_NAME);
        }

        if (empty($orderBy))
        {
            throw new \Core\Rest\Exception('INVALID_ORDER_BY', 400, NULL, static::COMPONENT_NAME);
        }

        if ($fileRowOffset < 0)
        {
            throw new \Core\Rest\Exception('INVALID_FILE_ROW_OFFSET', 400, NULL, static::COMPONENT_NAME);
        }

        if ($fileRowCount < 0)
        {
            throw new \Core\Rest\Exception('INVALID_FILE_ROW_COUNT', 400, NULL, static::COMPONENT_NAME);
        }

        if ($dirRowOffset < 0)
        {
            throw new \Core\Rest\Exception('INVALID_DIR_ROW_OFFSET', 400, NULL, static::COMPONENT_NAME);
        }

        if ($dirRowCount < 0)
        {
            throw new \Core\Rest\Exception('INVALID_DIR_ROW_COUNT', 400, NULL, static::COMPONENT_NAME);
        }

        $shareName =  array_shift($urlPath); // Taking the sharename out and results sharename removed from urlpath
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

        //Put all of the request parameters into a single structure
        $trueFalse                       = ['true' => TRUE, 'false' => FALSE];
        $categories                      = getCategoryNamesFromRequest($queryParams['category']);
        $dbInfoRequest                   = new \DBInfoRequest();
        $dbInfoRequest->categories       = $categories;
        $dbInfoRequest->shareName        = $shareName;
        $dbInfoRequest->subpath          = rtrim(($shareName . DS) . implode(DS, $urlPath), DS);
        $dbInfoRequest->share            = $share;
        $dbInfoRequest->startTime        = $startTime;
        $dbInfoRequest->dirRowOffset     = $dirRowOffset;
        $dbInfoRequest->dirRowCount      = $dirRowCount;
        $dbInfoRequest->fileRowOffset    = $fileRowOffset;
        $dbInfoRequest->fileRowCount     = $fileRowCount;
        $dbInfoRequest->isRecursive      = getEnumerationValueByKey($this->_issetOr($queryParams['recursive']), 'true', $trueFalse);
        $dbInfoRequest->includeHidden    = getEnumerationValueByKey($this->_issetOr($queryParams['include_hidden']), 'false', $trueFalse);
        $dbInfoRequest->orderBy          = $orderBy;
        $dbInfoRequest->isAscending      = ($order === 'asc');
        $dbInfoRequest->fileSqlFilters   = generateSqlFilters($queryParams, 'Files', 'file');
        $dbInfoRequest->categorySqlFilters= generateCategorySqlFilters($queryParams, $categories);
        $dbInfoRequest->folderSqlFilters = generateSqlFilters($queryParams, 'Folders', 'folder');;
        $dbInfoRequest->includeFileInfo  = getParameter($queryParams, 'files', \PDO::PARAM_BOOL, TRUE);
        $dbInfoRequest->includeDirInfo   = getParameter($queryParams, 'dirs',  \PDO::PARAM_BOOL, TRUE);
        $dbInfoRequest->showIsLinked     = getEnumerationValueByKey($this->_issetOr($queryParams['show_is_linked']), 'false', $trueFalse);
        $dbInfoRequest->debugSql         = getParameter($queryParams, 'debug_sql', \PDO::PARAM_BOOL, FALSE);

        set_time_limit(0);

        try {
            //todo: figure out how to get the proper PDO without this hack
            $pdo = new \PDO('sqlite:' . $dbPath);
            $stmt = $pdo->prepare("PRAGMA CASE_SENSITIVE_LIKE=ON"); $stmt->execute();

            generateInfoResponse($pdo,  $dbInfoRequest, $outputFormat, $apiVersion);
        } catch (\Exception $ex) {
            throw new \Core\Rest\Exception($ex->getMessage(), $ex->getCode(), $ex, static::COMPONENT_NAME);
        }

        set_time_limit(ini_get('max_execution_time'));
    }
}