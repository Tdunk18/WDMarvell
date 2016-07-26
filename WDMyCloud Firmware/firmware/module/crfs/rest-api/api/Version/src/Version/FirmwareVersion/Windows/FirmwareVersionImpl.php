<?php
/**
 * \file Version/src/Version/FirmwareVersion/Windows/FirmwareVersionImpl.php \author WDMV - Mountain View - Software
 * Engineering \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\FirmwareVersion\Windows;

/**
 * Get version of the firmware for Windows OS. Searches for version file in file system, if it is not found then gives a
 * HTTP 404. On success passes on the data for XML generation to Version class.
 */
use Version\FirmwareVersion\FirmwareVersion;

class FirmwareVersionImpl extends FirmwareVersion
{
    public function getVersion($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        // for testing, return firmware
        if ('testing' == $_SERVER['APPLICATION_ENV'])
        {
            return ['firmware' => '1212323'];
        }

        $devConfig = getGlobalConfig('device');
        $output = null;
        $results   = ['firmware' => trim(exec_runtime('Cscript.exe ' . $devConfig['FIRMWARE_VERSION_SCRIPT'], $output))];

        if (!empty($urlPath[0]))
        {
            $results['up_to_date'] = ($results['firmware'] == $urlPath[0]) ? 'true' : 'false';
        }

        return $results;
    }
}