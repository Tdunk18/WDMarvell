<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Db;

/**
 * Description of PDO
 *
 * @author gabbert_p
 */
class PDO extends \PDO {

    public function beginTransaction() {
        $start = microtime(true);
        parent::beginTransaction();
        $queryTime = (microtime(true) - $start);

        \Core\Logger::getInstance()->addQuery('BEGIN TRANSACTION', array(), $queryTime);
    }

    public function commit() {
        $start = microtime(true);
        parent::commit();
        $queryTime = (microtime(true) - $start);

        \Core\Logger::getInstance()->addQuery('COMMIT', array(), $queryTime);
    }
}

