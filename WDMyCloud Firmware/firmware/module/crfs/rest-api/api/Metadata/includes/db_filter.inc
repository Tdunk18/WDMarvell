<?php
/**
 * Manages different types of filtering (e.g. filter by matching values; filter by range of values, ...)
 * User: bjornson_e
 * Date: 12/11/13
 * Time: 12:11 PM
 */

/**
 * Class FilterType A structure for holding the definition of one type of supported filtering (e.g. filtering by a picture's date).
 */
class FilterType {
	public $filterName; //e.g. genre
	public $comparisonType; //e.g. comparison_type_match
	public $columnName;

	//Available types of comparisons
	public static $MATCH=1; //an exact match of text
	public static $YEAR_MONTH=2; //a matching of a unix time in the database to a specified year or a specified year_and_month
	public static $PARTIAL_MATCH=3; //a case-insensitive like statement. URL of "name=EriC" maps to SQL of lower(name) like '%eric%')
	public static $RANGE=4; //a numeric range.  URL of "size=100-100" maps to SQL of "size between 100 and 1000".
	public static $LOCATION=5; //a bounding box between SW and NE corner

	//NULL Constant definition
	public static $__NULL__='@NULL';

	public function __construct($filterName, $comparisonType, $columnName) {
		$this->filterName = $filterName;
		$this->comparisonType = $comparisonType;
		$this->columnName = $columnName;
	}
}

//Returns an array of arrays.  For each requested category it has an array of SqlFilters.
//e.g. categorySqlFilter['audio'][0] may be a filter that restricts audio files based on the requested genre
function generateCategorySqlFilters($queryParams, $categories) {
    $filters = array();
    foreach ($categories as $category) {
        $filters[$category] = generateSqlFilters($queryParams, getCategoryTableAlias($category), $category);
    }
    return $filters;
}

/**
 * Based on a client's request and a category of multimedia, this returns an array of SQL string that can be used to filter the result set.
 * @param array $queryParams The query parameters from the client's request
 * @param string $tableAlias The alias used to refer to the table when forming the SQL
 * @param string $categoryName The name of the category (e.g. 'audio')
 * @return array An array of strings holding SQL of filtering clauses (e.g. "genres='Pop')
 */
function generateSqlFilters($queryParams, $tableAlias, $categoryName) {
	//Initialize an empty response
	$categoryFilters = array();
	if(empty($categoryName))
		return $categoryFilters;
	//Find information on types of filtering supported for the specified category
	$tableMetaInfo = getTableMetaInfo($categoryName);
	$filterTypes = $tableMetaInfo->filterTypes;
	//For each type of supported filtering, see whether the request is asking for that type of filtering
	foreach ($filterTypes as $filterType) {
		$columnName = $filterType->columnName;
		$filterName = $filterType->filterName;
		switch($filterType->comparisonType) {
			case FilterType::$MATCH:
				$filterSql = getSqlFilterForMatch($filterName, $queryParams, $tableAlias, $columnName);
				if(!empty($filterSql))
					$categoryFilters[] = $filterSql;
				break;
			case FilterType::$PARTIAL_MATCH:
				$filterSql = getSqlFilterForSearch($filterName, $queryParams, $tableAlias, $columnName);
				if(!empty($filterSql))
					$categoryFilters[] = $filterSql;
				break;
			case FilterType::$YEAR_MONTH:
				$filterSql = getSqlFilterForYearMonth($filterName, $queryParams, $tableAlias, $columnName);
				if(!empty($filterSql))
					$categoryFilters[] = $filterSql;
				break;
			case FilterType::$RANGE:
				$filterSql = getSqlFilterForRange($filterName, $queryParams, $tableAlias, $columnName);
				if(!empty($filterSql))
					$categoryFilters[] = $filterSql;
				break;
			case FilterType::$LOCATION:
				$filterSql = getSqlFilterForLocation($queryParams, $tableAlias);
				if(!empty($filterSql))
					$categoryFilters[] = $filterSql;
				break;
		}
	}
	return $categoryFilters;
}

function getSqlFilterForLocation($queryParams, $tableAlias) {
	//only proceed if they have asked for this type of filtering
	if(!isset($queryParams["min_lat"]) || !isset($queryParams["max_lat"]) || !isset($queryParams["min_lon"]) || !isset($queryParams["max_lon"]))
		return null;

	$minLat = (float) $queryParams['min_lat'];
	$maxLat = (float) $queryParams['max_lat'];
	$minLon = (float) $queryParams['min_lon'];
	$maxLon = (float) $queryParams['max_lon'];
	$latExpression = "($tableAlias.latitude between $minLat and $maxLat)";

	if ($minLon < $maxLon) {
		$query = "$latExpression and ($tableAlias.longitude between $minLon and $maxLon)"; //generate the SQL to form a bounding box 
	} else {
		$query = "$latExpression and ($tableAlias.longitude >= $minLon or $tableAlias.longitude <= $maxLon)"; //generate the SQL to form a bounding box for a case when minLon in greater than maxLon
	}
	return $query;
}

