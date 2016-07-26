<?php
/**
 * \file db\albuminfodb.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(DB_ROOT . '/includes/dbaccess.inc');

/**
 *
 *
 */
class AlbumInfoDB extends DBAccess {

	function __construct(){}

	/**
	 * Returns info about an album
	 */
	function getAlbumInfo($albumId) {
		$sql = "SELECT a.album_id,
					a.owner,
					a.name,
					a.description,
					a.background_color,
					a.background_image,
					a.preview_image,
					a.slide_show_duration,
					a.slide_show_transition,
					a.media_type,
					count(ai.album_item_id) AS album_item_count,
					a.created_date AS ctime,
					a.expired_date AS expiration_time
				FROM Albums a
				LEFT JOIN AlbumItems ai ON ai.album_id = a.album_id
				WHERE a.album_id = :album_id";
		$bindVarNVTArray = array(
			array(':album_id', $albumId, PDO::PARAM_INT),
		);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sql', $sql);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'bindVarNVTArray', print_r($bindVarNVTArray,true));
		$albums = $this->executeQuery($sql, 'GET_ALBUM_INFO', $bindVarNVTArray);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'albums', print_r($albums,true));
		$album = isset($albums[0]) ? $albums[0] : false;
		$albums = $this->convertRows(array($album));
		$album = isset($albums[0]) ? $albums[0] : false;
		return $album;
	}

	/**
	 *
	 * @param array $albums
	 */
	function convertRows($albums) {
		for ($i=0; $i < count($albums); $i++) {
			$expiration_time = $albums[$i]['expiration_time'];
			$current_time    = time();
			$total_time      = $expiration_time - $current_time;
			$expiration_days = ceil($total_time / (60*60*24));
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