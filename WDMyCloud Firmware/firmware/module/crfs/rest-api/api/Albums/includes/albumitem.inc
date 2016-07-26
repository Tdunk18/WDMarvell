<?php
/**
 * \file albumitem.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumitemsdb.inc');

function getAlbumItem($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	$albumItem = $albumItemsDb->getAlbumItem($albumItemId);
	return $albumItem;
}

function getAlbumItems($albumId) {
	$albumItemsDb = new AlbumItemsDB();
	$albumItems = $albumItemsDb->getAlbumItems($albumId);
	return $albumItems;
}

function getAlbumItemByPath($albumId, $path) {
	$albumItemsDb = new AlbumItemsDB();
	$albumItem = $albumItemsDb->getAlbumItemByPath($albumId, $path);
	return $albumItem;
}

function getAlbumId($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->getAlbumId($albumItemId);
}

function getFilePath($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->getFilePath($albumItemId);
}

function createAlbumItem($albumId, $path, $itemOrder=null) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->createAlbumItem($albumId, $path, $itemOrder);
}

function updateAlbumItem($albumItemId, $itemOrder) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->updateAlbumItem($albumItemId, $itemOrder);
}

function deleteAlbumItem($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->deleteAlbumItem($albumItemId);
}

function isAlbumItemAccessible($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->isAlbumItemAccessible($albumItemId);
}

function isAlbumItemValid($albumItemId) {
	$albumItemsDb = new AlbumItemsDB();
	return $albumItemsDb->isAlbumItemValid($albumItemId);
}

/**
 * Verifies a user's permission to access the requested AlbumItem and then serves the data from that AlbumItem.
 * @param integer $albumItemId Primary key of the album_item table in the SQLite database which identifies an individual
 * item within an album.
 * @return no return value
 */
function readFileFromAlbumItem($albumItemId, $transcodingType) {
        \Core\Logger::getInstance()->info(__METHOD__ . " PARAMS: (id='{$albumItemId}', transcoding='{$transcodingType}')");

	$albumItemsDb = new AlbumItemsDB();

	//determine whether the user has access to this albumItem
	if(!$albumItemsDb->isAlbumItemAccessible($albumItemId)) {
		throw new Exception('USER_NOT_AUTHORIZED', 401);
	}

	//find the absolute path to this file's contents from the DB
	$filePath = $albumItemsDb->getFilePath($albumItemId);

	if(empty($filePath) || !file_exists($filePath)) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'FILE_NOT_FOUND: filePath', $filePath);
		throw new Exception('FILE_NOT_FOUND', 404);
	}

	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'filePath', $filePath);

	readFileFromPathNew($filePath, $transcodingType);
}