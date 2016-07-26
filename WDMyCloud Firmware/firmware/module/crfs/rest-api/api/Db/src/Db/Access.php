<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Db;

/**
 * Description of Access
 *
 * @author gabbert_p
 */
class Access {

    /**
     *
     * @var \PDO
     */
    static protected $db;

    /**
     *
     * @var \Db\Access
     */
    static protected $self;

    public function __construct() {

    }

    public static function init($db = null) {

        if (self::$db) {
            return self::$db;
        }

        if (empty($db)) {
            $dbFilePath = 
				\Common\Model\GlobalConfig::getInstance()
            				->getConfig("GLOBALCONFIG", 'db')['DATA_BASE_FILE_PATH'];
			//JS - if the DB file foes not exist, that is fine, it will ge created when validateVersion() is called.
            $db = new PDO('sqlite:' . $dbFilePath);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Turn on exceptions.
            Update::validateVersion($db);
        }

        return self::$db = $db;
    }

    /**
     *
     * @return \Db\Access;
     */
    public static function getInstance() {

        if (empty(self::$self)) {
            self::init();
            self::$self = new self();
        }

        return self::$self;
    }

    /**
     *
     * @param string $sql
     * @param array $bindParams
     * @return PDOStatement
     */
    public function query($sql, $bindParams = array()) {
        $stmnt = self::$db->prepare($sql);
        /*
         * Can't seralize PDOStatement objects.
          $key = '_PREPARE_CACHE_' . md5($sql);
          if (($stmnt = apc_fetch($key)) === false) {
          apc_store($key, $stmnt);
          }
         */

        $start = microtime(true);
        $stmnt->execute($bindParams);
        $queryTime = (microtime(true) - $start);

        \Core\Logger::getInstance()->addQuery($sql, $bindParams, $queryTime);

        return $stmnt;
    }

    static public function beginTransaction() {
        self::init();
        self::$db->beginTransaction();
    }

    static public function commit() {
        self::$db->commit();
    }

}

