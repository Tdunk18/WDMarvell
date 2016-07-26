<?php
/**
 * \file Metadata/Controller/MediaCrawler.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once COMMON_ROOT . '/includes/outputwriter.inc';
require_once COMMON_ROOT . '/includes/security.inc';
require_once DB_ROOT . '/includes/statusdb.inc';
require_once COMMON_ROOT . '/includes/util.inc';
require_once FILESYSTEM_ROOT . '/includes/db/multidb.inc';
require_once METADATA_ROOT . '/includes/wdmc/wdmcserverproxy.inc';

/**
 * \class MediaCrawler
 * \brief Calling a shell script to reset/rebuild crawler database.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, Flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see CrawlerDB, MetaDbInfo, MetaDBSummary
 */
class MediaCrawler
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'mediacrawler';

    /**
     * \par Description:
     * Update to reset/rebuild crawler database.
     *
     * \par Security:
     * - Must be authenticated as regular user or admin user
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/mediacrawler/{share_name}
     *
     * \param share_name String  - Optional
     * \param allshare   Boolean - Optional
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - share_name the crawler will rebuild the index for this share
     * - The default value for the format parameter is xml.
     * - Either the share_name or allshare parameter must be passed or an INVALID_SHARE error will be returned.
     *
     * \par Parameter Usages:
     *
     * - Reset or rebuild database by share:
     * http://localhost/api/1.0/rest/mediacrawler/{sharename}?allshare=
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
     * - 500 - Failed updating share access
     *
     * \par Error Codes:
     * - 47  - SHARE_NAME_MISSING - Share name is missing
     * - 76  - INVALID_SHARE - Invalid share.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized delete the passed in username.
     *
     * \par XML Response Example:
     * \verbatim
      <mediacrawler>
      <status>success</status>
      </mediacrawler>
      \endverbatim
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
    	$allShare = isset($queryParams['allshare']) ? filter_var($queryParams['allshare'], FILTER_VALIDATE_BOOLEAN) : FALSE;

    	if (!$allShare)
    	{
    	    $sharePath = $this->_getSharePathFromUrlPath($urlPath, FALSE);
    	}

        try
        {
            (new \WDMCServerProxy())->execRebuildCrawlerDB($allShare ? NULL : $sharePath->getShareRoot());
        }
        catch (\Exception $e)
        {
            throw new \Core\Rest\Exception('MEDIACRAWLER_INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
    }
}