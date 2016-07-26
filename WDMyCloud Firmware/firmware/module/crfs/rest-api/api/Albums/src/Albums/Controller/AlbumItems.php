<?php

namespace Albums\Controller;

/**
 * \class AlbumItems
 * \file albums/albumitem.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/album.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumaccessdb.inc');
require_once(ALBUMS_ROOT . '/includes/albumitem.inc');
require_once(FILESYSTEM_ROOT . '/includes/dir.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class AlbumItems
 * \brief Create, retrieve, update, or delete an album item.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Album, AlbumItemInfo, AlbumItemContents
 */
class AlbumItems /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Delete an existing album item.
     *
     * \par Security:
     * - Only the album owner or admin user can delete an album item.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/1.0/rest/album_items/{albumItemId}
     *
     * \param album_item_id Integer - required
     * \param format        String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_item_id parameter specifies which album item to delete.
     *
     * \par HTTP Response Codes:
     * - 200 - On success for deleting specified album item
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes
     * - 5 - ALBUM_ITEM_ID_MISSING - Album item id missing
     * - 119 - ALBUM_ITEM_NOT_FOUND - Album item not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 8 - ALBUM_ITEM_DELETE_FAILED - Failed to delete album item
     *
     * \par XML Response Example:
     * \verbatim
      <album_item>
      <status>success</status>
      </album_item>
      \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumItemId = isset($urlPath[0]) ? $urlPath[0] : null;
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItemId', $albumItemId);
        if (empty($albumItemId)) {
            $this->generateErrorOutput(400, 'album_item', 'ALBUM_ITEM_ID_MISSING', $outputFormat);
            return;
        }
        $albumItem = getAlbumItem($albumItemId);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItem', print_r($albumItem,true));
        if (empty($albumItem)) {
            $this->generateErrorOutput(404, 'album_item', 'ALBUM_ITEM_NOT_FOUND', $outputFormat);
            return;
        }
        $userId = getSessionUserId();
        if (!isAlbumItemAccessible($albumItemId) && !isAdmin($userId)) {
            $this->generateErrorOutput(401, 'album_item', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }
        $status = deleteAlbumItem($albumItemId);
        if (!$status) {
            $this->generateErrorOutput(500, 'album_item', 'ALBUM_ITEM_DELETE_FAILED', $outputFormat);
            return;
        }
        $results = array('status' => 'success', 'album_item_id' => $albumItemId);
        $this->generateSuccessOutput(200, 'album_item', $results, $outputFormat);
    }

    /**
     * \par Description:
     * Get album item of specified album item id.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve an album item.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_items/{albumItemId}
     *
     * \param album_item_id Integer - optional
     * \param album_id      Integer - optional
     * \param format        String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_item_id parameter specified which album item to get.
     * - If album_id is specified instead, then all items for that album will be returned.
     *
     * \retval album_item Array - album item
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
     * - 41 - PARAMETER_MISSING - Parameter is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 119 - ALBUM_ITEM_NOT_FOUND - Album item not found
     * - 67 - ALBUM_NOT_FOUND -Album not found
     *
     * \par XML Response Example:
     * \verbatim
      <album_item>
      <album_item_id>27</album_item_id>
      <album_id>5</album_id>
      <item_order>1</item_order>
      <path>/Public/Shared Pictures/Vacation</path>
      <name>Castle.jpg</name>
      <size>3058869</size>
      <ctime>1304002985</ctime>
      <mtime>1281863902</mtime>
      </album_item>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $sessionUserId = getSessionUserId();
        $albumItemId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $albumId = isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $sharePath = getSharePath();
        if (empty($albumItemId) && empty($albumId)) {
            $this->generateErrorOutput(400, 'album_item', 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        $userId = $sessionUserId;
        if (!empty($albumItemId)) {
            if (!isAdmin($userId) && !isAlbumItemAccessible($albumItemId)) {
                $this->generateErrorOutput(401, 'album_item', 'USER_NOT_AUTHORIZED', $outputFormat);
                return;
            }
            $albumItems = getAlbumItem($albumItemId);
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItem', print_r($albumItem,true));
            if (empty($albumItems[0])) {
                $this->generateErrorOutput(404, 'album_item', 'ALBUM_ITEM_NOT_FOUND', $outputFormat);
                return;
            }
            $albumItem = $albumItems[0];
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItem', print_r($albumItem,true));
            $path = mediaToUIPath($albumItem['path'], $albumItem['share_name']);
            $pathInfo = pathinfo($path);
            $path = ltrim($path, '/');
            $name = $pathInfo['basename'];
            ### PATH SHOULD CONTAIN THE SHARE PATH OR FILE NAME
            //$albumItem['path'] = $volumePath . $path;
            $albumItem['path'] = $pathInfo['dirname'];
            $albumItem['name'] = $name;
            $fileFullPath = implode(DS, [$sharePath, $path, $name]);
            $requestPath = DS . $path . DS . $name;
            $attributes = getAttributes($fileFullPath, $requestPath);
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'attributes', print_r($attributes,true));
            $albumItem['size'] = $attributes['size']['VALUE'];
            $albumItem['ctime'] = $attributes['ctime']['VALUE'];
            $albumItem['mtime'] = $attributes['mtime']['VALUE'];
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'album_item', print_r($albumItem,true));
            $this->generateItemOutput(200, 'album_item', $albumItem, $outputFormat);
        } else if (!empty($albumId)) {
            if (!isAdmin($sessionUserId)) {
                $albumAccessDB = new \AlbumAccessDB();
                $albumAccess = $albumAccessDB->getAlbumAccess($albumId, $sessionUserId);
                //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumAccess', print_r($albumAccess,true));
                if (empty($albumAccess)) {
                    $this->generateErrorOutput(401, 'album', 'USER_NOT_AUTHORIZED', $outputFormat);
                    return;
                }
            }
            $album = getOneAlbum($albumId);
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'album', print_r($album,true));
            if (empty($album)) {
                $this->generateErrorOutput(404, 'album', 'ALBUM_NOT_FOUND', $outputFormat);
                return;
            }
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumId', print_r($albumId,true));
            $albumItems = getAlbumItems($albumId);

            for ($i = 0; $i < count($albumItems); $i++) {

                $path = mediaToUIPath($albumItems[$i]['path'], $albumItems[$i]['share_name']);
                ;
                $pathInfo = pathinfo($path);
                $path = ltrim($path, '/');
                $name = $pathInfo['basename'];
                ### PATH SHOULD CONTAIN THE SHARE PATH OR FILE NAME
                //$albumItems[$i]['path'] = $volumePath . $path;
                $albumItems[$i]['path'] = $pathInfo['dirname'];
                $albumItems[$i]['name'] = $name;
                $fileFullPath = implode(DS, [$sharePath, $path, $name]);
                $requestPath = '/' . $path . '/' . $name;
                $attributes = getAttributes($fileFullPath, $requestPath);
                //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'attributes', print_r($attributes,true));
                $albumItems[$i]['size'] = $attributes['size']['VALUE'];
                $albumItems[$i]['ctime'] = $attributes['ctime']['VALUE'];
                $albumItems[$i]['mtime'] = $attributes['mtime']['VALUE'];
                //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'album_item', print_r($albumItem,true));
            }
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItems', print_r($albumItems,true));
            if (empty($albumItems)) {
                $this->generateErrorOutput(404, 'album_item', 'NO_ALBUM_ITEMS_FOUND', $outputFormat);
                return;
            }
            $this->generateCollectionOutput(200, 'album_items', 'album_item', $albumItems, $outputFormat);
        }
    }

    /**
     * \par Description:
     * Create a new album item of specified album.
     *
     * \par Security:
     * - Only the album owner or admin user can create an album item.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/album_items
     *
     * \param album_id   Integer - required
     * \param path       String  - required
     * \param item_order String  - optional
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_id parameter is the id of a specified album.
     * - The path parameter is the file path of a specified file.
     * - The item_order parameter is the order in which to return this item.
     *
     * \retval status        String  - success
     * \retval album_item_id Integer - id of new album item
     *
     * \par HTTP Response Codes:
     * - 200 - On success for creating new album item of specified album
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <album_item>
      <status>success</status>
      <album_item_id>27</album_item_id>
      </album_item>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($queryParams['album_id']) ? $queryParams['album_id'] : null;
        $path = isset($queryParams['path']) ? $queryParams['path'] : null;
        $itemOrder = isset($queryParams['item_order']) ? $queryParams['item_order'] : null;
        $allowDuplicates = isset($queryParams['allow_duplicates']) ? $queryParams['allow_duplicates'] : null;

        $path = ltrim($path, '/');
        if (empty($albumId) || empty($path)) {
            $this->generateErrorOutput(400, 'album_item', 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        //Check if user is authorized
        $userId = getSessionUserId();
        if (!isAlbumAccessible($albumId, true) && !isAdmin($userId)) {
            $this->generateErrorOutput(401, 'album_item', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if ($allowDuplicates !== 'true') {
            //Check if album item already exists
            $albumItem = getAlbumItemByPath($albumId, $path);
            //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItem', print_r($albumItem,true));
            if (!empty($albumItem)) {
                $this->generateErrorOutput(403, 'album', 'ALBUM_ITEM_ALREADY_EXISTS', $outputFormat);
                return;
            }
        }

        $albumItemId = createAlbumItem($albumId, $path, $itemOrder);
        if ($albumItemId == -1) {
            $this->generateErrorOutput(500, 'album_item', 'ALBUM_ITEM_CREATE_FAILED', $outputFormat);
            return;
        }
        $results = array('status' => 'success', 'album_item_id' => $albumItemId);
        $this->generateSuccessOutput(201, 'album_item', $results, $outputFormat);
    }

    /**
     * \par Description:
     * Update order of specified album item.
     *
     * \par Security:
     * - Only the album owner or admin user can update an album item.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/album_items
     *
     * \param album_item_id Integer - required
     * \param item_order    Integer - required
     * \param format        String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_item_id parameter is the id of a specified album item.
     * - The item_order parameter is the order in which to return this item.
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for updating an album item
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <album>
      <status>success</status>
      </album>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumItemId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $itemOrder = isset($queryParams['item_order']) ? trim($queryParams['item_order']) : null;
        if (empty($albumItemId) || empty($itemOrder)) {
            $this->generateErrorOutput(400, 'album_item', 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        $userId = getSessionUserId();
        if (!isAlbumAccessible($albumItemId, true) && !isAdmin($userId)) {
            $this->generateErrorOutput(401, 'album_item', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }
        $albumItem = getAlbumItem($albumItemId);
        if (empty($albumItem)) {
            $this->generateErrorOutput(404, 'album_item', 'ALBUM_ITEM_NOT_FOUND', $outputFormat);
            return;
        }
        $userId = getSessionUserId();
        if (!isAlbumItemAccessible($albumItemId) || !isAdmin($userId)) {
            $this->generateErrorOutput(401, 'album_item', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItemId', print_r($albumItemId,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'itemOrder', print_r($itemOrder,true));
        $status = updateAlbumItem($albumItemId, $itemOrder);
        if (!$status) {
            $this->generateErrorOutput(500, 'album_item', 'ALBUM_ITEM_UPDATE_FAILED', $outputFormat);
            return;
        }
        $results = array('status' => 'success', 'album_item_id' => $albumItemId);
        $this->generateSuccessOutput(200, 'album_item', $results, $outputFormat);
    }

}
