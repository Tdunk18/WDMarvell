<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model\Db;

use Core\Logger;

/**
 * Description of Album
 *
 * @author gabbert_p
 */
class AlbumMapper extends \Db\Access {

    /**
     * List of used queries for the Album class. Parameter names should match the mapper() data within the Album class.
     *
     * @var array
     */
    protected static $queries = array(
        'GET_ALBUM' => 'SELECT * FROM Albums WHERE album_id = :id',
        'GET_ALBUM_BY_NAME' => 'SELECT * FROM Albums WHERE name = :name',
        'GET_ALBUMS' => 'SELECT a.*, count(ai.album_item_id) as albums_item_count
                            FROM Albums a
                             LEFT JOIN AlbumItems ai ON ai.album_id = a.album_id
                            WHERE a.album_id > 0',
    );

    /**
     * Attempts to retrieve an album from the database.
     *
     * @param int $id
     * @return \Albums\Model\Album|null
     */
    static public function loadById($id, $params = array()) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (id='{$id}', params=" . var_export($params, true) . ")");

        list($sql, $bind) = self::_updateStatement(self::$queries['GET_ALBUM'], $params);
        $bind['id'] = $id;

        $row = self::getInstance()->query($sql, $bind);

        if (empty($row)) {
            return null;
        }

        return $row->fetchObject('\Albums\Model\Album');
    }

    /**
     *
     * @param type $name
     * @param type $owner
     * @param type $mediaType
     * @return \Albums\Model\Album|nyll
     */
    static public function loadByName($name, $owner = null, $mediaType = null) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (name='{$name}', owner='{$owner}', mediaType='{$mediaType}')");

        list($sql, $bind) = self::_updateStatement(self::$queries['GET_ALBUM_BY_NAME'], array('owner' => $owner,
                    'media_type' => $mediaType));
        $bind['name'] = $name;

        $row = self::getInstance()->query($sql, $bind);

        if (empty($row)) {
            return null;
        }

        return $row->fetchObject('\Albums\Model\Album');
    }

    /**
     *
     * @return \Albums\Model\AlbumList
     */
    static public function getAlbums($params) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($params, true) . ")");

        list($sql, $bind) = self::_updateStatement(self::$queries['GET_ALBUMS'], $params);
        $sql .= \PHP_EOL . ' GROUP BY a.album_id';

        $stmnt = self::getInstance()->query($sql, $bind);

        $albumList = new \Albums\Model\AlbumList();
        while (($row = $stmnt->fetchObject('\Albums\Model\Album')) == true) {
            $albumList[$row->getId()] = $row;
        }

        return $albumList;
    }

    static public function add(\Albums\Model\Album $album) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($album, true) . ")");

        $insertStatement = <<<EOT
            INSERT INTO Albums (
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
                    :created_date,
                    :expired_date
                )
EOT;

        self::getInstance()->query($insertStatement, array(
            'owner' => $album->getOwner(),
            'name' => $album->getName(),
            'description' => $album->getDescription(),
            'background_color' => $album->getBackgroundColor(),
            'background_image' => $album->getBackgroundImage(),
            'preview_image' => $album->getPreviewImage(),
            'slide_show_duration' => $album->getSlideShowDuration(),
            'slide_show_transition' => $album->getSlideShowTransition(),
            'media_type' => $album->getMediaType(),
            'created_date' => $album->getCreatedDate('c'),
            'expired_date' => $album->getExpiredDate('c'),
        ));

        $album->setId(self::$db->lastInsertId());

        return $album;
    }

    static public function update(\Albums\Model\Album $album) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($album, true) . ")");

        $insertStatement = <<<EOT
            UPDATE Albums SET
                    owner = :owner,
                    name = :name,
                    description = :description,
                    background_color = :background_color,
                    background_image = :background_image,
                    preview_image = :preview_image,
                    slide_show_duration = :slide_show_duration,
                    slide_show_transition = :slide_show_transition,
                    media_type = :media_type,
                    created_date = :created_date,
                    expired_date = :expired_date
                WHERE
                    album_id = :album_id
EOT;

        self::getInstance()->query($insertStatement, array(
            'album_id' => $album->getId(),
            'owner' => $album->getOwner(),
            'name' => $album->getName(),
            'description' => $album->getDescription(),
            'background_color' => $album->getBackgroundColor(),
            'background_image' => $album->getBackgroundImage(),
            'preview_image' => $album->getPreviewImage(),
            'slide_show_duration' => $album->getSlideShowDuration(),
            'slide_show_transition' => $album->getSlideShowTransition(),
            'media_type' => $album->getMediaType(),
            'created_date' => $album->getCreatedDate('c'),
            'expired_date' => $album->getExpiredDate('c'),
        ));

        return $album;
    }

    /**
     *
     * @param mixed $album Album ID or Album object
     */
    static public function delete($album) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($album, true) . ")");
        
        return self::getInstance()->query('DELETE FROM Albums WHERE album_id = :album_id', array('album_id' => is_object($album) ? $album->getId() : (int) $album));
    }

    /**
     * Updates a SQL statement with common bind parameters:
     *  - owner from param 'username'
     *  - media_type from param 'media_type'
     *
     * Returns array of SQL and bind parameters:
     *  - list($sql, $bind) = self::_updateStatement($sql, $params);
     *
     * @param string $sql
     * @param array $params
     * @return array
     */
    static protected function _updateStatement($sql, $params) {

        $bind = array();
        if (!empty($params['owner'])) {
            $sql .= ' AND owner = :owner';
            $bind['owner'] = $params['owner'];
        }

        if (!empty($params['media_type'])) {
            $sql .= ' AND media_type = :media_type';
            $bind['media_type'] = $params['media_type'];
        }

        return array($sql, $bind);
    }

}

