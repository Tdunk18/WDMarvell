<?php

/**
 * \file iTunes/Model/iTunes.php
 * \module iTunes
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace iTunes\Model;

use Core\Logger;

/**
 * iTunes model for managing iTunes service on the Linux platform.
 *
 * @author gabbert_p
 */
class iTunes {

    /**
     * Returns current service status of itunes server.
     *
     * @return boolean   Current iTunes service status: true (enabled) or false (disabled
     * @throws \iTunes\Exception
     */
    function getServiceStatus() {

        $output = $retVal = null; // This is here just to shut up my IDE from complaining about undeclared variables.
        $result = exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh \"itunes\"", $output, $retVal);
        $output[0] = ($result == 'enabled') ? 'true' : 'false';
       	if ($retVal !== 0) {
            Logger::getInstance()->err('"getServiceStartup.sh" call for "itunes" failed. Returned with "' . $retVal . '"');
            throw new \iTunes\Exception('"getServiceStartup.sh" call for "itunes"  failed. Returned with "' . $retVal . '"', 500);
        }

        /* Anything not "true" is assumed "false." */
        return $output[0];
    }

    /**
     * Enables or disables the iTunes service.
     *
     * @param string $status Boolean value to enable to disable iTunes service.
     * @return true          Always returns true because failure throws an exception.
     * @throws \iTunes\Exception
     */
    function setService($status) {

        // if the service is currently in the requested state then exit with sucess
        if ($status === $this->getServiceStatus()) {
            return true;
        }

        //$status = \Core\Config::booleanToString($status); // Converst true/false to string values "true" or "false"
		$status = (strcasecmp($status, 'true') === 0) ? 'enabled' : 'disabled';
        $output = $retVal = null; // This is here just to shut up my IDE from complaining about undeclared variables.
        exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh \"itunes\" \"$status\"", $output, $retVal);
        if ($retVal !== 0) {
            Logger::getInstance()->err('"setServiceStartup.sh" call for "itunes" failed. Returned with "' . $retVal . '"');
            throw new \iTunes\Exception('"getServiceStartup.sh" call for "itunes" failed. Returned with "' . $retVal . '"', 500);
        }

        return true;
    }

    /**
     * Scanes for a current instance of the iTunes service ... I think.
     *
     * @return true Always returns true because failure throws an exception.
     */
    function scan() {

        $output = $retVal = null; // This is here just to shut up my IDE from complaining about undeclared variables.
        exec_runtime("sudo /usr/local/sbin/rescanItunes.sh", $output, $retVal);
        if ($retVal !== 0) {
            Logger::getInstance()->err('"rescanItunes.sh" call failed. Returned with "' . $retVal . '"');
            throw new \iTunes\Exception('"rescanItunes.sh" call failed. Returned with "' . $retVal . '"', 500);
        }

        return true;
    }

}

