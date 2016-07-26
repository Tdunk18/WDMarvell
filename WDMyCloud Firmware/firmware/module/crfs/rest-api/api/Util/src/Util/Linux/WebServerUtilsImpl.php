<?php

namespace Util\Linux;

use Util\WebServerUtils;

/**
 * Linux/Apache 2.2 specific class for controlling the web server
 *
 * This class should have platform and web-server specific implementations
 *
 * @author joesapsford
 *
 */

class WebServerUtilsImpl extends WebServerUtils {

	public function startServer() {
        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
        exec_runtime("sudo /usr/sbin/apache2ctl start", $output, $retVal);
		return $retVal;
	}

	public function stopServer() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache2ctl stop", $output, $retVal);
		return $retVal;
	}

	public function restartServer() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache2ctl restart", $output, $retVal);
		return $retVal;
	}

	public function reloadServerConfig() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache2ctl -k graceful", $output, $retVal);
		return $retVal;
	}

	public function createWebUser($deviceUserId, $parentUsername, $deviceUserAuth) {
        // for testing, return true
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return true;
        }
		// create apache user
		$output=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/addUser_apache.sh $deviceUserId $deviceUserAuth $parentUsername", $output, $retVal );

		if($retVal !== 0) {
//			self::$logObj->LogData('OUTPUT', __CLASS__,  __FUNCTION__,  "ERROR: addUser_apache.sh call failed");
			return false;
		}

	}

	public function deleteWebUser($deviceUserId, $parentUsername=null) {
        // for testing, return true
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return true;
        }

	    // delete the apache user
		$output=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/deleteUser_apache.sh 'delete_dev_user' $deviceUserId $parentUsername", $output, $retVal );
		if($retVal !== 0) {
			//self::$logObj->LogData('OUTPUT', __CLASS__,  __FUNCTION__,  "ERROR: deleteUser_apache.sh call failed, $output, $retVal");
			return false;
		}
	}
}