#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));

require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');

require_once(FILESYSTEM_ROOT . '/src/Filesystem/Cli/volumeCrud.php');

$returnCode = 0;

if ($argc < 2) {
	$returnCode = RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS;
	echo("Usage: volume_mount.sh <mount | unmount> <volume_id> [<mount_point> <drive_path> <file_system_type> [<handle> <storage_type> <read_only> required only for dynamic volumes] required only for mount ]\n");
	exit($returnCode);
}

$command = strtolower($argv[1]);

if (($command != "mount") && ($command != "unmount")) {
	$returnCode = RETURN_CODE_FAILURE_INVALID_REQUEST;
	exit($returnCode);
}

if (($command == "mount") && ($argc < 6 && $argc > 8)) {
	$returnCode = RETURN_CODE_FAILURE_INVALID_REQUEST;
	exit($returnCode);
}

if (($command == "unmount") && ($argc != 3)) {
	$returnCode = RETURN_CODE_FAILURE_INVALID_REQUEST;
	exit($returnCode);
}

if ($command == "mount") {
	$volumeId = $argv[2];
	$mountPoint = $argv[3];
	$drivePath = $argv[4];
	$filesystemType = $argv[5];
    $usbHandle = isset($argv[6]) ? $argv[6] : null;
    $storageType = isset($argv[7]) ? $argv[7] : null;
    $readOnly = isset($argv[8]) ? $argv[8] : 'false';
	addVolume($volumeId, $mountPoint, $drivePath, $filesystemType, $usbHandle, $storageType, $readOnly);
} else {
	$volumeId = $argv[2];
	removeVolume($volumeId);
}

ob_flush();
exit($returnCode);