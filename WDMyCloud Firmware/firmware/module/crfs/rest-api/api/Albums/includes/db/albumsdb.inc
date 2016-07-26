<?php

/**
 * \file db\albumsdb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

class AlbumsDB extends DBAccess {

    function __construct() {

    }

    /**
     * Get an album of specified id
     *
     * @param integer $albumId
     * @param integer $username
     */
    function getAlbum($albumId, $username = null) {
        $sql = "SELECT *
				FROM Albums
				WHERE album_id = :album_id";
        if (!empty($username)) {
            $sql .= " AND owner = :username";
            $bindVarNVTArray = array(
                array(':album_id', $albumId, PDO::PARAM_INT),
                array(':username', $username, PDO::PARAM_STR),
            );
        } else {
            $bindVarNVTArray = array(
                array(':album_id', $albumId, PDO::PARAM_INT)
            );
        }
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $album = $this->executeQuery($sql, 'GET_ALBUM', $bindVarNVTArray);
        return $album;
    }

    /**
     * Get albums owned by specified user
     *
     * @param integer $username
     */
    function getOwnerAlbums($username, $albumId = null) {
        $sql = "SELECT *
				FROM Albums
				WHERE owner = :username";
        if (!empty($albumId)) {
            $sql .= " AND album_id = :album_id";
            $bindVarNVTArray = array(
                array(':username', $username, PDO::PARAM_STR),
                array(':album_id', $albumId, PDO::PARAM_INT),
            );
        } else {
            $bindVarNVTArray = array(
                array(':username', $username, PDO::PARAM_STR),
            );
        }
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $albums = $this->executeQuery($sql, 'GET_OWNER_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     * Returns albums of which user has access
     *
     * @param integer $albumId
     * @param string  $mediaType
     * @param integer $username
     */
    function getAlbums($albumId = null, $username = null, $mediaType = null) {
        //$sql = "SELECT album_id,owner,name,description,slide_show_duration,slide_show_transition,media_type,created_date AS ctime,expired_date AS expiration_time FROM Albums WHERE album_id > :zero";
        //$sql  = "SELECT a.album_id,a.owner,a.name,a.description,a.slide_show_duration,a.slide_show_transition,a.media_type,count(ai.album_item_id) AS album_item_count,a.created_date AS ctime,a.expired_date AS expiration_time FROM Albums a";
        //$sql .= " LEFT JOIN AlbumItems  ai ON ai.album_id = a.album_id";

        $sql = "SELECT a.album_id,a.owner,a.name,a.description,a.slide_show_duration,a.slide_show_transition,a.media_type,count(aa.album_id) AS album_access_count,a.created_date AS ctime,a.expired_date AS expiration_time";
        $sql .= " FROM Albums a";
        $sql .= " LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id";
        $sql .= " WHERE a.album_id > 0";

        //$bindVarNVTArray = array(':zero', 0, PDO::PARAM_INT);

        $bindVarNVTArray = null;

        if (!empty($albumId)) {
            $sql .= " AND a.album_id = :album_id";
            //$bindVarNVTArray = array_merge($bindVarNVTArray, array(':album_id', $albumId, PDO::PARAM_INT));
            $bindVarNVTArray[] = array(':album_id', $albumId, PDO::PARAM_INT);
        }
        if (!empty($username)) {
            $sql .= " AND (a.owner = :username OR aa.username = :username)";
            //$bindVarNVTArray = array_merge($bindVarNVTArray, array(':username', $username, PDO::PARAM_INT));
            $bindVarNVTArray[] = array(':username', $username, PDO::PARAM_STR);
        }
        if (!empty($mediaType)) {
            $sql .= " AND a.media_type = :media_type";
            //$bindVarNVTArray = array_merge($bindVarNVTArray, array(':media_type', $mediaType, PDO::PARAM_STR));
            $bindVarNVTArray[] = array(':media_type', $mediaType, PDO::PARAM_STR);
        }
        $sql .= " GROUP BY a.album_id";

        $rows = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));

        $rows = $this->convertRows($rows);
        return $rows;
    }

    /**
     * Returns albums of which user has access
     *
     * @param integer $albumId
     * @param string  $mediaType
     * @param integer $username
     */
    function getUserAlbums($albumId = null, $mediaType = null, $username = null) {
        $sql = "SELECT DISTINCT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					count(ai.album_item_id) AS album_item_count,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id
				LEFT JOIN AlbumItems  ai ON ai.album_id = a.album_id
				WHERE a.album_id > 0";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        $bindVarNVTArray = null;

        if (!empty($albumId)) {
            $sql .= " AND a.album_id = :album_id";
            $bindVarNVTArray[] = array(':album_id', $albumId, PDO::PARAM_INT);
        }

        if (!empty($mediaType)) {
            $sql .= " AND a.media_type = :media_type";
            $bindVarNVTArray[] = array(':media_type', $mediaType, PDO::PARAM_STR);
        }

        if (!empty($username)) {
            $sql .= " AND (aa.username = :username OR a.owner = :username)";
            $bindVarNVTArray[] = array(':username', $username, PDO::PARAM_INT);
        }

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'SQL', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));

        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        $albums = $this->convertRows($albums);
        return $albums;
    }

    /**
     * Returns albums of which user has access
     *
     * @param integer $albumId
     * @param string  $mediaType
     * @param integer $username
     */
    function getAlbumsWithAccessCount($albumId = null, $mediaType = null, $username = null) {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					count(ai.album_item_id) AS album_item_count,
					count(aa.album_id) AS album_access_count,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id
				LEFT JOIN AlbumItems  ai ON ai.album_id = a.album_id
				WHERE a.album_id > 0";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        $bindVarNVTArray = null;

        if (!empty($albumId)) {
            $sql .= " AND a.album_id = :album_id";
            $bindVarNVTArray[] = array(':album_id', $albumId, PDO::PARAM_INT);
        }

        if (!empty($mediaType)) {
            $sql .= " AND a.media_type = :media_type";
            $bindVarNVTArray[] = array(':media_type', $mediaType, PDO::PARAM_STR);
        }

        if (!empty($username)) {
            $sql .= " AND (aa.username = :username OR a.owner = :username)";
            $bindVarNVTArray[] = array(':username', $username, PDO::PARAM_STR);
        }

        $sql .= " GROUP BY aa.album_id";

        $rows = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'SQL', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));

        $rows = $this->convertRows($rows);
        return $rows;
    }

    /**
     * Returns albums which contain file path
     *
     * @param string  $filePath
     * @param integer $albumId
     */
    function getAlbumsWithFile($filePath, $username = null, $albumId = null) {
        $origPath = $filePath;
        $filePath = uiToMediaPath($filePath);
        $sql = "SELECT DISTINCT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumItems  ai ON ai.album_id = a.album_id
				LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id
				WHERE ai.path = :file_path";

        if (empty($username) && empty($albumId)) {
            $bindVarNVTArray = array(
                array(':file_path', $filePath, PDO::PARAM_STR),
            );
        } else if (!empty($username) && empty($albumId)) {
            $bindVarNVTArray = array(
                array(':file_path', $filePath, PDO::PARAM_STR),
                array(':username', $username, PDO::PARAM_INT),
            );
            $sql .= " AND (a.owner = :username OR aa.username = :username)";
        } else if (empty($username) && !empty($albumId)) {
            $sql .= " AND a.album_id = :album_id";
            $bindVarNVTArray = array(
                array(':file_path', $filePath, PDO::PARAM_STR),
                array(':album_id', $albumId, PDO::PARAM_INT),
            );
        } else {
            $sql .= " AND (a.owner = :username OR aa.username = :username)";
            $sql .= " AND a.album_id = :album_id";
            $bindVarNVTArray = array(
                array(':file_path', $filePath, PDO::PARAM_STR),
                array(':username', $username, PDO::PARAM_INT),
                array(':album_id', $albumId, PDO::PARAM_INT),
            );
        }

        //$sql .= " ORDER BY a.album_id";

        $rows = $this->executeQuery($sql, 'GET_ALBUMS_WITH_FILE', $bindVarNVTArray);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));

        $rows = $this->convertRows($rows);
        return $rows;
    }

    /**
     * Returns album by name
     *
     * @param string  $albumName
     * @param integer $username
     */
    function getUserAlbumByName($name, $username = null, $mediaType = null) {
        $sql = "SELECT *
				FROM Albums a
				WHERE a.name = :name";
        $prepKey = 'GET_ALBUMS';
        $bindVarNVTArray = array();

        $bindVarNVTArray [] = array(':name', $name, PDO::PARAM_STR);
        if (!empty($username)) {
            $sql .= " AND a.owner = :owner";
            $prepKey .= "_USER";
            $bindVarNVTArray [] = array(':owner', $username, PDO::PARAM_INT);
        }

        if (!empty($mediaType)) {
            $sql .= " AND a.media_type like :media_type";
            $prepKey .= "_CATEGORY";
            $bindVarNVTArray [] = array(':media_type', $username, PDO::PARAM_STR);
        }

        $sql .= " ORDER BY a.owner";

        $albums = $this->executeQuery($sql, $prepKey, $bindVarNVTArray);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albums', print_r($albums,true));

        return $albums;
    }

    /**
     * Returns albums of which user has access
     *
     * @param integer $username
     */
    function getAlbumAccess($albumId = null, $username = null, $mediaType = null) {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
					aa.album_id,
					aa.username,
					aa.access_level
				FROM AlbumAccess aa, Albums a
				WHERE aa.album_id = a.album_id";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        if (!empty($albumId)) {
            $sql .= " AND aa.album_id = a.album_id";
        }

        if (!empty($username)) {
            $sql .= " AND aa.username = :username OR a.owner = :username";
        }

        if (!empty($mediaType)) {
            $sql .= " AND a.media_type = :media_type";
        }

        $bindVarNVTArray = array(
            array(':username', $username, PDO::PARAM_INT)
        );
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     * Returns albums user has access
     *
     * @param integer $username
     */
    function getAlbums22($username) {
        $sql = "SELECT DISTINCT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id
				WHERE aa.username = :username OR a.owner = :username";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        $bindVarNVTArray = array(
            array(':username', $username, PDO::PARAM_INT)
        );
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     * Returns albums user has access by specified media type
     *
     * @param string  $mediaType
     * @param integer $username
     */
    function getAlbumsByMediaType($mediaType, $username) {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumAccess aa ON aa.album_id = a.album_id
				WHERE a.media_type = :media_type";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        if (!empty($username)) {
            $sql .= " AND (aa.username = :username OR a.owner = :username)";
            $bindVarNVTArray = array(
                array(':username', $username, PDO::PARAM_INT),
                array(':media_type', $mediaType, PDO::PARAM_INT)
            );
        } else {
            $bindVarNVTArray = array(
                array(':media_type', $mediaType, PDO::PARAM_INT)
            );
        }
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $albums = $this->executeQuery($sql, 'GET_ALBUMS_BY_CATEGORY', $bindVarNVTArray);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albums', print_r($albums,true));
        return $albums;
    }

    /**
     * Returns all albums
     */
    function getAllAlbums() {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        $bindVarNVTArray = null;
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     * Returns one albums
     */
    function getOneAlbum($albumId) {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				WHERE a.album_id = :album_id";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        $bindVarNVTArray = array(
            array(':album_id', $albumId, PDO::PARAM_INT)
        );
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     * Returns info about an album
     */
    function getAlbumInfo($albumId) {
        $sql = "SELECT
					a.album_id,
					a.owner,
					a.name,
					a.description,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				WHERE a.album_id = :album_id";

        /* Comment-out for future use
          a.background_color,
          a.background_image,
          a.preview_image,
         */

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        $bindVarNVTArray = array(
            array(':album_id', $albumId, PDO::PARAM_INT)
        );
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        return $albums;
    }

    /**
     *
     * @param $userName
     * @param $name
     * @param $description
     * @param $bkgdImage
     * @param $bkgdColor
     * @param $expireDate
     * @param $creationDate
     * @param $size
     * @param $readonly
     * @param $previewImage
     * @param $categoryId
     */
    function createAlbum($ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration) {
        if ($expiration == '0')
            $expiration = '';
        $ctime = time();
        $sql = "INSERT INTO Albums (
					owner,
					name,
					description,
					background_color,
					background_image,
					preview_image,
					slide_show_duration,
					slide_show_transition,
					media_type,
					created_date,
					expired_date
				) VALUES (
					:owner,
					:name,
					:description,
					:background_color,
					:background_image,
					:preview_image,
					:slide_show_duration,
					:slide_show_transition,
					:media_type,
					:ctime,
					:expiration
				)";
        $bindVarNVTArray = array(
            array(':owner', $ownerId, PDO::PARAM_INT),
            array(':name', $name, PDO::PARAM_STR),
            array(':description', $description, PDO::PARAM_STR),
            array(':background_color', $backgroundColor, PDO::PARAM_STR),
            array(':background_image', $backgroundImage, PDO::PARAM_STR),
            array(':preview_image', $previewImage, PDO::PARAM_STR),
            array(':slide_show_duration', $slideShowDuration, PDO::PARAM_INT),
            array(':slide_show_transition', $slideShowTransition, PDO::PARAM_STR),
            array(':media_type', $mediaType, PDO::PARAM_STR),
            array(':ctime', $ctime, PDO::PARAM_INT),
            array(':expiration', $expiration, PDO::PARAM_INT),
        );
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        return $this->executeInsert($sql, 'INSERT_ALBUM', $bindVarNVTArray);
    }

    /**
     *
     * @param $albumId
     * @param $name
     * @param $description
     * @param $bkgdImage
     * @param $bkgdColor
     * @param $expiredDate
     * @param $previewImage
     */
    function updateAlbum($albumId, $ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration) {
        $sql = "UPDATE Albums SET";
        $colAdded = false;
        $colArray = $this->addColumnToUpdateSQL('album_id', getSafeDatabaseText($albumId), $sql, $colAdded);
        if (!empty($ownerId))
            $colArray = $this->addColumnToUpdateSQL('owner', getSafeDatabaseText($ownerId), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($name))
            $colArray = $this->addColumnToUpdateSQL('name', getSafeDatabaseText($name), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($description))
            $colArray = $this->addColumnToUpdateSQL('description', getSafeDatabaseText($description), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($backgroundColor))
            $colArray = $this->addColumnToUpdateSQL('background_color', getSafeDatabaseText($backgroundColor), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($backgroundImage))
            $colArray = $this->addColumnToUpdateSQL('background_image', getSafeDatabaseText($backgroundImage), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($previewImage))
            $colArray = $this->addColumnToUpdateSQL('preview_image', getSafeDatabaseText($previewImage), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($slideShowDuration))
            $colArray = $this->addColumnToUpdateSQL('slide_show_duration', getSafeDatabaseText($slideShowDuration), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($slideShowTransition))
            $colArray = $this->addColumnToUpdateSQL('slide_show_transition', getSafeDatabaseText($slideShowTransition), $colArray['sql'], $colArray['isColAdded']);
        if (!empty($mediaType))
            $colArray = $this->addColumnToUpdateSQL('media_type', getSafeDatabaseText($mediaType), $colArray['sql'], $colArray['isColAdded']);

        if (!empty($expiration)) {
            $expiration = $expiration !== '0' ? $expiration : '';
            $colArray = $this->addColumnToUpdateSQL('expired_date', getSafeDatabaseText($expiration), $colArray['sql'], $colArray['isColAdded']);
        }
        $albumId = getSafeDatabaseText($albumId);
        $sql = $colArray['sql'] . " WHERE album_id = $albumId";
        $status = $this->executeUpdate($sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'status', $status);
        if ($status < 1) {
            return false;
        }
        return true;
    }

    /**
     *
     * @param $albumId
     */
    function deleteAlbum($albumId) {
        $sql = "DELETE FROM Albums
				WHERE album_id = :album_id";
        $bindVarNVTArray = array(
            array(':album_id', $albumId, PDO::PARAM_INT)
        );
        return $this->executeDelete($sql, 'DELETE_ALBUM', $bindVarNVTArray);
    }

    /**
     *
     * @param $albumId
     */
    function isAlbumAccessible($albumId, $isWriteRequested = null) {
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumId', print_r($albumId,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'isWriteRequested', print_r($isWriteRequested,true));
        $sessionUserId = getSessionUserId();
        $sql = "SELECT *
				FROM AlbumAccess
				WHERE album_id = :album_id AND username = :username";
        $bindVarNVTArray = array(
            array(':album_id', $albumId, PDO::PARAM_INT),
            array(':username', $sessionUserId, PDO::PARAM_STR),
        );
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
        $results = $this->executeQueryAndFetchOneRow($sql, 'GET_ALBUM_SHARE', $bindVarNVTArray);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'isAdmin', print_r($results,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'access_level', print_r($results['access_level'],true));
        if ($results['access_level'] === 'RW') {
            return true;
        } else if ($results['access_level'] === 'RO' && !$isWriteRequested) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param $username
     * @param $albumId
     */
    function isAlbumOwner($albumId, $username) {
        $sql = "SELECT count(*)
				FROM Albums
				WHERE album_id=:album_id AND owner=:username";
        $bindVarNVTArray = array(
            array(':album_id', $albumId, PDO::PARAM_INT),
            array(':username', $username, PDO::PARAM_INT),
        );
        $results = $this->executeQueryAndFetchOneRow($sql, 'IS_ALBUM_OWNER', $bindVarNVTArray);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'isAdmin', print_r($results,true));
        if (isset($results[0]) and $results[0] > 0) {
            return true;
        }
        return false;
    }

    /**
     *
     * @param $albumId
     */
    function isAlbumValid($albumId) {
        $sql = "SELECT *
				FROM Albums
				WHERE album_id = :albumId";
        $bindVarNVTArray = array(array(':albumId', $albumId, PDO::PARAM_INT));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albums', print_r($albums,true));
        $albums = $this->executeQuery($sql, 'GET_ALBUMS', $bindVarNVTArray);
        if (!isset($albums[0])) {
            return false;
        }
        return true;
    }

    /**
     *
     * @param array $albums
     */
    function convertRows($albums) {
        for ($i = 0; $i < count($albums); $i++) {
            $expiration_time = $albums[$i]['expiration_time'];
            $current_time = time();
            $total_time = $expiration_time - $current_time;
            $expiration_days = ceil($total_time / (60 * 60 * 24));
            if (!empty($albums[$i]['expiration_time'])) {
                $albums[$i]['expiration_days'] = $expiration_days > 0 ? $expiration_days : 0;
            } else {
                $albums[$i]['expiration_days'] = '';
            }
            $albums[$i]['current_time'] = $current_time;
        }
        return $albums;
    }

}