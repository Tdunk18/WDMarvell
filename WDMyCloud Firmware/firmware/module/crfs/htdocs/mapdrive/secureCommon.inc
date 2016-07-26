<?php
/**
 * \file mapdrive/secureCommon.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

define('WEBDAV_PREFIX', 'shares');
define('ADMIN_API_ROOT', $_SERVER["__ADMIN_API_ROOT"] . '/');
ini_set('include_path',
    '.' . ':' . ADMIN_API_ROOT . '/api/Common/includes/' . ':'
    . ADMIN_API_ROOT . '/api/' . ':'
    . ini_get('include_path')
    );

require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(SHARES_ROOT . '/includes/shareaccess.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

//set locale
if (file_exists('/etc/language.conf')) {
	$content = file_get_contents('/etc/language.conf');
	$strarr = explode(' ', $content);
	$locale = trim($strarr[1]);
}

if (!preg_match("/[a-zA-Z]{2}_[a-zA-Z]{2}/", $locale) ) {
    $locale = 'en_US';
}
/*ITR 83574 Below 11 languages are suported by wd2go.com:
 * Simple Chineese, Traditional Chineese, French, German, Italian, Japaneese, Korean, Portuguese, Russian, Spanish*/
$langArr = array('zh-CN', 'zh_TW', 'fr_FR', 'de_DE', 'it_IT', 'ja_JP', 'ko_KR', 'pt_BR', 'ru_RU', 'es_ES');
if(!in_array($locale, $langArr)){
	$locale = 'en_US';
}

setlocale(LC_ALL, $locale.'.utf8');
bindtextdomain("messages", ADMIN_API_ROOT . "/locale/");
//bindtextdomain("default", "UTF-8");
textdomain("messages");

// Get host name/IP and port number
$globalConfig = getGlobalConfig("global");
$portalProtocol = getCentralServerProt();
$portalHostName = getCentralServerHost();

$portalUrl = $portalProtocol . $portalHostName;

// init & generate session key
session_start();


function getDeviceUserDisplayName() {
	$displayName = isset($_SESSION['username']) ? $_SESSION['username'] : NULL;
	$fullName    = isset($_SESSION['fullname']) ? $_SESSION['fullname'] : NULL;

	if (!empty($displayName)) {
		if (!empty($fullName)) {
			$displayName = $fullName;
		}

		$displayName = " - " . $displayName;
	} else {
		$displayName = " ";
	}

	return $displayName;
}