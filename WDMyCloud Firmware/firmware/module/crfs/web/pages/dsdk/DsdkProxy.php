<?php

include ("../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */

if (login_check() != 1) {
    http_response_code(401);
    goto __exit;
}

$postOrPutRequest = ($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT');

$curlCommand = 'sudo curl -i -s --unix-socket "/var/run/wdappmgr.sock" -X ';
$curlCommand .= $_SERVER['REQUEST_METHOD'];
$curlCommand .= ' ';

if ($postOrPutRequest) {
    $curlCommand .= ' -d ';
    $curlCommand .= '\'';
    $curlCommand .= file_get_contents('php://input');
    $curlCommand .= '\'';
}

$curlCommand .= ' ';
$curlCommand .= 'http://localhost/';
$curlCommand .= $endpoint;

if (!$postOrPutRequest && $_SERVER['QUERY_STRING'] != null) {
    $curlCommand .= '?';
    $curlCommand .= $_SERVER['QUERY_STRING'];
}
$curlCommand .= ' 2>&1';

$output = shell_exec($curlCommand);

$startPos = strpos($output, ' ');
$httpCode = substr($output, $startPos + 1, 3);
$body = "";

if(($pos = strpos($output, '[')) !== false || ($pos = strpos($output, '{')) !== false) {
   $body = substr($output, $pos);
} else {
   $body = $output;
}


header('Content-Type: application/json');
http_response_code($httpCode);
echo $body;
__exit:
?>
