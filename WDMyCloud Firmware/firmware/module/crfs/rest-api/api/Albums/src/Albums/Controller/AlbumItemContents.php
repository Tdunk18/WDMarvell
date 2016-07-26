<?php

namespace Albums\Controller;

/**
 * \file albums/albumitemcontents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/albumitem.inc');
require_once(FILESYSTEM_ROOT . '/includes/contents.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

use Auth\User\UserManager;

/**
 * \class AlbumItemContents
 * \brief Retrieve contents of an album item.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Album, AlbumItem, AlbumItemInfo
 */
class AlbumItemContents /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'album_item_contents';

    /**
     * \par Description:
     * Download transcoded and/or range contents for specified album item.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve contents of an album item.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_item_contents/{albumItemId}
     *
     * \param album_item_id Integer - required
     * \param http_range    String  - optional
     * \param tn_type       String  - optional [tn96s1, i170s1, i1024s1]
     * \param format        String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_item_id parameter specified which album item content to download.
     * - The http_range parameter specified which part of the content to download.
     * - An example of http_range is: http_range=100-200.
     * - The tn_type parameter specified which transcoded format to download.
     * - Valid values for tn_type are: tn96s1, i160s1, or  i1024s1.
     *
     * \return file content of album item
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retriving specified album item
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     * 
     * \par Error Codes:
     * - 5 - ALBUM_ITEM_ID_MISSING - Album item id missing
     * - 119 - ALBUM_ITEM_NOT_FOUND - Album item not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * 
     * 
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumItemId = $urlPath[0];
        if (!isset($albumItemId)) {
            throw new \Core\Rest\Exception('ALBUM_ITEM_ID_MISSING', 400, null, self::COMPONENT_NAME);
        }

        if (!isAlbumItemValid($albumItemId)) {
            throw new \Core\Rest\Exception('ALBUM_ITEM_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }
        $userSecurity = \Auth\User\UserSecurity::getInstance();
        $sessionUsername = $userSecurity->getSessionUsername();
        if (!isAlbumItemAccessible($albumItemId) && !isAdmin($sessionUsername)) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        $tnType = !empty($queryParams['tn_type']) ? $queryParams['tn_type'] : null;
        $range = !empty($queryParams['http_range']) ? $queryParams['http_range'] : null;
        if (!empty($range))
            $_SERVER['HTTP_RANGE'] = $range;
        try {
            readFileFromAlbumItem($albumItemId, $tnType);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception($e->getMessage(), $e->getCode() ?: 500, $e, self::COMPONENT_NAME);
        }
    }

}
