<?php
/**
 * \file albumiteminfo.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/albumitem.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');

function getAlbumItemInfo($albumItemId) {
	$albumItem = getAlbumItem($albumItemId);
	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albumItem', print_r($albumItem,true));
	if (empty($albumItem)) {
		return false;
	}
	$path = isset($albumItem[0]['path']) ? $albumItem[0]['path'] : null;
	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'path', $path);
	$volInfo = getMediaVolumesInfo($path);
	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'volInfo', print_r($volInfo,true));
        if (empty($volInfo[0])) {
		throw new \Exception('Failed to get volumn info for ' . $path );
	}

	$volPath = $volInfo[0]['Path'];
	$dbPath  = $volInfo[0]['DbPath'];
	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'dbPath', $dbPath);

	$sql = "SELECT * FROM Files WHERE path = '".$path."'";

	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);

	$mediaDb = openMediaDb($dbPath);
	$dbaccess = new DBAccess();
	$rows = $dbaccess->executeQueryWithDb($mediaDb, $sql);
	closeMediaDb($mediaDb);

	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'rows', print_r($rows,true));

	if (empty($rows[0])) {
		return false;
	}
	$albumItemInfo = array(
		'album_item_id'		=> $albumItemId,
		'path'				=> $rows[0]['path'],
		'name'				=> $rows[0]['name'],
		'size'				=> $rows[0]['size'],
		'ctime'				=> @$rows[0]['created_time'], // Column doesn't exist in wdmc.Files
		'mtime'				=> $rows[0]['lastModifiedDate'],
		'last_updated_time'	=> $rows[0]['lastUpdatedDate'],
		'deleted'			=> $rows[0]['isDeleted'] == 1 ? 'true' : 'false',
	);
	return $albumItemInfo;
}