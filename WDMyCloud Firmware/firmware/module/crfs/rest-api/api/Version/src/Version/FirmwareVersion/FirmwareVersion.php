<?php
/**
 * \file Version/src/Version/FirmwareVersion/Windows/FirmwareVersion.php \author WDMV - Mountain View - Software
 * Engineering \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\FirmwareVersion;

use \Core\SystemInfo;
use \Core\ClassFactory;

abstract class FirmwareVersion implements FirmwareVersionInterface
{
    private static $instance = NULL;

    /**
     * getInstance() Returns the Operating System-specific singleton instance of this abstract class
     *
     * @return FirmwareVersionInterface
     */
    static public function getInstance()
    {
        if (!isset(self::$instance))
        {
            self::$instance = ClassFactory::getImplementation('Version\FirmwareVersion',
                                                              ['osname' => SystemInfo::getOSName()]);
        }

        return self::$instance;
    }

    /**
     * getVersion()
     *
     * @param $urlPath
     * @param $queryParams
     * @param $outputFormat default 'xml'
     */
    abstract public function getVersion($urlPath, $queryParams, $outputFormat);
    
	abstract public function getCurrentVersion();
	
	abstract public function getLastSentVersion();
	
	abstract public function isSentVersionUpToDate();
	
	abstract public function setCurrentVersionAsLatestSent();
}