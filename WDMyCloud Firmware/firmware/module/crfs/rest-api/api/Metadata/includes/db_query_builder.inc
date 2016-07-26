<?php

/**
 * Generates a string for an SQL query of directory information according to a client's request
 * @param PDO $pdo The database driver object for the metadata db
 * @param DBInfoRequest $dbInfoRequest
 * @param isSummary Boolean on whether this is a summary (vs info) request
 * @param isSqlDebug Boolean on whether this should do query analysis as part of debugging
 * @return string Returns a string in SQL format for querying the list of directories
 *
 * All query building functions return name, and path as well as other requested columns
 * Note: This supports multiple request paths so that in the future, multi-share requests can be made
 *       (this isn't being used yet, but it is a pending feature)
 */
function buildFileQuery(DBInfoRequest $dbInfoRequest, $isSummary, PDO $pdo) {

    $isSqlDebug  = $dbInfoRequest->debugSql;
    $isRecursive = $dbInfoRequest->isRecursive;

    $categoryJoiningClause = $dbInfoRequest->getCategoriesJoiningSql(); //e.g. "LEFT OUTER JOIN ImageMetaData imageTable ON imageTable.sourceId = Files.id"
    $filesTableColumnsSql  = getFilesTableColumnsSql(); //e.g. Files.Id, Files.isDeleted AS isDeleted, Files.size, Files.category, Files.lastModifiedDate
    $categoryColumnsSql    = $dbInfoRequest->getCategoriesColumnsSql(); //e.g. "table_image.dateTime, table_image.width, table_image.height"
    $filterStringSql       = $dbInfoRequest->getFilterStringForFilesSql();

    //If there is any joining with category tables, then we need to add those columns onto what is being selected
    $allColumnsSql = $filesTableColumnsSql;
    if($categoryColumnsSql != NULL) {
        $allColumnsSql .= ', ' . $categoryColumnsSql;
    }

    $subQueries = array();
    $queryPaths = getQueryPaths($dbInfoRequest);
    foreach ($queryPaths as $queryPath) {
        $subQueryInfo = new SubQueryInfo($queryPath);

        //Internal shares have a trivial mapping from the database path to the externally visible share name (e.g. External: /Public/dir1 <=> Database Path: /Public/dir1)
        //Removable media has a non-trivial mapping that needs to be taken into account (e.g. External: /WDPassport/dir1 <=> Database Path: /dir1)
        if($queryPath->share->isDynamicVolume()) {
            //Since some shares have DB paths that do not include the share name (e.g. external USB drives), the path returned to the client needs this to be added
            $shareNamePrefix = DS . $queryPath->share->getName(); // name relative to /shares so prepend DS
            $queryPath->requestedPath = substr(ltrim($queryPath->requestedPath, '/'), strlen($queryPath->share->getName()));
        }
        else
            $shareNamePrefix = NULL;

        //Build each of the necessary subqueries (may be 1 or more)
        // Common to both recursive and non-recursive cases
        if($subQueryInfo->includeEqualityFileQuery) {
            $subQuery = buildEqualityFileQuery($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        if($subQueryInfo->includeQueryForMatchingFileLink) {
            $subQuery = buildMatchingFileQueryForMatchingFileLink($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        if($subQueryInfo->includeQueryForContainingFolderLink) {
            // This gets the file within a folder link with an exact file name match
            $subQuery = buildMatchingFileQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }


        if($isRecursive) {
            if($subQueryInfo->includeDirectQuery) {
                $subQuery = buildDescendantFileQuery($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFileLinks) {
                $subQuery = buildMatchingFileQueryForContainedFileLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFolderLinks) {
                $subQuery = buildDescendantFileQueryForContainedFolderLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainingFolderLink) {
                $subQuery = buildDescendantFileQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
        } else {
            if($subQueryInfo->includeDirectQuery) {
                $subQuery = buildChildFileQuery($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeDynamicVolumeChildFileQuery) {
                $subQuery = buildDynamicVolumeChildFileQuery();
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFileLinks) {
                $subQuery = buildFileQueryForChildFileLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainingFolderLink) {
                $subQuery = buildChildFileQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
        }
    }

    //Convert all of the SubQuery objects into an array of SQL strings
    $subQueryStrings = array();
    foreach ($subQueries as $subQuery) {
        /* @var $subQuery QueryDescriptor */

        $linksJoiningClauseSql  = $subQuery->getLinksJoiningClauseSql();
        $parentJoiningClauseSql = $subQuery->getParentFileJoiningClauseSql(FALSE);

        $allJoinedTablesSql = "Files {$linksJoiningClauseSql} {$parentJoiningClauseSql} {$categoryJoiningClause}";

        //To get the full filter for this subquery, append on a filter for the path
        $allFilterStrSql = appendFilter($filterStringSql, $subQuery->filterWhereClause);

        if($isSummary) {
            $subQueryString = "SELECT COUNT(*) AS totalCount, SUM(size) AS totalSize FROM {$allJoinedTablesSql} WHERE {$allFilterStrSql}";
        } else {
            $nameExpression = $subQuery->nameExpression;
            $pathExpression = $subQuery->pathExpression;
            $subQueryString = "SELECT {$nameExpression} AS name, {$pathExpression} AS path, {$allColumnsSql} FROM {$allJoinedTablesSql} WHERE {$allFilterStrSql}";
            //todo: Optimization: If there is a limit, but no offset, then each subquery can have the limit applied before unioning. This allows the result size to be reduced sooner.
        }

        $subQueryStrings[] = $subQueryString;
        if($isSqlDebug) outputQueryAnalysis($pdo, $subQueryString, $subQuery->queryDescription);
    }

    //Combine all of the SQL Strings into a single Query String
    //Optimization: If only one subquery exists, then the query can be simplified by not requiring a query within a query.
    if (count($subQueries) == 1) {
        $queryString = reset($subQueryStrings);
    } else {
        $queryString = implode(' UNION ALL ', $subQueryStrings);
        if($isSummary) {
            //Note: it is important that aggregation is done before unioning.  Then this outer query only needs to union the smaller result set.
            $queryString = "SELECT SUM(totalCount) as totalCount, SUM(totalSize) as totalSize FROM ({$queryString})";
        }
    }

    //Append on ordering and limit/offset
    if(!$isSummary) {
        $queryString .= ' ' . $dbInfoRequest->getOrderByForFilesSql();
        $queryString .= ' ' . $dbInfoRequest->getLimitAndOffsetForFilesSql();
    }

    if($isSqlDebug) outputQueryAnalysis($pdo, $queryString, 'Aggregate or Unionized File Query');

    return $queryString;
}



//All query building functions return name, and path as well as other requested columns
//Note: This supports multiple request paths so that in the future, multi-share requests can be made (this isn't being used yet, but it is a pending feature)
function buildFolderQuery(DBInfoRequest $dbInfoRequest, $isSummary, PDO $pdo) {
    $isSqlDebug = $dbInfoRequest->debugSql;
    $isRecursive        = $dbInfoRequest->isRecursive;

    $foldersTableColumnsSql  = getFoldersTableColumnsSql(); //e.g. Folders.isDeleted AS isDeleted, Folders.lastModifiedDate
    $filterStringSql       = $dbInfoRequest->getFilterStringForFoldersSql();

    //If there is any joining with category tables, then we need to add those columns onto what is being selected
    $allColumnsSql = $foldersTableColumnsSql;

    $subQueries = array();
    $queryPaths = getQueryPaths($dbInfoRequest);
    foreach ($queryPaths as $queryPath) {
        $subQueryInfo = new SubQueryInfo($queryPath);

        //Internal shares have a trivial mapping from the database path to the externally visible share name (e.g. External: /Public/dir1 <=> Database Path: /Public/dir1)
        //Removable media has a non-trivial mapping that needs to be taken into account (e.g. External: /WDPassport/dir1 <=> Database Path: /dir1)
        if($queryPath->share->isDynamicVolume()) {
            $shareNamePrefix = DS . $queryPath->share->getName(); // name relative to /shares so prepend DS
            $queryPath->requestedPath = substr(ltrim($queryPath->requestedPath, '/'), strlen($queryPath->share->getName()));
        }
        else
            $shareNamePrefix = NULL;

        //Build each of the necessary subqueries (may be 1 or more)
        if($isRecursive) {
            if($subQueryInfo->includeDirectQuery) {
                $subQuery = buildDescendantAndEqualityFolderQuery($queryPath->requestedPath, $pdo);
                //Since some shares have DB paths that do not include the share name (e.g. external USB drives), the path returned to the client needs this to be added
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFolderLinks) {
                $subQuery = buildDescendantFolderQueryForContainedFolderLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFolderLinks) {
                $subQuery = buildMatchingFolderQueryForContainedFolderLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainingFolderLink) {
                $subQuery = buildDescendantFolderQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
        } else {
            if($subQueryInfo->includeDirectQuery) {
                $subQuery = buildChildFolderQuery($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeDynamicVolumeChildFolderQuery) {
                $subQuery = buildDynamicVolumeChildFolderQuery();
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainedFolderLinks) {
                $subQuery = buildMatchingFolderQueryForChildFolderLinks($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
            if($subQueryInfo->includeQueryForContainingFolderLink) {
                $subQuery = buildChildFolderQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
                $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
            }
        }
    }

    //Convert all of the SubQuery objects into an array of SQL strings
    $subQueryStrings = array();
    foreach ($subQueries as $subQuery) {
        /* @var $subQuery QueryDescriptor */

        $linksJoiningClauseSql  = $subQuery->getLinksJoiningClauseSql();
        $parentJoiningClauseSql = $subQuery->getParentFolderJoiningClauseSql(FALSE);

        $allJoinedTablesSql = "Folders {$linksJoiningClauseSql} {$parentJoiningClauseSql}";

        //To get the full filter for this subquery, append on a filter for the path
        $allFilterStrSql = appendFilter($filterStringSql, $subQuery->filterWhereClause);

        if($isSummary) {
            $subQueryString = "SELECT COUNT(*) AS totalCount FROM {$allJoinedTablesSql} WHERE {$allFilterStrSql}";
        } else {
            $nameExpression = $subQuery->nameExpression;
            $pathExpression = $subQuery->pathExpression;
            $subQueryString = "SELECT {$nameExpression} AS name, {$pathExpression} AS path, {$allColumnsSql} FROM {$allJoinedTablesSql} WHERE {$allFilterStrSql}";
            //todo: Optimization: If there is a limit, but no offset, then each subquery can have the limit applied before unioning. This allows the result size to be reduced sooner.
        }

        $subQueryStrings[] = $subQueryString;
        if($isSqlDebug) outputQueryAnalysis($pdo, $subQueryString, $subQuery->queryDescription);
    }

    //Combine all of the SQL Strings into a single Query String
    //Optimization: If only one subquery exists, then the query can be simplified by not requiring a query within a query.
    if (count($subQueries) == 1) {
        $queryString = reset($subQueryStrings);
    } else {
        $queryString = implode(' UNION ALL ', $subQueryStrings);
        if($isSummary) {
            //Note: it is important that aggregation is done before unioning.  Then this outer query only needs to union the smaller result set.
            $queryString = "SELECT SUM(totalCount) as totalCount FROM ({$queryString})";
        }
    }

    //Append on ordering and limit/offset
    if(!$isSummary) {
        $queryString .= ' ' . $dbInfoRequest->getOrderByForFoldersSql();
        $queryString .= ' ' . $dbInfoRequest->getLimitAndOffsetForFoldersSql();
    }

    if($isSqlDebug) outputQueryAnalysis($pdo, $queryString, 'Aggregate or Unionized Folder Query');

    return $queryString;
}
class DBGroupingRequest {
    const PARENT_PATH = 'PARENT_PATH'; // A special identifier for a groupingColumn to identify the path of the parent (the actual SQL for this varies between subqueries)
    var $groupingColumn1, $groupingColumn2; //e.g. 'artist', 'album'
    var $share;
    var $requestPath; //This is flexible, so it could be expanded to support any subdirectory (not just at the share level)
    var $categories; //The result is filtered to only include the specified categories
    var $joinWithCategory; //Boolean of whether we need to join with the category's table (note: we may filter on a category that we don't need to join with. e.g. audio grouped by folder)
    var $includeHidden = FALSE;
    var $fileSqlFilters = NULL; //This is flexible, so that it could be expanded to allow any type of file filtering
    var $categorySqlFilters = array(); //This is flexible so that it could be expanded to allow any type of category filtering (e.g. where artist=Jackson )
    var $debugSql;

    public function __construct($groupingColumn1, $groupingColumn2, $requestPath, $share, $category, $joinWithCategory, $debugSql) {
        $this->groupingColumn1      = $groupingColumn1;
        $this->groupingColumn2      = $groupingColumn2;
        $this->requestPath          = $requestPath;
        $this->share                = $share;
        $this->categories           = array ($category);
        $this->joinWithCategory     = $joinWithCategory;
        $this->debugSql             = $debugSql;
    }

    function isParentGroupingRequest() {
        return $this->groupingColumn1 == DBGroupingRequest::PARENT_PATH;
    }
    function isParentJoiningRequired(QueryDescriptor $queryDescriptor) {
        //We must join with the Folders table to find the parent IF this DBGroupingRequest is grouping by parent folder AND
        //   the expression used to obtain the path of the parent depends on the table ParentFolder
        return $this->isParentGroupingRequest() && $queryDescriptor->parentPathExpressionRequiresParentJoining();
    }

    function getAliasedGroupingColumnsSql(QueryDescriptor $queryDescriptor) {
        $groupingColumn1 = $this->groupingColumn1;
        $groupingColumn2 = $this->groupingColumn2;

        //If we are grouping based on the parent path, then we need to use the expression that is unique to this subquery to obtain the parent path
        if($this->isParentGroupingRequest()) {
            $theGc1PathExpression = $queryDescriptor->parentPathExpression;
            if($this->share->isDynamicVolume()){
                $theGc1PathExpression = '(\'' . DS . $this->share->getName() . '\' || '. $queryDescriptor->parentPathExpression . ')';
            }
            return $theGc1PathExpression . ' AS gc1, NULL AS gc2';
        }

        if($groupingColumn2 != NULL) {
            return "{$groupingColumn1} AS gc1, {$groupingColumn2} AS gc2"; //e.g. group by artist, album
        } else {
            return "{$groupingColumn1} AS gc1, NULL AS gc2"; //e.g. group by genre
        }
    }
    function getGroupingColumnsSql() {
        return ($this->groupingColumn2 == NULL ) ? 'gc1' : 'gc1, gc2';
    }

    function getCategoriesJoiningClauseSql() {
        if($this->joinWithCategory) {
            return getCategoriesJoiningSql($this->categories);
        } else {
            return NULL;
        }
    }

    function getCategoriesFilter() { return getCategoriesFilter($this->categories); }

    function getFilterStringForFilesSql() {
        $filterStr = '';
        $filterStr = appendFilter($filterStr, getHiddenFileFilter($this->includeHidden));
        $filterStr = appendFilter($filterStr, getFileStartTimeFilter(NULL));
        $filterStr = appendFilterArray($filterStr, $this->fileSqlFilters);
        $filterStr = appendFilter($filterStr, $this->getCategoriesFilter());     //e.g. "category in (1, 3)"

        foreach ( $this->categories as $category) {
            $filterStr = appendFilterArray($filterStr, $this->categorySqlFilters[$category]);
        }
        return $filterStr;
    }

} // class DBGroupingRequest

//TEMP FUNCTION JUST FOR DEBUGGING (this will be completely removed later)
/*function debugGrouping(PDO $pdo) {
    $groupingId = 1;
    $shareName = 'Public';

    //$dbGroupingRequest = new DBGroupingRequest(DBGroupingRequest::PARENT_PATH, NULL, "/{$shareName}/", 'audio', FALSE, TRUE);
    //$dbGroupingRequest = new DBGroupingRequest('artists', 'genres', "/{$shareName}/", 'audio', TRUE, TRUE);
    //$dbGroupingRequest = new DBGroupingRequest('artists', NULL, "/{$shareName}/", 'audio', TRUE, TRUE);

    buildGroupingQuery($dbGroupingRequest, "{$groupingId}, '{$shareName}', ", $pdo);
}*/

function buildGroupingQuery(DBGroupingRequest $dbGroupingRequest, $additionalSelectColumns, PDO $pdo) {
    $isSqlDebug = $dbGroupingRequest->debugSql;
    $categoriesJoiningClauseSql = $dbGroupingRequest->getCategoriesJoiningClauseSql(); //e.g. "JOIN AudioMetaData audioTable ON audioTable.sourceId = Files.id"

    $groupingColumnsSql = $dbGroupingRequest->getGroupingColumnsSql(); //e.g. artist as gc1, album as gc2
    $filterStringSql = $dbGroupingRequest->getFilterStringForFilesSql();

    $subQueries = array();
    $queryPath = new QueryPath();
    $queryPath->requestedPath = $dbGroupingRequest->requestPath;
    $queryPath->share = $dbGroupingRequest->share;
    $queryPaths = array($queryPath);
    //$requestedPaths = array($dbGroupingRequest->requestPath);
    foreach ($queryPaths as $queryPath) {
        $subQueryInfo = new SubQueryInfo($queryPath);

        //Internal shares have a trivial mapping from the database path to the externally visible share name (e.g. External: /Public/dir1 <=> Database Path: /Public/dir1)
        //Removable media has a non-trivial mapping that needs to be taken into account (e.g. External: /WDPassport/dir1 <=> Database Path: /dir1)
        //Since some shares have DB paths that do not include the share name (e.g. external USB drives), the path returned to the client needs this to be added
        if($queryPath->share->isDynamicVolume())
            $shareNamePrefix = $queryPath->share->getName();
        else
            $shareNamePrefix = NULL;

        //Build each of the necessary subqueries (may be 1 or more)
        if($subQueryInfo->includeDirectQuery) {
            $subQuery = buildDescendantFileQuery($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        if($subQueryInfo->includeQueryForContainedFileLinks) {
            $subQuery = buildMatchingFileQueryForContainedFileLinks($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        if($subQueryInfo->includeQueryForContainedFolderLinks) {
            $subQuery = buildDescendantFileQueryForContainedFolderLinks($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        if($subQueryInfo->includeQueryForContainingFolderLink) {
            $subQuery = buildDescendantFileQueryForContainingFolderLink($queryPath->requestedPath, $pdo);
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
        // Since groupings are only done at the share level, we always need this special case for dynamic volumes
        //   If in the future, we support grouping below the share level, we will need to further restrict when we include this.
        if($queryPath->share->isDynamicVolume() && $dbGroupingRequest->isParentGroupingRequest()) {
            $subQuery = buildDynamicVolumeChildFileQuery();
            $subQueries[] = prependStringConstantToQuery($subQuery, $shareNamePrefix);
        }
    }

    //Convert all of the SubQuery objects into an array of SQL strings
    $subQueryStrings = array();
    foreach ($subQueries as $subQuery) {
        /* @var $subQuery QueryDescriptor */

        $linksJoiningClauseSql  = $subQuery->getLinksJoiningClauseSql();
        $isParentJoiningRequired = $dbGroupingRequest->isParentJoiningRequired($subQuery);
        //echo "isParentJoiningRequired: {$isParentJoiningRequired}\n\n"; var_dump($subQuery); var_dump($dbGroupingRequest);
        $parentJoiningClauseSql = $subQuery->getParentFileJoiningClauseSql($isParentJoiningRequired);

        $allJoinedTablesSql = "Files {$linksJoiningClauseSql} {$parentJoiningClauseSql} {$categoriesJoiningClauseSql}";

        //To get the full filter for this subquery, append on a filter for the path
        $allFilterStrSql = appendFilter($filterStringSql, $subQuery->filterWhereClause);

        $pathExpression = $subQuery->pathExpression;
        $aliasedGroupingColumnsSql = $dbGroupingRequest->getAliasedGroupingColumnsSql($subQuery);
        $subQueryString = "SELECT {$additionalSelectColumns} {$aliasedGroupingColumnsSql}, COUNT(*) AS totalCount, MIN({$pathExpression}) AS minPath FROM {$allJoinedTablesSql} WHERE {$allFilterStrSql} GROUP BY {$groupingColumnsSql}";

        $subQueryStrings[] = $subQueryString;
        if($isSqlDebug) outputQueryAnalysis($pdo, $subQueryString, $subQuery->queryDescription);
    }

    //Combine all of the SQL Strings into a single Query String
    //Optimization: If only one subquery exists, then the query can be simplified by not requiring a query within a query.
    if (count($subQueries) == 1) {
        $queryString = reset($subQueryStrings);
    } else {
        $queryString = implode(' UNION ALL ', $subQueryStrings);
        //Note: it is important that grouping is done before unioning.  Then this outer query only needs to union the smaller result set.
        $queryString = "SELECT {$additionalSelectColumns} gc1, gc2, SUM(totalCount) AS totalCount, MIN(minPath) AS minPath FROM ({$queryString}) GROUP BY gc1, gc2";
    }

    if($isSqlDebug) outputQueryAnalysis($pdo, $queryString, 'BuildGroupingQuery: Aggregate (Unionized) Query');

    return $queryString;
}

function getQueryPaths(DBInfoRequest $dbInfoRequest) {
    //ToDo: Feature: Expand this array to handle the case of a root path that is parent to all shares.  This would require creation of an array that holds the path to each share that is accessible by the requesting user.
    $queryPath = new QueryPath();
    $requestedPath = $dbInfoRequest->getPath();
    $requestedPath = rtrim($requestedPath, '/').'/';
    $queryPath->requestedPath = $requestedPath;
    $queryPath->share = $dbInfoRequest->share;

    $queryPaths = array($queryPath);
    return $queryPaths;
}


//Returns the SQL expression for prepending the path with the specified constant (e.g. "File.path", "/USBShare" => "'/USBShare' || File.path")
function prependStringConstantSql($sqlExpression, $constantStr) {
    //Null of empty prefixes just return the unmodified sqlExpression
    if( $constantStr == NULL || empty($constantStr) ) return $sqlExpression;

    return "'{$constantStr}' || {$sqlExpression}";
}

function prependStringConstantToQuery(QueryDescriptor $queryDescriptor, $constantStr)
{
    $queryDescriptor->pathExpression = prependStringConstantSql($queryDescriptor->pathExpression, $constantStr);
    return $queryDescriptor;
}

function outputQueryAnalysis(PDO $pdo, $queryStr, $queryDescription = '') {
    echo "\n==================== STARTING QUERY ANALYSIS ======================\n";
    echo "-------------------- QueryDescription: $queryDescription \n";
    echo "-------------------- Query                   ----------------------\n";
    echo $queryStr . "\n";
    echo "-------------------- Summary                 ----------------------\n";

    $t0 = microtime(TRUE);

    $stmt = $pdo->prepare($queryStr);
    if (!$stmt)
    {
        error_log(__METHOD__ . '|' . var_export($pdo->errorInfo(), TRUE));
        error_log(__METHOD__ . '|' . $queryStr);
    }
    $stmt->execute();
    $rowCount = 0;
    while (($row = $stmt->fetch(\PDO::FETCH_ASSOC)) !== FALSE) {
        $rowCount++;
    }
    $t1=microtime(TRUE);
    $dt = round(1000.0 * ($t1-$t0), 2);
    echo "Row Count of Response: {$rowCount} \n";
    echo "Time of Response (ms): {$dt}\n";

    echo "-------------------- Query Plan              ----------------------\n";
    $stmt = $pdo->prepare("EXPLAIN QUERY PLAN " . $queryStr);
    if (!$stmt)
    {
        error_log(__METHOD__ . '|' . var_export($pdo->errorInfo(), TRUE));
        error_log(__METHOD__ . '|' . $queryStr);
    }
    $stmt->execute();
    while (($row = $stmt->fetch(\PDO::FETCH_ASSOC)) !== FALSE) {
        //var_dump($row);
        echo htmlspecialchars($row['detail'], ENT_QUOTES) . "\n";
    }

    echo "-------------------- Done                    ----------------------\n\n";
}

//This class makes decisions on how to optimize the query by choosing which subqueries should be excluded based on the type of share
//  e.g. a regular share doesn't need to do a subquery for links since regular shares cannot contain links
class SubQueryInfo {
    var $includeDirectQuery = true;
    var $includeEqualityFileQuery = true;
    var $includeQueryForContainedFileLinks   = true;
    var $includeQueryForContainedFolderLinks = true;
    var $includeQueryForContainingFolderLink = true;
    var $includeQueryForMatchingFileLink = true;
    // USB
    var $includeDynamicVolumeChildFileQuery = false; // for Dynamic Volumes (USB) only
    var $includeDynamicVolumeChildFolderQuery = false; // for Dynamic Volumes (USB) only

    public function __construct($queryPath) {

        if($queryPath->share->isDynamicVolume()){
            // Crawler does not capture share name in the Db for USB shares so non-recursive further below
            // the USB share (e.g. /MyUSBDrive/level1) should not include files/folders from the root of the USB share
            // See the usage in respective query builders.
            $depth = substr_count($queryPath->requestedPath, '/', 1); //A depth of 1 is just the share level (e.g. "/")
            if($depth == 1){
                // if the depth is at the share root level itself then include else turn off
                $this->includeDynamicVolumeChildFileQuery = true; // for USB shares only!!
                $this->includeDynamicVolumeChildFolderQuery = true; // for USB shares only!!
            }
        }
        ///*  This section can be commented out for debugging purposes.  In that case, all subqueries will always be called.
        $isSambaAvailable = $queryPath->share->isSambaAvailable();
        if($isSambaAvailable) {
            $this->includeQueryForContainedFileLinks = false;
            $this->includeQueryForContainedFolderLinks = false;
            $this->includeQueryForContainingFolderLink = false;
            $this->includeQueryForMatchingFileLink = false;
        } else {
            $this->includeDirectQuery = false;
            $this->includeEqualityFileQuery = false;
            $depth = substr_count($queryPath->requestedPath, '/', 1); //A depth of 1 is just the share level (e.g. "/Public/")
            //Links can only occur at the top level.  Any request for a deeper level won't find any
            if ($depth > 2) {
                $this->includeQueryForContainedFileLinks = false;
                $this->includeQueryForContainedFolderLinks = false;
            }
        }//*/
    }
} //class SubQueryInfo

// This class captures the path being requested & the respective share object.
// Defined for future use where the metadata request can be across all shares.
class QueryPath {
    var $requestedPath = '';
    var $share; // share object
} //class QueryPath

class QueryDescriptor {
    var $nameExpression;
    var $pathExpression;
    var $filterWhereClause; //The where-clause that restricts to only the desired path (may filter on Links and/or Files)
    var $linksJoiningClause; //
    var $requiresParentFolderJoining;
    var $queryDescription = ''; // used for debug purpose to identify the query with function name

    public function __construct($nameExpression, $pathExpression, $filterWhereClause, $linksJoiningClause, $joinFolders=FALSE, $parentPathExpression=NULL, $queryDescription='') {
        $this->nameExpression = $nameExpression;
        $this->pathExpression = $pathExpression;
        $this->filterWhereClause = $filterWhereClause;
        $this->linksJoiningClause = $linksJoiningClause;
        $this->requiresParentFolderJoining = $joinFolders;
        //The expression that is required to obtain the parent's path is different between different Queries
        $this->parentPathExpression = $parentPathExpression;
        $this->queryDescription = $queryDescription;

    }

    public function getLinksJoiningClauseSql() {
        if ($this->linksJoiningClause == NULL) return '';
        return 'JOIN Links ON ' . $this->linksJoiningClause;
    }

    //This will return a SQL clause for joining with the Folders table if this QueryDescriptor requires it OR the parameter requires it
    public function getParentFileJoiningClauseSql($forceParentFolderJoining) {
        if (!$forceParentFolderJoining && $this->requiresParentFolderJoining == NULL) return '';
        return 'JOIN Folders ParentFolder ON Files.folderId = ParentFolder.id';
    }

    //This will return a SQL clause for joining with the Folders table if this QueryDescriptor requires it OR the parameter requires it
    public function getParentFolderJoiningClauseSql($forceParentFolderJoining) {
        if (!$forceParentFolderJoining && $this->requiresParentFolderJoining == NULL) return '';
        return 'JOIN Folders ParentFolder ON Folders.folderId = ParentFolder.id';
    }

    public function parentPathExpressionRequiresParentJoining() {
        //If the expression for the Parent's path references the ParentFolder, then we do require joining with the Folders table in order to obtain this parent information
        return strpos($this->parentPathExpression, 'ParentFolder') !== FALSE;
    }
} // class QueryDescriptor

function getFilesTableColumnsSql() {
    return "Files.id, Files.isDeleted AS isDeleted, Files.size AS size, Files.category as category, Files.lastModifiedDate as lastModifiedDate";
}

function getFoldersTableColumnsSql() {
    return "Folders.id, Folders.isDeleted AS isDeleted, Folders.lastModifiedDate as lastModifiedDate";
}

//===================== RECURSIVE FILE QUERIES =========================================================================
// For more discussion and example usages, see: http://confluence.wdmv.wdc.com/display/MWS/Metadata+Query+Requirements#MetadataQueryRequirements-Queries:RecursiveFileQuery
function buildDescendantFileQuery($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantFileQuery';

    $queryPathRecurse = getRecursivePath($queryPath);

    $nameExpression = 'Files.name';
    $pathExpression = 'Files.path';
    $filterWhereClause = 'Files.path LIKE ' . $pdo->quote($queryPathRecurse);
    $parentPathExpression = 'ParentFolder.path';

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, FALSE, $parentPathExpression, $queryDescription);
}
function buildEqualityFileQuery($queryPath, PDO $pdo) {
    $queryDescription = 'buildEqualityFileQuery';

    // Since this is an equality query and Crawler Db does not capture '/' at the end of the files path, trim the slash at the end.
    $queryPathWithNoSlash = rtrim($queryPath, '/');

    $nameExpression = 'Files.name';
    $pathExpression = 'Files.path';
    $filterWhereClause = 'Files.path = ' . $pdo->quote($queryPathWithNoSlash);
    $parentPathExpression = 'ParentFolder.path';

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, FALSE, $parentPathExpression, $queryDescription);
}

function buildMatchingFileQueryForMatchingFileLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildMatchingFileQueryForMatchingFileLink';

    // Since this is a matching File link and slash is not captured at the end of files/file links, remove slash at the end of recursion as well.
    $queryPathWithNoSlash = rtrim($queryPath, '/');

    $nameExpression = 'Links.name';
    $pathExpression = 'Links.path';
    $filterWhereClause = 'Links.path = ' . $pdo->quote($queryPathWithNoSlash) . getFileLinkFilter();
    $joiningClause = "Files.path = Links.target";
    $parentPathExpression = $pdo->quote($queryPath); //Since File Links are only allowed directly under a share, the parent of any File Links that are found is the requestPath

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, $parentPathExpression, $queryDescription);
}

function buildMatchingFileQueryForContainedFileLinks($queryPath, PDO $pdo) {
    $queryDescription = 'buildMatchingFileQueryForContainedFileLinks';

    $queryPathRecurse = getRecursivePath($queryPath);

    $nameExpression = 'Links.name';
    $pathExpression = 'Links.path';
    $filterWhereClause = 'Links.path LIKE ' . $pdo->quote($queryPathRecurse) . getFileLinkFilter();
    $joiningClause = "Files.path = Links.target";
    $parentPathExpression = $pdo->quote($queryPath); //Since File Links are only allowed directly under a share, the parent of any File Links that are found is the requestPath

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, $parentPathExpression, $queryDescription);
}

//This is needed for the case where the requested path is a _child_ of a folder link.
function buildDescendantFileQueryForContainingFolderLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantFileQueryForContainingFolderLink';

    $queryPathQuoted = $pdo->quote($queryPath);

    $nameExpression = 'Files.name';
    $pathExpression = getVirtualFilePath(); //Effectively this is: LinkPath || TrimmedFilePath
    $filterWhereClause = "$queryPathQuoted LIKE (Links.folderPath || '%')".getFolderLinkFilter();
    $joiningClause = "Files.path LIKE (Links.target || substr($queryPathQuoted, length(Links.folderPath)+1) || '%')";
    //todo: Optimization: Find a more efficient expression for the parent path which applies to this case
    $parentPathExpression = getParentPathExpression($pathExpression, $nameExpression); //The parent cannot be based on the Folders table unless it is remapped

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, $parentPathExpression, $queryDescription);
}

//This is needed for the case where the requested path is a _child_ of a folder link with an exact match.
function buildMatchingFileQueryForContainingFolderLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildMatchingFileQueryForContainingFolderLink';

    // Since this is an equality query and Crawler Db does not capture '/' at the end of the files path, trim the slash at the end.
    $queryPathWithNoSlashQuoted = $pdo->quote(rtrim($queryPath, '/'));

    $nameExpression = 'Files.name';
    $pathExpression = getVirtualFilePath(); //Effectively this is: LinkPath || TrimmedFilePath
    $filterWhereClause = $pdo->quote($queryPath) . " LIKE (Links.folderPath || '%')".getFolderLinkFilter();
    $joiningClause = "Files.path = (Links.target || substr($queryPathWithNoSlashQuoted, length(Links.folderPath)+1))";
    //todo: Optimization: Find a more efficient expression for the parent path which applies to this case
    $parentPathExpression = getParentPathExpression($pathExpression, $nameExpression); //The parent cannot be based on the Folders table unless it is remapped

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, $parentPathExpression, $queryDescription);
}

function buildDescendantFileQueryForContainedFolderLinks($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantFileQueryForContainedFolderLinks';

    $queryPathRecurse = getChildRecursivePath($queryPath);

    $nameExpression = 'Files.name';
    $pathExpression = getVirtualFilePath();
    $filterWhereClause = 'Links.folderPath LIKE ' . $pdo->quote($queryPathRecurse) . getFolderLinkFilter();
    $joiningClause = "Files.path LIKE (Links.target || '%')";
    //todo: Optimization: Find a more efficient expression for the parent path which applies to this case
    $parentPathExpression = getParentPathExpression($pathExpression, $nameExpression); //The parent cannot be based on the Folders table unless it is remapped

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, $parentPathExpression, $queryDescription);
}

//===================== RECURSIVE FOLDER QUERIES =======================================================================
// For more discussion and example usages, see: http://confluence.wdmv.wdc.com/display/MWS/Metadata+Query+Requirements#MetadataQueryRequirements-Queries:RecursiveFolderQuery
function buildDescendantAndEqualityFolderQuery($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantAndEqualityFolderQuery';
    // Since folder paths end with slash in the crawler Db, the query includes the matching descendants as well as the folder itself.
    $queryPathRecurse = getRecursivePath($queryPath);

    $nameExpression = 'Folders.name';
    $pathExpression = 'Folders.path';
    $filterWhereClause = 'Folders.path LIKE ' . $pdo->quote($queryPathRecurse);

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, FALSE, NULL, $queryDescription);
}

//function buildDescendantFolderQueryForContainedFileLinks()  This is not needed since File links are not relevant to a query on folders

function buildDescendantFolderQueryForContainedFolderLinks($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantFolderQueryForContainedFolderLinks';

    $queryPathRecurse = getRecursivePath($queryPath);

    $nameExpression = 'Folders.name';
    $pathExpression = getVirtualFolderPath();
    $filterWhereClause = 'Links.folderPath LIKE ' . $pdo->quote($queryPathRecurse) . getFolderLinkFilter();
    $joiningClause = "Folders.path LIKE (Links.target || '%/%')";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, NULL, $queryDescription);
}

function buildMatchingFolderQueryForContainedFolderLinks($queryPath, PDO $pdo) {
    $queryDescription = 'buildMatchingFolderQueryForContainedFolderLinks';

    $queryPathRecurse = getRecursivePath($queryPath);

    $nameExpression = 'Links.name';
    $pathExpression = 'Links.path';
    $filterWhereClause = 'Links.folderPath LIKE ' . $pdo->quote($queryPathRecurse) . getFolderLinkFilter();
    $joiningClause = "Folders.path = Links.target";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, NULL, $queryDescription);
}

function buildDescendantFolderQueryForContainingFolderLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildDescendantFolderQueryForContainingFolderLink';

    $queryPathQuoted = $pdo->quote($queryPath);

    $nameExpression = 'Folders.name';
    $pathExpression = getVirtualFolderPath();
    $filterWhereClause = "$queryPathQuoted LIKE (Links.folderPath || '%/%')".getFolderLinkFilter();
    $joiningClause = "Folders.path LIKE (Links.target || substr($queryPathQuoted, length(Links.folderPath)+1) || '%')";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, FALSE, NULL, $queryDescription);
}

//===================== NON-RECURSIVE FILE QUERIES =====================================================================
// For more discussion and example usages, see: http://confluence.wdmv.wdc.com/display/MWS/Metadata+Query+Requirements#MetadataQueryRequirements-Queries:Non-recursiveFileQuery
function buildChildFileQuery($queryPath, PDO $pdo) {
    $queryDescription = 'buildChildFileQuery';

    $nameExpression = 'Files.name';
    $pathExpression = 'Files.path';

    //OPTION 2 (BAD): This logic works, but it requires a full table scan which takes 1600ms for the QA test data set (unacceptably slow)
    //$parentPathExpression = getParentPathExpression($pathExpression, $nameExpression);
    //$filterWhereClause = "{$parentPathExpression} = '{$requestPath}'";

    //OPTION 2 (GOOD): We require joining with the Folders table (aliased as ParentFolder) which can use an index.  Query time is 50ms for the QA test data set.
    $filterWhereClause = 'ParentFolder.path = ' . $pdo->quote($queryPath);

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, TRUE, NULL, $queryDescription); //The TRUE at the 5th param causes this to be joined with the Folders table
}

function buildDynamicVolumeChildFileQuery() {
    // Since crawler does not capture the share name in the paths (the indexing starts below USB share name) and the immediate child
    // files would not have an entry in the folders table, but are captured with -1 for folderid in the files table itself, so this
    // query is specific to handling Dynamic volume (USB shares) non-recursive file query
    $queryDescription = 'buildDynamicVolumeChildFileQuery';

    $nameExpression = 'Files.name';
    $pathExpression = 'Files.path';

    $filterWhereClause = "Files.folderid = -1";

    $parentPathExpression = "'/'";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, FALSE, $parentPathExpression, $queryDescription); //The TRUE at the 5th param causes this to be joined with the Folders table
}

function buildFileQueryForChildFileLinks($queryPath, PDO $pdo) {
    //This is identical to the recursive case, but this method of finding File Links would need to be changed if in the future we choose to support links at deeper levels
    return buildMatchingFileQueryForContainedFileLinks($queryPath, $pdo);
}

//function buildChildFileQueryForChildFolderLinks()  A contained folder link will not have any affect on a query for child Files

function buildChildFileQueryForContainingFolderLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildChildFileQueryForContainingFolderLink';
    //todo: Optimize this query by NOT using the Folders table.  Since there can only be one containing query, this can be looked up quickly in PHP.
    //todo:   The resulting SQL will be able to use the index since the path of comparison will now be a constant rather than a SQL expression.

    $queryPathQuoted = $pdo->quote($queryPath);

    $nameExpression = 'Files.name';
    $pathExpression = getVirtualFilePath();
    $filterWhereClause = "$queryPathQuoted LIKE (Links.folderPath || '%')".getFolderLinkFilter();
    //The File's parent must match the target of the link appended with the subpath that was requested
    $joiningClause = "ParentFolder.path = (Links.target || substr($queryPathQuoted, length(Links.folderPath)+1))";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, TRUE, NULL, $queryDescription);
}


