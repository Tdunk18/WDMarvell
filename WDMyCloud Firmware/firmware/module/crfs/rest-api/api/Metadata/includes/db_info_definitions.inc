<?php
/**
 * User: bjornson_e
 * Date: 12/5/13
 * Time: 8:33 AM
 */
require_once 'db_filter.inc';
require_once(COMMON_ROOT . '/includes/requestscope.inc');

/**
 * Class TableMetaInfo A structure for holding metadata on a media table(e.g. Holds info on AudioMetadata table)
 */
class TableMetaInfo {
    public $tableName;
    public $columns; // an array of pairs of ‘response_name’ => ‘column_name’ (response_name is how the column will be identified in the xml/json response)
    public $filterTypes; // an array of filter types

    public function __construct($tableName, $columns, $filterTypes) {
        $this->tableName = $tableName;
        $this->columns = $columns;
        $this->filterTypes = $filterTypes;
    }
}

/**
 * Class ColumnInfo An instance of the class is used to represent each field that is output for each file as part of a metadb_info response.
 * For example, one instance of this class defines that the column name of 'duration' is of type COLUMN_TYPE_INTEGER.
 */
class ColumnInfo {
    public $columnName;
    public $columnType;

    public static $COLUMN_TYPE_STRING    = 0;
    public static $COLUMN_TYPE_INTEGER   = 1;
    public static $COLUMN_TYPE_TIMESTAMP = 2;
    public static $COLUMN_TYPE_BOOLEAN   = 3;
    public static $COLUMN_TYPE_FLOAT     = 4;
    public static $selectedColumns_old = ['video' => array('date', 'genre', 'duration'), 'audio' => array('genre', 'artist', 'album', 'date', 'duration'), 'image' => array('date', 'width', 'height')];
    public static $selectedColumns_new = ['video' => array('date', 'genre', 'duration'), 'audio' => array('genre', 'artist', 'album', 'date', 'duration'), 'image' => array('date', 'width', 'height', 'description', 'longitude', 'latitude', 'keywords', 'camera_make', 'camera_model', 'orientation', 'copyright', 'exposure_time', 'iso_speed', 'focal_length', 'f_number', 'flash', 'elevation')];

    public function __construct($columnName, $columnType) {
        $this->columnName = $columnName;
        $this->columnType = $columnType;
    }
}

/**
 * @return array An array of: categoryName => TableMetaInfo.  This allows the TableMetaInfo to be found for a particular category (e.g. 'audio'=>...)
 */
