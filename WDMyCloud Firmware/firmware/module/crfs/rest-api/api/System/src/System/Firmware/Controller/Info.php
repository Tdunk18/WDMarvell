<?php

/**
 * \file firmware/Info.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace System\Firmware\Controller;

require_once(COMMON_ROOT . '/includes/outputwriter.inc');

use System\Firmware\Model;

/**
 * \class Info
 * \brief Returns an array of current and available update packages and immediately checks for any firmware update available.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class Info /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'firmware_info';

    /**
     * \par Description:
     * Return array of current and available update packages
     *
     * \par Security:
     * - No authentication if request is from LAN
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/firmware_info
     *
     * \param immediate Bool   - optional (default false)
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval firmware_info - firmware information
     *
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of firmware information
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 173  - FIRMWARE_INFO_INTERNAL_SERVER_ERROR - Firmware info internal server error
     *
     * \par XML Response Example:
     * \verbatim
        <firmware_info>
             <current_firmware>
                <package>
                    <name>WDMyCloud </name>
                    <version>03.04.01-219</version>
                    <description>Core F/W</description>
                    <package_build_time>1419453009</package_build_time>
                    <last_upgrade_time>1419456500</last_upgrade_time>
                </package>
            </current_firmware>
            <firmware_update_available>
                <available>true</available>
                <package>
                    <name>sq</name>
                    <version>04.01.02-417</version>
                    <description>sq core firmware</description>
                </package>
            </firmware_update_available>
            <upgrades>
                <available>true</available>
                <message/>
                <upgrade>
                    <version>04.01.02-417</version>
                    <image>
                     http://download.wdc.com/nas/sq-040102-417-20141211.deb
                    </image>
                    <filesize>170802700</filesize>
                    <releasenotes>
                     http://support.wdc.com/nas/rel.asp?f=http://www.wdc.com/wdproducts/updates/?family=wdfmycloud_s&lang=eng
                    </releasenotes>
                    <message/>
                </upgrade>
            </upgrades>
        </firmware_info>
        \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $immediate = isset($queryParams['immediate']) ? \Core\Config::stringToBoolean(trim($queryParams['immediate'])) : false;

        $fwUInfoObj = new Model\Firmware();
        $result = $fwUInfoObj->getAvailPackages($immediate);
        if ($result !== NULL) {

            $output = new \OutputWriter(strtoupper($outputFormat));
            $output->pushElement('firmware_info');

            // current firmware info
            $output->pushElement('current_firmware');

            foreach ($result['current']['package'] as $package) {

                if (empty($package['version']))
                    continue;
                $output->pushElement('package');
                $output->element('name', $package['name']);
                $output->element('version', $package['version']);
                $output->element('description', $package['description']);
                $output->element('package_build_time', $package['package_build_time']);
                $output->element('last_upgrade_time', $package['last_upgrade_time']);
                $output->popElement();
            }
            $output->popElement();

            // update firmware info
            $output->pushElement('firmware_update_available');
            $output->element('available', $result['update']['available']);
            foreach ($result['update']['package'] as $updatePackage) {
                if (empty($updatePackage['version']))
                    continue;
                $output->pushElement('package');
                $output->element('name', $updatePackage['name']);
                $output->element('version', $updatePackage['version']);
                $output->element('description', $updatePackage['description']);
                $output->popElement();
            }
            $output->popElement();

            // upgrades firmware info
            $output->pushElement('upgrades');
            $available = $result['upgrades']['available'];
            $output->element('available', $available);
            $output->element('message', $result['upgrades']['message']);

            // upgrade info
            foreach ($result['upgrades']['upgrade'] as $upgradePackage) {
                if (empty($upgradePackage['version']))
                    continue;
                $output->pushElement('upgrade');
                $output->element('version', $upgradePackage['version']);
                $output->element('image', $upgradePackage['image']);
                $output->element('filesize', $upgradePackage['filesize']);
                $output->element('releasenotes', $upgradePackage['releasenotes']);
                $output->element('message', $upgradePackage['message']);
                $output->popElement();
            }
            $output->popElement(); // </upgrades>
            $output->popElement(); // </firmware_info>
            $output->close();

        } else {
            //Failed to collect info
            throw new \Core\Rest\Exception('FIRMWARE_INFO_INTERNAL_SERVER_ERROR', 500, NULL, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Immediately check for firmware update available
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/firmware_info
     *
     * \param format  String - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval status  String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 173  - FIRMWARE_INFO_INTERNAL_SERVER_ERROR - Firmware info internal server error
     * - 174  - FIRMWARE_INFO_BAD_REQUEST - Firmware info bad request
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_info>
      <status>success</status>
      </firmware_info>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $fwInfoObj = new Model\Firmware();
        $result = $fwInfoObj->modifyUpdateAvailable();

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'firmware_info', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                throw new \Core\Rest\Exception('FIRMWARE_INFO_BAD_REQUEST', 400, NULL, self::COMPONENT_NAME);
            case 'SERVER_ERROR':
                throw new \Core\Rest\Exception('FIRMWARE_INFO_INTERNAL_SERVER_ERROR', 500, NULL, self::COMPONENT_NAME);
        }
    }
}