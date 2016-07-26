<?php

namespace Jobs\Model;

class JobDbUpdate {

    const TMP_SQL = '/tmp/jobDbUpdate.sql';
    const WIN_TMP_SQL = 'C:\Windows\temp\jobDbUpdate.sql';

    /**
     * @var PDO
     */
    protected $db;
    protected $dbVersion;

    public function __construct(\PDO $db, $dbVersion) {
        $this->db = $db;
        $this->dbVersion = $dbVersion;
    }

    public function version($version) {
        \Core\Logger::getInstance()->info(sprintf('Validating Jobs DB version %d <> Master Version %d', $this->dbVersion, $version));

        if (version_compare($version, $this->dbVersion, '<')) {
            throw new Exception('Jobs DB Version is greater than code supports.');
        }

        if (apc_fetch('JOB_DB_VALIDATED') || version_compare($version, $this->dbVersion, '=')) {
            \Core\Logger::getInstance()->info('Jobs DB Validated true');
            return true;
        }

        try { // Check if we need to create a new DB.
            $this->db->query('SELECT * FROM JobState');
        } catch ( \PDOException $e ) {
            $this->_createDb();
        }

        // Update only if the Db version is older than code supports
        if (version_compare($version, $this->dbVersion, '>')) {
            $sqlFile = $this->_generateSqlUpdate();

            $this->db->exec('BEGIN TRANSACTION');
            $this->db->exec(file_get_contents($sqlFile));
            $this->db->exec('COMMIT');

            //\Core\Logger::getInstance()->info('Jobs DB Updated');
        }

        apc_store('JOB_DB_VALIDATED', true);
        apc_store('JOB_DB_VERSION', $version);

        \Core\Logger::getInstance()->info('Jobs DB Validated true');
        return true;
    }

    protected function _generateSqlUpdate() {
        $updateDir = implode(DS, [realpath(__DIR__), 'Db', 'schema']);

        // Remove temp file.
        $osname = \Core\SystemInfo::getOSName();
        if($osname == 'windows'){
            if (file_exists(self::WIN_TMP_SQL)) {
                unlink(self::WIN_TMP_SQL);
            }
        }
        else {
            if (file_exists(self::TMP_SQL)) {
                unlink(self::TMP_SQL);
            }
        }


        if ( $dirh = opendir($updateDir) ) {
            while (false !== ($file = readdir($dirh))) {
                // We only want update SQL files.
                if (!strstr($file, 'JobsUpdate')) { continue; }

                $matches = null;
                preg_match('/^JobsUpdate-v([\d]+).sql$/', $file, $matches);
                \Core\Logger::getInstance()->info('Checking file: ' . $file, $matches);
                $version = $matches[1];

                if (version_compare($version, $this->dbVersion, '>')) {
                    \Core\Logger::getInstance()->info('Appending file: ' . $file);
                    if ($osname == 'windows')
                        file_put_contents(self::WIN_TMP_SQL, file_get_contents($updateDir . DS . $file), FILE_APPEND);
                    else
                        file_put_contents(self::TMP_SQL, file_get_contents($updateDir . DS . $file), FILE_APPEND);
                }
            }
            closedir($dirh);
        }

        if ($osname == 'windows')
            return self::WIN_TMP_SQL;
        else
            return self::TMP_SQL;
    }

    public static function validateVersion(\PDO $db) {
        $version = \Common\Model\GlobalConfig::getInstance()
                        ->getConfig("GLOBALCONFIG", 'jobs')['JOBS_DATABASE_VERSION'];
        $dbVersion = $db->query('PRAGMA user_version')->fetchColumn(0);

        return (new self($db, $dbVersion))->version($version);
    }

    protected function _createDb() {
        $this->db->exec('BEGIN TRANSACTION');
        $this->db->exec(file_get_contents(implode(DS, [realpath(__DIR__), 'Db', 'schema', 'JobsCreate.sql'])));
        $this->db->exec('COMMIT');

        // New Db created with Create Sql scripts, get & set version as current Db version
        $this->dbVersion = $this->db->query('PRAGMA user_version')->fetchColumn(0);
    }
}