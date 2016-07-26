<?php
/**
 * \file social\facebookapi.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class FacebookAPI {

	private $app_id;
	private $app_secret;
	private $app_url;

	public function __construct() {
		$this->app_id     = "288147771209400";
		$this->app_secret = "89efc6b3fff31449af4f4edf387338b5";
		$this->app_url    = "http://wdcteam.com/facebook/index.php";
	}

	/* Upload photo to Facebook.
	 * @param string $file
	 */
	public function upload($file='', $message='') {

		$file       = !empty($file)    ? $file    : '/shares/Public/apitest.jpg';
		$message    = !empty($message) ? $message : 'API Test Picture';

		$app_id     = $this->app_id;
		$app_secret = $this->app_secret;
		$app_url    = $this->app_url;

		$code = isset($_REQUEST['code']) ? $_REQUEST['code'] : '';

		if (empty($code)) {
			$dialog_url    = $this->_getDialogUrl($app_id, $app_url);
			$redirect_link = $this->_getRedirectLink($dialog_url);
			echo "$redirect_link";
		} else {
			$token_url     = $this->_getTokenUrl($app_id, $app_secret, $app_url, $code);
			$access_token  = $this->_getAccessToken($token_url);
			$graph_url     = $this->_getGraphUrl($access_token);
			$status        = $this->_uploadFile($graph_url, $file, $message);

			printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'status', $status);

			//$graph_form    = $this->_getGraphForm($graph_url);
			//echo "$graph_form";
		}
	}

	private function _getDialogUrl($app_id, $app_url) {
		$dialog_url = "http://www.facebook.com/dialog/oauth"
		. "?client_id="    . $app_id
		. "&redirect_uri=" . urlencode($app_url)
		. "&scope=publish_stream";
		return $dialog_url;
	}

	private function _getRedirectLink($dialog_url) {
		$redirect_link = '<script>top.location.href="' . $dialog_url . '"</script>'."\n";
		return $redirect_link;
	}

	private function _getTokenUrl($app_id, $app_secret, $app_url, $code) {
		$token_url  = "https://graph.facebook.com/oauth/access_token"
		. "?client_id="     . $app_id
		. "&client_secret=" . $app_secret
		. "&redirect_uri="  . urlencode($app_url)
		. "&code=" . $code;
		return $token_url;
	}

	private function _getAccessToken($token_url) {
		$response = file_get_contents($token_url);
		$params   = null;
		parse_str($response, $params);
		$access_token = isset($params['access_token']) ? $params['access_token'] : '';
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'response', $response);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'params', print_r($params,true));
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'access_token', $access_token);
		return $access_token;
	}

	private function _getGraphUrl($access_token) {
		$graph_url = "https://graph.facebook.com/me/photos?access_token=".$access_token;
		return $graph_url;
	}

	private function _getGraphForm($graph_url) {
		$graph_form  = '<form enctype="multipart/form-data" action="'.$graph_url.'" method="POST">'."\n";
		$graph_form .= 'Please choose a photo: '."\n";
		$graph_form .= '<input name="source" type="file"><br/><br/>'."\n";
		$graph_form .= 'Say something about this photo: '."\n";
		$graph_form .= '<input name="message" type="text" value="My New Photo"><br/><br/>'."\n";
		$graph_form .= '<input type="submit" value="Upload"><br/>'."\n";
		$graph_form .= '</form>'."\n";
		return $graph_form;
	}

	private function _uploadFile($graph_url, $file, $message) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $graph_url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_VERBOSE, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
		curl_setopt($ch, CURLOPT_POST, true);
		$post = array(
			"source"  => "@$file",
			"message" => urlencode($message),
		);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
		$response = curl_exec($ch);
		$error   = curl_error($ch);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'response', $response);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'error', $error);
		$status = $response;
		return $status;
	}

	/* Upload photo to Facebook.
	 * @param string $file
	 */
	public function upload000($file) {
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'file', $file);

		$app_id         = "288147771209400";
		$app_secret     = "89efc6b3fff31449af4f4edf387338b5";
		$post_login_url = "http://wdcteam.com/facebook/index.php";

		$code = isset($_REQUEST["code"]) ? $_REQUEST["code"] : '';

		//Obtain the access_token with publish_stream permission
		if (empty($code)) {
			$dialog_url= "http://www.facebook.com/dialog/oauth?"
			. "client_id=" .  $app_id
			. "&redirect_uri=" . urlencode( $post_login_url)
			.  "&scope=publish_stream";
			echo("<script>top.location.href='" . $dialog_url . "'</script>");
		} else {
			$token_url="https://graph.facebook.com/oauth/access_token?"
			. "client_id=" . $app_id
			. "&redirect_uri=" . urlencode( $post_login_url)
			. "&client_secret=" . $app_secret
			. "&code=" . $code;
			$response = file_get_contents($token_url);
			$params = null;
			parse_str($response, $params);

			printf("<PRE>%s=[%s]</PRE>\n", 'params', print_r($params,true));

			$access_token = $params['access_token'];

			// Show photo upload form to user and post to the Graph URL
			$graph_url= "https://graph.facebook.com/me/photos?access_token=".$access_token;

			echo '<form enctype="multipart/form-data" action="'.$graph_url.'" method="POST">';
			echo 'Please choose a photo: ';
			echo '<input name="source" type="file"><br/><br/>';
			echo 'Say something about this photo: ';
			echo '<input name="message" type="text" value="My New Photo"><br/><br/>';
			echo '<input type="submit" value="Upload"><br/>';
			echo '</form>';
		}
		return true;
	}

}