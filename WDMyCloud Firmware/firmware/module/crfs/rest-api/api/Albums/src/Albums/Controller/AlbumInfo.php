<?php

namespace Albums\Controller;

/**
 * \file albums/albuminfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/album.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(ALBUMS_ROOT . '/includes/db/albuminfodb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class AlbumInfo
 * \brief Retrieve album info.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Album, AlbumAccess
 */
class AlbumInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Get albums which contain the specified file.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve an album info.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_info?file_path={filePath}
     *
     * \param file_path Integer - required
     * \param album_id  Integer - optional
     * \param user_id   Integer - optional
     * \param format    String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_id parameter specifies which album to get.
     * - The user_id parameter specifies which album to get.
     * - The file_path parameter specifies the files to search for.
     *
     * \retval album_access_info Array - album access info
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retriving albums info.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 120 - NO_ALBUMS_FOUND - No albums found
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 67 - ALBUM_NOT_FOUND -Album not found  
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 260 - ALBUM_INFO_FAILED - ALBUM_INFO_FAILED
     *
     * \par XML Response Example:
     * \verbatim
      <album_info>
      <album>
      <album_id>1</album_id>
      <owner>1</owner>
      <name>Family Photos</name>
      <description>Photos taken of family last year</description>
      <slide_show_duration>1</slide_show_duration>
      <slide_show_transition>normal</slide_show_transition>
      <media_type>photos</media_type>
      <ctime>2011-01-01</ctime>
      <expiration_time>2012-12-31</expiration_time>
      <expiration_days>0</expiration_days>
      <current_time>1314811297</current_time>
      </album>
      </album_info>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userId = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        $filePath = isset($queryParams['file_path']) ? trim($queryParams['file_path']) : null;
        $sessionUserId = getSessionUserId();
        if (empty($userId) && !isAdmin($sessionUserId)) {
            $userId = $sessionUserId;
        }
        if (!empty($filePath)) {
            $AlbumsDB = new \AlbumsDB();
            $albums = $AlbumsDB->getAlbumsWithFile($filePath, $userId, $albumId);
            if (empty($albums)) {
                $this->generateErrorOutput(404, 'album_info', 'NO_ALBUMS_FOUND', $outputFormat);
                return;
            }
            $this->generateCollectionOutput(200, 'album_info', 'album', $albums, $outputFormat);
        } else {
            if (empty($albumId)) {
                $this->generateErrorOutput(400, 'album_info', 'ALBUM_ID_MISSING', $outputFormat);
                return;
            }
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumId', $albumId);
            if (!isAlbumValid($albumId)) {
                $this->generateErrorOutput(404, 'album_info', 'ALBUM_NOT_FOUND', $outputFormat);
                return;
            }
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'userId', $userId);
            if (!isAdmin($userId) && !isAlbumAccessible($albumId) && !isAlbumOwner($albumId, $userId)) {
                $this->generateErrorOutput(401, 'album_info', 'USER_NOT_AUTHORIZED', $outputFormat);
                return;
            }
            try {
                $albumInfoDB = new \AlbumInfoDB();
                $album = $albumInfoDB->getAlbumInfo($albumId);
                //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'album', print_r($album,true));
                if (empty($album)) {
                    $this->generateErrorOutput(404, 'album_info', 'NO_ALBUMS_FOUND', $outputFormat);
                    return;
                }
                //$this->generateCollectionOutput(200, 'albums', 'album', $album, $outputFormat);
                $this->generateSuccessOutput(200, 'album_info', $album, $outputFormat);
            } catch ( \Exception $e) {
                $this->generateErrorOutput(500, 'album_info', 'ALBUM_INFO_FAILED', $outputFormat);
            }
        }
    }

}
