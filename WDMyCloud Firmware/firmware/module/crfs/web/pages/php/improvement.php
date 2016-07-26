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

$cmd = $_REQUEST['cmd'];
$enable = $_REQUEST['enable'];
$username = $_SESSION['username'];	

exec("wto -n \"$username\" -g", $ret);
sscanf($ret[0], "timeout : %d", $timeout_val);
if ($timeout_val == -1 || strlen($username)==0)
{
	echo "<info><status>timeout</status></info>";
	return;
}

switch ($cmd) {
	case "setAnalytics":
		setAnalytics($enable);
		break;
	case "getAnalytics":
		getAnalytics();
		break;
}
function getAnalytics()
{
	exec("xmldbc -g /analytics" ,$retval);
	$enable = $retval[0];
	echo "<info><enable>$enable</enable></info>";
}
function setAnalytics($enable)
{
	/*if($enable=="1")
	{
		exec("twonky_analytics.sh start >/dev/null",$retval);
	}
	else
	{
		exec("twonky_analytics.sh stop >/dev/null",$retval);
	}

	exec("xmldbc -g /app_mgr/upnpavserver/enable" ,$retval);*/
		
	/*	
	if($retval[0]=='1')
	{
		exec("twonky.sh restart >/dev/null");
	}*/
	
	if ($enable == 0){
		exec("ganalytics --del-cron", $ga_ret);
	}

	$setCmd = "xmldbc -s /analytics \"$enable\"";
	exec($setCmd,$retval);
	exec("xmldbc -D /etc/NAS_CFG/config.xml",$retval);
	
	cp2flash("/etc/NAS_CFG/config.xml","/usr/local/config/config.xml");
	
	if ($enable == 1){
		exec("ganalytics --set-cron", $ga_ret);
	}

	echo "<info><status>ok</status><cmd>$setCmd</cmd></info>";
}
function cp2flash($filename,$flashPath)
{
	$mtdCmd = "access_mtd 'cp -f $filename $flashPath'";
	exec($mtdCmd, $retval);
}
?>
