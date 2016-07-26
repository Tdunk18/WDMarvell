<?php
/**
 * \file Metadata/Controller/ExternalVolumeScan.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

use \Metadata\Model\ExternalVolumeMediaView;

/**
 * \class ExternalVolumeScan
 * \brief Set/Retrieve setting for External Volume Scan
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, Flash UI app or any script.
 * - User needs to be authenticated to use this component.
 *
 */
class ExternalVolumeScan
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'external_volume_scan';

    /**
     * \par Description:
     * Retrieve ExternalVolumeMediaView status.
     *
     * \par Security:
     * - Must be authenticated as regular user or admin user
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/external_volume_scan
     *
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \par Parameter Usages:
     *
     * - get current setting of External Volume Scan in default format
     * http://localhost/api/@REST_API_VERSION/rest/external_volume_scan
     * 
     *
     * \retval external_scan String - true/false
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Failed to retrieve setting
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized delete the passed in username.
     *
     * \par XML Response Example:
     * \verbatim
    <external_volume_scan>
        <external_scan>false</external_scan>
    </external_volume_scan>
    \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        try{
            $res = \Metadata\Model\ExternalVolumeMediaView::getExternalVolumeMediaViewSetting();
            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $res, $outputFormat);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('REMOVABLE_STORAGE_EXTERNAL_SCAN_SETTING_RETRIEVAL', 500, $e, static::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Enable/Disable external volume scan.
     *
     * \par Security:
     * - Must be authenticated as regular user or admin user
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/external_volume_scan}
     *
     * \param external_scan   Boolean - Optional
     * \param format          String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - external_scan true/false to enable/disable removable storage scan
     * - The default value for the format parameter is xml.
     *
     * \par Parameter Usages:
     *
     * - Enable External Volume Scan
     * http://localhost/api/@REST_API_VERSION/rest/external_volume_scan?external_scan=true
     *
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for rebuilding Crawler DB
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal Failure
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized delete the passed in username.
     *
     * \par XML Response Example:
     * \verbatim
        <external_volume_scan>
            <status>success</status>
        </external_volume_scan>
      \endverbatim
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        if(!isset($queryParams['external_scan'])
            || (strtolower($queryParams['external_scan'])!=='true' && strtolower($queryParams['external_scan'])!=='false')){
            throw new \Core\Rest\Exception('Bad queryParams', 400, null, self::COMPONENT_NAME);
        }
        try{
            $value = (strtolower($queryParams['external_scan']) === 'true') ? true : false;
            ExternalVolumeMediaView::setExternalVolumeMediaViewSetting($value);
            $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('REMOVABLE_STORAGE_EXTERNAL_SCAN_SETTING_STORAGE', 500, $e, static::COMPONENT_NAME);
        }
    }
}