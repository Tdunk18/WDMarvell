<?php
//$username = $_REQUEST['username'];
//exec("wto -n \"$username\" -g", $ret);
//sscanf($ret[0], "timeout : %d", $timeout_val);
//$res = array();
//exec("xmldbc -g /system_mgr/idle/time", $res);
//$web_timeout = $res[0]*60;
//
//if ($timeout_val == -1 || strlen($username)==0 || $timeout_val >= $web_timeout)
//{
//	header('Content-type: text/xml');
//	echo "<info><status>timeout</status><timeout>$timeout_val</timeout><u>$username</u></info>";
//	return;
//}
session_start();
$r = new stdClass();
$r->success = false;

include ("../lib/login_checker.php");
$r->chk = login_check();
$r->isAdmin = $_SESSION['isAdmin'];
$r->n = $_SESSION['username'];
/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() == 0)
{
	echo json_encode($r);
	exit;
}

$cmd = $_REQUEST['cmd'];
$enable = $_REQUEST['enable'];	//enable or disable

switch ($cmd) {
	case "getDiskStatus":
		getDiskStatus();
		break;
	case "setSataPower":
		setSataPower($enable);
		break;
}
function setSataPower($enable)
{
	$state = "ok";
	if(file_exists("/tmp/system_ready"))
	{
		$setCmd = "sata_power.sh \"$enable\"";
	exec($setCmd,$retval);
	}
	else
	{
		$state = "ng";
	}

	if($enable=="enable")
	{
		sleep(30);
	}
	header('Content-type: text/xml');
	echo "<info><status>$state</status><cmd>$setCmd</cmd></info>";
}
function getDiskStatus()
{
	$res = 0;
	$cntDisk="";

	if(file_exists("/tmp/hotplug_repeat"))
	{
		$res = 2;
	}
	else if(file_exists("/tmp/system_busy"))
	{
		$res = 1;
	}

	exec("xmldbc -S /var/run/xmldb_sock_sysinfo -g /disks/count",$ret);
	exec("xmldbc -g /eula",$ret2);
	
	header('Content-type: text/xml');
	echo "<info><res>$res</res><cntDisk>$ret[0]</cntDisk><eula>$ret2[0]</eula></info>";
		
}

?>
