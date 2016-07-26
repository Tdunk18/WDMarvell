<?php
/**
 * \file album.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumitemsdb.inc');

function getAlbum($albumId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbum($albumId);
}

function getAlbums($albumId=null, $userId=null, $mediaType=null) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbums($albumId, $userId, $mediaType);
}

function getAlbumsWithAccessCount($albumId=null, $mediaType=null, $userId=null) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbumsWithAccessCount($albumId, $mediaType, $userId);
}

function getUserAlbum($albumId, $userId=null) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbum($albumId, $userId);
}

function getUserAlbumByName($name, $ownerId, $mediaType) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getUserAlbumByName($name, $ownerId, $mediaType);
}

function getAlbums2($userId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbums($userId);
}

function getAlbumsByMediaType($mediaType, $userId=null) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAlbumsByMediaType($mediaType, $userId);
}

function getAllAlbums() {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getAllAlbums();
}

function getOneAlbum($albumId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->getOneAlbum($albumId);
}

function createAlbum($ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration) {
	$albumsDb = new AlbumsDB();
	$albumId = $albumsDb->createAlbum($ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration);
	return $albumId;
}

function updateAlbum($albumId, $ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->updateAlbum($albumId, $ownerId, $name, $description, $backgroundColor, $backgroundImage, $previewImage, $slideShowDuration, $slideShowTransition, $mediaType, $expiration);
}

function deleteAlbum($albumId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->deleteAlbum($albumId);
}

function isAlbumAccessible($albumId, $isWriteRequested=null) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->isAlbumAccessible($albumId, $isWriteRequested);
}

function isAlbumValid($albumId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->isAlbumValid($albumId);
}

function isAlbumOwner($albumId, $userId) {
	$albumsDb = new AlbumsDB();
	return $albumsDb->isAlbumOwner($albumId, $userId);
}