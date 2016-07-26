<?php

namespace Albums\Controller;

/**
 * \file albums/albumcontents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/album.inc');
require_once(ALBUMS_ROOT . '/includes/albumitem.inc');
require_once(FILESYSTEM_ROOT . '/includes/contents.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(UTIL_ROOT . '/includes/zip.inc');

/**
 * \class AlbumContents
 * \brief Get contents of all files in specified album.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \see Album, AlbumItemContents, Dir, DirContents, File, FileContents
 */
class AlbumContents /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Get contents of all files in specified album.
     *
     * \par Security:
     * - Verifies readable album and valid album id.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/1.0/rest/albumcontents/{album_id}
     *
     * \param album_id       Integer - required
     * \param format         String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album is specified by the album id.
     *
     * \return zipped album contents
     *
     * \par Error Codes:
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 258 - ALBUM_IS_EMPTY -Album access not found
     * - 131 - FILE_LIST_IS_EMPTY - File list is empty
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retriving contents of all files
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $albumId = isset($urlPath[0]) ? trim($urlPath[0]) : null;

        if (empty($albumId)) {
            $this->generateErrorOutput(400, 'album_contents', 'ALBUM_ID_MISSING', $outputFormat);
            return;
        }

        $album = getAlbum($albumId);
        if (empty($album)) {
            $this->generateErrorOutput(404, 'album_contents', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }
        $albumName = isset($album[0]['name']) ? str_replace(' ', '_', $album[0]['name']) : 'NO_NAME';

        $userSecurity = \Auth\User\UserSecurity::getInstance();
        if (!isAlbumAccessible($albumId) && !$userSecurity->isAdmin($userSecurity->getSessionUsername())) {
            $this->generateErrorOutput(401, 'album_contents', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        try {
            set_time_limit(0);
            $fileName = basename($albumName) . ".zip";

            //$fileList = getFileListForAlbum($albumId, $includeHidden);
            $albumItems = getAlbumItems($albumId);

            if (empty($albumItems)) {
                $this->generateErrorOutput(404, 'album_contents', 'ALBUM_IS_EMPTY', $outputFormat);
                return;
            }

            $fileList = array();
            foreach ($albumItems as $albumItem) {
                $filePath = mediaToAbsPath($albumItem['path'], $albumItem['share_name']);
                if (!file_exists($filePath))
                    continue;
                $file = basename($filePath);
                $fileList[$file] = $filePath;
            }

            if (empty($fileList)) {
                $this->generateErrorOutput(404, 'album_contents', 'FILE_LIST_IS_EMPTY', $outputFormat);
                return;
            }

            generateZipStream($fileName, $fileList);
            set_time_limit(ini_get('max_execution_time'));
        } catch (\Exception $e) {
            $this->generateErrorOutput($e->getCode(), 'album_contents', $e->getMessage(), $outputFormat);
        }
    }

}
