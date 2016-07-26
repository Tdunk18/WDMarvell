<?php
/**
 * \file globalconfig.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * This is the global config library for retrieving INI file settings.
 *
 * Each module should have its own section in the INI file (e.g. [ALBUMS]) and should retreive the
 * module-specific settings using its section name. INI settings are returned as associative arrays
 * (see http://php.net/manual/en/function.parse-ini-file.php)
 */

//TODO we would need to remove this require_once in the future. We did not do it now because
//some functions from it are used here and converting it to a class will lead to changes across the entire code base
require_once(COMMON_ROOT . "/includes/util.inc");

use \Common\Model\GlobalConfig;
use \Core\Config;
use \Core\SystemInfo;

//convenience functions
function getGlobalConfig($section) {
	return GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", $section);
}

function setGlobalConfig($section, $name, $value) {
	return GlobalConfig::getInstance()->setConfig("GLOBALCONFIG", $section, $name, $value);
}

function getUpnpStatus($section) {
	return GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", $section);
}

function getDeviceName() {
	//JS - following should work on Linux and Windows
	$hostName = php_uname('n');

	//set machine name to host name up to the first '.'
	$hostName = strpos($hostName, '.') > 0 ? substr($hostName, 0, strpos($hostName, '.')) :  $hostName;

	return( array( 'machine_name' => $hostName ) );
}

function getDeviceId() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["DEVICEID"];
}

function getDeviceType() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "global");
	return $config["DEVICETYPE_" . strtoupper(SystemInfo::getModelNumber())];
}

function getDeviceSubDomain() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["SUBDOMAIN"];
}

function getInternalIp() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["INTERNAL_IP"];
}

//if we call this function from readConfigFile() function, we need to let it know not to call
//getConfig() beacause getConfig() will call readConfigFile() function and create an infinite loop
//we do that through fromInsideReadConfigFile flag being passed as true
function getDeviceTypeName($fromInsideReadConfigFile=false) {
	if($fromInsideReadConfigFile){
		return Config::$globalConfig["GLOBALCONFIG"]["global"]["DEVICETYPENAME_" . strtoupper(SystemInfo::getModelNumber())];
	}else{
		$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "global");
		return $config["DEVICETYPENAME_" . strtoupper(SystemInfo::getModelNumber())];
	}
}

function getDeviceAuthCode() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["DEVICEAUTH"];
}

/**
 * Update Dynamicconfig.ini with device registration details
 * @param unknown $deviceId	- unique ID of device
 * @param unknown $deviceAuth - device authentication code
 * @param unknown $serverBaseUrl - base URL of server
 * @param unknown $deviceDomain - NAS 3 level domain
 */
function setDeviceRegistrationConfig($deviceId, $deviceAuth, $serverBaseUrl, $deviceDomain = null) {

	//create NAS Sub-domain string

	if ($deviceDomain != null) {
		$settings = array('SUBDOMAIN'		 => $deviceDomain,
						  'DEVICEID' 		 => $deviceId,
						  'DEVICEAUTH' 		 => $deviceAuth,
						  'SERVER_BASE_URL'  => $serverBaseUrl);
	}
	else {
		//old-style 4 level domain
		$settings = array('DEVICEID'			=> $deviceId,
						  'DEVICEAUTH' 		 	=> $deviceAuth,
						  'SERVER_BASE_URL'   	=> $serverBaseUrl);

	}
	$changedArr = array( 'configId' => 'DYNAMICCONFIG',
					     'section'  => 'config',
					     'name'     => $settings);

	//update dynamic config file
	return GlobalConfig::getInstance()->setConfigArray($changedArr);

}

function getCommunicationStatus() {
		//JS first try and get communication status from APC Cache
	    $commStatus = apc_fetch("_CFG_COMM_STATUS");
        if (empty($commStatus)) {
        		//if not in cache get status from dynamic config
        		$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
        		if( empty($config["DEVICEID"]) || empty($config["DEVICEAUTH"])) {
        			 $commStatus = 'disabled';
        		}
        		else {
        			 $commStatus = $config["COMMUNICATION_STATUS"];
        		}
        }
        return $commStatus;
}

