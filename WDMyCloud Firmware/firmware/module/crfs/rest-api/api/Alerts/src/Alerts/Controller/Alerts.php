<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/Alerts.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALERTS_ROOT . '/src/Alerts/Alert/AlertRSS.php');

use Alerts\Alert\AlertConfiguration;
use Alerts\Alert\Db\AlertDB;

/**
 * \class Alerts
 * \brief REST API class for Alerts create, update and delete and Alerts RSS feed.
 *
 * - This component extends the Rest Component.
 * - Supports xml response data.
 * - Authentication may be required for the following scenario:
 * - 1. Requesting for admin and specific scope level alert on WAN.
 * - 2. Requesting for admin and specific scope without include_admin or simple parameter set on LAN.
 * - 3. Acknowledge specific and admin scope alert via PUT
 * - 4. Delete all alerts via DELETE
 *
 * - The ‘simple’ parameter is used to retrieve all the entries accessible to the condition (e.g. user, accessed via LAN) of the request being made.
 * - If admin level alerts is requested and if the user does not have admin privilege, request is rejected if either the request is not coming from LAN or include_admin is not set to true.
 * - Simple parameter explained: if this parameter is set then the alerts would only return all the alerts visible to the client based on the authentication information.
 * - 1. if the session is associated with an user, the returning query is to include alert specific to the authenticated user.
 * - 2. if the authenticated user is an admin user, the returning query is to include 'admin view-able only' alerts.
 * - 3. if the request is coming from LAN, we assume the session has admin privilege and the return query would include 'admin only view-able' alerts.

 */
class Alerts /*extends RestComponent*/ {

	use \Core\RestComponent;

	const COMPONENT_NAME = 'alerts';

    //format of params : ?album=<albumname, _all>&media=<mediatype, _none>,
    //mediattype = 'images','video','audio','files', or a combination, e.g.: 'images+video'

	var $alertLimit = 20;

    function createAlertRSSResult($queryParams, $apiVersion=NULL) {
        $admin_only = false;
        $all = true;
        $specific = false;

        $simple = (isset($queryParams['simple']) && $queryParams['simple'] == "true") ? true : false;
        if($simple || ('1.0' == $apiVersion)) {
        	$sessionUserId = getSessionUserId();
            if(!empty($sessionUserId)) {
                $specific = true;
                if(isAdmin($sessionUserId))
                    $admin_only = true;
            } else {
                if(isLanRequest())
                    $admin_only = true;
            }
        } else {
            $admin_only = (isset($queryParams['admin']) && $queryParams['admin'] == "true") ? true : false;
            $all = (isset($queryParams['all']) && $queryParams['all'] == "false") ? false : true;
            $specific = (isset($queryParams['specific']) && $queryParams['specific'] == "true") ? true : false;
        }

    	$hide_ack = (isset($queryParams['hide_ack']) && $queryParams['hide_ack'] == "false") ? false : true;
    	$min_level = isset($queryParams['min_level'])?$queryParams['min_level']+0:0;
    	$limit = isset($queryParams['limit'])?$queryParams['limit']+0:0;
    	if($limit <= 0)
    		$limit = $this->alertLimit;
    	$offset = isset($queryParams['offset'])?$queryParams['offset']+0:0;
    	$descend = (isset($queryParams['order']) && $queryParams['order'] == "asc") ? false: true; //false for asc, true for desc

    	if($min_level == 0) {
    		//min level not specified, using default
    		$alertConfigObj = new AlertConfiguration();
        	$result = $alertConfigObj->getConfig();

        	if($result['min_level_rss']+0 > 0)
        		$min_level = $result['min_level_rss']+0;
        	else //if default is not set properly in the configuration file
        		$min_level = 10;
    	}
		return generateAlertRss($limit, $offset, $descend, $admin_only, $all, $specific, $hide_ack, $min_level);
    }

