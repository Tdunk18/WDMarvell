#!/usr/bin/php
<?php
/**
 * \file ssl_cert_job.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));
//define('ADMIN_API_ROOT', realpath('/shares/Public/webapp/'));
//define('ADMIN_API_ROOT', realpath('/Users/sapsford_j/git/rest-api/origin-middleware/rest-api'));



require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(REMOTE_ROOT . '/src/Remote/Device/TrustedCertControl.php');

use \Zend\Log\Logger;
use \Remote\Device\TrustedCertControl;

if (!isTrustedCertEnabled()) {
	echo("Trusted Certificate Job is not enabled, please check globalcofig.ini settings");
	exit(TrustedCertControl::RETURN_CODE_TRUSTED_CERT_NOT_ENABLED);
}


if ($argc < 2) {
	$returnCode = TrustedCertControl::RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS;
	echo("Usage: ssl_cert_job.sh start|install|uninstall <start_time HH:mm (24 hour)>" . PHP_EOL);
	exit($returnCode);
}

$command = strtolower($argv[1]);
if (sizeof($argv) > 2) {
	$startTime24 = $argv[2];
}

if ( ($command != "start") && ($command != "install") && ($command != "uninstall")) {
	exit(TrustedCertControl::RETURN_CODE_FAILURE_INVALID_REQUEST);
}

//get job start time (24 hour clock)

if (empty($startTime24)) {
	$startTime24 = getTrustedCertJobStartTime();
}
$time = explode(":",$startTime24);
$hour24 = $time[0];
$mins = $time[1];

if ($hour24 < 0 || $hour24 > 23 || $mins < 0 | $mins > 59) {
	exit (TrustedCertControl::RETURN_CODE_INVALID_START_TIME);
}

//check if job is already running

/**
 * Check if trusted cert job is running or not
 */
$deviceType = getDeviceTypeName();

if ($deviceType == "sequioa") {
    exec("ps x|grep -v grep|grep \"/usr/bin/php /usr/local/sbin/ssl_cert_job.sh\"", $pout);
}
else {
	//on Alpha, cron spawns a seperate shell session, so we have to filter that out
	exec("ps x|grep -v grep|grep \"/usr/bin/php /usr/local/sbin/ssl_cert_job.sh\"|grep -v \"/bin/sh -c\"", $pout);
}
if (is_array($pout) && sizeof($pout) > 1) {
	echo("Trusted Cert Job is already running, so exiting" . PHP_EOL);
	exit (TrustedCertControl::RETURN_CODE_TRUSTED_CERT_ALREADY_RUNNING);
}

$certControl = TrustedCertControl::getInstance(LOGGER::ERR);

if ( $command == "start" ) {

	if (!$certControl->run(true, $hour24, $mins)) { //run job now
		echo("Trusted Cert Job failed" . PHP_EOL);
	}
	if ($deviceType == "sequioa") {
		//only install on non-Alpha NASes
		if (!$certControl->install($hour24, $mins)) { //install cron job, if not already installed or start time is different
			echo("Trusted Cert cron installation failed" . PHP_EOL);
		}
	}

}
else  if ( $command == "install" ) {
	$deviceType = getDeviceTypeName();
	if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
		echo("install option is not supported on this device" . PHP_EOL);
	}
	else if (!$certControl->install($hour24, $mins)) { //install cron job, if not already installed or start time is different
		//install cron job, if not already installed.
		echo("Failed to install cron job" . PHP_EOL);
	}
}
else if ( $command == "uninstall") {
	if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
		echo("uninstall option is not supported on this device" . PHP_EOL);
	}
	else if (!$certControl->uninstall()) {
		echo("Failed to uninstall cron job" . PHP_EOL);
	}
}
