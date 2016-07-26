<?php

//namespace Alerts\Alert;

require_once(COMMON_ROOT."/includes/rssfeed.inc");
require_once (COMMON_ROOT."/includes/languageConfiguration.php");
require_once (COMMON_ROOT."/includes/globalconfig.inc");
require_once (UTIL_ROOT."/includes/messageformatter.inc");

use Alerts\Alert\Db\AlertDB;
use Alerts\Alert\Alert;
use System\Device\StringTableReader;
/**
 *
 * Function to query alert database and construct alert objects out of each row returned
 *
 * @param int $limit
 * @param int $offset
 * @param bool $descend
 * @param bool $admin
 * @param bool $all
 * @param bool $specific
 * @param bool $hide_ack
 * @param int $level
 *
 * @auther Wang_S
 */
function getDBUserAlerts($limit, $offset, $descend, $admin, $all, $specific, $hide_ack, $level)
{
	$alerts = array();

	//query the database
	$alertdb = new AlertDB();
	$results = $alertdb->queryAlert(0, $admin, $all, $specific, $hide_ack, $level, 0, $limit, $offset, $descend);

	foreach($results as $alertrow) {
		$alert = new Alert($alertrow);
		array_push($alerts, $alert);
	}
	return $alerts;
}

/**
 *
 * Function to generate an rss feed for the last n alerts.
 *
 * @param int $alertLimit - number of alerts to include in feed
 *
 * @author Sapsford_J
 */

function generateAlertRss($limit, $offset, $descend=true, $admin=false, $all=true, $specific=false, $hide_ack=true, $level=10)
{
	//get last n alerts from database
	$alertArray = getDBUserAlerts($limit, $offset, $descend, $admin, $all, $specific, $hide_ack, $level);

	if (isset($alertArray)) {

		$feed = new RssFeed();
		$urlPrefix = $_SERVER["HTTP_HOST"];

/* This option is not used - not exposed in the WebUI
 * Hardcoding it for now siince 'getConfig()'
 * no longer exists in common/globalconfig.inc
 * *
		//get update freq from conf file
		$updateFrequencyMins = getConfigSetting("rssalerts.conf","main","UPDATEFREQUENCYMINS");
		if ($updateFrequencyMins === null ) {
			$updateFrequencyMins = 1;
		}
*/
        $updateFrequencyMins = 1;

		$feed->startChannel("alerts",
  					  $urlPrefix . "/api/1.0/rest/alerts?format=rss",
  					  "System Alerts",
  					  $urlPrefix . "/images/alertchannel.png",
  					  $feed->getRssDateString(time()),
  					  $updateFrequencyMins);

  		//get the current locale code
  		$locale = "en_US"; //default to American english
  		$langConfigObj = new LanguageConfiguration();
        $result = $langConfigObj->getConfig();

        if($result !== NULL){
            if($result['language'] !== '' ) {
            	$locale = $result['language'];
            }
        }

  		$reader = new StringTableReader($locale, "alertmessages.txt");
		foreach ($alertArray as $alert) {
			//read localized message text from string table for current locale
			$message = $reader->getString($alert->code);
            $description = $reader->getString($alert->code . "D");

            /** format the description */
            $description = formatMessage( $description, $alert->subst_values );

			$feed->addItem( $message,
				 			$urlPrefix . "/api/1.0/rest/display_alert?code=" . $alert->code . "&timestamp=" . $alert->timestamp . "&alert_id=" . $alert->id . "&acknowledged=" . $alert->acknowledged,
				 			$description,
				 			$feed->getRssDateString($alert->timestamp) );
		}
	}

	$feed->endChannel();
	return $feed->getRSS();

}