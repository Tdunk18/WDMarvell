<?php

abstract class QueryMorphPDO extends PDO {

	abstract public function morphQuery($sql);

	abstract public function morphResultSet($rows);

	abstract public function morphResultRow($row);

}