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

//if (isset($_SESSION['username']))
{
	$vv_sharename = $_GET['vv_sharename'];
	
	if(empty($_GET["vv_sharename"])) 
	{
		echo 'Parameter vv_sharename is missing.';
		return;
	}
	
	$cmd = "vvctl --check_share_name -s \"$vv_sharename\" >/dev/null";
	system($cmd);
	
	$cmd = "xmldbc -S /var/run/xmldb_sock_vv -g /result/check_share_name";
	$retval = trim(shell_exec($cmd));
	
	echo "<config><res>$retval</res></config>";
}
//else
//{
//	echo "No Login.";
//}
?>