function getTableMetaInfos()
{
    //todo: Store this in memory so it doesn't need to be APC fetched for every call within the same request
    $key            = 'table_meta_infos';
    $tableMetaInfos = apc_fetch($key);

    if (!$tableMetaInfos)
    {
        $tableMetaInfos =
        [
            'file' => new TableMetaInfo('Files', [],
                [
                    new FilterType('search_name', FilterType::$PARTIAL_MATCH, 'name'),
                    new FilterType('size_range', FilterType::$RANGE, 'size'),
                ]),
            'folder' => new TableMetaInfo('Folders', [],
                [new FilterType('search_name', FilterType::$PARTIAL_MATCH, 'name')]),
            'video' => new TableMetaInfo('VideoMetadata',
                [
                    'date'     => new ColumnInfo('date', ColumnInfo::$COLUMN_TYPE_TIMESTAMP),
                    'genre'    => new ColumnInfo('genres', ColumnInfo::$COLUMN_TYPE_STRING),
                    'duration' => new ColumnInfo('duration', ColumnInfo::$COLUMN_TYPE_INTEGER),
                ],
                [
                    new FilterType('genre', FilterType::$MATCH, 'genres'),
                    new FilterType('date_', FilterType::$YEAR_MONTH, 'date'),
                    new FilterType('date_range', FilterType::$RANGE, 'date'),
                ]),
            'audio' => new TableMetaInfo('AudioMetadata',
                [
                    'genre'    => new ColumnInfo('genres', ColumnInfo::$COLUMN_TYPE_STRING),
                    'artist'   => new ColumnInfo('artists', ColumnInfo::$COLUMN_TYPE_STRING),
                    'album'    => new ColumnInfo('album', ColumnInfo::$COLUMN_TYPE_STRING),
                    'date'     => new ColumnInfo('date', ColumnInfo::$COLUMN_TYPE_TIMESTAMP),
                    'duration' => new ColumnInfo('duration', ColumnInfo::$COLUMN_TYPE_INTEGER),
                ],
                [
                    new FilterType('genre', FilterType::$MATCH, 'genres'),
                    new FilterType('artist', FilterType::$MATCH, 'artists'),
                    new FilterType('album', FilterType::$MATCH, 'album'),
                    new FilterType('date_range', FilterType::$RANGE, 'date'),
                    new FilterType('date_', FilterType::$YEAR_MONTH, 'date'),
                    new FilterType('search_album', FilterType::$PARTIAL_MATCH, 'album'),
                    new FilterType('search_artist', FilterType::$PARTIAL_MATCH, 'artists'),
                ]),
            'image' => new TableMetaInfo('ImageMetadata',
                [
                    'date'          => new ColumnInfo('dateTime', ColumnInfo::$COLUMN_TYPE_TIMESTAMP),
                    'width'         => new ColumnInfo('width', ColumnInfo::$COLUMN_TYPE_INTEGER),
                    'height'        => new ColumnInfo('height', ColumnInfo::$COLUMN_TYPE_INTEGER),
                    'description'   => new ColumnInfo('description', ColumnInfo::$COLUMN_TYPE_STRING),
                    'longitude'     => new ColumnInfo('longitude', ColumnInfo::$COLUMN_TYPE_FLOAT),
                    'latitude'      => new ColumnInfo('latitude', ColumnInfo::$COLUMN_TYPE_FLOAT),
                    'keywords'      => new ColumnInfo('keywords', ColumnInfo::$COLUMN_TYPE_STRING),
                    'camera_make'   => new ColumnInfo('cameraMake', ColumnInfo::$COLUMN_TYPE_STRING),
                    'camera_model'  => new ColumnInfo('cameraModel', ColumnInfo::$COLUMN_TYPE_STRING),
                    'orientation'   => new ColumnInfo('orientation', ColumnInfo::$COLUMN_TYPE_INTEGER),
                    'copyright'     => new ColumnInfo('copyright', ColumnInfo::$COLUMN_TYPE_STRING),
                    'exposure_time' => new ColumnInfo('exposureTime', ColumnInfo::$COLUMN_TYPE_FLOAT),
                    'iso_speed'     => new ColumnInfo('isoSpeed', ColumnInfo::$COLUMN_TYPE_INTEGER),
                    'focal_length'  => new ColumnInfo('focalLength', ColumnInfo::$COLUMN_TYPE_FLOAT),
                    'f_number'      => new ColumnInfo('fNumber', ColumnInfo::$COLUMN_TYPE_FLOAT),
                    'flash'         => new ColumnInfo('flash', ColumnInfo::$COLUMN_TYPE_INTEGER),
                    'elevation'     => new ColumnInfo('elevation', ColumnInfo::$COLUMN_TYPE_FLOAT),
                ],
                [
                    new FilterType('date_', FilterType::$YEAR_MONTH, 'dateTime'),
                    new FilterType('date_range', FilterType::$RANGE, 'dateTime'),
                    new FilterType(null, FilterType::$LOCATION, null),
                ]),
        ];

        apc_store($key, $tableMetaInfos);
    }

    return $tableMetaInfos;
}

/**
 * Returns selected columns to send in response for the specified category.
 * @param string $category Identifies the category (e.g. 'audio'). The list of available categories can be found through getCategories().
 * @return array of columns for specific category
 */
function getSelectedColumns($category) 
{   
    // TODO: Eventually we can get the list of columns in parameter API request so only requested columns can be pulled out of DB and returned
    $apiVersion = RequestScope::getInstance()->getApiVersion();

    if($apiVersion < 2.7) {
        return ColumnInfo::$selectedColumns_old[$category];
    } else {
        return ColumnInfo::$selectedColumns_new[$category];
    }
}

/**
 * Returns TableMetaInfo for the specified category.
 * @param string $category Identifies the category for which the TableMetaInfo is desired (e.g. 'audio'). The list of available categories can be found through getCategories().
 * @return TableMetaInfo The TableMetaInfo for the specified category
 */
function getTableMetaInfo($category) {
    return getTableMetaInfos()[$category];
}

/**
 * @return array Returns an array of information on the columns that are to be returned for this category of request.
 * The key holds the display name for each column and the value holds the column name for each column.
 */
function getCategoryColumns($category) {
    return getTableMetaInfo($category)->columns;
}

/**
 * @param $category - file, folder, image, audio, video. Refer to getTableMetaInfos()
 * @return mixed - Returns table for the requested category if there is one else NULL (e.g. for category 'others', no match found return NULL).
 */
function getCategoryTableName($category) {
    return getTableMetaInfo($category)->tableName;
}

/**
 * @param $requestParam - a string value of category name or a comma separated string with category names (e.g. video, audio, image etc.)
 * @return array of category names
 *
 * Converts a comma separated category names into an array of valid category names (e.g ['video', 'audio']). Invalid categories are ignored.
 */
function getCategoryNamesFromRequest($requestParam) {
    $requestedCategoryNames = explode(',', $requestParam);
    $allValidCategoryNames = getAllCategoryNames();
    $result = array();
    foreach ($requestedCategoryNames as $requestedCategoryName) {
        //Only add a category to the results if the category is valid (do not allow wrong case or ignore white space)
        if(in_array($requestedCategoryName, $allValidCategoryNames)) {
            $result[] = $requestedCategoryName;
        }
    }
    return $result;
}

