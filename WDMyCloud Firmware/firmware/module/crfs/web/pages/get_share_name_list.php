<?php
session_start();
$r = new stdClass();

include ("lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() == 0)
{
	$r->success = false;
	goto __exit;
}


$share_name_xml = "/var/www/xml/smb.xml";
if (!file_exists($share_name_xml))
{
	$r->success = false;
	goto __exit;
}

$xml = simplexml_load_file($share_name_xml);
foreach($xml->samba->item as $key => $val)
{
	$r->item[] = array(
		"share_name" => (string)$val->name,
		"path" => (string)$val->path,
	);
}

$r->success = true;

__exit:
echo json_encode($r);
?>
