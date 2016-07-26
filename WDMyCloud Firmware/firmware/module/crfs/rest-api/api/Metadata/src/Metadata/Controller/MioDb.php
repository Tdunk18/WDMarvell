<?php
/**
 * \file metadata/MioDb.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Metadata\Controller;

require_once METADATA_ROOT . '/includes/miodb.inc';
require_once COMMON_ROOT . '/includes/outputwriter.inc';

/**
 * \class MioDb
 * \brief Download the Mio database file.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MioCrawlerStatus, MetaDbInfo, MetaDBSummary
 */
class MioDb
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'miodb';

    /**
     * \par Description:
     * Download the Mio database file.
     *
     * \par Security:
     * - Only authenticated can use this component.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/miodb?compress=true
     *
     * \param compress Boolean - required (default is false)
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - Use the compress parameter to download compressed db file.
     *
     * \return database file
     *
     * \par HTTP Response Codes:
     * - 200 - On success for getting mioclawler status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 244 - MIODB_FAILED - Error in getting MioCrwaler status failed
     * - 307 - MISSING_PARAMETER - Missing the compress parameter
     *
     */
    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $compress = strtolower(trim($queryParams['compress']));

        if (empty($queryParams) || !in_array($compress, ['true', 'false']))
        {
            throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        }

        try
        {
            $results = readMioDBFile($compress == 'true');
        }
        catch (\Exception $e)
        {
            throw new \Core\Rest\Exception('MIODB_FAILED', 500, $e, static::COMPONENT_NAME);
        }

        if ($results != true)
        {
            throw new \Core\Rest\Exception($results['msg'], $results['code'], NULL, static::COMPONENT_NAME);
        }
    }
}