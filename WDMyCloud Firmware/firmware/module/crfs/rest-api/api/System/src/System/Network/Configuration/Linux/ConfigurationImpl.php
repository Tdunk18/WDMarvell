<?php

namespace System\Network\Configuration\Linux;

use System\Network\Configuration\AbstractConfiguration;

class ConfigurationImpl extends AbstractConfiguration {

	function getNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->getNetworkConfiguration($urlPath, $queryParams, $ouputFormat);
	}


	function putNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->putNetworkConfiguration($urlPath, $queryParams, $ouputFormat);
	}

	function postNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function deleteNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function getNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->getNetworkServicesConfiguration($urlPath, $queryParams, $ouputFormat);
	}

	function putNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->putNetworkServicesConfiguration($urlPath, $queryParams, $ouputFormat);
	}

	function postNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function deleteNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function getNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->getNetworkWorkgroup($urlPath, $queryParams, $ouputFormat);
	}


	function putNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->putNetworkWorkgroup($urlPath, $queryParams, $ouputFormat);
	}

	function postNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function deleteNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function getSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->getSshConfiguration($urlPath, $queryParams, $ouputFormat);
	}

	function putSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		$instance = new ConfigurationUtil();
		return $instance->putSshConfiguration($urlPath, $queryParams, $ouputFormat);
	}

	function postSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

	function deleteSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml'){
		header("Allow: GET, PUT");
		header("HTTP/1.0 405 Method Not Allowed");
	}

}