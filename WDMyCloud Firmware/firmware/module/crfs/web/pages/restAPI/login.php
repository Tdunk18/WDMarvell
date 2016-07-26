<?php
session_start();
require("restAPI.php");

$toURL = sprintf("%s/local_login", $REST_API_PATH);
$send_data = array(
	"owner" => $_GET['owner'],
	"pw" => $_GET['pw']
);
echo restAPI_GET($toURL, $send_data);
?>
