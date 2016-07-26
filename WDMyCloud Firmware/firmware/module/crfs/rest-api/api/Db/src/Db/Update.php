<?php

namespace Db;

class Update {

    const TMP_SQL = '/tmp/orionDbUpdate.sql';
    const WIN_TMP_SQL = 'C:\Windows\temp\orionDbUpdate.sql';

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
        \Core\Logger::getInstance()->info(sprintf('Validating DB version %d <> Master Version %d', $this->dbVersion, $version));

        if (version_compare($version, $this->dbVersion, '<')) {
            throw new \Exception("DB Version is greater than code support.", 500);
        }

        if (apc_fetch('DB_VALIDATED') || version_compare($version, $this->dbVersion, '=')) {
            \Core\Logger::getInstance()->info('DB Validated true');
            return true;
        }

        try { // Check if we need to create a new DB.
            $this->db->query('SELECT * FROM Volumes');
        } catch ( \PDOException $e ) {
            $this->_createDb();
        }


        $sqlFile = $this->_generateSqlUpdate();

        $this->db->exec('BEGIN TRANSACTION');
        $this->db->exec(file_get_contents($sqlFile));
        $this->db->exec('COMMIT');

        apc_store('DB_VALIDATED', true);
        apc_store('DB_VERSION', $version);
        return true;
    }

    protected function _generateSqlUpdate() {
        $updateDir = realpath(dirname(dirname(__DIR__)) . DS . 'sql');

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

        $fileList = scandir($updateDir);
        if (!empty($fileList)) {
            foreach($fileList as $file){
                // We only want update SQL files.
                if (!strstr($file, 'update')) { continue; }

                $matches = null;
                preg_match('/^update-v([\d]+).sql$/', $file, $matches);
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
        }

        if ($osname == 'windows')
            return self::WIN_TMP_SQL;
        else
            return self::TMP_SQL;
    }

    public static function validateVersion(\PDO $db) {
        $version = \Common\Model\GlobalConfig::getInstance()
                        ->getConfig("GLOBALCONFIG", 'db')['DATA_BASE_VERSION'];
        $dbVersion = $db->query('PRAGMA user_version')->fetchColumn(0);

        return (new self($db, $dbVersion))->version($version);
    }

    protected function _createDb() {
        $this->db->exec('BEGIN TRANSACTION');
        $this->db->exec(file_get_contents(realpath(dirname(dirname(__DIR__)) . DS . 'sql' . DS . 'create.sql')));
        $this->db->exec('COMMIT');
        //pragma user_version is updated now
        $this->dbVersion = $this->db->query('PRAGMA user_version')->fetchColumn(0);
    }
}