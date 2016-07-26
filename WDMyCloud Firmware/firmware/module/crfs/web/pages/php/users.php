<?php
session_start();
$r = new stdClass();
$r->success = false;

include ("../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() != 1)
{
	echo json_encode($r);
	exit;
}

$username = $_COOKIE['username'];
exec("wto -n \"$username\" -g", $ret);
sscanf($ret[0], "timeout : %d", $timeout_val);
$res = array();
exec("xmldbc -g /system_mgr/idle/time", $res);
$web_timeout = $res[0]*60;

if ($timeout_val == -1 || strlen($username)==0 || $timeout_val >= $web_timeout)
{
	header('Content-type: text/xml');
	echo "<info><status>timeout</status><timeout>$timeout_val</timeout><u>$username</u></info>";
	return;
}

$cmd = $_GET['cmd'];
$type = $_GET['type'];
switch ($cmd) {
	case "getAccountXml":
		getAccountXml();
		break;
	case "getSmbXml":
		getSmbXml();
		break;
	case "rmImportUserFile":
		rmImportUserFile($type);
		break;		
}
function rmImportUserFile($type)
{
	if($type=='g')
	{
		system("rm -rf /tmp/import_groups");
	}
	else
	{
		system("rm -rf /tmp/import_users");
	}
	header('Content-type: text/xml');
	echo "<info><status>$type</status></info>";
}
function getAccountXml()
{
	system("account");
	header("Status: 200");
}
function getSmbXml()
{
	system("smbcom -v");
	header("Status: 200");
}
?>