function getIPAddresesAndPorts() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	$ipsAndPorts = array("EXTERNAL_IP"     => $config["EXTERNAL_IP"],
  						 "INTERNAL_IP"    => $config["INTERNAL_IP"],
  						 "EXTERNAL_PORT"   => $config["EXTERNAL_PORT"],
  						 "INTERNAL_PORT"   => $config["INTERNAL_PORT"],
  						 "DEVICE_SSL_PORT" => $config["DEVICE_SSL_PORT"]);

	return $ipsAndPorts;
}

function isPortForwardedConnection() {
	$config = GlobalConfig::getInstance()->getConfig("UPNPCONFIG", "config");
	return (strcasecmp($config["COMMUNICATION_STATUS"],"portforwarded") == 0);
}

function isRelayConnection() {
	$config = GlobalConfig::getInstance()->getConfig("UPNPCONFIG", "config");
	return (strcasecmp($config["COMMUNICATION_STATUS"],"relayed") == 0);
}

function getRemoteAccess() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["REMOTEACCESS"];
}


function getCentralServerHost() {
	$portalHost = "";

	$dynamicConfig = getUpnpStatus("config");
	if (isset($dynamicConfig)) {
		$portalUrl = $dynamicConfig["SERVER_BASE_URL"];
		if (isset($portalUrl)) {
			$portalHost = parse_url($portalUrl,PHP_URL_HOST);
		}
	}

	return $portalHost;
}

function getCentralServerProt() {
	$portalProtocol = "https://";

	$dynamicConfig = getUpnpStatus("config");
	if (isset($dynamicConfig)) {
		$portalUrl = $dynamicConfig["SERVER_BASE_URL"];
		if (isset($portalUrl)) {
			$portalProtocol = parse_url($portalUrl,PHP_URL_SCHEME)."://";
		}
	}

	return $portalProtocol;
}

function setRemoteAccess($remoteAccess) {
	if ( ( strcasecmp($remoteAccess,"TRUE") == 0) || (strcasecmp($remoteAccess, "FALSE") == 0)) {
		return GlobalConfig::getInstance()->setConfig("DYNAMICCONFIG", "config", "REMOTEACCESS", strtoupper($remoteAccess));
	} else {
		return false;
	}
}

function getDefaultPortsOnly() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["DEFAULT_PORTS_ONLY"];
}

function setDefaultPortsOnly($defaultPortsOnly) {
	if ( ( strcasecmp($defaultPortsOnly,"TRUE") == 0) || (strcasecmp($defaultPortsOnly, "FALSE") == 0)) {
		return GlobalConfig::getInstance()->setConfig("DYNAMICCONFIG", "config", "DEFAULT_PORTS_ONLY", strtoupper($defaultPortsOnly));
	}else {
		return false;
	}
}

function setManualPortForwardConfig($manualPortForward, $manualExternalHttpPort, $manualExternalHttpsPort) {

	$changedArr = array( 'configId' => 'DYNAMICCONFIG',
						 'section'  => 'config',
						 'name'     => array('DEFAULT_PORTS_ONLY'         => 'FALSE',
						 					 'MANUAL_PORT_FORWARD'        => strtoupper($manualPortForward),
											 'MANUAL_EXTERNAL_HTTP_PORT'  => $manualExternalHttpPort,
											 'MANUAL_EXTERNAL_HTTPS_PORT' => $manualExternalHttpsPort) );

	GlobalConfig::getInstance()->setConfigArray($changedArr);
}

