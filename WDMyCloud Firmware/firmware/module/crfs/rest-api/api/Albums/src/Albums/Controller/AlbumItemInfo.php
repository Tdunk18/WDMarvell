<?php

namespace Albums\Controller;

/**
 * \file albums/albumiteminfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/albumiteminfo.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumitemsdb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class AlbumItemInfo
 * \brief Retrieve album item info.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Album, AlbumItem
 */
class AlbumItemInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Get album item info of specified album item.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve album item info.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_item_info/{albumItemId}
     *
     * \param album_item_id Integer - required
     * \param format        String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_item_id parameter specified which album item info to get.
     *
     * \retval album_item_info Array - album item info
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
     * - 261 - ALBUM_ITEM_INFO_FAILED - Album item info failed
     *
     * \par XML Response Example:
     * \verbatim
      <album_item_info>
      <album_item_id>27</album_item_id>
      <album_id>5</album_id>
      <item_order>1</item_order>
      <path>/Public/Shared Pictures/Vacation</path>
      <name>Castle.jpg</name>
      <size>3058869</size>
      <ctime>1304002985</ctime>
      <mtime>1281863902</mtime>
      <last_updated_time>1311715265</last_updated_time>
      <deleted>false</deleted>
      </album_item_info>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumItemId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        
        if (empty($albumItemId)) {
            throw new \Core\Rest\Exception('ALBUM_ITEM_ID_MISSING', 400, null, self::COMPONENT_NAME);
        }

        try {
            $albumItem = getAlbumItem($albumItemId);
            if (empty($albumItem)) {
                throw new \Core\Rest\Exception('ALBUM_ITEM_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            }
            if (!isAlbumItemAccessible($albumItemId)) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
            }

            $albumItemInfo = getAlbumItemInfo($albumItemId);
            $pathInfo = pathinfo($albumItemInfo['path']);
            $path = $pathInfo['dirname'];
            $albumItemInfo['path'] = $path;
        } catch (\Exception $e) { // We don't want to translate REST exceptions.
            throw $e;
        } catch (\Exception $e) {
            \Core\Logger::getInstance()->err($e);
            throw new \Core\Rest\Exception('ALBUM_ITEM_INFO_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(201, 'album_item_info', $albumItemInfo, $outputFormat);
    }

}
