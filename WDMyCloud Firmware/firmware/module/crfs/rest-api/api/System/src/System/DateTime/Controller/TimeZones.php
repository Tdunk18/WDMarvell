<?php

/**
 * \file date-time/TimeZones.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\DateTime\Controller;
use System\DateTime\Model;

/**
 * \class TimeZones
 * \brief Retrieve array of time zones.
 *
 * - This component extends the Rest Component.
 * - Supports xml format.
 * - User must be authenticated to use this component.
 *
 */
class TimeZones /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'time_zones';

    /**
     * \par Description:
     * Returns list of time zones and description of each. The name is suitable to use in dateTimeConfiguration for picking time zone.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/time_zones
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval time_zones - Array of time zone names and descriptions
     * - name:  {time zone name}
     * - description:  {Description}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of time zones
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     *
     * \par XML Response Example:
     * \verbatim
      <time_zones>
      <time_zone>
      <name>Pacific/Midway</name>
      <description>(GMT-11:00) Midway Island, Samoa</description>
      </time_zone>
      <time_zone>
      <name>US/Hawaii</name>
      <description>(GMT-10:00) Hawaii</description>
      </time_zone>
      <time_zone>
      <name>US/Alaska</name>
      <description>(GMT-09:00) Alaska</description>
      </time_zone>
      <time_zone>
      <name>Pacific/Auckland</name>
      <description>(GMT+12:00) Auckland, Wellington</description>
      </time_zone>
      <time_zone>
      <name>Pacific/Fiji</name>
      <description>(GMT+12:00) Fiji, Kamchatka, Marshall Is.</description>
      </time_zone>
      </time_zones>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $detailobj = new Model\TimeZones();
        $timeZones = array();
        $timeZone = array();
        foreach ($detailobj->getTimeZones() as $name => $description) {
        	$timeZone['name'] = $name;
        	$timeZone['description'] = $description;
        	array_push($timeZones, $timeZone);
        }
        $this->generateCollectionOutput(200, self::COMPONENT_NAME, 'time_zone', $timeZones, $outputFormat);
    }

}
