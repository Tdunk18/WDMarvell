<?php

namespace System\Reporting\Controller;

use System\Reporting\Model;

/**
 * \file system_reporting/Information.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class Information
 * \brief Returns system information such as: manufacturer, model name and capacity to name a few.
 *  (Check methods for complete set of information).
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class Information /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'system_information';

    /**
     * \par Description:
     * Get complete information about the system.
     *
     * \par Security:
     * - No authentication required.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/system_information
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval system_information - system information
     * - manufacturer:  {Manufacturer}
     * - manufacturer_url:  {Url}
     * - model_description:  {Model description}
     * - model_name:  {Model name}
     * - model_url:  {Model url}
     * - model_number:  {Model number}
     * - capacity:  {System Capacity in TB}
     * - serial_number:  {Serial number}
     * - master_drive_serial_umber: {Serial Number}
     * - mac_address:  {mac address}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of system information
     * - 500 - Internal server error
     *
     * \par Error codes:
     * - 171 - SYSTEM_INFORMATION_INTERNAL_SERVER_ERROR - System information internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <?xml version="1.0" encoding="utf-8"?>
<system_information>
    <manufacturer>Western Digital Corporation</manufacturer>
    <manufacturer_url>http://www.wdc.com</manufacturer_url>
    <model_description>WD Venue Wireless Storage Hub</model_description>
    <model_name>wdvenue</model_name>
    <model_url>http://www.wdc.com/venue</model_url>
    <model_number>BALI</model_number>
    <host_name>WDMyCloudEX4</host_name>
    <capacity>0</capacity>
    <serial_number>none</serial_number>
    <master_drive_serial_number>none</master_drive_serial_number>
    <mac_address>00:90:af:f6:40:78</mac_address>
    <wd2go_server>198.107.148.217  stage9web.remotewd4.com remotewd4.com wd2go.com www.wd2go.com remotewd.com www.remotewd.com</wd2go_server>
    <dlna_server>access</dlna_server> <!-- Optional Argument -->
</system_information>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        try {
        	$infoObj = \System\Reporting\SystemReporting::getManager();
        	$result = $infoObj->getInfo();

            if ($result !== NULL) {
                $this->generateSuccessOutput(200, 'system_information', $result, $outputFormat);
            } else {
                //Failed to collect info
                $this->generateErrorOutput(500, 'system_information', 'SYSTEM_INFORMATION_INTERNAL_SERVER_ERROR', $outputFormat);
            }
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SYSTEM_STATE_INTERNAL_SERVER_ERROR', 500, $e, self::COMPONENT_NAME);
        }

    }

}