<?php
/**
 * \file Raid/Controller/UserRaidStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

namespace Storage\Raid\Controller;

/**
 * \class UserRaidStatus
 * \brief Get information about RAID configuration and start RAID - 1.0 version
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 */
class UserRaidStatus
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'user_raid_status';

    /**
     * \par Description:
     * Get the RAID configuration status.
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/user_raid_status
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
     * - raid_status - GOOD, BAD
     * - raid_rebuilding_progress - progress in percentage.  raid_rebuilding_progress field is only returned when the rebuilding is in progress.
     *
     * \par XML Response Example:
     * \verbatim
    <user_raid_status>
        <raid_status>GOOD</raid_status>
        <raid_rebuilding_progress>25</raid_rebuilding_progress>
    </user_raid_status>
       \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version=null)
    {
        try
        {
            $result = \Storage\Raid\Manager::getManager()->getDriveStatusOld($version);
        }
        catch (\Storage\Raid\Exception $sre)
        {
            throw new \Core\Rest\Exception($sre->getMessage(), $sre->getCode(), $sre, static::COMPONENT_NAME);
        }

        $this->generateMultipleCollectionOutputWithTypeAndCollectionNameCustom(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}