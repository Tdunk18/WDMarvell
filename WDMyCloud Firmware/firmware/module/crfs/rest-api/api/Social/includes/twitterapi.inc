<?php
/**
 * \file social\twitterapi.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class TwitterAPI {

	private $username;
	private $password;

	/* Class constructor.
	 */
	public function __construct($username=null, $password=null) {
		$this->username = $username;
		$this->password = $password;
	}

	/* Upload background image to Twitter.
	 * @param string $file
	 */
	public function upload($file) {
		$url      = 'http://twitter.com/account/update_profile_background_image.xml';
		$uname    = $this->username;
		$pword    = $this->password;
		$img_path = $file;
		$userpwd  = $uname . ':' . $pword;
		$img_post = array(
			'image' => '@' . $img_path . ';type=image/jpeg',
			'tile' => 'true',
			'MAX_FILE_SIZE' => '800000',
		);
		$opts = array(
		CURLOPT_URL            => $url,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HEADER         => true,
		CURLOPT_POST           => true,
		CURLOPT_POSTFIELDS     => $img_post,
		CURLOPT_HTTPAUTH       => CURLAUTH_ANY,
		CURLOPT_USERPWD        => $userpwd,
		CURLOPT_HTTPHEADER     => array('Expect:'),
		CURLINFO_HEADER_OUT    => true,
		);
		$ch = curl_init();
		curl_setopt_array($ch, $opts);
		$response = curl_exec($ch);
		$err      = curl_error($ch);
		$info     = curl_getinfo($ch);
		curl_close($ch);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'username', $this->username);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'password', $this->password);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'userpwd', $userpwd);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'img_post', print_r($img_post,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'err', $err);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'info', print_r($info,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'response', htmlspecialchars($response));
		return true;
	}
}