//===================== NON-RECURSIVE FOLDER QUERIES =====================================================================
// For more discussion and example usages, see: http://confluence.wdmv.wdc.com/display/MWS/Metadata+Query+Requirements#MetadataQueryRequirements-Queries:Non-recursiveFolderQuery
function buildChildFolderQuery($queryPath, PDO $pdo) {
    $queryDescription = 'buildChildFolderQuery';

    $nameExpression = 'Folders.name';
    $pathExpression = 'Folders.path';
    $filterWhereClause = 'ParentFolder.path = ' . $pdo->quote($queryPath);

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, TRUE, NULL, $queryDescription);
}

function buildDynamicVolumeChildFolderQuery() {
    // Since crawler does not capture the share name in the paths (the indexing starts below USB share name) and the immediate child
    // folders would have an entry in the folders table as -1 for folderid, so this query is specific to handling Dynamic volume (USB shares) non-recursive folder query
    $queryDescription = 'buildDynamicVolumeChildFolderQuery';

    $nameExpression = 'Folders.name';
    $pathExpression = 'Folders.path';
    $filterWhereClause = "Folders.folderid = -1";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, NULL, FALSE, NULL, $queryDescription);
}

//function buildChildFolderQueryForFileLinks()  This is not needed since File links are not relevant to a query on folders

