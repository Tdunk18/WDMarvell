<?php
/**
 * Functions for updating the separate database which holds information on files in a format that has already been grouped.
 * updateGroupingTable(...) is the entry point for requesting that the table be updated.
 * User: bjornson_e
 * Date: 11/26/13
 * Time: 4:41 PM
 */

require_once 'db_group_definitions.inc';
require_once 'db_info_definitions.inc';
require_once 'db_info.inc';

/**
 * This attaches the groupings database to the provided MediaVolsPDO.
 * @param MediaVolsPDO $pdo The MediaVolsPDO to which the groupings.db is to be attached
 * @param string $groupingsDbName an optional parameter for the name to assign the attached database (default is 'gdb')
 */
function attachGroupingDb(MediaVolsPDO $pdo, $groupingsDbPath, $groupingsDbName='gdb') {
    $attachSql = "ATTACH DATABASE '$groupingsDbPath' AS $groupingsDbName;";
    $pdo->exec($attachSql);
}

/**
 * @return bool Returns whether the database file exists for holding grouping information
 */
function groupingsDBExists($groupDbPath) {
    return file_exists($groupDbPath);
}

/**
/**
 * @return PDO Returns a PDO for the groupings database
 */
function createGroupingsPDO($groupDbPath) {
    $dirPath = dirname($groupDbPath);
    if(!file_exists($dirPath)){
        @mkdir($dirPath, 0777, TRUE);
    }
    return new PDO('sqlite:' . $groupDbPath);
}

/**
 * Creates a table called GroupingsTemp
 * @param PDO $pdo The PDO for the Groupings database
 */
function createGroupingsTempTable(PDO $pdo) {
    $pdo->exec("create table GroupingsTemp (groupingId INTEGER, shareName TEXT, groupVal1 TEXT, groupVal2 TEXT, groupCount INTEGER, example TEXT)");
}

/**
 * Creates indexes on the Groupings table to make filtering, grouping, and sorting faster
 * @param PDO $pdo The PDO for the Groupings database
 */
function createGroupingsIndexes(PDO $pdo) {
    $pdo->exec("create index groupingIdIndex on Groupings(groupingId)");
    $pdo->exec("create index groupVal1Index on Groupings(groupVal1)");
}

/**
 * Deletes the existing Groupings table and renames the GroupingsTemp table to take its place
 * @param PDO $pdo The PDO for the Groupings database
 */
function replaceGroupingsTable(PDO $pdo) {
    $pdo->exec("drop table Groupings"); //This table won't exist the first time, but that isn't a problem
    $pdo->exec("alter table GroupingsTemp rename to Groupings");
}

/**
 * Creates all of the rows for the specified groupingId and for the specified share within the specified database.
 * @param PDO $pdo The Groupings database into which the new rows are to be inserted
 * @param string $shareName The name of the share
 * @param string $sharePath The path of the share relative to the mount point of the volume (NOT an absolute path)
 * @param int $groupingId The type of grouping as defined in db_group_definitions.inc (e.g. audio_artist_album)
 * @param bool $debugSql debug flag to dump SQL queries & query plans to the response.
 */
function insertGroupingRows(PDO $pdo, $share, $groupingId, $debugSql) {
    //Get information on the specified groupingId
    $groupingInfo = getGroupingInfoByGroupingId($groupingId);
    $groupingColumn1  = $groupingInfo->groupingColumn1;
    $groupingColumn2  = $groupingInfo->groupingColumn2;
    $category         = $groupingInfo->category;
    $joinWithCategory = $groupingInfo->joinWithCategory;

//    $pathExpression = (\RequestScope::getMediaVolMgr()->isDynamicVolume($shareName)) ? "" : "/$shareName";
    $shareName = $share->getName();
//    $requestPath = '/'.$shareName.'/';
    $requestPath = $share->isDynamicVolume() ? "/" : '/'.$shareName.'/';

    //Construct an object that defines the type of grouping that is needed
    $dbGroupingRequest = new DBGroupingRequest($groupingColumn1, $groupingColumn2, $requestPath, $share, $category, $joinWithCategory, $debugSql);

    //Obtain the SQL for this grouping (with two extra column values injected into the SQL response)
    $additionalSelectColumns = "$groupingId, '$shareName', ";
    $groupingQuery = buildGroupingQuery($dbGroupingRequest, $additionalSelectColumns, $pdo);

    $pdo->exec("INSERT INTO gdb.GroupingsTemp {$groupingQuery}");
}

