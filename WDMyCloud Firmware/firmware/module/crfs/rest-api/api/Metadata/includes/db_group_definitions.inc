<?php

/**
 * Functions for getting information on the supported types of grouping.
 * User: bjornson_e
 * Date: 11/27/13
 * Time: 10:28 AM
 */

function getGroupingDbPath($shareName)
{
    //To set the Path of Grouping DB, check the Volume of related share
    $mediaVolMgr = \RequestScope::getMediaVolMgr();
    $volumeDetails = $mediaVolMgr->getVolumeByShareName($shareName);

    //Fetch the DB name from Global config
    $groupingDbName = getGlobalConfig('groupdb')['GROUPINGS_DB_NAME'];

    //Check if the Volume retrieved is a NON read only Volume
    if(strcmp($volumeDetails['ReadOnly'],'false') == 0){
        //Creating path for media crawler database related to NON-dynamic volume
        if((strcmp($volumeDetails['DynamicVolume'],'false') == 0)){
            return $volumeDetails['Path'].DS.$groupingDbName;
        }
        else{
            //Creating path for media crawler database related to dynamic volume
            $crawlerDbPath = substr($volumeDetails['DbPath'], 0, strpos($volumeDetails['DbPath'], '/.wdmc/wdmc.db'));
            //For dynamic volume, grouping DB will be inside /shares/.USB/USB_Unique_directory/
            return $crawlerDbPath.DS.$groupingDbName;
        }
    }
}

function getYearOrMonthSql($columnName, $format)
{
    return "strftime('%$format', $columnName, 'unixepoch', 'localtime')";
}

function getYearSQL($columnName)
{
    return getYearOrMonthSql($columnName, 'Y');
}

function getMonthSQL($columnName)
{
    return getYearOrMonthSql($columnName, 'm');
}

//todo: Optimization: Use APC to cache this so it doesn't have to be regenerated with each call
function getGroupingInfos()
{
    $key           = 'grouping_infos';
    $groupingInfos = apc_fetch($key);

    if (!$groupingInfos)
    {
        $ySqlDt        = getYearSQL('dateTime');
        $ySqlD         = getYearSQL('date');
        $mSqlDt        = getMonthSQL('dateTime');
        $mSqlD         = getMonthSQL('date');
        $imgMd         = 'image';
        $audMd         = 'audio';
        $vidMd         = 'video';
        $folder         = DBGroupingRequest::PARENT_PATH;
        $groupingInfos =
        [
            'image_year'         => new GroupingInfo( 1, 'year'  , NULL   , $imgMd, TRUE , $ySqlDt  , NULL),
            'image_year_month'   => new GroupingInfo( 2, 'year'  , 'month', $imgMd, TRUE , $ySqlDt  , $mSqlDt),
            'image_folder'       => new GroupingInfo( 3, 'folder', NULL   , $imgMd, FALSE, $folder  , NULL),
            'audio_year'         => new GroupingInfo( 4, 'year'  , NULL   , $audMd, TRUE , $ySqlD   , NULL),
            'audio_album'        => new GroupingInfo( 5, 'album' , NULL   , $audMd, TRUE , 'album'  , NULL),
            'audio_artist'       => new GroupingInfo( 6, 'artist', NULL   , $audMd, TRUE , 'artists', NULL),
            'audio_genre'        => new GroupingInfo( 7, 'genre' , NULL   , $audMd, TRUE , 'genres' , NULL),
            'audio_artist_album' => new GroupingInfo( 8, 'artist', 'album', $audMd, TRUE , 'artists', 'album'),
            'audio_folder'       => new GroupingInfo( 9, 'folder', NULL   , $audMd, FALSE, $folder  , NULL),
            'video_year'         => new GroupingInfo(10, 'year'  , NULL   , $vidMd, TRUE , $ySqlD   , NULL),
            'video_year_month'   => new GroupingInfo(11, 'year'  , 'month', $vidMd, TRUE , $ySqlD   , $mSqlD),
            'video_genre'        => new GroupingInfo(12, 'genre' , NULL   , $vidMd, TRUE ,'genres'  , NULL),
            'video_folder'       => new GroupingInfo(13, 'folder', NULL   , $vidMd, FALSE, $folder  , NULL),
        ];

        apc_store($key, $groupingInfos);
    }

    return $groupingInfos;
}

/**
 * @param string $groupingType
 * @return GroupingInfo
 */
function getGroupingInfo($groupingType)
{
    return getGroupingInfos()[$groupingType];
}

/**
 * @return int The number of different types of grouping that are supported
 */
function getGroupingTypeCount()
{
    return count(getGroupingInfos());
}

/**
 * Finds a groupingInfo based on the specified groupingType.
 * Returns null if none are found with a matching groupingType.
 * @param int $groupingId
 * @return GroupingInfo
 */
function getGroupingInfoByGroupingId($groupingId)
{
    foreach (getGroupingInfos() as $groupingInfo)
    {
        if (groupingInfoIdMatchesGroupingId($groupingInfo, $groupingId))
        {
            return $groupingInfo;
        }
    }

    return NULL;
}

function groupingInfoIdMatchesGroupingId(GroupingInfo $groupingInfo, $groupingId)
{
    return ($groupingInfo->groupingId == $groupingId);
}

/**
 * Class GroupingInfo A structure for holding the information on one type of grouping that is supported (e.g. "group by artists").
 * Note that one type of grouping can group by two columns (e.g. "group by artists, genres")
 */
class GroupingInfo
{
    public $groupingId;
    public $valueName;
    public $valueSubname;
    public $isTwoLevel; //todo: remove this unused field

    public $category; //The category that this is to be filtered on (e.g. 'audio'
    public $joinWithCategory; //boolean indicating whether joining is needed with the table for the category
    public $groupingColumn1;
    public $groupingColumn2;

    /**
     * @param int $groupingId An integer identifier for this type of grouping (this is stored as a column in the database)
     * @param bool $isTwoLevel
     * @param string $valueName The name that is presented outwardly
     * @param string $valueSubname
     * @param string $category
     * @param string $groupingColumn1 This is commonly just a column name, but it could be a whole expression
     * @param string $groupingColumn2 This is commonly just a column name, but it could be a whole expression
     * @param int $fileCategory When this is non-null, the query will join the File table with the folders table for the specified category
     */
    public function __construct($groupingId, $valueName, $valueSubname, $category, $joinWithCategory, $groupingColumn1,
                                $groupingColumn2)
    {
        $this->groupingId        = $groupingId;
        $this->valueName         = $valueName;
        $this->valueSubname      = $valueSubname;
        $this->isTwoLevel        = $valueSubname !== NULL;

        $this->category          = $category;
        $this->joinWithCategory  = $joinWithCategory;
        $this->groupingColumn1   = $groupingColumn1;
        $this->groupingColumn2   = $groupingColumn2;
    }
}
