<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model\Db\Album;

use Core\Logger;

/**
 * Description of ItemMapper
 *
 * @author gabbert_p
 */
class AccessMapper extends \Db\Access {

    const READ_WRITE = 'RW';
    const READ_ONLY = 'RO';
    const NOT_AUTHORIZED = 'NA';

    static public $accessLabels = array(
        self::READ_WRITE => 'Read/Write',
        self::READ_ONLY => 'Read Only',
        self::NOT_AUTHORIZED => 'Not Authorized',
    );

    static public function add(\Albums\Model\Album\Access $access) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($access, true) . ")");

        $insertStatement = <<<EOT
            INSERT INTO AlbumAccess (
                    album_id,
					username,
					access_level,
					created_date
				) VALUES (
					:album_id,
					:username,
					:access_level,
					:created_date
                )
EOT;

        self::getInstance()->query($insertStatement, array(
            'album_id' => $access->getAlbumId(),
            'username' => $access->getUsername(),
            'access_level' => $access->getAccessLevel(),
            'created_date' => $access->getCreatedDate('c'),
        ));

        return $access;
    }

    /**
     * Deletes records from the AlbumAccess table, based on supplied parameters.
     *
     * @param mixed $access  Album ID, AccessList or single Access object.
     * @return int Total number of records deleted.
     */
    static public function delete($access) {
        Logger::getInstance()->info(__METHOD__ . " PARAMS: (" . var_export($access, true) . ")");

        $delete = array();
        if (ctype_digit((string) $access)) {
            $delete[] = array('album_id' => (int) $access);
        } elseif ($access instanceof \Albums\Model\Album\Access) {
            $delete[] = array('album_id' => $access->getAlbumId(),
                'username' => $access->getUsername());
        } elseif ($access instanceof \Albums\Model\AlbumList) {
            foreach ($access as $a) {
                $delete[] = array('album_id' => $a->getAlbumId(),
                    'username' => $a->getUsername());
            }
        }


        /* If it's an object, we'll always have the 'username' component.
         *   Else, we're always be deleting all Album access by just the album id
         */
        $stmnt = is_object($access) ? self::$db->prepare('DELETE FROM AlbumAccess WHERE album_id = :album_id AND username = :username')
                : self::$db->prepare('DELETE FROM AlbumAccess WHERE album_id = :album_id');
        /* @var $stmnt \PDOStatement */

        $totalAffected = 0;
        foreach ($delete as $row) {
            $totalAffected += $stmnt->execute($row);
        }

        return $totalAffected;
    }

}

