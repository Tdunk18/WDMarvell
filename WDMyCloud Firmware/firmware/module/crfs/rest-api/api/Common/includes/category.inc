<?php
/**
 * \file common\category.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

function getCategoryId($mediaType) {
	$mediaType  = strtolower(trim($mediaType));
	$mediaTypes = array('videos', 'music', 'photos', 'other');
	for ($i=0; $i < count($mediaTypes); $i++) {
		if ($mediaType == $mediaTypes[$i]) {
			break;
		}
	}
	$categoryId = $i < count($mediaTypes) ? ($i + 1) : null;
	return $categoryId;
}

function getCategoryIdArray($mediaTypeArray) {
	$ret = array();
	$mediaTypes = array('videos' => 1, 'music' =>2, 'photos' =>3, 'other' => 4);
	if (empty($mediaTypeArray)) {
		$ret = array_values($mediaTypes);
	}
	foreach ($mediaTypeArray as $typeElem) {
		$typeElem = strtolower(trim($typeElem));
		if ($mediaTypes[$typeElem] > 0 ) {
			$ret[]= $mediaTypes[$typeElem];
		}
	}

	return $ret;
}

function getMediaType($categoryId) {
	return MediaTypeEnum::getCategoryName($categoryId);
}

function getCategoryId2($category) {
	$category   = strtolower($category);
	$categories = array('videos', 'music', 'photos', 'other');
	$categoryId = 0;
	foreach($categories as $cat) {
		$categoryId++;
		if ($cat == $category) {
			break;
		}
	}
	$categoryId = $categoryId >= 1 && $categoryId <= count($categories) ? $categoryId : null;
	return $categoryId;
}

/*
 * query result map
 */
class MediaTypeEnum {

	//array(1=>'videos', 2=> 'music', 3=>'photos', 4=>'other');
	//IMPORTANT: has to be declared in enumerating order
	const VIDEO  = "videos";
	const MUSIC  = "music";
	const PHOTOS = "photos";
	const OTHER  = "other";

	private static $enums = array();
	private static $lookupName = array();
	private static $lookupId = array();

	public static function getEnums() {
		if (empty(self::$enums)) {
			$refl = new ReflectionClass('MediaTypeEnum');
			self::$enums = array_values($refl->getConstants());
			$index = 1;
			foreach(self::$enums as $enum) {

				self::$lookupId[$enum] = $index;
				self::$lookupName[$index] = $enum;
				$index++;
			}
		}
		return self::$enums;
	}

	public static function getCategoryId($enum) {
		$lookup = self::$lookupId[$id];
		if ($lookup) {
			return $lookup;
		}

		return -1;
	}

	public static function getCategoryName($id) {
		$lookup = self::$lookupName[$id];
		if ($lookup) {
			return $lookup;
		}

		return -1;
	}

	function getCategoryIdArray($mediaTypeArray) {
		$ret = array();
		$mediaTypes = self::$lookupId;

		foreach ($mediaTypeArray as $typeElem) {
			$typeElem = strtolower(trim($typeElem));
			if ($mediaTypes[$typeElem] > 0 ) {
				$ret[]= $mediaTypes[$typeElem];
			}
		}

		return $ret;
	}
}

//static initializer
MediaTypeEnum::getEnums();