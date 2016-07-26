<?php

namespace System\Device\Security\Model;

class DeviceSecurity {

	public function getSecurityConfiguration() {
		$conf=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/device_security_get_config.sh", $conf, $retVal);
		if ($retVal !== 0) {
			throw new \System\Device\Security\Exception(sprintf('"device_security_get_config" execution failed. Returned with "%d"', $retVal), 500);
		}
		return $conf[0];
	}

	public function updateSecurityConfiguration($queryParams) {

		$securityConfig = $queryParams['locked'];
		$conf=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/device_security_set_config.sh $securityConfig", $conf, $retVal);

		if ($retVal !== 0) {
			throw new \System\Device\Security\Exception(sprintf('"storage_transfer_set_config" execution failed. Returned with "%d"', $retVal), 500);
		}

	}

}