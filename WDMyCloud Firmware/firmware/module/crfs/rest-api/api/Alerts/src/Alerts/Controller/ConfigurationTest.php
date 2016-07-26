<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/ConfigurationTest.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT.'/includes/mailClient.php');
require_once(UTIL_ROOT . '/includes/NasXmlWriter.class.php');

use Alerts\Alert;
use Core\Logger;

/**
 * \class ConfigurationTest
 * \brief Used to send test email to all configured recipients in /etc/alert_email.conf.
 *
 * - This component extends the Rest Component.
 * - Supports xml for response data.
 * - User need not be authenticated to use this component.
 *
 */
class ConfigurationTest{
	
	use \Core\RestComponent;

    function get($urlPath, $queryParams=null, $ouputFormat='xml'){
    	header("Allow: POST");
        header("HTTP/1.0 405 Method Not Allowed");
    }
    
    function sendTestEmail($from, $to, $xml, $mailClient, $index){
		// Send test email    	
    	if(isset($to) && strcmp($to,"") != 0){
			$emailStatus = $mailClient->sendTestEmail($from, $to);
			$statusStr = "Fail";
			if($emailStatus == true){
				$statusStr = "Success";
			}
			$statusArr_0 = array("Status"=>$statusStr);
			$xml->element('email_recipient_'.$index, $to, $statusArr_0);
            Logger::getInstance()->info(__FUNCTION__ . ", $statusStr");
		}
	}
	
    /**
     * \par Description:
     * Send test email to all configured recipients in /etc/alert_email.conf.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/alert_test_email
     *
     *
	 * \par HTTP POST Body
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - format:  Refer main page for details
     * 
     * \retval alert_configuration_test - Alert configuration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful sending of an email
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
<alert_configuration_test>
  <email_recipient_0 Status="Success">john.doe@wdc.com</email_recipient_0>
</alert_configuration_test>
\endverbatim
     */
    function post($urlPath, $queryParams=null, $ouputFormat='xml'){
        // Send email notification.
    	$mailClient = new \mailClient();

        header("Content-Type: application/xml");
        $xml = new \NasXmlWriter();
        $xml->push('alert_configuration_test');
        
    	$alertConfigObj = new Alert\AlertConfiguration();
        $alertConfigObj = $alertConfigObj->getConfig();
        
		Logger::getInstance()->info(__FUNCTION__, $alertConfigObj);

		$this->sendTestEmail($alertConfigObj['email_returnpath'], 
        				$alertConfigObj['email_recipient_0'], $xml, $mailClient, 0);
        $this->sendTestEmail($alertConfigObj['email_returnpath'], 
        				$alertConfigObj['email_recipient_1'], $xml, $mailClient, 1);
        $this->sendTestEmail($alertConfigObj['email_returnpath'], 
        				$alertConfigObj['email_recipient_2'], $xml, $mailClient, 2);
        $this->sendTestEmail($alertConfigObj['email_returnpath'], 
        				$alertConfigObj['email_recipient_3'], $xml, $mailClient, 3);
        $this->sendTestEmail($alertConfigObj['email_returnpath'], 
        				$alertConfigObj['email_recipient_4'], $xml, $mailClient, 4);
        				
		$xml->pop();
		echo $xml->getXml();
    }
    
    function put($urlPath, $queryParams=null, $ouputFormat='xml'){
    	header("Allow: POST");
        header("HTTP/1.0 405 Method Not Allowed");
    }


    function delete($urlPath, $queryParams=null, $ouputFormat='xml'){
    	header("Allow: POST");
        header("HTTP/1.0 405 Method Not Allowed");
    }

}