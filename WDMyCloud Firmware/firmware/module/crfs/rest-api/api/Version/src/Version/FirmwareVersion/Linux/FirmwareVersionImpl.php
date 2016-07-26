<?php
/**
 * \file Version/src/Version/FirmwareVersion/Linux/FirmwareVersionImpl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\FirmwareVersion\Linux;

use Version\FirmwareVersion\FirmwareVersion;

class FirmwareVersionImpl extends FirmwareVersion
{
	
	const versionFile = '/etc/version';
	const lastFirmwareSentFile = '/CacheVolume/last_firmware_info_sent';
	
	/**
	 * getVersion()
	 * returns the version of the firmware from file system.
	 */
	public function getVersion($urlPath, $queryParams = null, $outputFormat = 'xml')
	{
        // for testing, return firmware
        if ('testing' == $_SERVER['APPLICATION_ENV'])
        {
           return ['firmware' => '1212323'];
        }

	    $latestVersion = !empty($urlPath[0]) ? $urlPath[0] : '';
       	$file          = '/etc/version';

       	if (!file_exists($file))
       	{
           	return FALSE;
       	}

       	$results = ['firmware' => trim(file_get_contents($file))];

       	if (!empty($latestVersion))
       	{
           	$results['up_to_date'] = ($results['firmware'] == $latestVersion) ? 'true' : 'false';
       	}

       	return $results;
	}
	
	public function getCurrentVersion()
	{
		if (!file_exists(self::versionFile)){
			return false;
		}
		return trim(file_get_contents(self::versionFile));
	}
	
	public function getLastSentVersion()
	{
		if (!file_exists(self::lastFirmwareSentFile))
			return false;
	
		return trim(file_get_contents(self::lastFirmwareSentFile));
	}
	
	public function isSentVersionUpToDate()
	{
		return ($this->getCurrentVersion() === $this->getLastSentVersion());
	}
	
	public function setCurrentVersionAsLatestSent()
	{
		$currentVersion = $this->getCurrentVersion();
		if($currentVersion === false)
			return;
		$result = file_put_contents(self::lastFirmwareSentFile, $currentVersion);
		
		if($result)
			chmod(self::lastFirmwareSentFile, 0777);
	}
}
