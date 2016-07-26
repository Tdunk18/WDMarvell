<?php
/**
 * \file metadata/mediacrawlerstatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once METADATA_ROOT . '/includes/crawlerstatus.inc';

/**
 * \class MediaCrawlerStatus
 * \brief Get status of the MediaCrawler process.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MioDB, MetaDbInfo, MetaDBSummary
 */
class MediaCrawlerStatus
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'mediacrawler_status';

    /**
     * \par Description:
     * Get status of the MioCrawler process.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/mediacrawler_status
     *
     * \param volume_id - optional, the id of the volume. If this is omitted, the status for all volumes is returned

     * \param format String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \par Parameter Usages:
     *
     * http://localhost/api/1.0/rest/mediacrawler_status?auth%5Fusername=admin&error%5Fstatus%5Foverride=1&pw=&auth%5Fpassword=&rest%5Fmethod=GET&owner=admin
     *
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for getting status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Media crawler is not running or Internal server error
     *
     * \par Error Codes:
     * - 209 - CRAWLER_IS_NOT_RUNNING - Crawler is not running
     *
     *
     * \par XML Response Example:
     * \verbatim
<mediacrawler_status>
    <volumes>
        <volume>
            <volume_id>abcdef12345</volume_id>
            <volume_state>idle|stalled|scanning|extracting|transcoding</volume_state>
            <categories>
                <category>
                    <category_type>videos|music|photos|other</category_type>
                    <mdate>1315067903</mdate>
                    <extracted_count>407</extracted_count>
                    <transcoded_count>400</transcoded_count>
                    <total>407</total>
                </category>
                ...
                ...
                <category>
                    <category_type>videos|music|photos|other</category_type>
                    <mdate>315067903</mdate>
                    <extracted_count>407</extracted_count>
                    <transcoded_count>400</transcoded_count>
                    <total>507</total>
                </category>
            </categories>
        </volume>
                ...
                ...
        <volume>
            <volume_id>abcdef12345</volume_id>
            <volume_state>  </volume_state>
            <categories>
                <category>
                ...
                ...
                </category>
                ...
                ...
            </categories>
        </volume>
    </volumes>
</miocrawler_status>

      \endverbatim
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'XML')
    {
        $volumeId = isset($queryParams['volume_id']) ? trim($queryParams['volume_id']) : NULL;
        $volumes  = \RequestScope::getMediaVolMgr()->getMediaVolumeInfo();

        if (empty($volumes))
        {
            $ow = new \OutputWriter($outputFormat);

            $ow->pushElement('mediacrawler_status');
            $ow->popElement();
            $ow->close();

            return;
        }

        $isValidVolumeId = FALSE;

        foreach ($volumes as $volume)
        {
            if ($volume['Id'] == $volumeId)
            {
                $isValidVolumeId = TRUE;

                break;
            }
        }

        if (!empty($volumeId) && !$isValidVolumeId)
        {
            throw new \Core\Rest\Exception('VOLUME_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        $ow = new \OutputWriter($outputFormat);

        $ow->pushElement('mediacrawler_status');
        $ow->pushElement('volumes');
        $ow->pushArray('volume');

        foreach (getCrawlerStatus($volumeId) as $volInfo)
        {
            $ow->pushArrayElement();

            $ow->element('volume_id', $volInfo['volume_id']);
            $ow->element('volume_state', $volInfo['volume_state']);

            $ow->pushElement('categories');
            $ow->pushArray('category');

            foreach ($volInfo['categories'] as $category)
            {
                $ow->pushArrayElement();

                foreach (['category_type', 'mdate', 'extracted_count', 'transcoded_count', 'total'] as $index)
                {
                    $ow->element($index, $category[$index]);
                }

                $ow->popArrayElement();
            }

            $ow->popArray();
            $ow->popElement();
            $ow->popArrayElement();
        }

        $ow->popArray();
        $ow->popElement(); //volumes
        $ow->popElement();

        $ow->close();
    }
}