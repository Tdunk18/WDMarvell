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

if (!empty($_FILES)) {	
		//echo $_FILES['file']['tmp_name'];
	
	if(isset($_POST['list_type']))
	{
		system("rm -f /tmp/import_groups");
		move_uploaded_file($_FILES['users_impGroupsFile_text']['tmp_name'],"/tmp/import_groups");		
	}
	else
	{
		system("rm -f /tmp/import_users");
		move_uploaded_file($_FILES['users_impUsersFile_text']['tmp_name'],"/tmp/import_users");
}
}

?>
