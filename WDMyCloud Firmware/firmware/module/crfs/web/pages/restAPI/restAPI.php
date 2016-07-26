<?php
session_start();
$strCookie = 'PHPSESSID=' . $_COOKIE['PHPSESSID'] . '; path=/'; 
session_write_close(); 

$REST_API_PATH = "/api/2.1/rest";

$default_options = array (
	CURLOPT_HEADER => 0,
	CURLOPT_VERBOSE => 0,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_COOKIE => $strCookie,
	CURLOPT_SSL_VERIFYPEER => false,
	CURLOPT_SSL_VERIFYHOST => false
);

function send_curl($options, $toURL)
{
	$toURL = "http://127.0.0.1" . $toURL;
	$curl = curl_init();
	$options[CURLOPT_URL] = $toURL;

	curl_setopt_array($curl, $options);
	$r = curl_exec($curl);

	$info =curl_getinfo($curl);
	if(!curl_errno($curl))
	{
		//echo $r;
	}
	else
	{
		$r = null;
	}

	curl_close($curl);
	return $r;
}

function restAPI_POST($toURL, $send_data = null)
{
	$options = $GLOBALS['default_options'];
	$options[CURLOPT_POST] = true;
	$options[CURLOPT_POSTFIELDS] = http_build_query($send_data, '', '&');

	return send_curl($options, $toURL);
}

function restAPI_GET($toURL, $send_data = null)
{
	$options = $GLOBALS['default_options'];
	$toURL = sprintf("%s?%s", $toURL, ($send_data) ? http_build_query($send_data, '', '&') : "");
	$options[CURLOPT_POST] = false;

	return send_curl($options, $toURL);
}

function restAPI_PUT($toURL, $send_data = null)
{
	$options = $GLOBALS['default_options'];

	$send_data['rest_method'] = "PUT";
	$toURL = sprintf("%s?%s", $toURL, ($send_data) ? http_build_query($send_data, '', '&') : "");
	$options[CURLOPT_POST] = false;

	return send_curl($options, $toURL);
}

function restAPI_DELETE($toURL, $send_data = null)
{
	$options = $GLOBALS['default_options'];

	$send_data['rest_method'] = "DELETE";
	$toURL = sprintf("%s?%s", $toURL, ($send_data) ? http_build_query($send_data, '', '&') : "");
	$options[CURLOPT_POST] = false;

	return send_curl($options, $toURL);
}
?>
