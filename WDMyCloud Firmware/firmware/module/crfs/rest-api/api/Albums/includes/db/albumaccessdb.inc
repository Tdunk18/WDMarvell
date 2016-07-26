<?php
/**
 * \file db\albumaccessdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

/**
 *
 *
 */
class AlbumAccessDB extends DBAccess {

    private static $queries = [
        'SELECT_ALBUM_ACCESS'           => "SELECT aa.album_id, aa.username, aa.access_level as access, aa.created_date as ctime FROM AlbumAccess aa WHERE aa.album_id = :album_id",
        'SELECT_ALBUM_ACCESS_FOR_USER'  => "SELECT aa.album_id, aa.username, aa.access_level as access, aa.created_date as ctime FROM AlbumAccess aa, Albums a WHERE aa.album_id = a.album_id AND aa.album_id=:album_id AND (aa.username=:username OR a.owner=:username)",
        'SELECT_SHARED_ACCESS'          => "SELECT * FROM Albums a, AlbumAccess aa WHERE a.album_id = aa.album_id AND aa.username=:username",
        'SELECT_SHARED_ACCESS_FOR_USER' => "SELECT * FROM Albums a, AlbumAccess aa WHERE a.album_id = aa.album_id AND aa.username=:username AND a.owner = :owner",
        'INSERT_ALBUM_ACCESS'           => "INSERT INTO AlbumAccess (album_id, username, access_level, created_date) VALUES (:album_id, :username, :access, :created_date)",
        'UPDATE_ALBUM_ACCESS'           => "UPDATE AlbumAccess SET access_level=:access WHERE album_id=:album_id AND username=:username",
        'DELETE_ALBUM_ACCESS'           => "DELETE FROM AlbumAccess WHERE album_id=:album_id",
        'DELETE_ALBUM_ACCESS_FOR_USER'  => "DELETE FROM AlbumAccess WHERE album_id=:album_id AND username=:username",
    ];

    function __construct(){}

    /**
     * Get album access for specified albumId and username
     *
     * @param integer $albumId
     * @param string $username
     */
    function getAlbumAccess($albumId, $username = null) {
        $queryName       = 'SELECT_ALBUM_ACCESS';
        $bindVarNVTArray = [[':album_id', $albumId, PDO::PARAM_INT]];

        if (!empty($username)) {
            $queryName = 'SELECT_ALBUM_ACCESS_FOR_USER';

            array_push($bindVarNVTArray, [':username', $username, PDO::PARAM_STR]);
        }

        return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
    }

    /**
     * Get album access list for a specific user to a single owner's albums
     *
     * @param string $ownerUsername username of album owner
     * @param string $accessUsername username of user to get album access list for
     */
    function getSharedAccess($ownerUsername, $accessUsername = null) {
        if (!empty($accessUsername)) {
            $queryName       = 'SELECT_SHARED_ACCESS_FOR_USER';
            $bindVarNVTArray = [
                [':username', $accessUsername, PDO::PARAM_STR],
                [':owner', $ownerUsername, PDO::PARAM_STR],
            ];
        } else {
            $queryName       = 'SELECT_SHARED_ACCESS';
            $bindVarNVTArray = [[':username', $ownerUsername, PDO::PARAM_STR]];
        }

        return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
    }

    /**
     * Add a new album access for specified albumId and username
     *
     * @param integer $albumId
     * @param string $username
     * @param string $access
     */
    function addAlbumAccess($albumId, $username, $access) {
        $queryName       = 'INSERT_ALBUM_ACCESS';
        $bindVarNVTArray = [
            [':album_id', $albumId, PDO::PARAM_INT],
            [':username', $username, PDO::PARAM_STR],
            [':access',  $access, PDO::PARAM_STR],
            [':created_date', time(), PDO::PARAM_INT],
        ];

        return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
    }

    /**
     * Update an existing album access for specified albumId and username
     *
     * @param integer $albumId
     * @param string $username
     * @param string $access
     */
    function updateAlbumAccess($albumId, $username, $access) {
        $queryName       = 'UPDATE_ALBUM_ACCESS';
        $bindVarNVTArray = [
            [':album_id', $albumId, PDO::PARAM_INT],
            [':username', $username, PDO::PARAM_STR],
            [':access',  $access, PDO::PARAM_STR],
        ];

        return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
    }

    /**
     * Delete an album access for specified albumId and username
     *
     * @param integer $albumId
     * @param integer $username
     */
    function deleteAlbumAccess($albumId, $username=null) {
        $queryName       = 'DELETE_ALBUM_ACCESS';
        $bindVarNVTArray = [[':album_id', $albumId, PDO::PARAM_INT]];

        if (!empty($username)) {
            $queryName = 'DELETE_ALBUM_ACCESS_FOR_USER';

            array_push($bindVarNVTArray, [':username', $username, PDO::PARAM_STR]);
        }

        return $this->executeQuery(self::$queries[$queryName], $queryName, $bindVarNVTArray);
    }
}