<?php

namespace AlbumMetadata\Controller;
/**
 * \file    albummetadata/metadbalbum.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

class MetaDbAlbum {

    use \Core\RestComponent;

    private $AlbumsDB;
    public $group_bys = array('category', 'date', 'genre');
    public $order_bys = array('item_order', 'category', 'name', 'size', 'modified_time', 'created_time', 'last_updated_time');
    public $orders = array('asc', 'desc');

    function __construct() {
        require_once(METADATA_ROOT . '/includes/metadb.inc');
        require_once(ALBUMS_ROOT . '/includesdb/albumsdb.inc');
        $this->AlbumsDB = new AlbumsDB();
    }


    /**
     * \par Description:
     * Get listing of album items from mediacrawler database.
     *
     * \par Security:
     * - Verifies readable album and valid album id.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/metadb_album
     *
     * \param album_id   Integer - required
     * \param where      String  - optional
     * \param group_by   String  - optional
     * \param order_by   Boolean - optional
     * \param order      Boolean - optional
     * \param offset     String  - optional
     * \param limit      String  - optional
     * \param format     String  - optional
     *
     * \par Parameter Details:
     * - The album_id is used to find out album's info.
     *
     * \retval status  String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for listing of album items
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 41 - PARAMETER_MISSING - Parameter is missing
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 67 - ALBUM_NOT_FOUND -Album not found
     *
     * \par XML Response Example:
     * \verbatim
     <album_access>
     <status>success</status>
     </album_access>
     \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $metaDb = new \MetaDB();
        $path = implode('/', $urlPath);
        $path = ltrim($path, '/');
        $path = rtrim($path, '/');
        $paths = explode('/', $path);
        $albumId = isset($paths[0]) ? trim($paths[0]) : null;
        $where = isset($queryParams['where']) ? trim($queryParams['where']) : null;
        $group_by = isset($queryParams['group_by']) ? trim($queryParams['group_by']) : null;
        $order_by = isset($queryParams['order_by']) ? trim($queryParams['order_by']) : null;
        $order = isset($queryParams['order']) ? trim($queryParams['order']) : null;
        $offset = isset($queryParams['offset']) ? trim($queryParams['offset']) : '0';
        $limit = isset($queryParams['limit']) ? trim($queryParams['limit']) : '10';

        if (empty($albumId)) {
            $this->generateErrorOutput(400, 'metadb_album', 'ALBUM_ID__MISSING', $outputFormat);
            return;
        }

        if (!empty($order_by) && !in_array($order_by, $this->order_bys)) {
            $this->generateErrorOutput(400, 'metadb_album', 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        if (!empty($order) && !in_array($order, $this->orders)) {
            $this->generateErrorOutput(400, 'metadb_album', 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        $album = $this->AlbumsDB->getAlbum($albumId);
        if (empty($album)) {
            $this->generateErrorOutput(404, 'metadb_album', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }

        $metaDb->getAlbumItems($albumId, $where, $group_by, $order_by, $order, $offset, $limit);
    }

}