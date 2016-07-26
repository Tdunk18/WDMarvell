<?php
/**
 * \file storage/Usage.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Storage\Usage\Controller;

use Storage\Usage\Model;
use Core\Logger;

/**
 * \class StorageUsage
 * \brief Reports storage usage
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */

class StorageUsage /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = "storage_usage";

    /**
     * \par Description:
     * Return storage usage by video, photos, music, and other media.
     * Calling the API with version 1.0 will return the sizes in GB (base 10), otherwise the sizes are in bytes.
     *
     * \par Security:
     * - No authentication required on LAN and user authentication required on WAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/storage_usage
     *
     * \param include_categories   Boolean  - optional (default is true)
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \par include_categories   - if passed as "false" limits the output to only size and usage- without breakdown into categories
     *
     * \retval storage information Array - storage info
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of storage usage
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 166  - STORAGE_USAGE_INTERNAL_SERVER - Storage usage internal server error
     *
     *
     * This is the formula used to calculate usage: for each volume we look up mount point in Volumes table, calculate usage and add it up:
     *
     * df -B 1 "***mount_point***""
     *
     * Example output:
     * Filesystem    1-blocks       Used		Available	Use%	Mounted on
     * %root%       56861696		50413568	3512320		93%		/
     *
     * In the results of the command above let's assign letters to categories to make formula reading easier:
     * 1-blocks will be "a"
     * Used will be "b"
     * Available will be "c"
     * Use% (just the number) will be "d"
     *
     * formula for usage:
     * a - c - ((a - b - c) * (100 - d) / 100)
     *
     * Formula for "other" is to subtract "video", "music" and "photos" from "usage"
     *
     * \par XML Response Example:
     * \verbatim
      <storage_usage>
      <size>1964257656832</size>
      <usage>1245221621760</usage>
      <video>4924718366</video>
      <photos>118389480</photos>
      <music>94403523</music>
      <other>1240084110391</other>
      </storage_usage>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version=null) {
        $storageUsageObj = new Model\StorageUsage();

        $result = $storageUsageObj->addUpSizeAndUsage();
        $includeCategories = isset($queryParams['include_categories']) ? \Core\Config::stringToBoolean(trim($queryParams['include_categories'])) : true;

        if($includeCategories){
            $result = $storageUsageObj->calculateMediaBreakdown($result);
        }
        
        $result = $storageUsageObj->applyVersionSpecificUnits($result, $version);

        if ($result !== NULL) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
        } else {
            //Failed to collect info
        	$this->generateErrorOutput(500, 'storage_usage', 'STORAGE_USAGE_INTERNAL_SERVER', $outputFormat);
        }
    }

}

/*
* Local variables:
*  indent-tabs-mode: nil
*  c-basic-offset: 4
*  c-indent-level: 4
*  tab-width: 4
* End:
*/