<?php
/**
 * \file social\socialnetworks.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

class SocialNetworks {

	private $app_id;
	private $app_secret;
	private $app_url;
	private $request_url;
	private $authorize_url;
	private $access_url;

	public function __construct() {
	}

	public function _setNetwork($network) {
		switch ($network) {
			case 'facebook':
				$this->request_url   = "http://www.facebook.com/dialog/oauth";
				$this->authorize_url = "https://graph.facebook.com/oauth/access_token";
				$this->access_url    = "https://graph.facebook.com/me/photos";

				### W2Go.com
				//$this->app_id        = "166493610108591";
				//$this->app_secret    = "77b16bb0885f2b32c6f4af87af20e19";
				//$this->app_url       = "https://wd2go.com/api/1.0/rest/social_network";

				### MY REGISTERED NAS BOX
				//$this->app_id        = "166493610108591";
				//$this->app_secret    = "77b16bb0885f2b32c6f4af87af20e19";
				//$this->app_url       = "http://ronmybooklive-device61649.wd2go.com/api/1.0/rest/social_network";

				### WDCTEAM.com
				//$this->app_id        = "288147771209400";
				//$this->app_secret    = "89efc6b3fff31449af4f4edf387338b5";
				//$this->app_url       = "http://wdcteam.com/api/1.0/rest/social_network";

				### WDLIB.com
				$this->app_id        = "206747019394066";
				$this->app_secret    = "d4a54fc98a3b264586b83082b5cdfac9";
				//$this->app_url       = "http://wdlib.com/api/1.0/rest/social_network";
				$this->app_url       = "https://www.wdlib.com";

				break;

			case 'twitter':
				$this->request_url   = "https://api.twitter.com/oauth/request_token";
				$this->authorize_url = "https://api.twitter.com/oauth/authorize";
				$this->access_url    = "https://api.twitter.com/oauth/access_token";
				$this->app_id        = "ny7gOuUtIU4zQ6dIxhpwuQ";
				$this->app_secret    = "bva371XgccdtDJFD2L5Xm3OgmUUzt1PtXYp8OmECE";
				$this->app_url       = "http://wdcteam.com/api/1.0/rest/social_network";
				break;

			case 'youtube':
				$this->app_id        = "";
				$this->app_secret    = "";
				$this->app_url       = "";
				$this->request_url   = "";
				$this->authorize_url = "";
				$this->access_url    = "";
				break;

			case 'twitpic':
				$this->app_id        = "";
				$this->app_secret    = "";
				$this->app_url       = "";
				$this->request_url   = "";
				$this->authorize_url = "";
				$this->access_url    = "";
				break;

			default:
				$this->app_id        = "";
				$this->app_secret    = "";
				$this->app_url       = "";
				$this->request_url   = "";
				$this->authorize_url = "";
				$this->access_url    = "";
				break;
		}
	}

	public function getSocialAuthUrl($network, $user_id) {
		$this->_setNetwork($network);
		switch ($network) {
			case 'facebook':

				### FACEBOOK DOES NOT ACCEPT URLS EMBEDDED IN THE REDIRECT_URI

				$app_url  = $this->app_url;

				//$nas_url  = $_SERVER['SCRIPT_URI'];
				//$app_url  = $this->app_url.'?nas_url='.$nas_url.'&network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&rest_method=POST';

				//$nas_ip   = $_SERVER['SERVER'];
				//$app_url  = $this->app_url.'/'.$nas_ip.'/'.$network.'/'.$user_id;
				//$nas_url  = $_SERVER['SCRIPT_URI'];

				//$params   = 'nas_url='.$nas_url.'&network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&rest_method=POST';
				//$app_url  = $this->app_url.'?'.urlencode($params);

				//$nas_url  = $_SERVER['SCRIPT_URI'];
				//$app_url  = $this->app_url.'?nas_url='.$nas_url.'&network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&rest_method=POST';

				//$app_url  = $this->app_url.'?network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&owner=admin&pw=&rest_method=POST';

				$auth_url = "http://www.facebook.com/dialog/oauth"
				. "?client_id="    . $this->app_id
				. "&redirect_uri=" . urlencode($app_url)
				. "&scope=publish_stream";
				break;

			case 'twitter':
				$auth_url = '';
				break;

			case 'youtube':
				$auth_url = '';
				break;

			case 'twitpic':
				$auth_url = '';
				break;

			default:
				$auth_url = '';
				break;
		}
		return $auth_url;
	}

	public function getSocialAuthCode($auth_url) {
		$response = @file_get_contents($auth_url);
		$params = null;
		parse_str($response, $params);
		//printf("<PRE>%s=[%s]</PRE>\n", 'params', print_r($params,true));
		$auth_code = isset($params['code']) ? $params['code'] : false;
		return $auth_code;
	}

	public function getSocialAccessUrl($network, $user_id, $auth_code) {
		$this->_setNetwork($network);
		switch ($network) {
			case 'facebook':
				### FACEBOOK DOES NOT ACCEPT URLS EMBEDDED IN THE REDIRECT_URI
				### FACEBOOK DOES NOT ACCEPT REDIRECT_URIS THAT DO MATCH THE AUTHORIZED WEBSITE SITE URL IN ITS RECORDS

				//$app_url    = $this->app_url.'?nas_url='.$nas_url.'&network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&rest_method=POST';

				//$nas_url    = $_SERVER['SCRIPT_URI'];
				//$params     = 'nas_url='.$nas_url.'&network='.$network.'&user_id='.$user_id.'&auth_type=OAUTH&rest_method=POST';
				//$app_url    = $this->app_url.'?'.urlencode($params);

				### TRY WITH EXTENDED PATH USING HTACCESS FILE
				//$server     = $_SERVER['SERVER'];
				//$app_url    = $this->app_url.'/'.$server.'/'.$network.'/'.$user_id;

				### TRY WITH PARAMETERS
				//$server     = $_SERVER['SERVER'];
				//$app_url    = $this->app_url.'?server='.$server.'&network='.$network.'&user_id='.$user_id;

				$app_url    = $this->app_url;

				$access_url ="https://graph.facebook.com/oauth/access_token"
				. "?client_id="     . $this->app_id
				. "&client_secret=" . $this->app_secret
				. "&code="          . $auth_code
				//. "&type=client_cred"  //DO NOT USE THIS PARAMETER
				. "&redirect_uri="  . urlencode($app_url);
				break;

			case 'twitter':
				$access_url = '';
				break;

			case 'youtube':
				$access_url = '';
				break;

			case 'twitpic':
				$access_url = '';
				break;

			default:
				$access_url = '';
				break;
		}
		return $access_url;
	}

	public function getSocialAccess($access_url) {
		$response = @file_get_contents($access_url);
		$params = null;
		parse_str($response, $params);
		//printf("<PRE>%s=[%s]</PRE>\n", 'params', print_r($params,true));
		$access_token = isset($params['access_token']) ? $params['access_token'] : false;
		if ($access_token == false) return false;
		$expires      = isset($params['expires'])      ? $params['expires']      : false;
		$access       = array('access_token' => $access_token, 'expires' => $expires);
		return $access;
	}

	public function getFacebookAccess() {
		$this->app_id        = "288147771209400";
		$this->app_secret    = "89efc6b3fff31449af4f4edf387338b5";
		$this->app_url       = "http://wdcteam.com/api/1.0/rest/social_network";

		$this->request_url   = "http://www.facebook.com/dialog/oauth";
		$this->authorize_url = "https://graph.facebook.com/oauth/access_token";
		$this->access_url    = "https://graph.facebook.com/me/photos";

		//$this->app_id     = "166493610108591";
		//$this->app_secret = "77b16bb0885f2b32c6f4af87af20e19d";
		//$this->app_url    = "https://www.wd2go.com/api/1.0/rest/social_network";

		$access['auth_type']    = 'OAUTH';
		$access['access_token'] = 'AAAEGEaGLtrgBAJA3AbJZCA203PgUSZA4f0ZClvqhRFk1gEdZBG17Jwrjjtc2Xxqe21l0PI8x2WRxtabJrxDZC7rh85EwxyNXo8k1ZC3yInPfvF9aG4YGxB';
		$access['expires']      = '1319266800';
		return $access;
	}

	public function getTwitterAccess() {
		$this->app_id        = "ny7gOuUtIU4zQ6dIxhpwuQ";
		$this->app_secret    = "bva371XgccdtDJFD2L5Xm3OgmUUzt1PtXYp8OmECE";
		$this->app_url       = "http://wdcteam.com/api/1.0/rest/social_network";

		$this->request_url   = "https://api.twitter.com/oauth/request_token";
		$this->authorize_url = "https://api.twitter.com/oauth/authorize";
		$this->access_url    = "https://api.twitter.com/oauth/access_token";

		$access['auth_type']    = 'OAUTH';
		$access['access_token'] = 'AAAEGEaGLtrgBAJA3AbJZCA203PgUSZA4f0ZClvqhRFk1gEdZBG17Jwrjjtc2Xxqe21l0PI8x2WRxtabJrxDZC7rh85EwxyNXo8k1ZC3yInPfvF9aG4YGxB';
		$access['expires']      = '1319266800';
		return $access;
	}

	public function getYoutubeAccess() {
		$access['auth_type']    = 'OAUTH';
		$access['access_token'] = 'AAAEGEaGLtrgBAJA3AbJZCA203PgUSZA4f0ZClvqhRFk1gEdZBG17Jwrjjtc2Xxqe21l0PI8x2WRxtabJrxDZC7rh85EwxyNXo8k1ZC3yInPfvF9aG4YGxB';
		$access['expires']      = '1319266800';
		return $access;
	}

	public function getTwitpicAccess() {
		$access['auth_type']    = 'BASIC';
		$access['access_token'] = '';
		$access['expires']      = '';
		return $access;
	}

	/* Upload photo to social network.
	 * @param string  $network
	 * @param integer $user_id
	 * @param string  $file
	 * @param string  $message
	 */
	public function upload($network, $access_token, $file, $message) {
		$graph_url = $this->_getGraphUrl($access_token);
		$status    = $this->_uploadFile($graph_url, $file, $message);
		return $status;
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
		$response = @file_get_contents($token_url);
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

		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'graph_url', $graph_url);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'file', $file);
		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'message', $message);

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
}