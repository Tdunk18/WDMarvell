<?php
/**
 * \file common\logger.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 *
 */
class Logger {

	private $_clazz;
	private $msgLog;
	private static $cliBuff = array();
	private static $outFlag = 0;
	const CLI = 1;
	const SYSLOG = 2;

	function __construct($className) {

		$this->_clazz = $className;
                require_once(__DIR__ . DS . 'logmessages.inc');
		$this->msgLog = new LogMessages();
	}

	private function _log($outputFlag, $level, $methodName, $msg) {

		if ($outputFlag > 0) {

			if($outputFlag & self::SYSLOG) {
				$this->msgLog->LogData('ORION_LOG', $this->_clazz, $methodName, " [$level] $msg");
			}

			if ($outputFlag & self::CLI) {
				$respLog = "$this->_clazz.$methodName [$level] $msg";
			}

			$args = func_get_args();
			array_shift($args);
			array_shift($args);
			array_shift($args);
			array_shift($args);
			$i = 0;
			foreach($args as $arg) {
				$out = print_r($arg, true);
				if($outputFlag & self::CLI) {
					$respLog .= "\n$this->_clazz.$methodName [$level] dbgvar$i: $out";

				}
				if ($outputFlag & self::SYSLOG) {
					//strip new line char for syslog to print
					$lineOut = preg_replace("/\r|\n/", "\\n", $out);
					$this->msgLog->LogData('ORION_LOG', $this->_clazz, $methodName, " [$level] dbgvar$i: " . $lineOut);
				}
				$i++;
			}
			if($outputFlag & self::CLI) {
                            \Core\Logger::getInstance()->info($respLog);
				self::$cliBuff[]= $respLog;
			}
		}
	}

	function debug($methodName, $msg) {
		if(self::$outFlag > 0) {
			$args = func_get_args();
			array_unshift($args, self::$outFlag, 'DEBUG');
			call_user_func_array(array($this,'_log'), $args);
		}
	}

	function error($methodName, $msg) {
		$args = func_get_args();
		//always log to syslog if it's error
		array_unshift($args, self::SYSLOG | self::$outFlag, 'ERROR');
		call_user_func_array(array($this,'_log'), $args);

	}

	static function getCliBuffer() {
		return self::$cliBuff;
	}

	static function init() {
        require_once ('globalconfig.inc');
		$debug= getParameter(null, 'orion_debug', PDO::PARAM_STR, null);

		if (!isset($debug)) {
			$gconf = getGlobalConfig("global");
			$debug=  isset($gconf['ORION_DEBUG']) ? $gconf['ORION_DEBUG'] : null;
		}
		if(isset($debug)) {
			$subject = $debug;
			if (preg_match_all("/cli/i", $subject, $matches) > 0) {
				self::$outFlag |= self::CLI;
			}
			if (preg_match_all("/syslog/i", $subject, $matches) > 0) {
				self::$outFlag |= self::SYSLOG;
			}
		}

	}

	static function debugPrint() {
		if ((self::$outFlag & self::CLI) === 0) {
			return;
		}

		$debugCollecion = Logger::getCliBuffer();
		$padding = "     ";
		echo '<!--';
		foreach ($debugCollecion as $key => $debugmsg) {
			if ($padding != null) {
				if (!is_array($debugmsg)) {
					$debugmsg = explode("\n", $debugmsg);
				}

				foreach ($debugmsg as &$line) {
					$line = $padding . $line;
				}
				$debugmsg = implode("\n", $debugmsg);

			}

			echo "
DEBUG Message:   BEGIN($key) {
			$debugmsg
}END($key)


                ";
		}
		echo '-->';
	}

}

Logger::init();
function getLogger($object = NULL) {
	static $logarr = array();

	if (!isset($object)) {
		$className = ".GLOBAL";
	} else if (is_object($object)) {
		$className = get_class($object);
	} else if (is_string($object)) {
		$className = $object;
	} else {
		$className = "UNKNOWN-$object";
	}
	if (!isset($logarr[$className])) {
		$logarr[$className] = new Logger($className);
	}

	return $logarr[$className];
}