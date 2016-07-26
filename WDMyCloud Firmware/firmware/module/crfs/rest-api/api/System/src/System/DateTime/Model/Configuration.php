<?php

namespace System\DateTime\Model;

/**
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */

class Configuration {

    public function getConfig() {
        $datetime = date('U');

        $ntpdate = $retVal = null; // This is here just to shut up my IDE from complaining about undeclared variables
        exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh ntpdate", $ntpdate, $retVal);
        if ($retVal == 0) {
        	$ntpservice = (!empty($ntpdate[0]) && $ntpdate[0] === 'enabled') ? 'true' : 'false';
        }
        else{
        	$ntpservice = '';
        }

        $ntpsrv=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/getFixedNtpServer.sh", $ntpsrv, $retVal);
        if ($retVal !== 0) {
        	$ntpsrv = array(0 => '', 1 => '');
        }

        $output=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/getExtraNtpServer.sh", $output, $retVal);
        if ($retVal == 0) {
        	if (count($output) === 0) {
        		$ntpsrv_user = '';
        	} else {
        		$ntpsrv_user = $output[0];
        	}
	    }
	    else{
	    	$ntpsrv_user = '';
	    }

        $time_zone_name=$retVal=null;
        exec_runtime('sudo sed -n -e \'1p\' /etc/timezone', $time_zone_name, $retVal, false);
        if ($retVal !== 0) {
            \Core\Logger::getInstance()->err('"/etc/timezone" call failed. Returned with "' . $retVal . '"');
			throw new \Core\Rest\Exception('"/etc/timezone" call failed. Returned with "' . $retVal . '"', 500);
        }

        return ( array(
            'datetime' => "$datetime",
            'ntpservice' => "$ntpservice",
            'ntpsrv0' => @"$ntpsrv[0]",
            'ntpsrv1' => @"$ntpsrv[1]",
            'ntpsrv_user' => "$ntpsrv_user",
            'time_zone_name' => @"$time_zone_name[0]",
            ));
    }

    public function modifyConf($changes) {

    	//Back up files in case of failure
    	$output=$retVal=null;
        exec_runtime("sudo /bin/cp /etc/timezone /etc/timezone.bak", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }

        exec_runtime("sudo /bin/cp /etc/localtime /etc/localtime.bak", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }
        //Actually do change
		$restartCron = false;

        $curConfig = $this->getConfig();
        if ($curConfig === NULL) {
           break;
        }
        if ($changes['ntpservice'] === 'false') {
            $output=$retVal=null;
            $dateTimeArg=  escapeshellarg($changes["datetime"]);
            exec_runtime("sudo date -s@$dateTimeArg", $output, $retVal, false);
            if ($retVal !== 0) {
               return 'SERVER_ERROR';
            }
            $restartCron = true;
         }

          //Update time zone if it changed
          if ($curConfig['time_zone_name'] !== $changes['time_zone_name']) {
          	 $output=$retVal=null;
			 $cmdString = "echo " . escapeshellarg($changes['time_zone_name']) . " >/etc/timezone";
          	 exec_runtime("sudo bash -c '($cmdString)'", $output, $retVal, false);
             if ($retVal !== 0) {
                break;
             }
             $output=$retVal=null;
             exec_runtime("sudo /bin/cp /usr/share/zoneinfo/\"{$changes['time_zone_name']}\" /etc/localtime", $output, $retVal);
             if ($retVal !== 0) {
               break;
             }
             $restartCron = true;
          }

			//Update user defined NTP server if it changed
            if ($curConfig['ntpsrv_user'] !== $changes['ntpsrv_user']) {
                $output=$retVal=null;
                if ($changes['ntpsrv_user'] === '') {
                    exec_runtime("sudo /usr/local/sbin/modExtraNtpServer.sh", $output, $retVal);
                } else {
                    exec_runtime("sudo /usr/local/sbin/modExtraNtpServer.sh \"{$changes['ntpsrv_user']}\"", $output, $retVal);
                }
                if ($retVal !== 0) {
                    break;
                }
            }

            //Update NTP service enable if it changed
            if ($curConfig['ntpservice'] !== $changes['ntpservice']) {
            	$output=$retVal=null;
            	if ($changes['ntpservice'] === 'true') {
                    //Enable start up service
                    exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh ntpdate enabled", $output, $retVal);
                    if ($retVal !== 0) {
                        break;
                    }
                }
                else {
                	//Disable NTP start up service
                    exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh ntpdate disabled", $output, $retVal);
                    $output=$retVal=null;
                    $dateTimeArg=  escapeshellarg($changes["datetime"]);
                    exec_runtime("sudo date -s@$dateTimeArg", $output, $retVal, false);
                    if ($retVal !== 0) {
                        throw new \Core\Rest\Exception('DATE_TIME_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, null, 'date_time_configuration');
                    }
                }
            }

            if ($restartCron) {
            	//restart cron service if date-time or timezone changed.or ntp service was enabled
            	$output = $retVal = 0;
            	exec_runtime("sudo service cron restart > /dev/null 2>&1", $output, $retVal, false);
            }

            return 'Success';
     }
}