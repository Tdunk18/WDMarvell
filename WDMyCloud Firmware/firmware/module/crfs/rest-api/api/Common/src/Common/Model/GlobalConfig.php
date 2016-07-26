<?php
namespace Common\Model;
/**
 * \file GlobalConfig.php
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
require_once(COMMON_ROOT . "/includes/requestscope.inc");


use \Core\Config;
use \Core\SystemInfo;
use \Core\Logger;

define('RETRY_COUNT', 5); 	  // count of read, write time


class GlobalConfig {

	private static $instance = null;

	/**
	 * getInstance()
	 *
	 * Returns the singleton instance of this class
	 *
	 * @return GlobalConfig implemantation class instance
	 */
	static public function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = new GlobalConfig();

			if (!isset(Config::$globalConfig["GLOBALCONFIGPATH"])) {
				Config::$globalConfig["GLOBALCONFIGPATH"] = "globalconfig.ini";
			}
			if (!isset(Config::$globalConfig["DYNAMICCONFIGPATH"])) {
				Config::$globalConfig["DYNAMICCONFIGPATH"] = "%DYNAMIC_CONFIG%/dynamicconfig.ini";
			}

			if (!isset(Config::$globalConfig["UPNPCONFIGPATH"])) {
				Config::$globalConfig["UPNPCONFIGPATH"] = "upnpstatus.conf";
			}
		}
		return self::$instance;
	}

	/**
	 * To ensure we can read associatve arrays from a PHP INI file with PHP 5.2 and earlier, we
	 * are using a format that can be parsed in 5.2 and earlier, example:
	 *
	 * AUDIO_MIMETYPES[]="mp3:audio/mp3" will get converted to UDIO_MIMETYPES["mp3"] = "audio/mp3"
	 * by this function
	 *
	 */
	public function readAssocArrays($config) {
		$newConfig = array();
		foreach ($config as $module=>$moduleConfig) {
			$newModuleConfig = array();
			foreach ($moduleConfig as $name=>$value) {
				if (is_array($value)) {
					$arrayVal = array();
					foreach ($value as $arrayEle) {
						if (($pos = strpos($arrayEle, ":")) !== false) {
							$var = substr($arrayEle, 0, $pos);
							$val = substr($arrayEle, $pos+1);
							$arrayVal[$var]=$val;
						} else {
							array_push($arrayVal, $arrayEle);
						}
					}
					$newModuleConfig[$name] = $arrayVal;
				} else {
					$newModuleConfig[$name]=$value;
				}

			}
			$newConfig[$module] = $newModuleConfig;
		}
		return $newConfig;
	}

	/**
	 * To ensure we can read associative arrays from a PHP INI file with PHP 5.2 and earlier, we
	 * are using a format that can be parsed in 5.2 and earlier, example:
	 *
	 * AUDIO_MIMETYPES["mp3"] = "audio/mp3" will get converted to:
	 * AUDIO_MIMETYPES[]="mp3:audio/mp3" by this function
	 *
	 * @param unknown_type $globalConfig
	 * @return unknown_type
	 */
	public function writeAssocArrays($config) {
		$newConfig = array();
		foreach ($config as $module=>$moduleConfig) {
			$newModuleConfig = array();
			foreach ($moduleConfig as $name=>$value) {
				if (is_array($value)) {
					$keys = array_keys($value);
					$arrayVal = array();
					foreach ($keys as $key) {
						if (!is_int($key)) {
							//key is not array index, therefore associative key
							$value[$key] = $key . ':' . $value[$key];
						}
						array_push($arrayVal, $value[$key]);
					}
					$newModuleConfig[$name] = $arrayVal;
				} else {
					$newModuleConfig[$name]=$value;
				}
			}
			$newConfig[$module] = $newModuleConfig;
		}
		return $newConfig;
	}

	public function parseConfigFilePath($filePath, $defaultConfigPath) {
		$pos1 = strpos($filePath, "%");
		if ($pos1 === FALSE) {
			//no substitution, use default config path
			return $defaultConfigPath . $filePath;
		}
		$pos2 = strpos($filePath, "%", $pos1+1);
		if ($pos2 === FALSE || ($pos2-$pos1 <= 1)) {
			//no substitution, single ocurrence of '%', use default config path
			return $defaultConfigPath . $filePath;
		}
		$configKey = substr($filePath, $pos1+1,$pos2-$pos1-1);
		$searchVal = substr($filePath, $pos1,$pos2-$pos1+1);
		$configGlobal = getGlobalConfig("global");
		$configVal = $configGlobal[$configKey];
		if ( isset($configVal) ) {
			$filePath = str_replace($searchVal, $configVal, $filePath );
		}
		return $filePath;
	}

	public function getConfigFilePath($configId, $attachFileName = true) {
		//check if the last character is slash, if yes - remove it to aviod having double slash in the path
		$webAppPath = getWebAppPath();
		if(isset($webAppPath[mb_strlen($webAppPath, 'UTF-8')-1]) && $webAppPath[mb_strlen($webAppPath, 'UTF-8')-1]=='/'){
			$webAppPath = substr($webAppPath, 0, -1);
		}

		if ( (isset($_SERVER["WINDIR"]) && (stripos($_SERVER["WINDIR"], "windows") !== false)) ||
				(isset($_SERVER["windir"]) && (stripos($_SERVER["windir"], "windows") !== false))
		) {
			//we are running on windows
			$defaultConfigPath = $webAppPath . "/config/Windows/";
		} else {
			//'tis Linux
			$defaultConfigPath = $webAppPath . "/config/";
		}
		if(!$attachFileName){
			return $defaultConfigPath;
		}
		$globalConfigPath = !empty(Config::$globalConfig[$configId . "PATH"]) ? Config::$globalConfig[$configId . "PATH"] : 'globalconfig.ini';
		$configFilePath = $this->parseConfigFilePath($globalConfigPath, $defaultConfigPath);

		return  $configFilePath;
	}

	public function getTmpConfigFilePath($configId) {
		//we only need to do this for dynamicconfig,ini, so this is hard-coded for now
		if ($configId == "DYNAMICCONFIG") {
			$config = $this->getConfig("GLOBALCONFIG", "global");
			return $config["DYNAMIC_CONFIG_TMP"];
		}
		return NULL;
	}

	/* Read config ini file
	 * CAUTION: apc function is different between php 5.3 and 5.2.
	* *
	/* Read config ini file
	* CAUTION: apc function is different between php 5.3 and 5.2.
	* */
	public function readConfigFile($configId) {
		$configSettings = array();
		$configFilePath = $this->getConfigFilePath($configId);
		$isExit     = true;
		$countRetry = 0;
		$returnTrueFlag = false;
                if($configId !== 'DYNAMICCONFIG') {
                    $readData = apc_fetch('CONFIG_GLOBAL_AND_PLATFORM_NODYNAMIC');
                    if($readData) {
                        if(version_compare(PHP_VERSION, '5.3.0') < 0) { //PHP < 5.3
                            $readData = $readData[0];
                        }
                        Config::$globalConfig[$configId] = $readData;
                        return;
                    }
                }

		do {
			if (isset($configFilePath) && file_exists($configFilePath) && !is_dir($configFilePath)) {
				$configSettings = parse_ini_file($configFilePath, true);
				if(!empty($configSettings)) {
					$configSettings = $this->readAssocArrays($configSettings);
					$isExit = false;
					$returnTrueFlag= true;
				} else {
					usleep(200);
					$countRetry++;
				}
			} else {
				usleep(500);
				$countRetry++;
			}

			if($returnTrueFlag){
				Config::$globalConfig[$configId] = $configSettings;
				//only check platform config for global config
				if($configId != 'DYNAMICCONFIG'){
					//get path to the directory without filename 'globalconfig.ini' attach. We will attach our own filename
					$filePathPlatform = $this->getConfigFilePath($configId, false);

					//if the devicetype is supposed to have platform specific settings
					//and the file with those settings exists

					//we need to update Config::$globalConfig before using getDeviceTypeName() function, since it will pull information out of it
					//we pass true parameter to it for it to use the config array directly instead of calling getConfig() function, since that function
					//will in turn call the function that we are inside of and we will get an infinite loop
					$filePathPlatform = $filePathPlatform . 'platformConfig/' . getDeviceTypeName(true) . '/platformconfig.ini';
					if (is_array($configSettings)
							&& file_exists($filePathPlatform)
							&& !is_dir($filePathPlatform)){
						//parse the file with platform specific settings
						$configPlatformSettings = parse_ini_file($filePathPlatform, true);
						//trasform it into an associativ array
						$configPlatformSettings = $this->readAssocArrays($configPlatformSettings);

						//iterate through the array of platform-spefic settings and merge
						//the settings for each category with global settings for such category
						//if a setting exists in both files the platform specific setting takes precedence
						//so order of arrays getting merged by "+" matters
						//if category does not exist in global settings
						foreach($configPlatformSettings as $configPlatformSettingsK => $configPlatformSettingsV){
							$configSettings[$configPlatformSettingsK] = isset($configSettings[$configPlatformSettingsK]) ?
							$configPlatformSettingsV + $configSettings[$configPlatformSettingsK] :
							$configPlatformSettingsV;
						}
                                                apc_add('CONFIG_GLOBAL_AND_PLATFORM_NODYNAMIC', $configSettings);
						Config::$globalConfig[$configId] = $configSettings;
					}
				}
				return true;
			}
		} while($isExit && $countRetry < RETRY_COUNT);

		return false;
	}

	/* Write config ini file
	 *
	* */
	/* Write config ini file
	 *
	* */
	public function writeConfigFile($configId) {
		if (isset(Config::$globalConfig[$configId])) {
			$cr = PHP_EOL;

			$configFilePath    = $this->getConfigFilePath($configId);
			$tmpConfigFilePath = $this->getTmpConfigFilePath($configId);

			$isExistTmpFile = file_exists($tmpConfigFilePath) ? true : false;

			$content      = ""; // buffer of config/dynamicconfig.ini
			$contentTmp   = ""; // buffer of /tmp/dynamicconfig.ini

			$globalConfig = Config::$globalConfig[$configId];
			$globalConfig = $this->writeAssocArrays($globalConfig);
			foreach ($globalConfig as $module=>$moduleConfig) {
				$content .= "[". $module . "]"  . $cr;

				foreach ($moduleConfig as $name=>$value) {
					if (!is_array($value)) {
						$content .= $name . "=\"" . $value . "\""  . $cr;
						if ($isExistTmpFile) {
							$contentTmp .= $name . "=\"" . $value . "\""  . $cr;
						}
					} else {
						foreach ($value as $arrayEle) {
							$content .= $name . "[]=\"" . $arrayEle . "\"" . $cr;
							if ($isExistTmpFile) {
								$contentTmp .= $name . "[]=\"" . $arrayEle . "\"" . $cr;
							}
						}
					}
				}
			}

			$isExit     = true;
			$countRetry = 0;
			do {
				if(file_put_contents($configFilePath, $content, LOCK_EX)) {
					if($configId == 'DYNAMICCONFIG') {
						if (\RequestScope::getInstance()->isApcDirty($configId)) {
							Logger::getInstance()->err(__FUNCTION__ . ", APC WRITE DIRTY: $configId, content: " . $content);

						}

						if(version_compare(PHP_VERSION, '5.3.0') >= 0) { //PHP >= 5.3

							if (!apc_store($configId, $content)) {
								Logger::getInstance()->err(__FUNCTION__ . ", APC WRITE FAILED: $configId, content: " .$content);

							}
						} else {

							if (!apc_store($configId, array($content))) {
								Logger::getInstance()->err(__FUNCTION__ . ", APC WRITE FAILED: $configId, content: " . $content);

							}
						}
						\RequestScope::getInstance()->setApcDirty($configId);
						file_put_contents($configFilePath . "_safe", $content, LOCK_EX);
					}
					$isExit = false;
				} else {
					$countRetry++;
					usleep(200);
				}
			} while($isExit && $countRetry < RETRY_COUNT);

			$isExit     = true;
			$countRetry = 0;
			do {
				if (!empty($contentTmp) && file_put_contents($tmpConfigFilePath, $contentTmp, LOCK_EX)) {
					$isExit = false;
				} else {
					$countRetry++;
					usleep(200);
				}

			} while($isExit && $countRetry < RETRY_COUNT);
		}
		return true;
	}

	// added to restore config file from safe_copy
	public function restoreConfig($configId, $section) {
		$configFilePath = $this->getConfigFilePath($configId);
		$safeCopyPath = $configFilePath . "_safe";

		if(!file_exists($safeCopyPath)) {
			return false;
		}

		$safeSettings = parse_ini_file($safeCopyPath, true);

		//check that we have all of the settings from the safe copy and it
		//is not corrupted
		$totalSafeSettings = isset($safeSettings[$section]['TOTAL_SETTINGS']) ? $safeSettings[$section]['TOTAL_SETTINGS'] : null;
        // ITR: 94551 - Cannot push fixed DynamicConfig to field devices so append +1 (hack) 
        // to avoid retoring config again & again
		if (empty($totalSafeSettings) || (sizeof($safeSettings[$section])+1 != $totalSafeSettings )) {
			//echo("Unable to restore: " . $configId . ", safe copy is truncated<br />");
			return false;
		} else {
            $isCopied = copy($safeCopyPath, $configFilePath);
			if($isCopied){
                Config::$globalConfig[$configId] = $safeSettings;
            }
            return $isCopied;
		}
	}

	public function getConfig($configId, $section) {
		if (!isset(Config::$globalConfig[$configId]) || $configId == "DYNAMICCONFIG") {
			$this->readConfigFile($configId);
			//If not, copy safe copy to live copy as safe copy should have the latest edits
			if ($configId == "DYNAMICCONFIG") {
				$configSettings = isset(Config::$globalConfig["DYNAMICCONFIG"][$section]) ? Config::$globalConfig["DYNAMICCONFIG"][$section] : null;
				$totalSettings  = isset($configSettings['TOTAL_SETTINGS'])   ? $configSettings['TOTAL_SETTINGS']   : null;
                // ITR: 94551 - Cannot push fixed DynamicConfig to field devices so append +1 (hack) 
                // to avoid retoring config again & again
				if (!isset($totalSettings) || (sizeof(Config::$globalConfig["DYNAMICCONFIG"][$section])+1 != $totalSettings )) {
					//try restoring missing settings from local safe copy
					if (!$this->restoreConfig($configId, $section)) {
						return false;
						//echo("Dynamic Config file was truncated, failed to restore it from safe copy");
					}
				} // if (!isset($totalSettings)
			}
		}
		$globalConfig = Config::$globalConfig[$configId];
		if (isset($globalConfig[$section])) {
			return($globalConfig[$section]);
		}

		//trace error here
		return NULL;
	}

	/* Will be setting up as indivisble value
	 *
	*/
	public function setConfig($configId, $section, $name, $value) {

		//for now and for security, we are only going to allow values
		//to be set for parameters that are already defined in
		//globalconfig.ini

		Config::$globalConfig[$configId][$section][$name] = $value;
		GlobalConfig::getInstance()->writeConfigFile($configId);
		return TRUE;
	}

	/* Array version of setConfig to write all changing in one time
	 *
	*/
	public function setConfigArray($changedArray) {
		$configId = $changedArray['configId'];
		$section  = $changedArray['section'];

		//for now and for security, we are only going to allow values
		//to be set for parameters that are already defined in
		//globalconfig.ini
		foreach($changedArray['name'] as $key => $val) {
			Config::$globalConfig[$configId][$section][$key] = $val;
		}
		$this->writeConfigFile($configId);
		return true;
	}
}