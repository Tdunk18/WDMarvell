<?php

namespace Storage\Transfer\Model;

class StorageTransfer {

	public function getStorageConfiguration($storage) {
		$retVal=$conf=null;
		exec_runtime("sudo /usr/local/sbin/storage_transfer_get_config.sh $storage", $conf, $retVal);
		if ($retVal !== 0) {
			throw new \Storage\Transfer\Exception('"storage_transfer_get_config" execution failed. Returned with "' . $retVal . '"', 500);
		}
		$result = json_decode($conf[0], true);
		return $result;
	}

	public function updateStorageConfiguration($queryParams) {
		$retVal=$conf=null;
		$parameterString = $queryParams['storage_type']. " ";

		if (isset($queryParams["auto_transfer"])) {
			$autoTransfer = strtolower($queryParams['auto_transfer']);
			$parameterString.="--auto_transfer $autoTransfer ";
		}

		if (isset($queryParams["transfer_mode"])) {
			$transferMode = $queryParams['transfer_mode'];
			$parameterString.="--transfer_mode $transferMode";
		}

		exec_runtime("sudo /usr/local/sbin/storage_transfer_set_config.sh $parameterString", $conf, $retVal);

		if ($retVal !== 0) {
			throw new \Storage\Transfer\Exception('"storage_transfer_set_config" execution failed. Returned with "' . $retVal . '"', 500);
		}

		return true;
	}

	public function initiateStorageTransfer($operation, $shareName=null) {
	    $retVal=$conf=null;
	    $share = escapeshellarg($shareName);
		if (isset($operation)) {
			$transferMode = escapeshellarg($operation);
			exec_runtime("sudo nohup /usr/local/sbin/storage_transfer_start_now.sh $transferMode $share 1>/dev/null &", $conf, $retVal, false);
		} else {
		    //Default value of storage transfer mode is saved by user into the settings via storage_transfer API. If this variable is not passed it will follow this saved behaviour.
		    exec_runtime("sudo nohup /usr/local/sbin/storage_transfer_start_now.sh $share 1>/dev/null &", $conf, $retVal, false);
		}

		if ($retVal!==0) {
		    if(isset($conf)){
		        if(strcmp($conf[0], 'Unable to locate storage device') == 0){
		            return "Unable to locate storage device";
		        }
		    }
			throw new \Storage\Transfer\Exception('"storage_transfer_start_now" execution failed. Returned with "'. $retVal . '"', 500);
		}
	    return;
	}

}