function buildMatchingFolderQueryForChildFolderLinks($queryPath, PDO $pdo) {
    //Since folder links can only be one level down, the Child version of this query is the same as the Descendant version
    return buildMatchingFolderQueryForContainedFolderLinks($queryPath, $pdo);
}

function buildChildFolderQueryForContainingFolderLink($queryPath, PDO $pdo) {
    $queryDescription = 'buildChildFolderQueryForContainingFolderLink';

    $queryPathQuoted = $pdo->quote($queryPath);

    $nameExpression = 'Folders.name';
    $pathExpression = getVirtualFolderPath();
    $filterWhereClause = "$queryPathQuoted LIKE (Links.folderPath || '%')".getFolderLinkFilter(); //Finds the containing link

    //The File's parent must match the target of the link appended with the subpath that was requested
    $joiningClause = "ParentFolder.path = (Links.target || substr($queryPathQuoted, length(Links.folderPath)+1))";

    return new QueryDescriptor($nameExpression, $pathExpression, $filterWhereClause, $joiningClause, TRUE, NULL, $queryDescription);
}

//===================== UTILITY FUNCTIONS =========================================================================
//Utility functions so that SQL strings are not so badly repeated in the above blocks of code

//Creates a path as it appears externally.
function getVirtualFilePath  () { return 'Links.folderPath || substr(Files.path, length(Links.target)+1)'; }
function getVirtualFolderPath() { return 'Links.folderPath || substr(Folders.path, length(Links.target)+1)'; }
//Converts a requested path to the actual path by chopping off the Link's path and prepending the target
function getChildRecursivePath($path) { return $path.'%/%'; }
function getRecursivePath($path) { return $path.'%'; }
function getFileLinkFilter  () { return ' AND NOT Links.isFolder AND NOT Links.isDeleted'; }
function getFolderLinkFilter() { return ' AND Links.isFolder AND NOT Links.isDeleted'; }

// Returns an SQL string for the filename through taking a substring of the provided fullPath
//This is not currently used since it performs worse than doing a table join
function getParentPathExpression($fullPath, $filename) {
    //Take everything from the beginning
    return "substr({$fullPath}, 1, length({$fullPath})-length({$filename}))";
}

