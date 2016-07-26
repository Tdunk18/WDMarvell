<?php
/**
 * \file Version/src/Version/FirmwareVersion/FirmwareVersionInterface.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\FirmwareVersion;

interface FirmwareVersionInterface
{
	/**
	 * \par Description:
     * Get version of the firmware.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/version
     *
     * \param format String - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval firmware String - version of firmware.
	 */
	public function getVersion($urlPath, $queryParams, $outputFormat);
	
	public function getCurrentVersion();
	
	public function getLastSentVersion();
	
	public function isSentVersionUpToDate();
	
	public function setCurrentVersionAsLatestSent();
}