    /**
     * \par Description:
     * Used to retrieve and return a set of alert listing that exists in the system.
     *
     * \par Security:
     * - No authentication required for LAN and user authentication required for WAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/alerts
     *
     * \param format           String   - optional (default is xml)
     * \param simple           Boolean  - optional (default is false)
     * \param include_admin    Boolean  - optional (default is false)
     * \param admin            Boolean  - optional (default is false)
     * \param specific         Boolean  - optional (default is false)
     * \param all              Boolean  - optional (default is true)
     * \param hide_ack         Boolean  - optional (default is true)
     * \param min_level        Integer  - optional (default is min_level_rss in /etc/alert_email.conf or 10)
     * \param limit            Integer  - optional (default is 20 if limit passed in is <= 0)
     * \param offset           Integer  - optional (default is 0)
     * \param order            String   - optional (default is 'desc')
     *
     * \par Parameter Details:
     * - format: Refer main page for details
     * - simple: if this parameter is set to false and user is logged in, specific is set to true, and if the logged in user is admin, admin is set to true as well.
     *           if this parameter is set to true and user not logged in, and if the request is from LAN admin is set to true as well.
     *           if this parameter is set to true, {admin, all, specific, include_admin} parameters are not honored.
     * - include_admin: used to include admin level alerts to the return list
     * - admin: used to specify alerts of admin scope to be included or not
     * - specific: used to specify alerts of specific scope to be included or not
     * - all: user to specify alerts of all scope to be included or not
     * - hide_ack: used to specify acknowledged alerts should be part of the result or not, to show acknowledged alerts set this to false
     * - min_level: specifies the severity level of alerts
     * - limit: specifies how many alerts to be returned
     * - offset: specifies from which alert to retrieve the offset
     * - order: specifies alerts should be returned in ascending ('asc') or descending ('desc') order
     *
     * \retval rss - RSS feed
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of alert listing
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to retrieve alerts.
     * - 236 - ERROR_NOT_FOUND - requested resource not found.
     * - 237 - ERROR_NOT_SUPPORTED - request not supported.
     *
     * \par XML Response Example:
     * \verbatim
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>alerts</title>
    <link>{alert link}</link>
    <atom:link href="{IP Address}/api/@REST_API_VERSION/rest/alerts?format=rss" rel="self" type="application/rss+xml" />
    <description>System Alerts</description>
    <lastBuildDate>{alert date}</lastBuildDate>
    <language>{language}</language>
    <ttl>1</ttl>
    <item>
        <title>{alert title}</title>
        <link>{IP Address}/api/1.0/rest/display_alert?code={alert code}&amp;timestamp={alert time stamp}&amp;alert_id={alert id}&amp;acknowledged={alert acknowledgement}</link>
        <description>{alert description}</description>
        <pubDate>{xml publish date}</pubDate>
        <guid isPermaLink="true">{IP Address}/api/@REST_API_VERSION/rest/display_alert?code={alert code}&amp;timestamp={alert time stamp}&amp;alert_id={alert id}&amp;acknowledged={alert acknowledgement}&amp;zuid=60d409a4</guid>
    </item>
  </channel>
</rss>
\endverbatim
     */
    function get($urlPath, $queryParams=null, $outputFormat='xml', $apiVersion=NULL)
    {
        $orderOptions = array('asc', 'desc');

        if (isset($queryParams['order'])) {
            if (!in_array($queryParams['order'], $orderOptions)) {
                throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
            }
        }

        $simple = (isset($queryParams['simple']) && $queryParams['simple'] == "true") ? true : false;

        if(!$simple && ('1.0' != $apiVersion)){
            $admin_only = (isset($queryParams['admin']) && $queryParams['admin'] == "true") ? true : false;
            $specific = (isset($queryParams['specific']) && $queryParams['specific'] == "true") ? true : false;
            $include_admin = (isset($queryParams['include_admin']) && $queryParams['include_admin'] == "true") ? true : false;

            // only need to get authenticated if any of these params are true
            if ($admin_only || $specific || $include_admin) {
                // Alerts::get is a NO_AUTH permission -- need to run authentication checks if they request non-simple format.
                \Core\NasController::authenticate($urlPath, $queryParams);
                $sessionUsername = \Auth\User\UserSecurity::getInstance()->getSessionUsername();

                if (empty($sessionUsername) && $specific) { // if user id is not known and wants user specific query, we should reject it
    			    $this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
    			    return;
    		    }

                /*  if admin level alerts is requested and is does not have admin priviledge, reject if either
                the request is not coming from LAN or include_admin is not set to true. */

            	if($admin_only && !isAdmin($sessionUsername) && (!isLanRequest() || !$include_admin)) {
        	    	$this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
    			    return;
        	    }
            }
        }

        switch($outputFormat)
        {
            case 'xml'	:
            case 'rss2'	:
            case 'rss'	:
                $result =  $this->getXmlOutput($urlPath, $queryParams, $apiVersion);
                break;
            case 'json' :
               $this->getJsonOutput($urlPath, $queryParams);
                break;
            case 'text' :
                $this->getTextOutput($urlPath, $queryParams);
                break;
        };

        if ( ($result  === NULL) || (sizeof($result) == 0)) {
            $this->generateErrorOutput(404, 'alerts', 'ERROR_NOT_FOUND', $outputFormat);
        } else {
			//$this->generateSuccessOutput(200, 'alerts', 'Success', $outputFormat);
			echo($result);
			return;
		}

        //return $result;
    }


