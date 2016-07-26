<?php

namespace Alerts\Controller;

/**
 * \file Alerts/Controller/Display.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use Alerts\Alert\Db\AlertDB;
use Alert\Alert\Alert;
use System\Device\StringTableReader;
//NOTE: this is just a Test place-holder so that the Alert RSS links work

require_once (COMMON_ROOT."/includes/languageConfiguration.php");

/**
 * \class Display
 * \brief Used to retrive alerts to display in html format that can be consumed by the client.
 *
 * - This component extends the Rest Component.
 * - Supports xml format.
 * - User need not be authenticated to use this component.
 *
 */
class Display /*extends RestComponent*/ {

	use \Core\RestComponent;

    /**
     * \par Description:
     * Used to retrive alerts to display in html format that can be consumed by the client.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/display_alert
     *
     * \param format     String  - optional (default is xml)
     * \param alert_id   Integer - optional (default is 0)
     *
     * \par Parameter Details:
     * - format:  Refer main page for details
     * - code  : alert code
     * - time_stamp: it's an unix timestamp, if nothing is given it defaults to 0 which corresponds to [Wed, 31 Dec 1969 16:00:00 PST]
     * - alert_id: it's the id assigend to the alert
     *
     * \retval Alerts in html format
     *
     * \par HTTP Response Codes:
     * - 200 - On success return of alerts to be displayed
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 236 - ERROR_NOT_FOUND - Requested resource not found.
     * - 237 - ERROR_NOT_SUPPORTED - request not supported.
     *
     * \par XML Response Example:
     * \verbatim
<html>
<head>
	<title>WD NAS System Alert</title>
</head>
<body>
	<p></p>
	<center>
	<table border="0" cellspacing= "10" cellpadding = "8" width="85%">
	<tr>
		<td style="border-top:1px;border-bottom:solid 2px;border-top:solid 2px"><font face="arial" size="5" color="blue">WD NAS</font></td>
	</tr>
	<tr>
		<td style="border-top:1px;border-bottom:solid 1px"><font face="arial" size="5" color="red"> Alert: </font><font face="arial" size="5" color="black"></font></td>
	</tr>
	<tr>
		<td><font face="arial" size="2" color="black"></font></td>
	</tr>
	<tr>
		<td><font face="arial" size="4" color="black">Description</font></td>
	</tr>
	<tr>
		<td><font face="arial" size="3" color="black">Alert description goes here</font></td>
	</tr>
	</table>
	</center>
</body>
</html>
\endverbatim
     */
    function get($urlPath, $queryParams=null, $outputFormat='xml')
    {
        switch($outputFormat)
        {
            case 'xhtml':
        	case 'xml'	:
                $result =  $this->getXmlOutput($urlPath, $queryParams);
                break;
            case 'json' :
                $this->getJsonOutput($urlPath, $queryParams);
                break;
            case 'text' :
                $this->getTextOutput($urlPath, $queryParams);
                break;
        };

        if (!$result) {
            $this->generateErrorOutput(404, 'displayalert', 'ERROR_NOT_FOUND', $outputFormat);
        }
    }


   /**
     * Returns RSS formatted alerts
     * @param $urlPath
     * @param $queryParams
     */

    function getXmlOutput($urlPath, $queryParams)
    {
    	//get alert code and read alert message string from localized string table
		$wd_code = isset($queryParams["code"])?$queryParams["code"]:"";
		$wd_timestamp = isset($queryParams["timestamp"])?$queryParams["timestamp"]:0;
		$wd_alert_id = isset($queryParams["alert_id"])?$queryParams["alert_id"]+0:0;
		//echo "alert code: $wd_alert_id\n";
		if (isset($wd_alert_id)) {

		//get the current locale code

			$locale = "en_US"; //default to American english
	  		$langConfigObj = new \LanguageConfiguration();
	        $result = $langConfigObj->getConfig();

	        if($result !== NULL){
	            if($result['language'] !== '' ) {
	            	$locale = $result['language'];
	            }
	        }

	        $sessionUserId = getSessionUserId();
	        $isAdminUser   = isAdmin($sessionUserId);
	        $alertdb = new AlertDB();
	        $rows = $alertdb->queryAlert($wd_alert_id, $isAdminUser, true, false, true, 10, 0, 20, 0, true, $wd_code, $wd_timestamp);
	        if(count($rows) <= 0)
	        	return $this->emptyRss();

	        $reader = new StringTableReader($locale, "alertmessages.txt");

?>
<html>
<head>
	<title>WD NAS System Alert</title>
</head>
<body>
	<p></p>
	<center>
	<table border="0" cellspacing= "10" cellpadding = "8" width="85%">
	<tr>
		<td style="border-top:1px;border-bottom:solid 2px;border-top:solid 2px"><font face="arial" size="5" color="blue">WD NAS</font></td>
	</tr>
	<tr>
<?php
            foreach ($rows as $row) {
    			$message = $reader->getString($row['code']);
		    	if(preg_match("/\+;(.*);\-/", $row['desc'], $matches)) {
			    	$description = $reader->getString($row['code'] . "D", explode(";", $matches[1]));
			    } else {
    				$description = $reader->getString($row['code'] . "D");
	    		}

                $displaydate = date("D, d M Y H:i:s T", strtotime($row['timestamp']));
?>
		<td style="border-top:1px;border-bottom:solid 1px"><font face="arial" size="5" color="red"> Alert: </font><font face="arial" size="5" color="black"><?php echo($message);?></font></td>
	</tr>
	<tr>
		<td><font face="arial" size="2" color="black"><?php echo($displaydate) ?></font></td>
	</tr>
	<tr>
		<td><font face="arial" size="4" color="black">Description</font></td>
	</tr>
	<tr>
		<td><font face="arial" size="3" color="black"><?php echo($description) ?></font></td>
	</tr>
<?php
			}

		}
?>
	</table>
	</center>
</body>
</html>

<?php

        return true;
    }

    function emptyRss() {
?>
        <html>
<head>
	<title>WD NAS System Alert</title>
</head>
<body>
	<p></p>
	<center>
	<table border="0" cellspacing= "10" cellpadding = "8" width="85%">
	<tr>
		<td style="border-top:1px;border-bottom:solid 2px;border-top:solid 2px"><font face="arial" size="5" color="blue">WD NAS</font></td>
	</tr>
	<tr>
		<td style="border-top:1px;border-bottom:solid 1px"><font face="arial" size="5" color="red"> Alert: </font><font face="arial" size="5" color="black">0</font></td>
	</tr>
	</table>
	</center>
</body>
</html>
<?php
        return true;
    }

    /**
     * Return JSON formatted output - not implemented as RSS is an xml-only
     * format.
     *
     * @param $urlPath
     * @param $queryParams
     */
    function getJsonOutput($urlPath, $queryParams) {
        $this->generateErrorOutput(501, 'alerts', 'ERROR_NOT_SUPPORTED', 'xml');
    }

    /**
     * Return plain text output - not implemented as RSS is an xml-only
     * format.
     *
     * @param $urlPath
     * @param $queryParams
     */
    function getTextOutput($urlPath, $queryParams) {
        $this->generateErrorOutput(501, 'alerts', 'ERROR_NOT_SUPPORTED', 'xml');
    }

}