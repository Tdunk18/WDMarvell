<?php

/**
 * \file common\logmessages.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use Core\Logger;

/**
 *
 */
class LogMessages {

    function __construct() {
    }

    function LogParameters($className, $methodName, $parameterArray) {
        openlog("REST_API", LOG_PID, \LOG_USER);

        $methodName = strtoupper($methodName);

        if ($parameterArray === null) {
            syslog(LOG_INFO, $_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : No Input paramters");
            Logger::getInstance()->info($_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : No Input paramters");
        } else if (!is_array($parameterArray)) {
            syslog(LOG_INFO, $_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : PARAMETER = $parameterArray");
            Logger::getInstance()->info($_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : PARAMETER = $parameterArray");
        } else {
            $keys = array_keys($parameterArray);
            $count = 0;
            foreach ($parameterArray as $parameter) {
                syslog(LOG_INFO, $_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : $keys[$count] = " . var_export($parameter, true));
                Logger::getInstance()->info($_SERVER["REMOTE_ADDR"] . " PARAMETER $className $methodName : $keys[$count] =  " . var_export($parameter, true));
                $count++;
            }
        }
        closelog();
    }

    function LogData($beginEnd, $className, $methodName, $msgStatus) {

        openlog("REST_API", LOG_PID, \LOG_USER);

        $methodName = strtoupper($methodName);

        if ($beginEnd === 'BEGIN') {
            syslog(LOG_INFO, $_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName");
            Logger::getInstance()->info($_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName");
        } elseif ($msgStatus === 'SUCCESS') {
            syslog(LOG_INFO, $_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName $msgStatus ");
            Logger::getInstance()->info($_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName $msgStatus");
        } else {
            syslog(LOG_WARNING, $_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName $msgStatus");
            Logger::getInstance()->err($_SERVER["REMOTE_ADDR"] . " $beginEnd $className $methodName $msgStatus");
        }
        closelog();
    }

}