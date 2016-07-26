<?php
require_once 'db_util.inc';
require_once 'db_query_builder.inc';
require_once(METADATA_ROOT . '/includes/crawlerstatus.inc');

/**
 * An include file that contains the general logic and output logic for the metadb_info implementation
 * @param PDO $pdo
 * @param DBInfoRequest $dbInfoRequest
 * @param OutputWriter $outputWriter
 */
function generateInfoResponse(PDO $pdo, DBInfoRequest $dbInfoRequest, $outputFormat, $apiVersion) {
    $volInfo = \RequestScope::getMediaVolMgr()->getVolumeByShareName($dbInfoRequest->shareName);
    $crawlerStatus = getCrawlerStatus($volInfo['Id']);

    if (!empty($dbInfoRequest->startTime) && (int)$dbInfoRequest->startTime < $crawlerStatus['last_purge']) {
        throw new \Exception('INVALID_START_TIME', 400);
    }

    $outputWriter = new \OutputWriter(strtoupper($outputFormat));
    $outputWriter->pushElement('metadb_info');

    //Add header information relating to the times
    $outputWriter->numberElement('generated_time', time());
    $outputWriter->numberElement('last_purge_time', $crawlerStatus['last_purge']);
    $outputWriter->numberElement('last_updated_db_time', $crawlerStatus['last_crawl']);

    if (empty($dbInfoRequest->startTime) || (int)$dbInfoRequest->startTime <= $crawlerStatus['last_crawl']) {
        //Add the main information on file_info and dir_info
        if ($dbInfoRequest->includeFileInfo) {
            generateFileResponse($pdo, $dbInfoRequest, $outputWriter, $apiVersion);
        }
        if ($dbInfoRequest->includeDirInfo) {
            generateDirResponse($pdo, $dbInfoRequest, $outputWriter, $apiVersion);
        }
    }

    $outputWriter->popElement();
    $outputWriter->close();
}

/**
 * Generates only the portion of the output associated with directories
 * @param PDO $pdo The data object to query
 * @param DBInfoRequest $dbInfoRequest The client's request
 * @param OutputWriter $outputWriter
 */
function generateDirResponse(PDO $pdo, DBInfoRequest $dbInfoRequest, OutputWriter $outputWriter, $apiVersion) {
    $isSqlDebug = $dbInfoRequest->debugSql;
    $queryStr = buildFolderQuery($dbInfoRequest, FALSE, $pdo);
    //If we are only debugging the SQL, then we are done
    if($isSqlDebug)
        return;

    streamDirOutput($pdo, $queryStr, $dbInfoRequest, $outputWriter, $apiVersion);
}

/**
 * Streams the output of directory information based on the provided query
 * @param PDO $pdo
 * @param string $query
 * @param OutputWriter $outputWriter
 */
function streamDirOutput(PDO $pdo, $query, DBInfoRequest $dbInfoRequest, OutputWriter $outputWriter, $apiVersion) {
    //Execute the query (but don't fetch all the rows yet)
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $outputWriter->pushArray(($apiVersion == '1.0') ? 'dirs' : 'dir');

    $sharePrefix = $dbInfoRequest->share->getName();
    while (($row = $stmt->fetch(\PDO::FETCH_ASSOC)) !== FALSE)
    {
        // Skip entries of the share itself on platforms like Sequoia
        $path = trim($row['path'], '/');
        if ($path == $sharePrefix)
            continue;

        //Push the results of this row out
        $outputWriter->pushArrayElement();
        $outputWriter->element('path', dirname($row['path']));
        $outputWriter->element('name', $row['name']);
        $outputWriter->numberElement('modified', $row['lastModifiedDate']);
        if($apiVersion < 2.7) {
            $outputWriter->element('deleted', getBooleanOutputName($row['isDeleted']));
        } else {
            $outputWriter->element('deleted', getBooleanOutput($row['isDeleted']));
        }

        if ($dbInfoRequest->showIsLinked) {
            $isLinked = 'false';

            $map = \Filesystem\Model\Link::getMapFromTarget($row['path'], TRUE, FALSE, TRUE);
            if (!empty($map)) {
                $isLinked = 'true';
            }

            $outputWriter->element('is_linked', $isLinked);
        }

        $outputWriter->popArrayElement();
    }

    $outputWriter->popArray();

    //cleanup
    $stmt->closeCursor();
}

/**
 * Generates only the portion of the output associated with files
 * @param PDO $pdo The data source to be queried
 * @param DBInfoRequest $dbInfoRequest Structure holding information on the client's request
 * @param OutputWriter $outputWriter
 */
function generateFileResponse(PDO $pdo, DBInfoRequest $dbInfoRequest, OutputWriter $outputWriter, $apiVersion) {
    $isSqlDebug = $dbInfoRequest->debugSql;
    $queryStr = buildFileQuery($dbInfoRequest, FALSE, $pdo);
    //If we are only debugging the SQL, then we are done
    if($isSqlDebug)
        return;
    streamFileOutput($pdo, $queryStr, $dbInfoRequest, $outputWriter, $apiVersion);
}

