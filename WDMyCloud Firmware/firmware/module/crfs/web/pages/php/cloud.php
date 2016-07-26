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

$flashPath = "/usr/local/config";

$cmd = $_POST['cmd'];
$filename = $_POST['filename'];

switch ($cmd) {
	case "cp2flash":
		cp2flash($filename,$flashPath);
		break;
	case "restart_server":
		restart_server();
		break;
}
function restart_server()
{
	system("cat /usr/local/config/dynamicconfig_config.ini >/tmp/dynamicconfig" ,$retval);
	system("remote_access.sh >/dev/null" , $retval);
	echo "<info><status>ok</status></info>";
}
function cp2flash($filename,$flashPath)
{
	$mtdCmd = "access_mtd 'cp -f $filename $flashPath'";
	
	//system($mtdCmd, $retval);
	header("Status: 200");
}
?>
