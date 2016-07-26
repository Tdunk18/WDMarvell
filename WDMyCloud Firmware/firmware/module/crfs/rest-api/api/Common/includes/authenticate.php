<?php
/**
 * \file common\authenticate.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/logmessages.inc');

function authenticateAsOwner($queryParams) {
	$logObj = new LogMessages();

	if( !isset($queryParams["pw"]) ) {
		$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'owner password not supplied');
		return FALSE;
	}
	setlocale(LC_CTYPE, "en_US.UTF-8");
	
	define('SKIP_SHELL_SCRIPT',false);

	if (!SKIP_SHELL_SCRIPT) {
		//Verify owner name
		$ownerName = $retVal = null;
		exec_runtime("sudo /usr/local/sbin/getOwner.sh", $ownerName, $retVal);
		if($retVal !== 0) {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'getOwner.sh failed');
			return NULL;
		}
		if($ownerName[0] !== $queryParams['owner']) {
			$logObj->LogParameters(NULL, __FUNCTION__, $ownerName[0]);
			$logObj->LogParameters(NULL, __FUNCTION__, "{$queryParams["owner"]}");
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'owner do not match');
			return FALSE;
		}

		//Verify password

		$ownerName = $retVal = null;
		exec_runtime("sudo /usr/local/sbin/getOwner.sh", $ownerName, $retVal);
		if($retVal !== 0) {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'getOwner.sh failed');
			return NULL;
		}
		$ownerName = $ownerName[0];
		unset($hash);
		exec_runtime("sudo awk -v usr=" . escapeshellarg($ownerName) . " -F: '{if ($1 == usr) print $2}' /etc/shadow", $hash, $retVal,false);
		if($retVal !== 0) {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
			return NULL;
		}
		$hash = $hash[0];
		unset($passwd);
		$passwd = $queryParams["pw"];
		if("$passwd" === FALSE) {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
			return FALSE;
		}
		if($hash === '') {
			if($queryParams["pw"] === "") {
				return TRUE;
			} else {
				$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
				return FALSE;
			}
		}

		$salt = substr($hash, 0, 12);
		unset($challange);
		$challange = crypt($passwd, "$salt");
		if($challange === $hash) {
			return TRUE;
		} else {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid password');
			return FALSE;
		}

	} else {

		unset($ownerUid);
		unset($ownerName);
		$useShellScriptForOwnerName = false;
		$useShellScriptForHash = false;
		$nasConfig = @parse_ini_file('/etc/nas/config/wd-nas.conf', true);

		if ($nasConfig === false) {
			$useShellScriptForOwnerName = true;
			$useShellScriptForHash = true;
		} else{
			if (!isset($nasConfig['settings']['SH_SETUP_PARAM_FILE']) || !isset($nasConfig['settings']['PASSWD_FILE'])) {
				$useShellScriptForOwnerName = true;
			}
			if (!isset($nasConfig['settings']['SHADOW_FILE'])) {
				$useShellScriptForHash = true;
			}
		}

		if (SKIP_SHELL_SCRIPT && !$useShellScriptForOwnerName) {
			$handle = @fopen($nasConfig['settings']['SH_SETUP_PARAM_FILE'], 'r');
			if ($handle === false) {
				$useShellScriptForOwnerName = true;
			} else {
				while (($buffer = fgets($handle)) !== false) {
					if ($buffer[0] != '#') {
						$data = explode('=', trim($buffer));
						if (isset($data[0]) && isset($data[1]) && $data[0] == 'ownerUid') {
							$ownerUid = str_replace('"','', $data[1]);
							break;
						}
					}
				}
				fclose($handle);
				if (isset($ownerUid)) {
					$handle = @fopen($nasConfig['settings']['PASSWD_FILE'], 'r');
					if ($handle === false) {
						$useShellScriptForOwnerName = true;
					} else {
						while (($buffer = fgets($handle)) !== false) {
							if ($buffer[0] != '#') {
								$data = explode(':', trim($buffer));
								if (isset($data) && !empty($data) && isset($data[0]) && isset($data[2]) && isset($data[3]) && $data[3] == '1000' && $data[2] == $ownerUid) {
									$ownerName = $data[0];
									break;
								}
							}
						}
						fclose($handle);
						if (!isset($ownerName)) {
							$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'getOwner failed');
							return NULL;
						}
					}
				}
			}
		}

		if (!SKIP_SHELL_SCRIPT || $useShellScriptForOwnerName) {
			$ownerName = $retVal = null;
			exec_runtime("sudo /usr/local/sbin/getOwner.sh", $ownerName, $retVal);
			if($retVal !== 0) {
				$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'getOwner.sh failed');
				return NULL;
			}
			$ownerName = $ownerName[0];
		}

		unset($hash);
		if (SKIP_SHELL_SCRIPT && !$useShellScriptForHash) {
			$handle = @fopen($nasConfig['settings']['SHADOW_FILE'], 'r');
			if ($handle === false) {
				$useShellScriptForHash = true;
			} else {
				while (($buffer = fgets($handle)) !== false) {
					if ($buffer[0] != '#') {
						$data = explode(':', trim($buffer));
						if (isset($data[0]) && isset($data[1]) && $data[0] == $ownerName) {
							$hash = $data[1];
							break;
						}
					}
				}
				fclose($handle);
				if (!isset($hash)) {
					$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
					return NULL;
				}
			}
		}

		if (!SKIP_SHELL_SCRIPT || $useShellScriptForHash) {
			$hash = $retVal = null;
			exec_runtime("sudo awk -v usr=" . escapeshelarg($ownerName) . " -F: '{if ($1 == usr) print $2}' /etc/shadow", $hash, $retVal, false);
			if($retVal !== 0) {
				$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
				return NULL;
			}
			$hash = $hash[0];
		}

		$decodedPw = base64_decode($queryParams["pw"], false);
		if("$decodedPw" === FALSE) {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
			return FALSE;
		}

		if($hash === '') {
			if($queryParams["pw"] === "") {
				return TRUE;
			} else {
				$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
				return FALSE;
			}
		}

		$salt = substr($hash, 0, 12);
		unset($challange);
		$challange = crypt($decodedPw, "$salt");

		if($challange === $hash) {
			return TRUE;
		} else {
			$logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid password');
			return FALSE;
		}
	}
}