<?php

require_once 'db_group_definitions.inc';
require_once 'db_util.inc';
//require_once FILESYSTEM_ROOT . '/includes/db_group_definitions.inc';
//require_once(COMMON_ROOT . "/includes/outputwriter.inc");

use Metadata\Model\GroupingQueryDescriptor;

/**
 * Generates responses to metadb_group API calls by generating a query, executing the query, and writing the results.
 * User: bjornson_e
 * Date: 11/26/13
 * Time: 2:52 PM
 */

/**
 * Returns a query for obtaining the set of subgroups within a specified group (e.g. select month where year=1999;
 * select album where artist='Jackson').
 *
 * @param \Metadata\Model\GroupingQueryDescriptor $groupingQueryDescriptor An object that encapsulates all necessary
 *     information for generating a grouping query.
 * @return string
 */
function generateGroupingQuery(GroupingQueryDescriptor $desc)
{
    $columns  = 'groupVal1' . ($desc->getIsTwoLevel() ? ', groupVal2' : '');
    $filter   = 'groupingId = '. $desc->getGroupingId();
    $filter   = appendFilter($filter, 'shareName = "' . $desc->getShareName() . '"');
    $filter   = appendFilter($filter, getQueryColumnFilterValue($desc->getFilterValue(), 'groupVal1'));

    return 'SELECT ' . $columns . ', groupCount, example FROM Groupings WHERE ' . $filter
         . ' ORDER BY ' . $columns . ($desc->getIsAscending() ? '' : ' DESC')
         . getLimitAndOffsetFilter($desc->getRowOffset(), $desc->getRowCount());
}

/**
 * Writes the provided rows to the OutputWriter in the proper format
 * @param Array $rows
 * @param GroupingInfo $groupingInfo
 * @param string $shareName
 * @param string $sharePath
 * @param OutputWriter $outputWriter
 */
function writeOutput(GroupingInfo $groupingInfo, $rows, $shareName, $sharePath, OutputWriter $outputWriter) {
    $outputWriter->pushElement('db_group');
    $outputWriter->element('group_name', $groupingInfo->valueName);
    $outputWriter->element('subgroup_name', $groupingInfo->valueSubname);

    $outputWriter->pushElement('groups');
    $outputWriter->pushArray('group');
    foreach($rows as $row) {
        $outputWriter->pushArrayElement();
        $outputWriter->element('name', $row['groupVal1'], true);
        //Only some groupings have two values (e.g. year, month), so the subname is conditional
        if ($groupingInfo->isTwoLevel)
            $outputWriter->element('subname', $row['groupVal2'], true);
        $outputWriter->element('count', $row['groupCount']);

        //even though there is currently only 1 example, this shows the true 1-to-many relationship and allows for future expansion
        $outputWriter->pushElement('examples');
        $outputWriter->pushArray('example');
        //The path for the example file is currently in terms of sharePath and it needs to be converted to be in terms of a shareName
        //Add the share name and cut off the share path
        $examplePieces = explode(DS, ltrim($row['example'], DS));

        if ($examplePieces[0] !== $shareName)
        {
            array_unshift($examplePieces, $shareName);
        }

        $outputWriter->arrayElement(DS . implode(DS, $examplePieces));
        $outputWriter->popArray();
        $outputWriter->popElement();

        $outputWriter->popArrayElement();
    }
    $outputWriter->popArray();
    $outputWriter->popElement();
    $outputWriter->popElement();
    $outputWriter->close();
}

/**
 * @param DBAccess $dbAccess
 * @param PDO $pdo
 * @param string $shareName
 * @param string $sharePath
 * @param string $groupingName
 * @param string $filterValue
 * @param bool $isAscending
 * @param int $rowOffset
 * @param int $rowCount
 * @param OutputWriter $outputWriter
 */
function generateGroupingResponse(DBAccess $dbAccess, PDO $pdo, $shareName, $sharePath, $groupingName, $filterValue,
                                  $isAscending, $rowOffset, $rowCount, $debugSql, OutputWriter $outputWriter)
{
    // Get information on the type of grouping
    $info = getGroupingInfo($groupingName);
    $desc = new GroupingQueryDescriptor($shareName, $info->groupingId, $info->isTwoLevel, $filterValue, $isAscending,
            $rowOffset, $rowCount);
    $sql  = generateGroupingQuery($desc);

    if($debugSql) outputQueryAnalysis($pdo, $sql);

    $rows = $dbAccess->executeQueryWithDb($pdo, $sql);

    writeOutput($info, $rows, $shareName, $sharePath, $outputWriter);
}