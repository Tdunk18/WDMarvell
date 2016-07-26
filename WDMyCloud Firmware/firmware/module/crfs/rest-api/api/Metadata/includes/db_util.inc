<?php
/**
 * A set of utility methods that are used by all of the MetaDB APIs.
 * Such functions include: validation of inputs and parsing of strings.
 * Such functions also generate SQL clauses and join such clauses together.
 */

/**
 * Returns a key from within the validValues.  This is mainly used to validate that a client-given key is valid.
 * This returns null if the inputKey is not a key within the validValues.
 * If the inputKey is null, then the defaultKey is used.
 * @param string $inputKey Key that is to be lookup up
 * @param string $defaultKey Default key that is used when inputKey is null
 * @param array $validKeyValues Array of all valid keys (values are not used by this function)
 * @return string A key from validKeyValues
 */
function getEnumerationKey($inputKey, $defaultKey, $validKeyValues)
{
    $inputKey = $inputKey ?: $defaultKey;

    return array_key_exists($inputKey, $validKeyValues) ? $inputKey : NULL;
}


function getQueryColumnFilterValue($filterValue, $column)
{
    if (is_null($filterValue))
    {
        return '';
    }
    elseif ($filterValue == FilterType::$__NULL__)
    {
        $filter = 'IS NULL';
    }
    else
    {
        $filter = ' = "' . sqlite_escape_string(trim($filterValue))  . '"';
    }

    return $column . ' ' . $filter;
}

/**
 * Returns a value from within the validValues as specified by the inputKey.
 * This returns null if the inputKey is not a key within the validValues.
 * If the inputKey is null, then the defaultKey is used.
 * @param string $inputKey Key that is to be used to lookup the value
 * @param string $defaultKey A default key to use if the inputKey is null
 * @param array $validKeyValues An array whose keys are the valid values
 * @return string a key from validValues
 */
function getEnumerationValueByKey($inputKey, $defaultKey, $validKeyValues)
{
    $inputKey = $inputKey ?: $defaultKey;

    return array_key_exists($inputKey, $validKeyValues) ? $validKeyValues[$inputKey] : NULL;
}

/**
 * Returns a value from within the validValues as specified by the inputValue.
 * This returns null if the inputValue is not a key within the validValues.
 * If the inputValue is null, then the defaultValue is returned.
 * @param string $inputValue Value that is requested
 * @param string $defaultValue A default value that is to be used if inputValue is null
 * @param array $validValues An array of valid values (keys in this array are irrelevant)
 * @return string a value from validValues
 */
function getEnumerationValue($inputValue, $defaultValue, $validValues)
{
    $inputValue = $inputValue ?: $defaultValue;

    return in_array($inputValue, $validValues) ? $inputValue : NULL;
}

/**
 * Converts a boolean value from an integer to an output name.
 * @param int $boolValue A value of 0 or 1
 * @return string An output format for a boolean value (i.e. 'true' or 'false')
 */
function getBooleanOutputName($boolValue) {
    $boolNames = array(1=>'true', 0=>'false');
    return $boolNames[$boolValue];
}

/**
 * Converts a boolean value from an integer to true/false.
 * @param int $boolValue A value of 0 or 1
 * @return boolean An output format for a boolean integer value (i.e. true or false)
 */
function getBooleanOutput($boolValue) {
    return $boolValue === 1;
}

/**
 * Gets "limit" and "offset" modifiers to the provided query string if the provided values are non-null.
 * @param int $rowOffset a value of zero will cause this to be ignored
 * @param int $rowCount a value of zero will cause this to be ignored
 * @return string returns a string to be used within an SQL query that imposes the specified limit and offset
 */
function getLimitAndOffsetFilter($rowOffset, $rowCount) {
    $filterStr = '';
    //If an offset is specified, a count is required by SQL.  If a count is not given, then we select a value so large that it really places no limit
    if($rowCount==0 && $rowOffset!=0)
        $rowCount = 10000000;
    if ($rowCount!=0)
        $filterStr .= " limit $rowCount";
    if ($rowOffset!=0)
        $filterStr .= " offset $rowOffset";
    return $filterStr;
}

/**
 * Generates an SQL query string based on the requested start time.
 * @param string $startTime The minimum lastUpdatedDate (this can be empty if no filtering is desired based on lastUpdatedDate).
 * @return string An SQL string for filtering based on start time
 */
function getFileStartTimeFilter($startTime)
{
    // TODO: Check with Eric how to handle both isDeleted & startTime together
    return 'Files' . (empty($startTime) ? '.isDeleted = 0' : ".lastUpdatedDate >= $startTime");
}
function getFolderStartTimeFilter($startTime)
{
    return 'Folders' . (empty($startTime) ? '.isDeleted = 0' : ".lastUpdatedDate >= $startTime");
}

/**
 * Generates an SQL query string based on whether hidden files need to be excluded or not
 * @param bool $includeHidden Boolean which indicates whether hidden files should be included in the results
 * @return string An SQL string for filtering
 */
function getHiddenFileFilter($includeHidden) {
    //If we are NOT including hidden files, then we need an extra where-clause
    return ($includeHidden) ? NULL : 'Files.isHidden = 0';
}
function getHiddenFolderFilter($includeHidden) {
    //If we are NOT including hidden files, then we need an extra where-clause
    return ($includeHidden) ? NULL : 'Folders.isHidden = 0';
}

/**
 * Appends additionalFilterStr onto currentFilterStr with the proper conjunction of "AND" for SQL.
 * @param string $currentFilterStr The current SQL string (e.g. "name='Fred'")
 * @param string $additionalFilterStr The additional SQL string that needs to be added with the proper conjunction
 * @return string An SQL string to be used within a where-clause.
 */
function appendFilter($currentFilterStr, $additionalFilterStr)
{
    if (empty($additionalFilterStr)) // If there is nothing to append, then return the current filter string
    {
        return $currentFilterStr;
    }
    elseif (empty($currentFilterStr)) // The first filter doesn't need a conjunction, but later filters require 'AND' to be added
    {
        return ' ' . $additionalFilterStr;
    }

    return $currentFilterStr . ' AND ' . $additionalFilterStr;
}

/**
 * Appends all strings within the additionalFilterArray onto the currentFilterStr using the proper conjunction of "AND" for SQL
 * @param string $currentFilterStr  The current SQL string (e.g. "name='Fred'")
 * @param array $additionalFilterArray An array of strings which each contain an SQL where-clause
 * @return string An updated filter that contains both the current filter with all additional filters
 */
function appendFilterArray($currentFilterStr, $additionalFilterArray) {
    if($additionalFilterArray == NULL)
        return $currentFilterStr;

    foreach ($additionalFilterArray as $additionalFilterStr) {
        $currentFilterStr = appendFilter($currentFilterStr, $additionalFilterStr);
    }
    return $currentFilterStr;
}

