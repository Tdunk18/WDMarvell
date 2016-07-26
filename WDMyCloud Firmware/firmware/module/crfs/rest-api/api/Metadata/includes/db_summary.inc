<?php
require_once 'db_util.inc';
require_once 'db_info.inc';

/**
 * An include file that contains the general logic and output logic for the metadb_summary implementation
 * User: bjornson_e
 * Date: 12/9/13
 * Time: 1:49 PM
 */

/**
 * Generates the summary output for a client's metadb_summary request
 * @param PDO $pdo
 * @param DBInfoRequest $dbInfoRequest
 * @param OutputWriter $outputWriter
 */
function generateSummaryResponse(PDO $pdo, DBInfoRequest $dbInfoRequest, $outputFormat) {
    $volInfo = \RequestScope::getMediaVolMgr()->getVolumeByShareName($dbInfoRequest->shareName);
    $crawlerStatus = getCrawlerStatus($volInfo['Id']);

    if (!empty($dbInfoRequest->startTime) && (int)$dbInfoRequest->startTime < $crawlerStatus['last_purge']) {
        throw new \Exception('INVALID_START_TIME', 400);
    }

    $outputWriter = new \OutputWriter(strtoupper($outputFormat));
    $outputWriter->pushElement('metadb_summary');

    if (empty($dbInfoRequest->startTime) || (int)$dbInfoRequest->startTime <= $crawlerStatus['last_crawl']) {
        //1. Generate a query
        $isSqlDebug = $dbInfoRequest->debugSql;
        $queryStr = buildFileQuery($dbInfoRequest, TRUE, $pdo);
        //No summary of folders (e.g. the number of folders) is currently supported within the response, so this is not needed
        //$queryFolderStr = buildFolderQuery($pdo, $dbInfoRequest, TRUE, $isSqlDebug);

        //If we are only debugging the SQL, then we are done, else execute stream output
        if(!$isSqlDebug){
            //2. Generate the output based on the query
            streamSummaryOutput($pdo, $dbInfoRequest, $queryStr, $outputWriter);
        }

    } else {
        $outputWriter->element('file_count', '0');
        $outputWriter->element('size', '');
        $outputWriter->element('path', $dbInfoRequest->getPath());
    }

    $outputWriter->popElement();
    $outputWriter->close();
}

/**
 * Streams the output of directory information based on the provided query
 * @param PDO $pdo
 * @param DBInfoRequest $dbInfoRequest
 * @param string $queryStr
 * @param OutputWriter $outputWriter
 */
function streamSummaryOutput(PDO $pdo, DBInfoRequest $dbInfoRequest, $queryStr, OutputWriter $outputWriter) {
    //Execute the query (but don't fetch all the rows yet)
    $stmt = $pdo->prepare($queryStr);

    if (!$stmt)
    {
        error_log(__METHOD__ . '|' . var_export($pdo->errorInfo(), TRUE));
        error_log(__METHOD__ . '|' . $queryStr);
    }

    $stmt->execute();

    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    $outputWriter->element('file_count', $row['totalCount']);
    $outputWriter->element('size', $row['totalSize']);
    $outputWriter->element('path', $dbInfoRequest->getPath());

    //cleanup
    $stmt->closeCursor();
}
