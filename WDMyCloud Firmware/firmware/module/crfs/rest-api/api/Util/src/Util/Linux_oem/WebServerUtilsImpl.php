<?php

namespace Util\Linux_oem;

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
        exec_runtime("sudo /usr/sbin/apache start web;sudo /usr/sbin/apache start dav", $output, $retVal, false);
		return $retVal;
	}

	public function stopServer() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache stop web;sudo /usr/sbin/apache stop dav", $output, $retVal, false);
		return $retVal;
	}

	public function restartServer() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache restart web;sudo /usr/sbin/apache restart dav", $output, $retVal, false);
		return $retVal;
	}

	public function reloadServerConfig() {
	        // for testing, return empty string = success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return '';
        }
        $output=$retVal=null;
	    exec_runtime("sudo /usr/sbin/apache restart web;sudo /usr/sbin/apache restart dav", $output, $retVal, false);
		return $retVal;
	}

	public function createWebUser($deviceUserId, $parentUsername, $deviceUserAuth) {
 			return false;
	}

	public function deleteWebUser($deviceUserId, $parentUsername=null) {
 			return false;
	}
}