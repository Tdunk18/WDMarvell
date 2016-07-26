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

function get_xml_value_from_memory($node)
{
	$res = array();
	$cmd = sprintf("xmldbc -g %s ", $node);
	exec($cmd, $res);
	return $res;
}

function set_xml_value_to_memory($node, $val)
{
	$cmd = sprintf("xmldbc -s %s \"%s\"", $node, $val);
	pclose(popen($cmd, 'r'));
}

$action = $_POST['action'];

$r = new stdClass();
switch ($action)
{
	case "get_info":
	{
		$r->auto_clear = get_xml_value_from_memory("/recycle_bin/auto_clear")[0];
		$r->clear_days = get_xml_value_from_memory("/recycle_bin/day")[0];
		if ($r->clear_days == "") $r->clear_days = 1;

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "save":
	{
		set_xml_value_to_memory("/recycle_bin/auto_clear", $_POST["enable_auto_clear"]);
		set_xml_value_to_memory("/recycle_bin/day", $_POST["clear_days"]);

		pclose(popen("xmldbc -D /etc/NAS_CFG/config.xml", 'r'));
		pclose(popen("access_mtd \"cp -f /etc/NAS_CFG/config.xml /usr/local/config\"", 'r'));

		$r->success = true;
		echo json_encode($r);
	}
		break;
}
?>
