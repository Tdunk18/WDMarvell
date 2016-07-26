#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));
//define('ADMIN_API_ROOT', realpath('/shares/Public/webapp/'));
//define('ADMIN_API_ROOT', '/Users/joesapsford/dev/Orion_2.1.0_dev/trunk/rest_api/webapp');

require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(SHARES_ROOT . '/src/Shares/Cli/sharesCrud.php');


if ($argc < 3) {
	$returnCode = RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS;
	echo("Usage: crud_share_db.sh <create|update|delete> <share-name> <path to smb.conf file> [true|false] [new_share_name]\n");
	exit($returnCode);
}

$command = strtolower($argv[1]);
if ( ($command != "create") && ($command != "update") && ($command != "delete")) {
	exit(RETURN_CODE_FAILURE_INVALID_REQUEST);
}

$shareName = $argv[2];
$smbConfPath = $argv[3];
if (sizeof($argv) > 4) {
	//JS - optional argument
	$mediaServing = $argv[4];
}
else {
	$mediaServing = false;
}
if (sizeof($argv) > 5) {
	//JS - optional argument
	$newShareName = $argv[5];
}
else {
	$newShareName = false;
}
$sharesCrud = new SharesCrud();
$returnCode =  $sharesCrud->sharesCrud($command, $shareName, $smbConfPath, $mediaServing, $newShareName);
ob_flush();
exit($returnCode);