function clearManualPortForwardConfig() {

	$changedArr = array( 'configId' => 'DYNAMICCONFIG',
						 'section'  => 'config',
						 'name'     => array('MANUAL_PORT_FORWARD'        => 'FALSE',
											 'MANUAL_EXTERNAL_ROUTER_IP'  => '',
											 'MANUAL_EXTERNAL_HTTP_PORT'  => '',
											 'MANUAL_EXTERNAL_HTTPS_PORT' => ''));
	GlobalConfig::getInstance()->setConfigArray($changedArr);
}

function getManualportForward() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["MANUAL_PORT_FORWARD"];
}

function getManualExternalRouterIp() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["MANUAL_EXTERNAL_ROUTER_IP"];
}

function getManualExternalHttpPort() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["MANUAL_EXTERNAL_HTTP_PORT"];
}

function getManualExternalHttpsPort() {
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	return $config["MANUAL_EXTERNAL_HTTPS_PORT"];
}

function getOrionDBPath() {
	$dbConfig = getGlobalConfig("db");
	return $dbConfig["DATA_BASE_FILE_PATH"];
}

function getCrawlerStatusDBPath() {
	$dbConfig = getGlobalConfig("db");
	return $dbConfig["CRAWLER_STATUS_FILE_PATH"];
}

function isV2MediaDb() {
	$ret = true;
	$dbConfig = getGlobalConfig("db");

	if (isset($dbConfig["MEDIA_CRAWLER_HOST_FILE_PATH"])) {
		$McHostsFile = $dbConfig["MEDIA_CRAWLER_HOST_FILE_PATH"];
		if (file_exists($McHostsFile)) {
			$ret = false;
		}
	}
	return $ret;
}

function isMultiDb() {
	$configGlobal = getGlobalConfig("global");
	if(isset($configGlobal["ENABLE_MULTI_DB"])) {
		return strcasecmp("TRUE", $configGlobal["ENABLE_MULTI_DB"]) == 0;
	}

	return false;
}

function getMediaCrawlerDirName() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["MEDIA_CRAWLER_DB_DIR_NAME"])) {
		return $dbConfig["MEDIA_CRAWLER_DB_DIR_NAME"];
	}
	return null;
}

function getMediaCrawlerHostFilePath() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["MEDIA_CRAWLER_HOST_FILE_PATH"])) {
		return $dbConfig["MEDIA_CRAWLER_HOST_FILE_PATH"];
	}
	return null;
}

function getMediaCrawlerPath() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["MEDIA_CRAWLER_PATH"])) {
		return $dbConfig["MEDIA_CRAWLER_PATH"];
	}
	return null;
}

function getMediaCrawlerServiceName() {
	$dbConfig = getGlobalConfig("services");
	if(isset($dbConfig["MEDIACRAWLER_SVC_NAME"])) {
		return $dbConfig["MEDIACRAWLER_SVC_NAME"];
	}
	return null;
}

function getCommunicationServiceName() {
	$dbConfig = getGlobalConfig("services");
	if(isset($dbConfig["COMMMANAGER_SVC_NAME"])) {
		return $dbConfig["COMMMANAGER_SVC_NAME"];
	}
	return null;
}

function getCommManagerScriptStatus() {
    $config = getGlobalConfig("services");
    if(isset($config["COMMMANAGERSCRIPT_STATUS"])) {
        return $config["COMMMANAGERSCRIPT_STATUS"];
    }
    return null;
}

function getFileInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["FILE_INFO_COLUMNS"])) {
		return $dbConfig["FILE_INFO_COLUMNS"];
	}
	return null;
}

function getFileInfoColumnsV2() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["FILE_INFO_COLUMNS_V2"])) {
		return $dbConfig["FILE_INFO_COLUMNS_V2"];
	}
	return null;
}

function getFileInfoColumnsV3() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["FILE_INFO_COLUMNS_V3"])) {
		return $dbConfig["FILE_INFO_COLUMNS_V3"];
	}
	return null;
}

function getDirInfoColumnsV3() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["DIR_INFO_COLUMNS_V3"])) {
		return $dbConfig["DIR_INFO_COLUMNS_V3"];
	}
	return null;
}