	/**
	 * \par Description:
	 * Used for creating and adding alert to the set of existing alerts in the system.
	 *
	 * \par Security:
	 * - No authentication required and request allowed in LAN only.
	 *
	 * \par HTTP Method: POST
	 * - http://localhost/api/@REST_API_VERSION/rest/alerts
	 *
	 * \par HTTP POST Body
     * - code={alert code, check AlertDesc table in wd-alert-desc.db or alertmessages.txt to get this number}
     * - parameter={alert description}
     * - user={user id}
	 *
	 * \param code      String  - required
	 * \param parameter String  - required
     * \param user      Integer - required
	 *
	 * \par Parameter Details:
	 * - code={alert code, check AlertDesc table in wd-alert-desc.db or alertmessages.txt to get this number}
     * - parameter={alert description}
     * - user={user id}
	 *
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful creation of an alert
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 238 - ERROR_BAD_REQUEST - Bad Request.
     * - 239 - ERROR_INTERNAL_SERVER - Error in internal server.
     * - 237 - ERROR_NOT_SUPPORTED - request not supported.
     *
	 * \par XML Response Example:
	 * \verbatim
	<alerts>
  	<status>{return status}</status>
	</alerts>
	\endverbatim
	 */
    function post($urlPath, $queryParams=null, $outputFormat='xml') {
    	$code = isset($queryParams['code'])? $queryParams['code'] : "";

    	if(empty($code)) {
    		$this->generateErrorOutput(400, 'alerts', 'ERROR_BAD_REQUEST', $outputFormat);
    		return;
    	}
    	else{
    		$alertdb = new AlertDB();
    		$codeValidity = $alertdb->searchCode($code);
    		if(empty($codeValidity)){
    			$this->generateErrorOutput(400, 'alerts', 'ERROR_BAD_REQUEST', $outputFormat);
    			return;
    		}
    	}


    	$parameter = isset($queryParams['parameter']) ? $queryParams['parameter'] : "";

    	if (!empty($parameter)) {
    		$parameter =  filter_var($parameter, \FILTER_SANITIZE_STRING );
    	}

    	$user = isset($queryParams['user'])? ($queryParams['user']+0) : 0;

    	$alertdb = new AlertDB();
    	$result = $alertdb->insertAlert($code, $parameter, $user);

    	if(!$result)
    		$this->generateErrorOutput(500, 'alerts', 'ERROR_INTERNAL_SERVER', $outputFormat);
    	else {
            $output = $retval = null;
            exec_runtime("sudo /usr/local/sbin/incUpdateCount.pm alert >/dev/null 2>&1 &", $output, $retval, false);
    		$this->generateSuccessOutput(201, 'alerts', array('status' => 'Success'), $outputFormat);
        }
    }

