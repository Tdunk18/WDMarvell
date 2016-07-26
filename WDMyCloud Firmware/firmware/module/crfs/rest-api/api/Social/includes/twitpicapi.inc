<?php
/**
 * \file social\twitpicapi.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class TwitpicAPI {

	private $username;
	private $password;

	/* Class constructor.
	 */
	public function __construct($username=null, $password=null) {
		$this->username = $username;
		$this->password = $password;
	}

	/* Upload photo to Twitpic.
	 * @param string $file
	 */
	public function upload($file) {
		$postfields             = array();
		$postfields['username'] = $this->username;
		$postfields['password'] = $this->password;
		$postfields['media']    = "@$file";
		$twitter_url            = 'http://twitpic.com/api/upload';
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_BINARYTRANSFER, 1);
		curl_setopt($curl, CURLOPT_URL, $twitter_url);
		curl_setopt($curl, CURLOPT_POST, 3);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $postfields);
		$results = curl_exec($curl);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'results', print_r($results,true));
		curl_close($curl);
		$login_xml = new SimpleXMLElement($results);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'login_xml', print_r($login_xml,true));
		$status = true;
		return $status;
	}
}