function getDirInfoColumnsV2() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["DIR_INFO_COLUMNS_V2"])) {
		return $dbConfig["DIR_INFO_COLUMNS_V2"];
	}
	return null;
}

function getDirInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["DIR_INFO_COLUMNS"])) {
		return $dbConfig["DIR_INFO_COLUMNS"];
	}
	return null;
}

function getPhotosMetaInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["IMAGE_META_INFO_COLUMNS"])) {
		return $dbConfig["IMAGE_META_INFO_COLUMNS"];
	}
	return null;
}

function getMusicMetaInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["AUDIO_META_INFO_COLUMNS"])) {
		return $dbConfig["AUDIO_META_INFO_COLUMNS"];
	}
	return null;
}

function getVideoMetaInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["VIDEO_META_INFO_COLUMNS"])) {
		return $dbConfig["VIDEO_META_INFO_COLUMNS"];
	}
	return null;
}

function getOtherMetaInfoColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["OTHER_META_INFO_COLUMNS"])) {
		return $dbConfig["OTHER_META_INFO_COLUMNS"];
	}
	return null;
}

function getMusicMetaInfoResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["AUDIO_MI_RESULT_MAP"])) {
		return $dbConfig["AUDIO_MI_RESULT_MAP"];
	}
	return null;
}

function getVideoMetaInfoResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["VIDEO_MI_RESULT_MAP"])) {
		return $dbConfig["VIDEO_MI_RESULT_MAP"];
	}
	return null;
}

function getOtherMetaInfoResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["OTHER_MI_RESULT_MAP"])) {
		return $dbConfig["OTHER_MI_RESULT_MAP"];
	}
	return null;
}

function getMioCrawlerXcodeIniPath() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["MIO_CRAWLER_XCODE_INI_FILE_PATH"])) {
		return $dbConfig["MIO_CRAWLER_XCODE_INI_FILE_PATH"];
	}
	return null;
}

function getMioCrawlerPath() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["MIO_CRAWLER_PATH"])) {
		return $dbConfig["MIO_CRAWLER_PATH"];
	}
	return null;
}

function getGenreMetaGroupColumns() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["GENRE_FILE_INFO_COLUMNS"])) {
		return $dbConfig["GENRE_FILE_INFO_COLUMNS"];
	}
	return null;
}

function getAudioGenreMetaGroupResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["AUDIO_GENRE_META_GROUP_RESULT_MAP"])) {
		return $dbConfig["AUDIO_GENRE_META_GROUP_RESULT_MAP"];
	}
	return null;
}

function getVideoGenreMetaGroupResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["VIDEO_GENRE_META_GROUP_RESULT_MAP"])) {
		return $dbConfig["VIDEO_GENRE_META_GROUP_RESULT_MAP"];
	}
	return null;
}

function getOtherGenreMetaGroupResultMap() {
	$dbConfig = getGlobalConfig("db");
	if(isset($dbConfig["OTHER_GENRE_META_GROUP_RESULT_MAP"])) {
		return $dbConfig["OTHER_GENRE_META_GROUP_RESULT_MAP"];
	}
	return null;
}

function getSkipLanSecurityCheck() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "network");
	return $config["SKIP_LAN_SECURITY_CHECK"];
}

function getWdmcRequestSocket() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "db");
	return $config["WDMC_REQUEST_SOCKET"];
}

function getSmbFilePath() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "directories");
	return $config["SMB_CONFIG_PATH"];
}

function getSmbCopyFilePath()  {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "directories");
	return $config["SMB_CONFIG_COPY_PATH"];
}

function getPlatformType() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "platform");
	return $config["PLATFORM_TYPE"];
}

function getUserEmailScript() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "device");
	return $config["USER_EMAIL_SCRIPT"];
}

function getSSLCertPath() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "openssl");
	return $config["CERT_PATH"];
}