function streamFileOutput(PDO $pdo, $query, DBInfoRequest $dbInfoRequest, OutputWriter $outputWriter, $apiVersion)
{
    // Execute the query (but don't fetch all the rows yet)
    $stmt = $pdo->prepare($query);

    if (!$stmt)
    {
        error_log(__METHOD__ . '|' . var_export($pdo->errorInfo(), TRUE));
        error_log(__METHOD__ . '|' . $query);
    }

    $stmt->execute();

    // When reading values by column index, we need to know the initial index for reading category values
    $outputWriter->pushArray(($apiVersion == '1.0') ? 'files' : 'file');

    $categoryColumns = $dbInfoRequest->getCategoriesColumnsSql();
    //Construct an array which allows quickly looking up the type of columns based on the category identifier (e.g. 3 => list of image columns)
    //   This is necessary since a request may return MULTIPLE types of categories (e.g. images AND video)
    $categoryColumnsFromCategoryIdentifier = array();
    $categoryTableNamesFromCategoryIdentifier = array();
    foreach ($dbInfoRequest->categories as $category) {
        $categoryIdentifier = getCategoryIdentifier($category);
        $categoryColumns = getTableMetaInfo($category)->columns;
        $responseColumns = getSelectedColumns($category);
        foreach($categoryColumns as $column => $columnInfo) {
            if(!in_array($column, $responseColumns)) {
                unset($categoryColumns[$column]);
            }
        $categoryColumnsFromCategoryIdentifier[$categoryIdentifier] = $categoryColumns;
        }
        $categoryTableNamesFromCategoryIdentifier[$categoryIdentifier] = getCategoryTableAlias($category);
    }

    while (($row = $stmt->fetch(\PDO::FETCH_ASSOC)) !== FALSE)
    {
        //Start pushing the results of this row out
        $outputWriter->pushArrayElement();
        $outputWriter->element('path', dirname($row['path']));
        $outputWriter->element('name', $row['name']);
        $outputWriter->numberElement('size', $row['size']);
        $categoryIdentifier = $row['category'];
        $outputWriter->element('media_type', getCategoryOutputName($categoryIdentifier));
        $outputWriter->numberElement('modified', $row['lastModifiedDate']);
        if($apiVersion < 2.7) {
            $outputWriter->element('deleted', getBooleanOutputName($row['isDeleted']));
        } else {
            $outputWriter->element('deleted', getBooleanOutput($row['isDeleted']));
        }

        if ($dbInfoRequest->showIsLinked) {
            $isLinked = 'false';

            if (!$row['isLink']) {
                $map = \Filesystem\Model\Link::getMapFromTarget($row['path'], TRUE, FALSE, TRUE);
                if (!empty($map)) {
                    $isLinked = 'true';
                }
            }

            $outputWriter->element('is_linked', $isLinked);
        }

        $categoryColumns = $categoryColumnsFromCategoryIdentifier[$categoryIdentifier];
        $categoryTableName = $categoryTableNamesFromCategoryIdentifier[$categoryIdentifier];
        foreach ($categoryColumns as $categoryName => $categoryColumn)
        {
            // Check column value with regular column name, if not found, try with the aliased table name . column Name
            // To guard against how Sql handles column names when not aliased explicitly in the query
            $value = isset($row[$categoryColumn->columnName]) ?
                $row[$categoryColumn->columnName] : $row[$categoryTableName.'.'.$categoryColumn->columnName];

            appendCategoryColumnToOutput($categoryName, $categoryColumn, $value, $outputWriter);
        }

        $outputWriter->popArrayElement();
    }
    $outputWriter->popArray();

    $stmt->closeCursor();
}

function appendCategoryColumnToOutput($categoryName, ColumnInfo $categoryColumn, $value, OutputWriter $outputWriter)
{
    switch ($categoryColumn->columnType)
    {
        case ColumnInfo::$COLUMN_TYPE_INTEGER:

            $outputWriter->numberElement($categoryName, $value);

            break;

        case ColumnInfo::$COLUMN_TYPE_STRING:

            $outputWriter->element($categoryName, $value);

            break;

        case ColumnInfo::$COLUMN_TYPE_FLOAT:

            $outputWriter->numberElement($categoryName, $value);

            break;

        case ColumnInfo::$COLUMN_TYPE_BOOLEAN:

            $outputWriter->element($categoryName, getBooleanOutput($value));

            break;

        case ColumnInfo::$COLUMN_TYPE_TIMESTAMP:

            //This is a workaround for dates that are being reported as '-1' instead of empty
            if ($value == '-1')
            {
                $value = '';
            }

            $outputWriter->numberElement($categoryName, $value);

            break;
    }
}