function getSqlFilterForMatch($filterName, $queryParams, $tableAlias, $columnName) {
	//only proceed if they have asked for this type of filtering
	if(!isset($queryParams[$filterName]))
		return null;
	$filterValue = $queryParams[$filterName]; //find the requested value to be matched
	$filterValue = sqlite_escape_string($filterValue);

	$query = null;
	if ($filterValue == FilterType::$__NULL__) {
		$query = "$tableAlias.$columnName IS NULL";
	} else {
		$query = "$tableAlias.$columnName = '$filterValue'"; //generate the SQL
	}
	return $query;
}

function getSqlFilterForSearch($filterName, $queryParams, $tableAlias, $columnName) {
	$filterValue = isset($queryParams[$filterName]) ? $queryParams[$filterName] : NULL; //find the requested value to be searched for
	//only proceed if they have asked for this type of filtering
	if($filterValue === NULL || $filterValue === '')
		return null;
	$filterValue = strtolower($filterValue); //make the search word(s) lower case
	//If multiple words are provided, separate them into an array
	$filterWords = explode('|', $filterValue);
	$filterSQLStrings = array(); //initialize an empty array for holding the results

	//Generate SQL for each keyword
	foreach ($filterWords as $filterWord) {
		$filterWord = sqlite_escape_string($filterWord);
		$filterSQLStrings[] =  "lower($tableAlias.$columnName) like '%$filterWord%' ESCAPE '\'"; //generate the SQL
	}

	//Combine each piece together with the 'OR' conjunction
	$combinedSQL = implode(' OR ', $filterSQLStrings);

	//Add parenthesis if there are multiple pieces
	if (count($filterWords) > 1)
		$combinedSQL = '('.$combinedSQL.')';
	return $combinedSQL;
}

function getSqlFilterForYearMonth($filterName, $queryParams, $tableAlias, $columnName) {
	$filterNameYear  = $filterName.'year';
	$filterNameMonth = $filterName.'month';
	$filterValueYear  = $queryParams[$filterNameYear ]; //find the requested year
	$filterValueMonth = $queryParams[$filterNameMonth]; //find the requested month
	//only proceed if they have asked for this type of filtering with a numeric type or if NULL is requested

	if (!isset($filterValueYear) && !isset($filterValueMonth)) {
		return null;
	}

	if ($filterValueYear == FilterType::$__NULL__) { // no need to check for month because validation is already done in the controller, meaning if year is null month is also null.
		$query = "$tableAlias.$columnName IS NULL";
		return "$tableAlias.$columnName IS NULL";
	}

	$startTime = getStartingTimestamp($filterValueYear, $filterValueMonth);
	$endTime   = getEndingTimestamp  ($filterValueYear, $filterValueMonth)-1;
	return "$tableAlias.$columnName between $startTime and $endTime"; //generate the SQL
}

function getSqlFilterForRange($filterName, $queryParams, $tableAlias, $columnName) {
	$filterValue = isset($queryParams[$filterName]) ? $queryParams[$filterName] : NULL; //find the requested range to be searched for
	//only proceed if they have asked for this type of filtering
	if(empty($filterValue))
		return null;
	$rangeValues = explode('-', $filterValue); //separate the value with the delimiter of a dash
	$lowerValue = $rangeValues[0];
	$upperValue = $rangeValues[1];
	//Only allow numeric values to be supported (prevents SQL injection)
	if (!is_numeric($lowerValue) || !is_numeric($upperValue))
		return null;
	return "$tableAlias.$columnName between $lowerValue and $upperValue"; //generate the SQL
}

/**
 * Returns a unix timestamp for the beginning of the specified period.  If the $month is empty, then the response will be for the beginning of the whole year.
 * @param int $year The integer year (e.g. 2000)
 * @param int $month The integer month from 1 through 12 inclusive
 * @return int The unix timestamp for the beginning
 */
function getStartingTimestamp($year, $month) {
	//If there is no month, then we are just matching the year, so the StartingTimestamp is in the first month
	if($month==0) {
		return mktime(0, 0, 0, 1, 1, $year);
	} else {
		return mktime(0, 0, 0, $month, 1, $year);
	}
}

/**
 * Returns a unix timestamp for the end of the specified period.  If the $month is empty, then the response will be for the end of the whole year.
 * @param int $year The integer year (e.g. 2000)
 * @param int $month The integer month from 1 through 12 inclusive
 * @return int The unix timestamp for the end
 */
function getEndingTimestamp($year, $month) {
	//If there is no month specified, then we are just matching the year
	if($month==0) {
		//The EndingTimestamp is in the first month of the next year
		return mktime(0, 0, 0, 1, 1, $year+1);
	} else {
		$month++; //go to the next month
		if($month==13) { //if we went past the range of valid months, then roll over to the next year
			$month = 1;
			$year++;
		}
		return mktime(0, 0, 0, $month, 1, $year);
	}
}

//todo: implement a better way of escaping strings
/**
 * The official implementation of this is no longer supported.
 * A better approach would be to use $pdo->quote($inStr), but then I would need to pass the pdo around to every function (messy).
 * @param string $inStr Input string that needs to be safely escaped to prevent sql injection
 * @return string A safely escaped string
 */
function sqlite_escape_string($inStr) {
	$inStr = str_replace("\\", "\\\\", $inStr);
	$inStr = str_replace("'", "''", $inStr);
	$inStr = str_replace("%", "\%", $inStr);
	$inStr = str_replace("_", "\_", $inStr);
	return $inStr;
}