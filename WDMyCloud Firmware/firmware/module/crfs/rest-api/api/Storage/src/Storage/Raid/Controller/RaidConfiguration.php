<?php
/**
 * \file Raid/Controller/RaidConfiguration.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

namespace Storage\Raid\Controller;

/**
 * \class RaidConfiguration
 * \brief Get information about RAID configuration and start RAID
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 *
 */
class RaidConfiguration
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'raid_configuration';

    /**
     * \par Description:
     * Get the RAID configuration status.
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/raid_configuration
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
     * - stage - preparing, configuring, restoring, idle
     * - status - in-progress, succeeded, failed. Only returned when RAID configuration is in progress.
     * - status_desc - status description. Only returned when RAID configuration is in progress.
     * - progress - progress in percentage. Only returned when RAID configuration is in progress.
     * - elapsed_time - elapsed time in seconds. Only returned when RAID configuration is in progress.
     *
     * \par XML Response Example:
     * \verbatim
     <raid_configuration>
        <stage>configuring</stage>
        <status>in-progress<status>
        <status_desc>status description</status_desc>
        <progress>50</progress>
        <elapsed_time>14</elapsed_time>
    </raid_configuration>
       \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        try
        {
            $result = \Storage\Raid\Manager::getManager()->getConfigurationStatus();
        }
        catch (\Storage\Raid\Exception $sre)
        {
            throw new \Core\Rest\Exception($sre->getMessage(), $sre->getCode(), $sre, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }

    /**
     * \par Description:
     * Cause the device to start RAID configuration
     *
     * \par Security:
     * - Can only be used on LAN
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/raid_configuration
     *
     * \param raid_mode  Integer - optional
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - raid_mode - integer {0-10}, what mode to start RAID in. If no value is passed RAID will start according to the default factory configuration
     * !!! On Lighting devices raid_mode parameter will be ignored. POST only configures raid if it not already configured in the default mode for
     * the number of discs inserted and it only configures it in the default mode. If RAID is already configured in a default mode, POST will return
     * a message about it and will not start to re-configure RAID. Default modes on Lightning are:
     * 1HDD - JBOD
     * 2HDD - RAID1
     * 3HDD - RAID5
     * 4HDD - RAID5
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
     <raid_configuration>
         <status>success</status>
     </raid_configuration>
      \endverbatim
     */
    function post($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $raidMode = '';

        if (isset($queryParams['raid_mode']))
        {
            $params = filter_var_array($queryParams,
                [
                    'raid_mode' =>
                    [
                        'filter'  => \FILTER_VALIDATE_INT,
                        'options' =>
                        [
                            'min_range' => 0,
                            'max_range' => 5
                        ]
                    ]
                ]);

            if (empty($params['raid_mode']))
            {
                throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, NULL, static::COMPONENT_NAME);
            }

            $raidMode = $params['raid_mode'];
        }

        try
        {
            $result = \Storage\Raid\Manager::getManager()->initRaid($raidMode);
        }
        catch (\Storage\Raid\Exception $sre)
        {
            throw new \Core\Rest\Exception($sre->getMessage(), $sre->getCode(), $sre, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
    }
}