/**
 * @return array An array of all supported names for categories.
 */
function getAllCategoryNames()
{
    return ['video', 'audio', 'image', 'other'];
}

function getCategoryIdentifier($categoryName) {
    switch($categoryName) {
        case 'video': return  1;
        case 'audio': return  2;
        case 'image': return  3;
        case 'other': return  4;
        default     : return -1;
    }
}

//Returns an array of categoryIdentifiers based on the provided array of categoryNames (e.g. ['video', 'audio'] => [1, 2])
function getCategoryIdentifiers($categoryNames) {
    $categoryIdentifiers = array();
    foreach ($categoryNames as $categoryName) {
        $categoryIdentifiers[] = getCategoryIdentifier($categoryName);
    }
    return $categoryIdentifiers;
}


/**
 * Converts from a category number (i.e. stored in the database) to a category name for output
 * @param $categoryNumber
 * @return string The name of the category for output purposes
 */
function getCategoryOutputName($categoryNumber) {
    if(($categoryNumber<1) || ($categoryNumber>4) )
        return null;
    $categories = array(1=>'video', 2=>'audio', 3=>'image', 4=>'other');
    return $categories[$categoryNumber];
}

function getCategoryTableAlias($category) { return $category.'_table'; } //The alias to be used for the category table within the SQL query
function getFolderTableAlias() { return 'folderTable'; } //The alias to be used for the Folders table within the SQL query
function getJoiningFileColumnName() { return 'Id'; } //The name of the column from the Files table to be used for joining
function getJoiningCategoryColumnName() { return 'sourceId'; } //The name of the column from the category table to be used for joining

// TODO: No usage found. Commented for now but marked for delete.
//function getFileColumnsCount() { return 6; }  //This is just the number of columns that are returned by getFileColumnsSql

/**
 * Class DBInfoRequest A structure for holding all of the information of the user's request.  This information will be used to generate a matching query.
 */
class DBInfoRequest {
    public $categories;
    public $shareName;
    public $share;
    public $subpath;
    public $startTime;
    public $isRecursive;
    public $includeHidden;
    public $fileSqlFilters; //an array of filter strings (e.g. "genres='Pop'", "artists='Jackson'", ...)
    public $categorySqlFilters; //an array categories which contain an array of filter strings (e.g. "genres='Pop'", "artists='Jackson'", ...)
    public $folderSqlFilters; //an array of filter strings (e.g. "folder_search_name='hello'", ...)
    //The remainder of the fields only relate to info requests and don't relate to summary requests
    public $orderBy;
    public $isAscending;
    public $fileRowOffset, $fileRowCount, $dirRowOffset, $dirRowCount;
    public $includeFileInfo, $includeDirInfo; //booleans on whether the fileInfo or dirInfo are included in the response
    public $showIsLinked;
    public $debugSql;

    function getCategoryTableName($category) {
        return getTableMetaInfo($category)->tableName;
    }

    /**
     * @return string Returns an SQL string which will join the two tables together.
     * An empty string is returned if no category joining was requested.
     */
//    function getJoiningFilter() {
//        if($this->category==null)
//            return '';
//        return 'Files.'.getJoiningFileColumnName().' = '.getCategoryTableAlias().'.'.getJoiningCategoryColumnName();
//    }

    /**
     * @return string Returns the full path for the request which includes both the share name and the subpath.  Begins with a slash and does NOT end with a slash.
     */
    function getPath() {
        return DS .$this->subpath;
    }

    function getCategoriesJoiningSql() { return getCategoriesJoiningSql($this->categories); }

    function getCategoriesFilter() { return getCategoriesFilter($this->categories); }

    function getCategoriesColumnsSql() { return getCategoriesColumnsSql($this->categories); }

    //Create the SQL for the requested ordering
    function getOrderByForFilesSql() {
        $orderBySql = $this->orderBy;
        if (!$this->isAscending) {
            $orderBySql .= ' DESC';
        }
        $orderBySql .= ", Files.id";//id to make sure list is deterministic on matching $dbInfoRequest->orderBy
        return 'ORDER BY ' . $orderBySql;
    }

    function getOrderByForFoldersSql() {
        $orderBySql = $this->orderBy;
        if (!$this->isAscending) {
            $orderBySql .= ' DESC';
        }
        $orderBySql .= ", Folders.id";//id to make sure list is deterministic on matching $dbInfoRequest->orderBy
        return 'ORDER BY ' . $orderBySql;
    }

    function getLimitAndOffsetForFilesSql() {
        return getLimitAndOffsetFilter($this->fileRowOffset, $this->fileRowCount);
    }

