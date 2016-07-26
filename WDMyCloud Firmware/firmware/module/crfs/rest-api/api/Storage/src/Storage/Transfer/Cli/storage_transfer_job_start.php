#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));
require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(UTIL_ROOT . '/includes/httpclient.inc');

/*Create the POST request to execute storage_active_transfer API*/

//Trim any '/' from beginning and end. And encode the input string.
$src_path = rawurlencode(trim($argv[1], '/'));

$requestUrl = "http://127.0.0.1/api/2.1/rest/storage_active_transfer/$src_path?rest_method=POST&async=true";

$httpClient = new \HttpClient();
$response = $httpClient->get($requestUrl);

echo $response['response_text'];