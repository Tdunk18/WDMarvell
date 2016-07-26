<?php
/**
 * \file social\youtubeapi.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class YoutubeAPI {

	private $dev_key;
	private $dev_secret;

	/* Class constructor.
	 */
	public function __construct() {
		$this->dev_key = '';
		$this->dev_secret = '';
	}

	/* Upload photo to Facebook.
	 * @param string $file
	 */
	public function upload($file) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'file', $file);
		return true;
	}
}