function isTrustedCertEnabled() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "openssl");
	return (strtoupper($config["TRUSTED_CERT_ENABLED"]) == "TRUE");
}

function getTrustedCertJobStartTime() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "openssl");
	return $config["TRUSTED_CERT_JOB_START"];
}

function getServerBaseUrl() {
	//first try dynamic config, then fallback to globalconfig setting if it is not set in
	//dynamic config
	$config = GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "config");
	if (empty($config["SERVER_BASE_URL"])) {
		$config = getGlobalConfig('global');
	}
	$srvUrl = parse_url($config["SERVER_BASE_URL"]);
	$port = !empty($srvUrl['port'])? ":".$srvUrl['port']:"";
	$updateUrl = $srvUrl['scheme']."://".$srvUrl['host'].$port;

	return $updateUrl;
}



/* This will be enabled function in PHP < 5.3
 *
 */
function parse_ini_string_apc($str, $ProcessSections=false) {
	if(version_compare(PHP_VERSION, '5.3.0') >= 0) { //PHP >= 5.3
		return(parse_ini_string($str, $ProcessSections));
	}

	$lines  = explode(PHP_EOL, $str);
	$return = array();
	$inSect = false;

	$lines = preg_replace('/"/i', '', $lines);
	foreach($lines as $line) {
		$line = trim($line);
		if(!$line || $line[0] == "#" || $line[0] == ";")
		continue;
		if($line[0] == "[" && $endIdx = strpos($line, "]")) {
			$inSect = substr($line, 1, $endIdx-1);
			continue;
		}
		if(!strpos($line, '='))
		continue;

		$tmp = explode("=", $line, 2);
		if($ProcessSections && $inSect)
		$return[$inSect][trim($tmp[0])] = ltrim($tmp[1]); else
		$return[trim($tmp[0])] = ltrim($tmp[1]);
	}
	return $return;
}

function getDeviceRegistrationUrl() {
	$deviceReg = getGlobalConfig('device_registration');
	return $deviceReg['REGISTER_URL'];
}

function getDeviceTestRegistrationUrl() {
	$deviceReg = getGlobalConfig('device_registration');
	return $deviceReg['TEST_REGISTER_URL'];
}

function getDeviceTestSerial() {
	$deviceReg = getGlobalConfig('device_registration');
	return $deviceReg['TEST_SERIAL'];
}

function getShareSizeFilePath(){
	$filePath = getGlobalConfig('shares');
	return $filePath['SHARE_SIZE_CACHE'];
}

function getSharesPath() {
	$settings = getGlobalConfig('directories');
	return $settings['SHARES_PATH'];
}

function getWebdavShareMount() {
	$webdav = getGlobalConfig('webdav');
	return $webdav['WEBDAV_SHARE_MOUNT'];
}

function getUSBmountpath(){
	$mountpath = getGlobalConfig('usb');
	return $mountpath['USB_MOUNT_PATH'];
}

function getNTPServiceValidity(){
	$ntpService = getGlobalConfig('ntp_server');
	return $ntpService['NTP_SERVICE'];
}

function getDefaultNetworkInterface(){
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "network");
	return $config["DEFAULT_NETWORK_INTERFACE"];
}

function getSitesAvailablePath() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "apache");
	return $config["APACHE_SITES_AVAILABLE"];
}

function getSitesEnabledPath() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "apache");
	return $config["APACHE_SITES_ENABLED"];
}

function getRestApiConfEnabled() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "apache");
	return $config["APACHE_REST_API_CONF_ENABLED"];
}

function getRestApiConfTrusted() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "apache");
	return $config["APACHE_REST_API_CONF_TRUSTED"];
}

function getRestApiConfUntrusted() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "apache");
	return $config["APACHE_REST_API_CONF_UNTRUSTED"];
}

function getConfigBackupPath() {
	$config = GlobalConfig::getInstance()->getConfig("GLOBALCONFIG", "directories");
	return $config["CONFIG_BACKUP_PATH"];
}