    function getLimitAndOffsetForFoldersSql() {
        return getLimitAndOffsetFilter($this->dirRowOffset, $this->dirRowCount);
    }

    function getFilterStringForFilesSql() {
        $filterStr = '';
        $filterStr = appendFilter($filterStr, getHiddenFileFilter($this->includeHidden));
        $filterStr = appendFilter($filterStr, getFileStartTimeFilter($this->startTime));
        $filterStr = appendFilterArray($filterStr, $this->fileSqlFilters);
        $filterStr = appendFilter($filterStr, $this->getCategoriesFilter());     //e.g. "category in (1, 3)"

        foreach ( $this->categories as $category) {
            $filterStr = appendFilterArray($filterStr, $this->categorySqlFilters[$category]); //e.g. "genre='classical'"
        }
        return $filterStr;
    }

    function getFilterStringForFoldersSql() {
        $filterStr = '';
        $filterStr = appendFilter($filterStr, getHiddenFolderFilter($this->includeHidden));
        $filterStr = appendFilter($filterStr, getFolderStartTimeFilter($this->startTime));
        $filterStr = appendFilterArray($filterStr, $this->folderSqlFilters);
        return $filterStr;
    }
} // class DBInfoRequest

// This returns the joining clause (or NULL if there is no joining) for metadata tables.
// This supports BOTH the common case of only joining with one table as well as the case of joining with multiple tables.
// Joining with multiple tables is required for the use case of showing both photos and videos combined. This requires OUTER joining.
// If we are only obtaining one category, then inner joining will work.
function getCategoriesJoiningSql($categories) {
    $categoryCount = count($categories);

    if( $categoryCount == 0 )
        return NULL;

    if( $categoryCount == 1 ) {
        $category = reset($categories);
        //The category of "other" does not require joining with any table of metadata
        if(getCategoryTableName($category)==NULL)
            return NULL;
        return getSingleCategoryJoiningSql($category);
    }
    //Handle the case where it is to be joined with multiple metadata tables
    $joiningClauses = array();
    foreach ( $categories as $category ) {
        //The category of "other" does not require joining with any table of metadata
        if(getCategoryTableName($category)==NULL)
            continue;
        $joiningClauses[] = 'LEFT OUTER '.getSingleCategoryJoiningSql($category);
    }
    return implode(' ', $joiningClauses);
}

function getSingleCategoryJoiningSql($category) {
    $fileColumnName = getJoiningFileColumnName();
    $categoryTableName = getCategoryTableName($category);
    $categoryTableAlias = getCategoryTableAlias($category);
    $categoryColumnName = getJoiningCategoryColumnName();

    return "JOIN {$categoryTableName} {$categoryTableAlias} ON {$categoryTableAlias}.{$categoryColumnName} = Files.{$fileColumnName}";
}

//Returns a list of all required columns for all of the requested categories (includes Alias for each column)
function getCategoriesColumnsSql($categories) {
    if(count($categories) == 0 )
        return NULL;

    //Make an array which contains the results for each category (most commonly just one), and then implode them to form a single list of columns
    $columnsSql = array();
    foreach ($categories as $category) {
        $categoryColumnsSql = getSingleCategoryColumnsSql($category);
        if ($categoryColumnsSql != '')
            $columnsSql[] = $categoryColumnsSql;
    }

    return implode(', ', $columnsSql);
}

/**
 * A function for returning a list of columns to be selected for the requested category
 * @return string The SQL string which contains the properly separated list of columns to be selected due to the requested category.
 * e.g. If a client's request is for the category of audio, then the following could be returned: "genres, artists, date"
 */
function getSingleCategoryColumnsSql($category) {
    //Using the alias is necessary since we may be joining with MULTIPLE metadata tables that have identically named columns
    $categoryTableAlias = getCategoryTableAlias($category);

    $categoryColumns = getCategoryColumns($category);
    if(count($categoryColumns)==0)
        return '';
    //Convert the array of $columnInfo objects into an array of column names
    $columnNames = array();

    $responseColumns = getSelectedColumns($category);
    foreach($categoryColumns as $column => $columnInfo) {
        if(in_array($column, $responseColumns)) {
            $columnNames[] = $categoryTableAlias . '.' . $columnInfo->columnName;
        }
    }
    return implode(', ', $columnNames);
}

//A private function to get the SQL that appropriately filters for the requested categories.
//Note: This needs to support more than one category
function getCategoriesFilter($categories) {
    $categoryCount = count($categories);
    if( $categoryCount == 0)
        return NULL;
    if( $categoryCount == 1) {
        return 'Files.category = '. getCategoryIdentifier(reset($categories)); // First Element's Value;
    }
    $categoryIdentifiers = getCategoryIdentifiers($categories);
    return 'Files.category in (' . implode(', ', $categoryIdentifiers) . ')';
}