/**
 * This is a temporary solution which will only update the groupings table if the metadata DB has changed recently.
 * Here are some problems with this solution:
 *    It does NOT support multiple meta-data databases (i.e. it only considers the timestamp for the database of the currently requested share.
 *    It does NOT do any restrictions for multiple parallel requests (e.g. only allow one update to execute at once).
 * @param string $shareName
 * @param DBAccess $dbAccess
 */
function updateGroupingTableIfChanged($shareName, DBAccess $dbAccess, $debugSql) {
    $dbPath = \RequestScope::getMediaVolMgr()->getVolumeByShareName($shareName)['DbPath'];
    //need to set the path of Grouping DB
    $groupDbPath = getGroupingDbPath($shareName);
    list($isUpdateToDate, $mediaDbMTime) = isGroupingTableUpToDate($dbPath, $groupDbPath);
    if ($isUpdateToDate)
    {
        //echo "Groupings Table: No update needed";
        return;
    }
    //echo "Groupings Table: Executing update";

    //If the groupings is newer than the media, then we are done
    $mediaVolsPdo = openMediaDb($dbPath);
    //$dbPath    = '/shares/.wdmc/wdmc.db'; //TODO: Remove hack on how to find the DB
    //$mediaVolsPdo = new \PDO('sqlite:' . $dbPath);
    updateGroupingTable($dbAccess, $mediaVolsPdo, $groupDbPath, $debugSql);

    touch($groupDbPath, $mediaDbMTime);
}

/**
 * Returns whether the Groupings database is up to date
 * @param string $dbPath Path to the media database
 * @return array of a bool and the media db mtime
 */
function isGroupingTableUpToDate($dbPath, $groupDbPath) {
    $mediaDbMTime = max(filemtime($dbPath), (int)@filemtime("$dbPath-wal"));//when wal doesn't exist this will return mtime of $dbPath
    $groupingDbMTime = (int)@filemtime($groupDbPath);//when this doesn't exist it will return zero

    //this check will make sure the grouping db is considered up to date if groupings were generated within the last 3 seconds.
    //this is regardless of the state of the crawler.
    if ($groupingDbMTime >= time() - 3) {
        return [true, $mediaDbMTime];
    }

    return [$groupingDbMTime >= $mediaDbMTime, $mediaDbMTime];
}

/**
 * @param DBAccess $dbAccess
 * @param MediaVolsPDO $mediaVolsPdo
 */
function updateGroupingTable(DBAccess $dbAccess, MediaVolsPDO $mediaVolsPdo, $groupDbPath, $debugSql) {
    //Create a Groupings DB if it doesn't already exist
    if(!groupingsDBExists($groupDbPath)) {
        createGroupingsPDO($groupDbPath);
    }

    $groupingsPdo = openDbwithPath($groupDbPath);
    attachGroupingDb($mediaVolsPdo, $groupDbPath); //get our PDO attached to the extra DB for Groupings
    //Make a temporary table to put our results while they are being generated
    createGroupingsTempTable($groupingsPdo);

    //find out how many types of groupings we have
    $groupingTypeCount = getGroupingTypeCount();

    //Update the groupings table for each share
    $shares = (new \Shares\Model\Share\SharesDao())->getAll();
    foreach ($shares as $share) {
        $shareName = $share->getName();
        // Skip Backup & SmartWare shares - not crawled
        if($shareName === 'TimeMachineBackup' || $shareName === 'SmartWare' || $share->getRecycleBin())
            continue;
        //Update the data for each type of grouping
        for($groupingId=1; $groupingId<=$groupingTypeCount; $groupingId++) {
            insertGroupingRows($mediaVolsPdo, $share, $groupingId, $debugSql);
        }
    }

    //Get rid of the old table (Groupings) and replace it with the new table (GroupingsTemp)
    replaceGroupingsTable($groupingsPdo);
    //Indexes are created AFTER all of the rows have been inserted (big performance benefit so tree rebalancing is not needed on the indexes)
    createGroupingsIndexes($groupingsPdo);
}