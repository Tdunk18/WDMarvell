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

/*
Get Value from XML file or memory
*/

define("CONFIG_XML", "./config.xml");

//dont include "config"
function get_xml_value_from_file($xml_file, $node)
{
	if (!file_exists($xml_file))
		return null;

	/*
	$xml_str = file_get_contents($xml_file);
	$xml = new SimpleXMLElement($xml_str);
	*/
	$xml = simplexml_load_file($xml_file);
	$items = $xml->xpath($node);

	if (count($items) == 1) // only one value
		return (string)$items[0];
	if (count($items) > 1) //return array
		return $items;
	else
		return null;

	return null;
}

function get_xml_value_from_memory($node)
{
	$res = array();
	$cmd = sprintf("xmldbc -g %s", escapeshellarg("/" . $node));
	exec($cmd, $res);
	return $res;
}

$nodes = $_POST["nodes"];

$r->success = true;
$r->info = get_xml_value_from_memory($nodes);

__exit:
echo json_encode($r);
?>
