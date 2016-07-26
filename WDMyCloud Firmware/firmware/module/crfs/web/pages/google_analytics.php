<?php
session_start();
$r = new stdClass();
$r->success = false;
include ("./lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check()==0)
{
	echo json_encode($r);
	exit;
}

$action = $_POST['cmd'];
if ($action == "") $action = $_GET['cmd'];

$r = new stdClass();
switch ($action)
{
	case "set":
	{
		$opt = $_POST['opt'];
		$arg = $_POST['arg'];
		$run_cmd = sprintf("ganalytics --%s %s > /dev/null &", $opt, ($arg != "") ? $arg : "");
		
		system($run_cmd);

		$r->run_cmd = $run_cmd;
		$r->success = true;
		echo json_encode($r);
	}
	break;	
}
?>
