<?php

namespace Core;

class SystemInfo {
    /**
     * A short version of the operating system name (windows or linux).
     *
     * @var string
     */
    protected static $_osName;
    /**
     * The system model number.
     *
     * @var string
     */
    protected static $_modelNumber;

    /**
     * Returns the System type we're currently on: "windows" or "linux"
     *
     * Everything outside of Windows defaults to Linux.
     *
     * @return string
     */
    static public function getOSName() {
        if (!isset(static::$_osName)) {
            static::$_osName = strtolower(substr(PHP_OS, 0, 3)) === 'win' ? 'windows' : 'linux';
        }

        return static::$_osName;
    }

    /**
     * Returns the model number as defined within /etc/system.conf modelNumber or "cent" for
     *   windows systems.
     *
     * TODO: Add windows system.conf equivalent.
     *
     * @staticvar string $modelNumber
     * @return string
     * @throws Exception
     */
    static public function getModelNumber() {
        if (!isset(static::$_modelNumber)) {
            switch (self::getOSName()) {
                case 'linux':

                    if ((static::$_modelNumber = @parse_ini_file('/etc/system.conf')['modelNumber']) == FALSE) {
                        throw new \Exception('Failed to parse "modelNumber" from /etc/system.conf');
                    }

                    break;

                case 'windows':

                    //For e.g. "Cscript.exe C:\inetpub\OrionSite2.1\bin\Scripts\GetProductModelNum.vbs";
                    $productModelNumScript = implode(DS, ['Cscript.exe  ' . $_SERVER["APPL_PHYSICAL_PATH"], 'bin', 'Scripts', 'GetProductModelNum.vbs']);
                    static::$_modelNumber  = trim(exec_runtime($productModelNumScript, $modelNumber, null, false));

                    break;

                default:

                    throw new \Exception(sprintf('Failed to recognize "%s" as an OS Type', self::getOSName()));
            }
        }

        return static::$_modelNumber;
    }
}