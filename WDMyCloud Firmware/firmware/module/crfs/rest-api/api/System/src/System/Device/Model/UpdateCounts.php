<?php

namespace System\Device\Model;

class UpdateCounts {
    private static $lockFilePath = '/var/lock/updateCounts';
    private static $countDirPath = '/tmp/updateCounts';

    /**
     * Get update counts. Counts default to 1.
     *
     * @param string $counterName the name of the file in $countDirPath for which to get a count from. Null to get all.
     * @return array key is the counter name and the value is the count, or false on failure.
     */
    public static function get($counterName = null) {
        $fp = fopen(self::$lockFilePath, 'c+');
        if ($fp === false) {
            return false;
        }

        if (!flock($fp, LOCK_SH)) {
            fclose($fp);
            return false;
        }

        if (!file_exists(self::$countDirPath)) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return [];
        }

        $fileNames = scandir(self::$countDirPath, SCANDIR_SORT_NONE);
        if ($fileNames === false) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }

        $results = [];
        foreach ($fileNames as $fileName) {
            if ($fileName === '.' || $fileName === '..' || ($counterName !== null && $fileName !== $counterName)) {
                continue;
            }

            $fileContents = file_get_contents(self::$countDirPath . "/$fileName");
            if ($fileContents === false) {
                flock($fp, LOCK_UN);
                fclose($fp);
                return false;
            }

            $count = 1;
            $fileContents = trim($fileContents);
            if ($fileContents !== '') {
                $count = intval($fileContents);
            }

            $results[$fileName] = $count;
        }

        flock($fp, LOCK_UN);
        fclose($fp);

        return $results;
    }

    /**
     * Increment a count. If the count doesn't exist, set it to 1.
     *
     * @param string $counterName the name of the file in $countDirPath for which to set a count in.
     * @return boolean success or not
     */
    public static function increment($counterName) {
        $countFilePath = self::$countDirPath . "/$counterName";

        $fp = fopen(self::$lockFilePath, 'c+');
        if ($fp === false) {
            return false;
        }

        if (!flock($fp, LOCK_EX)) {
            fclose($fp);
            return false;
        }

        if (!file_exists(self::$countDirPath) && !mkdir(self::$countDirPath)) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }

        $fileContents = file_get_contents($countFilePath);
        if ($fileContents === false) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }

        $fileContents = trim($fileContents);
        $count = 1;
        if ($fileContents !== '') {
            $count = intval($fileContents) + 1;
        }

        $putResult = file_put_contents($countFilePath, $count);

        flock($fp, LOCK_UN);
        fclose($fp);

        return $putResult !== false;
    }
}
