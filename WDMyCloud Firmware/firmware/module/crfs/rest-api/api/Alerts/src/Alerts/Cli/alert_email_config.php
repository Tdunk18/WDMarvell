#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));

require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');

$returnCode = 0;

if ($argc < 7) {
	$returnCode = RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS;
	echo("Usage: alert_amail_config.sh <email_enabled=true/false> <min_level_email=1/5/10> <email_recipient_0=test1@wdc.com> <email_recipient_1=test2@wdc.com> <email_recipient_2=test3@wdc.com> <email_recipient_3=test4@wdc.com> <email_recipient_4==test5@wdc.com>\n");
	exit($returnCode);
}

set_error_handler(function() {
	throw new \Alerts\xception(sprintf('Failed to open config "%s" for write.', '/etc/alert_email.conf'));
}, E_NOTICE | E_WARNING); // PHP 5.3 only
$fh = fopen('/etc/alert_email.conf', 'w'); // No die!
restore_error_handler();


$emailEnabled = explode("=", $argv[1]);
if($emailEnabled[1] == 'true') {
	fwrite($fh, 'email_enabled=on');
} else {
	fwrite($fh, 'email_enabled=off');
}
fwrite($fh, "\n");
fwrite($fh, "\n");


fwrite($fh, "email_returnpath=nas.alerts@wdc.com");
fwrite($fh, "\n");
fwrite($fh, "\n");


$minLevelEmail = explode("=", $argv[2]);
fwrite($fh, "min_level_email=$minLevelEmail[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


fwrite($fh, "min_level_rss=$minLevelEmail[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


$emailRecipient0 = explode("=", $argv[3]);
fwrite($fh, "email_recipient_0=$emailRecipient0[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


$emailRecipient1 = explode("=", $argv[4]);
fwrite($fh, "email_recipient_1=$emailRecipient1[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


$emailRecipient2 = explode("=", $argv[5]);
fwrite($fh, "email_recipient_2=$emailRecipient2[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


$emailRecipient3 = explode("=", $argv[6]);
fwrite($fh, "email_recipient_3=$emailRecipient3[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


$emailRecipient4 = explode("=", $argv[7]);
fwrite($fh, "email_recipient_4=$emailRecipient4[1]");
fwrite($fh, "\n");
fwrite($fh, "\n");


fclose($fh);

exit($returnCode);