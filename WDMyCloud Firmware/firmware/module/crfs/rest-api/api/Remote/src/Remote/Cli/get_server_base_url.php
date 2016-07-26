#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));
require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');

use \Common\Model\GlobalConfig;
$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
if (empty($config["SERVER_BASE_URL"])) {
	$config = getGlobalConfig('global');
}
if(!empty($config["SERVER_BASE_URL"])){
	echo $config["SERVER_BASE_URL"];
	exit;
}else{
	echo "Error: no server base url found";
	exit(1);
}
