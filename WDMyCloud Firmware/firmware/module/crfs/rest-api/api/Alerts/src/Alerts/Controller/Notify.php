<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/Notify.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use Alerts\Alert\AlertConfiguration;
use Alerts\Alert\Db\AlertDB;
use Alerts\Alert\Alert;

require_once(COMMON_ROOT . '/includes/mailClient.php');
/**
 * \class Notify
 * \brief Used to email alerts to configured recipients in the system.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component from LAN
 *
 */
class Notify /*extends RestComponent*/ {

	use \Core\RestComponent;

    const COMPONENT_NAME = 'alert_notify';
    
    private function isLocalHost(){
    	if ($_SERVER['REMOTE_ADDR'] == $_SERVER['SERVER_ADDR']) {
    		return true;
    	}
    	return false;
    }

	/**
	 * \par Description:
	 * Used to email alerts to configured recipients in the system.
	 *
	 * \par Security:
	 * - No authentication required and request is from local host only.
	 *
	 * \par HTTP Method: POST
	 * - http://localhost/api/@REST_API_VERSION/rest/alert_notify
	 *
	 * \par HTTP POST Body
	 *
	 * \param format String - optional
	 *
	 * \par Parameter Details:
	 * - format:  Refer main page for details
	 *
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful notification of the configured recipient.
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Codes:
	 * - 240 - ERROR_NOT_AUTHORIZED - Not authorized to trigger send alert email.
	 *
	 */
     function post($urlPath, $queryParams=null, $outputFormat='xml'){
    	// Handle request from local host.
    	// Get the Box IP address and to list to make sure we allow only local requests.

		if(!$this->isLocalHost()){
			$this->generateErrorOutput(403, 'alert_notify', "THIS_CALL_SHOULD_BE_FROM_LOCALHOST_ONLY", $outputFormat);
		}
		else{
	    	$result='';
	
	        // Get alert config
	        $alertConfigObj = new AlertConfiguration();
	        $alertConfig = $alertConfigObj->getConfig();
	
	        // Read alerts from the last notified time
	        //$lastNotifiedTime = $alertConfigObj->getLastNotifiedTime();
	        $min_level_email = $alertConfig['min_level_email']+0 == 0? 10 : $alertConfig['min_level_email']+0;
	        $lastNotifiedId = $alertConfigObj->getLastNotifiedId() + 0;
	        $alertdb = new AlertDB();
	        $alertrows = $alertdb->queryAlert(0, true, false, false, true, $min_level_email, $lastNotifiedId);
	        $alerts = array();
	        foreach($alertrows as $alertrow) {
	            $alert = new Alert($alertrow);
	            array_push($alerts, $alert);
	        }
	
	        if(count($alerts) > 0){
	            // Send email notification.
	            $mailClient = new \MailClient();
	            $emailStatus = $mailClient->sendEmail($alertConfig, $alerts);
	            $lastid = ($alerts[0]->id) + 0;
	
	            if($emailStatus == true){
	                $alertConfigObj->updateLastNotifiedTime(time(), $lastid);
	                $result['alert_notify_status'] = "Success";
	            }else{
	                $result['alert_notify_status'] = "Fail";
	            }
	        }else{
	        	\Core\Logger::getInstance()->info("No Alert");	
	            $result['alert_notify_status'] = "NO_ALERT_EMAIL_HAS_BEEN_SENT";
	        }
	        $this->generateSuccessOutput(200, 'alert_notify', $result, $outputFormat);
		}
    }
}