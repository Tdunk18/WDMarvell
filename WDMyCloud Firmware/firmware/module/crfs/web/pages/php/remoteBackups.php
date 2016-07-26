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

$date = new DateTime();
$r= $date->getTimestamp();

$cmd = $_REQUEST['cmd'];
$RemoteBackupsAPI = new RemoteBackupsAPI;

switch ($cmd) {
	case "getRecoverItems":
		$RemoteBackupsAPI->getRecoverItems();
		break;
}


class RemoteBackupsAPI{
	public function getRecoverItems()
	{
		$xmlPath = "/var/www/xml/rsync_recover_items.xml";
		$jobName = $_REQUEST['jobName'];
		
		@unlink($xmlPath);
		
		$cmd = "rsyncmd -l \"$xmlPath\" -r \"$jobName\" >/dev/null";
		system($cmd);
		
		if (file_exists($xmlPath))
		{
			print file_get_contents($xmlPath);
		}
		else
		{
			print "<config></config>";
		}
	}
}
?>
