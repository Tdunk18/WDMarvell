<?php

namespace Remote\Device\Linux;

class SerialNumberImpl extends \Remote\Device\SerialNumber {

	public function getSerialNumber() {
		if ($_SERVER['APPLICATION_ENV'] == 'testing') {
			return '1234567';
		}
		$deviceConfig = getGlobalConfig('device');
		$serialNum = '';
		$serialNumScript = $deviceConfig['SERIAL_NUM_SCRIPT'];
		if (isset($serialNumScript) && !empty($serialNumScript)) {
			$serialNumScript = str_replace('%DQ%','"', $serialNumScript);
			$serialNumArr =array();
			exec_runtime($serialNumScript, $serialNumArr);
			if (isset($serialNumArr[0]) ) {
				$serialNum = $serialNumArr[0];
			}
		}
		return $serialNum;
	}

}