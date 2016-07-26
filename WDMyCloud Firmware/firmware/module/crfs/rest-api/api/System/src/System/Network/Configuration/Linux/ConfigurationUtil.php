<?php

namespace System\Network\Configuration\Linux;

//require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');
require_once(SYSTEM_ROOT . '/includes/SshConfiguration.php');
require_once(SYSTEM_ROOT . '/includes/NetworkConfiguration.php');
require_once(SYSTEM_ROOT . '/includes/NetworkServicesConfiguration.php');
require_once(SYSTEM_ROOT . '/includes/NetworkWorkgroup.php');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

class ConfigurationUtil {

	function getNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$netConfObj = new \NetworkConfiguration();
		$ifname = $queryParams["ifname"];
		return $netConfObj->getNetworkConfig($ifname);
	}

	function putNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$netConfObj = new \NetworkConfiguration();
		$result = $netConfObj->modifyNetworkConfig($queryParams);
		return $result;
	}

	function getNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$networkServicesConfigObj = new \NetworkServicesConfiguration();
		return $networkServicesConfigObj->getConfig();
	}

	function putNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$networkServicesConfigObj = new \NetworkServicesConfiguration();
		$result = $networkServicesConfigObj->modifyConfig($queryParams);
		return $result;
	}

	function getNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		$networkWorkgroupObj = new \NetworkWorkgroup();
		return $networkWorkgroupObj->getConfig();
	}


	function putNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		$networkWorkgroupObj = new \NetworkWorkgroup();
		$result = $networkWorkgroupObj->modifyConfig($queryParams);
		return $result;
	}

	function getSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml') {
		$sshConfigObj = new \SshConfiguration();
		return $sshConfigObj->getConfig();

	}

	function putSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){

		$sshConfigObj = new \SshConfiguration();
		$result = $sshConfigObj->modifyConfig($queryParams);
		return $result;
	}

}