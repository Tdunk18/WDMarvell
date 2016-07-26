<?php
/**
 * \file httpclient.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Returns true if the device is pointing to staging environment.  false if it's production
 */

use Core\Logger;

function isStagingEnv() {
	static $isStaging = null;

	if (null == $isStaging) {
		$isStaging = true;

		$dynamicConfig = getUpnpStatus("config");
		if (isset($dynamicConfig["SERVER_BASE_URL"])) {
			$portalUrl = $dynamicConfig["SERVER_BASE_URL"];
			$comp = parse_url($portalUrl);
			if (isset($comp['host'])) {
				$dynHost = $comp['host'];
			}
		}

		$globalConfig = getGlobalConfig("global");
		if (isset($globalConfig["SERVER_BASE_URL"])) {
			$portalUrl = $globalConfig["SERVER_BASE_URL"];
			$urlComp = parse_url($portalUrl);
			if (isset($urlComp['host'])) {
				$globHost = $urlComp['host'];
			}
		}

		if (isset($dynHost) && isset($globHost)) {
			if (strcasecmp($globHost, $dynHost) == 0) {
				$isStaging = false;

			}
		}

	}

	return $isStaging;
}

/**
 * Create a url string from an associative array
 * @param associative array
 * @return string
 */
function getUrlString( $args ) {
	$retString = "";
	foreach ( $args as $key => $value ) {
		if (strlen ( $retString ) ) {
			$retString .= "&";
		}
		$retString .= urldecode( $key ). "=" . urlencode( $value );
	}
	return $retString;
}

class HttpClient {

	var $name = "HttpClient";

	private $server;
	private $requestUrl;
	private $curlOptions = array();

	public function __construct ( $args = array() ) {
		$this->curlOptions[ CURLOPT_RETURNTRANSFER ] = TRUE;
		$this->curlOptions[ CURLOPT_SSL_VERIFYPEER ] = FALSE;
		if (isStagingEnv()) {
			$this->curlOptions[ CURLOPT_SSL_VERIFYHOST ] = FALSE;
			Logger::getInstance()->debug(__FUNCTION__ . ", staging mode, set CURLOPT_SSL_VERIFYHOST to false");
		}
		if (!empty ( $args['requestUrl'] ) ) {
			$this->requestUrl = $args['requestUrl'];
		}else {
			$this->requestUrl = "";
		}

		if (!empty ($args['curlOptions'])) {
			$this->curlOptions = array_merge($this->curlOptions, $args['curlOptions']);
		}
		Logger::getInstance()->debug(__FUNCTION__ . ", httpclient.curlOpts: ", $this->curlOptions);
	}

	//only supporting json right now
	public function postV2($requestUrl, $args = array()) {
		$output = null;

		$this->requestUrl = $requestUrl;

		$postBody = json_encode($args);

		$curlClient = curl_init($this->requestUrl);
		curl_setopt($curlClient, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curlClient, CURLOPT_HTTPHEADER,
						array("Content-type: application/json"));
		curl_setopt($curlClient, CURLOPT_POST, true);
		curl_setopt($curlClient, CURLOPT_POSTFIELDS, $postBody);

		if (ORION_DEBUG) {
			$start = microtime(true);
		}

		$output = curl_exec( $curlClient );
		$info = curl_getinfo($curlClient);
		$statusCode = $info['http_code'];

		if (ORION_DEBUG) {
			$totalTime = (microtime(true) - $start);
			\Core\Logger::getInstance()->addRequest($this->requestUrl, array("status_code" => $statusCode, "response_text" => $output), $totalTime);
		}

		curl_close($curlClient);
		return array("status_code" => $statusCode, "response_text" => $output);
	}

	public function post($args = array()) {
		$output = null;
		if ( !empty ( $args['requestUrl'] ) ) {
			$this->requestUrl = $args['requestUrl'];
		}
		$curlClient = $this->__getCurl();
		curl_setopt ( $curlClient, CURLOPT_POST, TRUE );
		if ( !empty ( $args['data'] ) ) {
			curl_setopt( $curlClient, CURLOPT_POSTFIELDS, getUrlString( $args['data'] ) );
		}

		if (ORION_DEBUG) {
			$start = microtime(true);
		}

		$output = curl_exec( $curlClient );
		$info = curl_getinfo($curlClient);
		$statusCode = $info['http_code'];

		if (ORION_DEBUG) {
			$totalTime = (microtime(true) - $start);
			\Core\Logger::getInstance()->addRequest($this->requestUrl, array("status_code" => $statusCode, "response_text" => $output), $totalTime);
		}

		curl_close($curlClient);
		return array("status_code" => $statusCode, "response_text" => $output);
	}

	//only supporting json right now
	public function put($requestUrl, $args = array()) {
		$output = null;

		$this->requestUrl = $requestUrl;

		$putBody = json_encode($args);

		$curlClient = curl_init($this->requestUrl);
		curl_setopt($curlClient, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curlClient, CURLOPT_HTTPHEADER,
		array("Content-type: application/json"));
		curl_setopt($curlClient, CURLOPT_CUSTOMREQUEST, "PUT");
		curl_setopt($curlClient, CURLOPT_POSTFIELDS, $putBody);

		if (ORION_DEBUG) {
			$start = microtime(true);
		}

		$output = curl_exec( $curlClient );
		$info = curl_getinfo($curlClient);
		$statusCode = $info['http_code'];

		$totalTime = (microtime(true) - $start);
		\Core\Logger::getInstance()->addRequest($this->requestUrl, array("status_code" => $statusCode, "response_text" => $output), $totalTime);

		curl_close($curlClient);
		return array("status_code" => $statusCode, "response_text" => $output);
	}

	public function get($requestUrl) {
		$output = null;
		// URL can't be enpty for get
		if (empty($requestUrl)) {
			return;
		}
		$this->requestUrl = $requestUrl;
		$curlClient = $this->__getCurl();

		$start = microtime(true);

		$output = curl_exec($curlClient);

		$totalTime = (microtime(true) - $start);
		\Core\Logger::getInstance()->addRequest($this->requestUrl, array("status_code" => $statusCode, "response_text" => $output), $totalTime);

		$info = curl_getinfo($curlClient);
		$statusCode = $info['http_code'];

		curl_close($curlClient);

		return array("status_code" => $statusCode, "response_text" => $output);
	}

	private function generateLocaleHeader() {
		if (file_exists('/etc/language.conf')) {
			$content = file_get_contents('/etc/language.conf');
			$strarr = explode(' ', $content);
			$locale = trim($strarr[1]);
		} else {
			$locale = 'en_US';
		}
		$locale = str_replace("_", "-", $locale);
		return "Accept-Language: $locale";
	}

	private function __getCurl () {
		$curl = curl_init();
		$curlOptions = $this->curlOptions;
		$curlOptions[CURLOPT_URL] = $this->requestUrl;
		if (isset($curlOptions[CURLOPT_HTTPHEADER])) {
			$headers = $curlOptions[CURLOPT_HTTPHEADER];
		}
		if (!empty($headers) && is_array($headers)) {
			array_push($headers, $this->generateLocaleHeader());
		} else {
			$headers = array($this->generateLocaleHeader());
		}

		$curlOptions[CURLOPT_HTTPHEADER] = $headers;
		curl_setopt_array( $curl, $curlOptions );
		//DO NOT force SSL version 3 for our production environment but to auto-negotiate.
		curl_setopt($curl, CURLOPT_SSLVERSION, 0);
		return $curl;
	}
}