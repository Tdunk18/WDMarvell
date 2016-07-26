<?php

namespace AlbumMetadata\Controller;

/**
 * \file    albummetadata/metadbalbumsummary.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(METADATA_ROOT . '/includes/metadb.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

/**
 * \class MetaDBAlbumSummary
 * \brief Get item summary of specified album.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see MetaDBAlbum, MetaDBGroup, MetaDBGroupSummary, MetaDBInfo, MetaDBSummary
 */
class MetaDbAlbumSummary {

    use \Core\RestComponent;

    public $group_bys = array('category', 'date', 'genre');
    public $order_bys = array('item_order', 'category', 'name', 'size', 'modified_time', 'created_time', 'last_updated_time');
    public $orders = array('asc', 'desc');

    /**
     * \par Description:
     * Get item summary of specified album.
     *
     * \par Security:
     * - Verifies readable album and valid album id.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/metadb_album_summary/{album_id}
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
     *
     * \par Parameter Details:
     *
     * - The album_id specifies the desired album.
     *
     * \retval metadb_album_summary Array - album summary
     *
     * \par HTTP Response Codes:
     * - 200 - On success for listing item summary of specified album
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 31 - INVALID_PARAMETER - Invalid parameter
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 126 - DB_ACCESS_FAILED - Database access failed
     *
     *
     * \par XML Response Example:
     * \verbatim
      <metadb_album_summary>
      <count>4</count>
      <size>25458200</size>
      <album_id>1</album_id>
      </metadb_album_summary>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $path = implode('/', $urlPath);
        $path = ltrim($path, '/');
        $path = rtrim($path, '/');
        $paths = explode('/', $path);
        $albumId = isset($paths[0]) ? trim($paths[0]) : null;
        $where = isset($queryParams['where']) ? trim($queryParams['where']) : null;
        $group_by = isset($queryParams['group_by']) ? trim($queryParams['group_by']) : null;
        $order_by = isset($queryParams['order_by']) ? trim($queryParams['order_by']) : null;
        $order = isset($queryParams['order']) ? trim($queryParams['order']) : null;
        $offset = isset($queryParams['offset']) ? trim($queryParams['offset']) : null;
        $limit = isset($queryParams['limit']) ? trim($queryParams['limit']) : null;

        if (empty($albumId)) {
            $this->generateErrorOutput(400, 'metadb_album_summary', 'ALBUM_ID__MISSING', $outputFormat);
            return;
        }

        if (!empty($order_by) && !in_array($order_by, $this->order_bys)) {
            $this->generateErrorOutput(400, 'metadb_album_summary', 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        if (!empty($order) && !in_array($order, $this->orders)) {
            $this->generateErrorOutput(400, 'metadb_album_summary', 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        $AlbumsDB = new \AlbumsDB();
        $album = $AlbumsDB->getAlbum($albumId);
        if (empty($album)) {
            $this->generateErrorOutput(404, 'metadb_album_summary', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }

        try {
            $MetaDB = new \MetaDB();
            $results = $MetaDB->getAlbumSummary($albumId, $where, $group_by, $order_by, $order, $offset, $limit);
            $results[0]['album_id'] = $albumId;
            $this->generateSuccessOutput(200, 'metadb_album_summary', $results[0], $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'metadb_album_summary', 'DB_ACCESS_FAILED', $outputFormat);
            return;
        }
    }

}