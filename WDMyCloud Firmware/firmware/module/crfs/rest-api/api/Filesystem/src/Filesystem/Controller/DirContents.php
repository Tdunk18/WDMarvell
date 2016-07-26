<?php

namespace Filesystem\Controller;

/**
 * \file filesystem/dircontents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(FILESYSTEM_ROOT . '/includes/dir.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
//require_once(UTIL_ROOT . '/includes/zip.inc');
require_once COMMON_ROOT . '/includes/security.inc';



use Util\ZipStream;
use Filesystem\Model;

/**
 * \class DirContents
 * \brief Gets directory contents of specified directory.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \see AlbumContents, Dir, File, FileContents
 */
class DirContents
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'dir_contents';

    /**
     * \par Description:
     * This GET request is used get the contents of a specified directory. The content is returned as a zip file.
     * If the path specified as {share_name}/{dir1}/{dir2}, then the archive is named dir2.zip and includes dir2 and all its contents.
     *
     * \par Security:
     * - User must be authenticated.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/dir_contents/{share_name}/{dir_path}
     *
     * \param share_name     String  - required
     * \param dir_path       String  - required
     * \param include_hidden Boolean - optional (default is false)
     * \param format         String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - dir_path - the directory to get the contents.
     * - include_hidden - if set to true then the return list will contain hidden files and directories.
     *
     * \return zipped directory contents
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the zip file
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 42 - PATH_NOT_DIRECTORY - Path is not a directory
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 75 - SHARE_NOT_FOUND - Share name does not exists
     */
    function get($urlPath, $queryParams = null, $output_format = 'xml')
    {
    	setlocale(LC_ALL, "en_US.UTF-8");

        $skipAccessibleCheck = FALSE;
        if (isset($queryParams['hmac'])) {
            try {
                \Auth\Model\Hmac::validatePacket($queryParams['hmac'], implode(DS, $urlPath));
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
            }

            $skipAccessibleCheck = TRUE;
        }

        $sharePath     = $this->_getSharePathFromUrlPath($urlPath, FALSE, FALSE, FALSE, FALSE, $skipAccessibleCheck);
        $includeHidden = isset($queryParams['include_hidden']) ? trim($queryParams['include_hidden']) : FALSE;
        $includeHidden = in_array($includeHidden, ['true', '1', 1]);

        if (!isPathLegal($sharePath->getRelativePath()))
        {
            throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, self::COMPONENT_NAME);
        }

        if (!$sharePath->exists())
        {
            throw new \Core\Rest\Exception('PATH_NOT_FOUND', 404, NULL, self::COMPONENT_NAME);
        }

        if (!$sharePath->isDir())
        {
            throw new \Core\Rest\Exception('PATH_NOT_DIRECTORY', 400, NULL, self::COMPONENT_NAME);
        }

        ZipStream::getInstance()->generateZipStream($sharePath->getAbsolutePath(), $sharePath->getAbsolutePath(), $includeHidden);

    }
}