<?php
/**
 * \file db\statusdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . "/includes/dbaccess.inc");

/**
 *
 *
 */
class StatusDB extends DBAccess{

	function StatusDB(){
	}

	/**
	 *
	 */
	function getStatus(){
		// SQL Statement with prepared stement bind variables.
		$sql = 'SELECT mdate, desc, etype, mc_version from Status ' ;
		$status = $this->executeQueryAndFetchOneRow($sql, 'GET_STATUS', NULL, true);
		return $status;
	}

	function getStatusWithDb($db){
		// SQL Statement with prepared stement bind variables.
		$sql = 'SELECT mdate, desc, etype, mc_version from Status ' ;
		$status = $this->executeQueryAndFetchOneRowWithDb($db, $sql);
		return $status;
	}
}