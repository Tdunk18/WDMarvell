<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model\Db\Album;
use Core\Logger;
use Auth\User\UserManager;

/**
 * Description of ItemMapper
 *
 * @author gabbert_p
 */
class ItemMapper extends \Db\Access {

    /**
     * List of used queries for the Album class. Parameter names should match the mapper() data within the Album class.
     *
     * @var array
     */
    protected static $queries = array(
        'GET_ITEMS' => "SELECT ai.*
            FROM AlbumItems ai
            WHERE album_id = :album_id",
    );

    public static function getItems($albumId) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (albumId=".var_export($albumId, true).")");
        $bind = array('album_id' => $albumId);

        $sql = self::$queries['GET_ITEMS'];
        $userSecurity = \Auth\User\UserSecurity::getInstance();
        $sessionUsername = $userSecurity->getSessionUsername();
        if (!isAdmin($sessionUsername)) {
            $bind['username'] = $sessionUsername;
            $sql .= " AND ( SELECT share_name FROM UserShareAccess sa WHERE sa.username = :username
                                AND (s.public_access = 'true' OR sa.access_level != 'NA') )";
        }

        /* Still having to add in extra ... */
        $sql .= \PHP_EOL . ' ORDER BY item_order ASC';

        $stmnt = self::getInstance()->query($sql, $bind);
        Logger::getInstance()->info($stmnt);

        $itemList = new \Albums\Model\AlbumList();
        while ( ($row = $stmnt->fetchObject('\Albums\Model\Album\Item' )) == true ) {
            $itemList[$row->getId()] = $row;
        }

        return $itemList;
    }

}

