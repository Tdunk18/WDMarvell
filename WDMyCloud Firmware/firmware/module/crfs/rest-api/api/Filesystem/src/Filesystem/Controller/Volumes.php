<?php

namespace Filesystem\Controller;

/**
 * \file    filesystem/volumes.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');

/**
 * \class Volumes
 * \brief Retrieve a volume.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Drives, Status, Version
 */
class Volumes /* extends AbstractActionController */ {

    use \Core\RestComponent;
    const COMPONENT_NAME = 'volumes';

    /**
     * \par Description:
     * This GET request is used to get the volume information.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/volumes/{volume_id}
     *
     * \param volume_id String - optional
     * \param format    String - optional (default is xml)
     *
     * \par Parameter Details:
     * - volume_id - the volume id
     *
     * \retval volumes Array - volume info
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
     * <volumes>
     *      <volume_id>4E1AEA7B1AEA6007_1</volume_id>
     *      <label/>
     *      <base_path>/shares/USB_MyPassport</base_path>
     *      <drive_path>/dev/sde1</drive_path>
     *      <is_connected>true</is_connected>
     *      <db_ready>0</db_ready>
     *      <capacity>1000169</capacity>
     *      <dynamic_volume>true</dynamic_volume>
     *      <file_system_type>ufsd</file_system_type>
     *      <read_only>false</read_only>
     *      <handle>575831314138324C35383031</handle>
     *      <crawler_status/>
     *      <created_date>1433211443</created_date>
     *      <mounted_date>1433211443</mounted_date>
     *      <mount_path>/media/USB</mount_path>
     *      <storage_type>USB</storage_type>
     *      </volume>
     *  </volumes>
     * \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $volumeId = !empty($urlPath[0]) ? trim($urlPath[0]) : null;
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'volumeId', $volumeId);
        $volumesDB = new \VolumesDB();
        try{
            if (!empty($volumeId)) {
                $volume = $volumesDB->getVolume($volumeId);
                if (empty($volume)) {
                    $this->generateErrorOutput(404, self::COMPONENT_NAME, 'VOLUME_NOT_FOUND', $outputFormat);
                    return;
                }
                $this->generateItemOutput(200, self::COMPONENT_NAME, $volume, $outputFormat);
                return;
            }
            $volumes = $volumesDB->getVolume();
        }catch (\Exception $e ){
            throw new \Core\Rest\Exception($e->getMessage(), $e->getCode(), null, self::COMPONENT_NAME);
        }
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'volumes', print_r($volumes,true));
        if (empty($volumes)) {
            $this->generateErrorOutput(404, self::COMPONENT_NAME, 'NO_VOLUMES_FOUND', $outputFormat);
            return;
        }
        $this->generateCollectionOutput(200, self::COMPONENT_NAME, 'volume', $volumes, $outputFormat);
    }



}