<?php
/**
 * \file Raid/Controller/RaidDrivesStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

namespace Storage\Raid\Controller;

/**
 * \class RaidDrivesStatus
 * \brief get information about drives and their status
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 */
class RaidDrivesStatus
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'raid_drives_status';

    /**
     * \par Description:
     * Get the RAID configuration status.
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/raid_drives_status
     *
     * \retval status String - success
     *
     * \param format     String  - optional (default is xml)
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     *  \par Response Details:
     * - status:
     *         drive_raid_already_formatted = RAID is already formatted(default state once RAID Array is configured)
     *         drive_raid_ready = the drives  are compatible with the device
     *         no_drives_found = no drives are in the chassis, or drives are unusable
     *         restricted_drives_found = invalid drive type in one or more locations
     *         incorrect_drive_order = drives not in correct locations or not in correct order
     *        drive_raid_incompatible_configuration = drive configuration does not allow the default modes supported
     *         failed_drive_raid_mode = raid mode failed
     *         stopped = configuration was stopped
     *         rebuilding = rebuilding RAID array
     *         busy = fetching inserted drives data
     * - status_desc - status description
     * - drives - all the drives found with one <drive>...</drive> record per drive
     * - drive_size - drive size in bites
     * - valid_drive_list - allowed/restricted, valid_drive_list indicates whether the drive falls under white list / grey list (allowed) or black list (restricted).
     * - smart_status - running/fail/pass
     * - raid_mode - 0 - 10 for RAID mode 0-10, 11 for JBOD, 12 for spanning.
     * - removable - 1/0, meaning true/false
     *
     * \par XML Response Example:
     * \verbatim
     <raid_drives_status>
        <status>drive_raid_already_formatted</status>
        <status_desc>RAID is already formatted</status_desc>
        <drives>
            <partition_uuid>fab0d946:158819a9:bbdac761:35d13b20</partition_uuid>
            <busy_drive_location>
                <location>2</location>
            </busy_drive_location>
            <drive>
                <model>WDC WD20EFRX-68AX9N0</model>
                <serial_number>WD-WMC301430200</serial_number>
                <drive_size>2000398934016</drive_size>
                <valid_drive_list>allowed</valid_drive_list>
                <smart_status/>
                <raid_mode>5</raid_mode>
                <removable>1</removable>
            </drive>
            ...
        </drives>
    </raid_drives_status>
       \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        try
        {
            $infoObj = \Storage\Raid\Manager::getManager();
            $results = $infoObj->getDriveStatus() + $infoObj->getDrivesInfo();
        }
        catch (\Storage\Raid\Exception $sre)
        {
            throw new \Core\Rest\Exception($sre->getMessage(), $sre->getCode(), $sre, static::COMPONENT_NAME);
        }

        $this->generateMultipleCollectionOutputWithTypeAndCollectionNameCustom(200, static::COMPONENT_NAME, $results, $outputFormat);
    }
}