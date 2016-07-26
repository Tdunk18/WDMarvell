<?php
/**
 * \file common\dbaccess.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(__DIR__ . DS . 'dbutil.inc');

use \Core\Logger;

class DBAccess {

	/**
	 *
	 * @var Prepared stementes cache array.
	 */
	private static $pdoPreparedStatementsCache = array();
	private $_db = null;

	function __construct($db = null) {
		$this->_db = $db;
	}

	protected function _getDb() {
		if (empty($this->_db)) {
			$this->_db = getDB();
		}

		return $this->_db;
	}

	/**
	 * Returns prepared statement from the cache. If statement is not available
	 * in the cache this function creates new statement and updates cache.
	 *
	 * @param $sql						SQL query
	 * @param $cacheKey					Prepared Statements cache key
	 * @return \PDOStatement
	 */
	function getPreparedStatement($sql, $cacheKey) {
		if(!array_key_exists($cacheKey, self::$pdoPreparedStatementsCache)){
			$db = $this->_getDb();
			self::$pdoPreparedStatementsCache[$cacheKey] = $db->prepare($sql);
		}

		if (!is_object(self::$pdoPreparedStatementsCache[$cacheKey])) {
			Logger::getInstance()->err(__FUNCTION__ . ", Failed to get prepared statement for sql: $sql");
			throw new \Exception("Failed to get prepared statement for sql: $sql");
		}

		return self::$pdoPreparedStatementsCache[$cacheKey];
	}

	/**
	 * Binds prepared statement variables.
	 *
	 * @param PDOStatement $stmt						Prepared statement
	 * @param array $bindVarNVTArray			Prepared stements bind variables name, value and type.
	 */
	function bindVariables($stmt, $bindVarNVTArray) {
		foreach ($bindVarNVTArray as $bindVarKey => $bindVarInfo) {
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarKey', print_r($bindVarKey,true));
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarInfo', print_r($bindVarInfo,true));
			$stmt->bindParam($bindVarInfo[0], $bindVarInfo[1], $bindVarInfo[2]);
		}
	}

	/**
	 * Executes query and fetches all rows.
	 *
	 * @param $sql						SQL query
	 * @param $cacheKey					Prepared Statements cache key
	 * @param $prepareStementNVTArray	Prepared stements bind variables name, value and type.
	 */
	function executeQuery($sql, $cacheKey, $bindVarNVTArray=NULL) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));
			if (!empty($bindVarNVTArray)) {
				$this->bindVariables($stmt, $bindVarNVTArray);
			}

            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);

			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$rows = $stmt->fetchAll();
			return $rows;
		} catch(PDOException $e) {
			//echo 'DBAccess::executeQuery : '.$e;
			Logger::getInstance()->err(__FUNCTION__ . ", Failed to execute sql: $sql, exception: " . $e);
		}
		return null;
	}

	/**
	 * Executes a Select query using an array of input values with an IN clause
	 *
	 * e.g. SELECT count(*) FROM deviceusers WHERE email IN (?,?,?,?).
	 * where ? = $inputParams - an array of values to be searched or not to be searched for (NOT IN - clause).
	 *
	 * @param $sql
	 * @param $cacheKey
	 * @param array $inputParams - array of items applicable for IN or NOT IN clause.
	 * @return array|null
	 * @throws Exception
	 *
	 */
	function executeSelectIn($sql, $cacheKey, array $inputParams) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'inputParams', print_r($inputParams,true));
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));

			$start = microtime(true);
			$ret = $stmt->execute($inputParams);
			$totalTime = (microtime(true) - $start);

			Logger::getInstance()->addQuery($sql, $inputParams, $totalTime);

			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$rows = $stmt->fetchAll();
			return $rows;
		} catch(PDOException $pdoEx) {
			Logger::getInstance()->err(__FUNCTION__ . ", Failed to execute sql: $sql, with exception: " . $pdoEx);
			throw new Exception('Select-In Sql Exception' . $pdoEx->getMessage(), $pdoEx->getCode(), 'dbaccess');
		}
		return null;
	}

	/**
	 * Executes a plain old SQL query (no prepared statement)
	 *
	 * @param string $sql
	 * @return $count Count of numbers of rows affected.
	 */
	function executeSql($sql) {
		$count = false;
		$db = $this->_getDb();
		$count = $db->exec($sql);
		return $count;
	}

	/**
	 * Executes update sql. This function is not using prepared statements.
	 *
	 * @param string $sql
	 * @return $status Return true if update was a success.
	 */
	function executeUpdate($sql) {
		$count = $this->executeSql($sql);
		if ($count == 0) {
			return false;
		}
		return true;
	}

	/**
	 * Executes query and fetches one row.
	 *
	 * @param $sql
	 * @param $cacheKey
	 * @param $bindVarNVTArray
	 */
	function executeQueryAndFetchOneRow($sql, $cacheKey, $bindVarNVTArray=NULL, $fetchAssoc=false) {
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);
			if(!empty($bindVarNVTArray)){
				$this->bindVariables($stmt, $bindVarNVTArray);
			}

            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);

			if($fetchAssoc == true)
			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$rows = $stmt->fetch();
			$stmt->closeCursor();
			return $rows;
		} catch(PDOException $e) {
			echo 'DBAccess::executeQueryAndFetchOneRow : '.$e;
		}
		return null;
	}

	/**
	 * Executes insert sql and returns last inserted row id.
	 *
	 * @param $sql						SQL query
	 * @param $cacheKey					Prepared Statements cache key
	 * @param $prepareStementNVTArray	Prepared stements bind variables name, value and type.
	 */
	function executeInsert($sql, $cacheKey, $bindVarNVTArray=NULL) {
		$lastInsertId = -1;
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
			if (!empty($bindVarNVTArray)) {
				$this->bindVariables($stmt, $bindVarNVTArray);
			}
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));
            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);

			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'ret', $ret);
			if($ret == true) {
				$db = $this->_getDb();
				$lastInsertId = $db->lastInsertId();
			} else {
				Logger::getInstance()->err(__FUNCTION__ . ", Failed to execute insert sql: $sql");
			}
		} catch(PDOException $e) {
			Logger::getInstance()->err(__FUNCTION__ . ", Exception in insert sql: $sql, exception: " . $e);
		}
		return $lastInsertId;
	}

	/**
	 * Executes delete sql and returns true if success.
	 *
	 * @param $sql						SQL query
	 * @param $cacheKey					Prepared Statements cache key
	 * @param $prepareStementNVTArray	Prepared stements bind variables name, value and type.
	 */
	function executeDelete($sql, $cacheKey, $bindVarNVTArray=NULL) {

		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		$retVal = false;
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);

			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));

			if (!empty($bindVarNVTArray)) {
				$this->bindVariables($stmt, $bindVarNVTArray);
			}
            $start = microtime(true);
			$retVal = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);
		} catch(PDOException $e) {
			Logger::getInstance()->err(__FUNCTION__ . ", Exception in delete sql: $sql");
			return false;
		}
		return $retVal;
	}

	/**
	 * Executes update sql. This function is using prepared statements.
	 *
	 * @param $sql
	 * @param $cacheKey
	 * @param $bindVarNVTArray
	 */
	function executeUpdateWithPreparedStatements($sql, $cacheKey, $bindVarNVTArray=NULL) {
		$retVal = false;
		try {
			$stmt = $this->getPreparedStatement($sql, $cacheKey);
			if (!empty($bindVarNVTArray)) {
				$this->bindVariables($stmt, $bindVarNVTArray);
			}
            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, $bindVarNVTArray, $totalTime);
		} catch(PDOException $e) {
			Logger::getInstance()->err(__FUNCTION__ . ", Exception in execute update prepared sql: $sql, exception: " . $e);
		}
		return $retVal;
	}

	/**
	 * Util function to add column in update SQL
	 *
	 * @param $columnName
	 * @param $columnValue
	 * @param $sql
	 * @param $isColAdded
	 */
	function addColumnToUpdateSQL($columnName, $columnValue, $sql, $isColAdded) {
		//if (isset($columnValue) && !(trim($columnValue)==='')) {
		if ($columnValue !== null) {
			if ($isColAdded) {
				$sql = $sql. ", ";
			}
			$sql = $sql. " $columnName='$columnValue' ";
			return array('sql' => $sql, 'isColAdded' => true);
		} else {
			return array('sql' => $sql, 'isColAdded' => $isColAdded);
		}
	}

	/**
	 *
	 * Util function to generate an update statement for a given table name, index column and
	 * column, value pairs held in an associative array
	 *
	 * @param $tableName string name of table
	 * @param $whereColumn string name of column in WHERE clause
	 * @param $whereColumnValue any value to match against whereColumn in WHERE clause
	 * @param $columnValues associative array of column names and values
	 *
	 * JS - added 06/14/10
	 *
	 */
	function generateUpdateSql($tableName, $whereColumn, $whereColumnValue, $columnValues) {
		$sql = "UPDATE " . $tableName . " SET ";
		$colvals = "";
		foreach ($columnValues as $col => $value) {
			if ($value !== null) {
				if (!empty($colvals)) {
					$colvals = $colvals . ",";
				}
				if (is_string($value)) {
					//for sqlite, double-up single quotes
					$value = str_replace("'","''",$value);
					$colvals = $colvals . $col . "='" . trim($value) . "'";
				} else {
					$colvals = $colvals . $col . "=" . $value;
				}
			}
		}
		$sql = $sql . $colvals;
		if (is_string($whereColumnValue)) {
			$whereColumnValue = "'" . trim(getSafeDatabaseText($whereColumnValue)) . "'";
		}
		if (is_array($whereColumn)) {
			for($i=0; $i < count($whereColumn); $i++) {
				if ($i == 0) {
					$sql .= " WHERE ";
				} else {
					$sql .= " AND ";
				}
				if (is_string($whereColumnValue[$i])) {
					$whereColumnValue[$i] = "'" . trim(getSafeDatabaseText($whereColumnValue[$i])) . "'";
				}
				$sql .= $whereColumn[$i] . " = " . $whereColumnValue[$i];
			}
		} else {
			$sql = $sql . " WHERE " . $whereColumn . " = " . $whereColumnValue;
		}

		//printf("<PRE>%s.%s=[%s]</PRE>", __METHOD__, 'sql', $sql);

		return $sql;
	}

	/**
	 * Executes query and fetches all rows.
	 */
	function executeQueryWithDb($db, $sql) {
		if ($db instanceof QueryMorphPDO) {
			$sql = $db->morphQuery($sql);
		}

		try {
			$stmt = $db->prepare($sql);
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));
			if (!is_object($stmt)) {
                $errorInfo = $db->errorInfo();
                $errMsg = $errorInfo[2];
				Logger::getInstance()->err(__FUNCTION__ . ", Failed to get prepared statement for sql: $sql. Error: $errMsg");
				throw new Exception("Failed to get prepared statement for sql: $sql. Error: $errMsg");
			}
            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, array(), $totalTime);

			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$rows = $stmt->fetchAll();
			$stmt->closeCursor();
			return $rows;
		} catch(PDOException $e) {
			Logger::getInstance()->err(__FUNCTION__ . ", Exception during prepared statement execution sql: $sql, exception: " . $e);

			//echo 'DBAccess::executeQueryWithDb : '.$e;
		}
		return null;
	}

	/**
	 * Executes query and returns stmt/cursor.
	 */
	function executeQueryWithDbCursor($db, $sql) {
		if ($db instanceof QueryMorphPDO) {
			$sql = $db->morphQuery($sql);
		}
		try {
			$stmt = $db->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
			//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'stmt', print_r($stmt,true));
			if (!is_object($stmt)) {
				Logger::getInstance()->err(__FUNCTION__ . "Failed to get prepared statement for sql: $sql");
				return null;
			}
            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, array(), $totalTime);

			return $stmt;
		} catch(PDOException $e) {
			echo 'DBAccess::executeQueryWithDbCursor : '.$e;
		}
		return null;
	}

	/**
	 * Executes query and fetches one row.
	 *
	 * @param $sql
	 * @param $cacheKey
	 * @param $bindVarNVTArray
	 */
	function executeQueryAndFetchOneRowWithDb($db, $sql) {
		try {

			$stmt = $db->prepare($sql);
			if (!is_object($stmt)) {
				Logger::getInstance()->err(__FUNCTION__ . ", Failed to get prepared statement for sql: $sql");
				return null;
			}
            $start = microtime(true);
			$ret = $stmt->execute();
            $totalTime = (microtime(true) - $start);

            Logger::getInstance()->addQuery($sql, array(), $totalTime);

			$stmt->setFetchMode(PDO::FETCH_ASSOC);
			$rows = $stmt->fetch();
			$stmt->closeCursor();
			return $rows;
		} catch(PDOException $e) {
			echo 'DBAccess::executeQueryAndFetchOneRow : '.$e;
		}
		return null;
	}

	function getNextRow($stmt) {
		if ($stmt) {
			$row = $stmt->fetch(PDO::FETCH_ASSOC, PDO::FETCH_ORI_NEXT);
		}
		return $row;
	}

	public function updateTableByX($tableName, $colFilter, $filterValue, $updateArgs) {
		$params = array();
		foreach ($updateArgs as $colName => $colValue) {
			if ($colValue != null) {

				if (is_string($colValue)) {
					$params[$colName] = getSafeDatabaseText((string) $colValue);
				} else {
					$params[$colName] = $colValue;
				}

			}
		}
		if (count($params) > 0) {
			$sql    = $this->generateUpdateSql($tableName, $colFilter, $filterValue, $params);
    		Logger::getInstance()->debug(__FUNCTION__ . ", update sql: $sql", $params);
			$count = $this->executeSql($sql);

			if ($count === false) {
				Logger::getInstance()->err(__FUNCTION__ . ", update sql failed: $sql");

			}
			return $count;
		} else {
			return false;
		}
	}

}