    /**
     * \par Description:
     * Used for acknowledging an alert. An alert is said to be acknowledged, if the alert is shown to the user and the user acted in
     * turn to read about the alert (e.g. click on the alert message to read).
     *
     * \par Security:
     * - User authentication required for LAN and ADMIN authentication required for WAN
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/alerts
     *
     * \param alert_id            Integer   - required
     * \param ack                 Boolean   - required
     * \param format              String    - optional (default is xml)
     *
     * \par Parameter Details:
     * - format: Refer main page for details
     * - alert_id: {alert id number}
     * - ack: true/false
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of an alert as acknowledge
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 236 - ERROR_NOT_FOUND - Requested resource not found.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to perform delete user function.
     * - 239 - ERROR_INTERNAL_SERVER - Error in internal server.
     * - 237 - ERROR_NOT_SUPPORTED - request not supported.
     *
     * \par XML Response Example:
     * \verbatim
<alerts>
  <status>{return status}</status>
</alerts>
\endverbatim
     */
    function put($urlPath, $queryParams=null, $outputFormat='xml') {
	    $sessionUserId = getSessionUserId();
		$isAdminUser   = isAdmin($sessionUserId);
    	if (empty($sessionUserId)) {
			$this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
			return;
		}

    	$alertdb = new AlertDB();
    	$alert_id = (isset($queryParams['alert_id']) && ($queryParams['alert_id']+0) > 0) ? ($queryParams['alert_id']+0) : 0;
    	$ack = (isset($queryParams['ack']) && $queryParams['ack'] == "false")? false : true;

    	$rows = $alertdb->queryAlert($alert_id);
		if(count($rows) <= 0) {
			$this->generateErrorOutput(404, 'alerts', 'ERROR_NOT_FOUND', $outputFormat);
			return;
		}

		if($rows[0]['scope'] == 2 && !$isAdminUser) { //admin
			$this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
			return;
		}

		if($rows[0]['scope'] == 3 && $rows[0]['user'] != $sessionUserId && !$isAdminUser) { //specific
			$this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
			return;
		}

		if($rows[0]['admin_ack_only'] == 1 && !$isAdminUser) {
		    $this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
			return;
		}

    	$result = $alertdb->markAlertAck($alert_id, $ack);

    	if(!$result)
    		$this->generateErrorOutput(500, 'alerts', 'ERROR_INTERNAL_SERVER', $outputFormat);
    	else {
            $output = $retval = null;
            exec_runtime("sudo /usr/local/sbin/incUpdateCount.pm alert >/dev/null 2>&1 &", $output, $retval, false);
    		$this->generateSuccessOutput(200, 'alerts', array('status' => 'Success'), $outputFormat);

    		$osname = \Core\SystemInfo::getOSName() . getPlatformType();

    		if ($osname == "linuxoem") {
    			$output = $retval = null;
    			exec_runtime("sudo /usr/local/sbin/notifyAckAlert.sh \"$alert_id\"", $output, $retval);
    		}

        }

    }

	/**
	 * \par DEPRECATED - not supported since MyBookLive, use PUT instead to acknowledge alerts.
	 * Alert history is maintained for all clients and old alerts are purged periodically from the database on the NAS.
	 * It is not safe or desireable to allow individual clients to delete alerts from the Alerts DB.
	 *
	 * \par Description:
	 * Used to delete all alert entries that exist in the system.
	 *
	 * \par Security:
     * - Admin authentication required and request allowed in LAN only.
	 *
	 * \par HTTP Method: DELETE
	 * - http://localhost/api/@REST_API_VERSION/rest/alert
     *
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful deletion of all alert entries
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
     * \par Error Codes:
     * - 33 - ERROR_NOT_SUPPORTED - one or more of the parameters passed is invalid.
     * - 57 - USER_NOT_AUTHORIZED - current user is not authorized to perform delete user function.
     * - 90 - ERROR_INTERNAL_SERVER - username to be deleted is not found in the system.
     *
	 * \par XML Response Example:
	 * \verbatim
<users>
  <status>success</status>
</users>
\endverbatim
	 */
    function delete($urlPath, $queryParams=null, $outputFormat='xml') {
    	$sessionUserId = getSessionUserId();
		$isAdminUser   = isAdmin($sessionUserId);

		if(!$isAdminUser) {
			$this->generateErrorOutput(401, 'alerts', 'USER_NOT_AUTHORIZED', $outputFormat);
			return;
		}

    	$alertdb = new AlertDB();
    	$result = $alertdb->deleteAllAlerts();

    	if(!$result)
    		$this->generateErrorOutput(500, 'alerts', 'ERROR_INTERNAL_SERVER', $outputFormat);
    	else {
            $output = $retval = null;
            exec_runtime("sudo /usr/local/sbin/incUpdateCount.pm alert >/dev/null 2>&1 &", $output, $retval, false);
    		$this->generateSuccessOutput(200, 'alerts', array('status' => 'Success'), $outputFormat);
        }
    }

    function getXmlOutput($urlPath, $queryParams, $apiVersion=NULL) {
        return $this->createAlertRSSResult($queryParams, $apiVersion);
    }

    function getJsonOutput($urlPath, $queryParams) {
        $this->generateErrorOutput(501, 'alerts', 'ERROR_NOT_SUPPORTED', 'xml');
    }

    function getTextOutput($urlPath, $queryParams) {
        $this->generateErrorOutput(501, 'alerts', 'ERROR_NOT_SUPPORTED', 'xml');
    }

}
