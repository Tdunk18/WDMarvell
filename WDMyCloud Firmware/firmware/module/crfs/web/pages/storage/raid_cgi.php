<?php
//session_start();
//$r = new stdClass();
//$r->success = false;
//
//include ("../lib/login_checker.php");
//
///* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
//if (login_check() != 1)
//{
//	echo json_encode($r);
//	exit;
//}

$action = $_POST['cmd'];
if ($action == "") $action = $_GET['cmd'];

$r = new stdClass();
switch ($action)
{
	case "cgi_Run_Smart_Test":
	{
		$run_cmd = $_POST['run_cmd'];
		system("smart_test -X > /dev/null");

		$run_cmd .= " > /dev/null &";
		system($run_cmd);
		sleep(3);

		$r->run_cmd = $run_cmd;
		$r->ret = $ret;
		$r->success = true;
		echo json_encode($r);
	}
		break;
	
	case "cgi_Get_SysInfo":
	{
		$_TMP_SYSINFO_XML = "/var/www/xml/_tmp_sysinfo.xml";
		system("xmldbc  -p /disks $_TMP_SYSINFO_XML -S /var/run/xmldb_sock_sysinfo");
		echo file_get_contents($_TMP_SYSINFO_XML);
		@unlink($_TMP_SYSINFO_XML);
	}
		break;
}
?>
