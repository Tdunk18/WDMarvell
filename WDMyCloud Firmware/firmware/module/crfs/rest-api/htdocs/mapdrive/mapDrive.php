<?php
/**
 * \file mapdrive/mapDrive.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once("secureCommon.inc");
require_once("header.inc");

use Remote\DeviceUser\Db\DeviceUsersDB;
use Auth\User\UserManager;

$pos = strpos($_SERVER["HTTP_USER_AGENT"], "Macintosh");
$productName = getSysProp("modelNameUI");

// Get webdav path and start directory
$webdav_path = getParameter($_REQUEST, 'webdav_path', PDO::PARAM_STR, NULL, false);
$map_key     = getParameter($_REQUEST, 'mapkey',      PDO::PARAM_STR, NULL, true);

if (empty($map_key)) {
    header('Location: /mapdrive/accessDenied.php');
    return;
}

//get list of shares accesible for this user
$deviceUserId = $_SESSION[$map_key]["deviceUserId"];
$authCode     =  $_SESSION[$map_key]["deviceUserAuthCode"];

$shareObj       = new \ShareAccess();
$deviceUserDao  = DeviceUsersDB::getInstance();
$userManager    = UserManager::getInstance();
$user           = NULL;
$deviceUser     = NULL;


if ($deviceUserDao->isValid($deviceUserId, $authCode)) {
   $deviceUser = $deviceUserDao->getDeviceUser($deviceUserId);
   $user = $userManager->getUser($deviceUser->getParentUsername());
} else {
	header('Location: /mapdrive/accessDenied.php');
    return;
}

$shares = $shareObj->getSharesForUser($deviceUser->getParentUsername());

$isLan = "false";

$upnpStatusConfig = getUpnpStatus("config");
if (isset($upnpStatusConfig)) {
	$deviceStatus=$upnpStatusConfig["COMMUNICATION_STATUS"];
	if (isLanRequest()) {
		$portNumber=$upnpStatusConfig["INTERNAL_PORT"];
		$sslPortNumber=$upnpStatusConfig["DEVICE_SSL_PORT"];
		$isLan = "true";
	} else if (strcasecmp("relayed",trim($deviceStatus)) == 0) {
		$portNumber=80;
		$sslPortNumber=443;
	} else {
		$portNumber=$upnpStatusConfig["EXTERNAL_PORT"];
		$sslPortNumber=$upnpStatusConfig["EXTERNAL_SSL_PORT"];
	}
}

$portNumber = empty($portNumber)? 80: $portNumber;
$sslPortNumber = empty($sslPortNumber)? 443: $sslPortNumber;


// Get host name/IP and port number

if (strpos($_SERVER["REQUEST_URI"], "http") !== false) {
//relayed
	$urlComp = parse_url($_SERVER["REQUEST_URI"]);
	$portStr= "";
	if (isset($urlComp['port'])) {
		$portStr = ":".$urlComp['port'];
	}
	$name = $urlComp['host'];

	list($sub1, $sub2, $dns1, $dns2) = split("\.", $name,4);

	if (!empty($sub1) && !empty($sub2) && !empty($dns1) && !empty($dns2) && !is_numeric($dns2)) {
		$subDHostName = "$sub1-$sub2.$dns1.$dns2";
	} else {
		$subDHostName = $name;
	}

	$subDUrl = $urlComp['scheme']."://".$urlComp['host'].$portStr;
	$appletUrl = "http://".$urlComp['host'];
} else {
//portforwarded
	$subDHostName = $_SERVER["SERVER_NAME"];
	$subDPort = $_SERVER["SERVER_PORT"];
	$subDProtocol = "http://";
	if ($_SERVER["HTTPS"] === "on") {
	    $subDProtocol = "https://";
	}
	$subDUrl = $subDProtocol . $subDHostName . ":" . $subDPort;
	$appletUrl = "http://" . $subDHostName . ":$portNumber";
}

foreach ($shares as $share) {
	// ITR: 79826
	//$urlArray[] =  "/webdav/" . $share["share_name"];
	$urlArray[] =  "/" . $share["share_name"] . "_";

}



?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" >
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <LINK REL=StyleSheet HREF="css/main.css" TYPE="text/css">
    <script type="text/javascript" src="js/jquery.js"> </script>
    <script type="text/javascript" src="js/jquery.blockUI.js"> </script>
	<title><?php echo $productName;?><?php echo getDeviceUserDisplayName();?></title>
    <link rel="shortcut icon" href="images/WD2go_Favicon.ico" type="image/x-icon"/>

</head>
<body id="container" class="backgroundTopGradient">
	<!--ITR #77306:  applet id="WDJavaTester" code="WDTester.class"  align="baseline" width="0" height="0">no java sdk found!!</applet -->

	<!-- <div id="outerShell" style="position: fixed; width: 100%; height: 100%; overflow-y:auto"> -->
	<div class="topGrad"></div>
	<div id="outerShell" style="position: relative; width: 900px; height: 75%; top:-40px;overflow-y:auto;overflow-x:hidden">
			<?php //include('header.inc') ?>
            <div>
               <!--  <img src='images/WD2go_ColorStrip.png'/> -->
				<div class="contentTables" style="width: 640px;">
					<div style="width: 640px;padding-bottom:15px;">
						<div style="float:left;width:260px;">
							<span class='title'><?php echo gettext("My Cloud SHARES") ?> (<?php echo count($urlArray); ?>)</span>
						</div>
						<div id="title" align="right" style="float:left;width:375px;padding-top:2px;">
							<a target="_blank" id="kba_link" href="http://wdc.custhelp.com/app/answers/detail/a_id/10392/"><?php echo gettext("CANT_SEE_YOUR_SHARES") ?></a>
						</div>
					</div>
                    <div class='titleSeperatorSpacing'>
                        <div class='titleSeperator'>
                        </div>
                    </div>
					<div style="width: 100%; height: 30px">

					</div>
					<div id="appletWrap">
						<!-- ITR #65565: <script src="js/deployJava.js"></script>  -->
						<!-- http://docs.oracle.com/javase/7/docs/technotes/guides/jweb/deployment_advice.html -->
						<!-- <script src="https://www.java.com/js/deployJava.js"></script> -->
						<!-- ITR # 81468 -->
						<!--  As of 11/2013, https://www.java.com/js/deployJava.js does not support IE 11-->
						<script src="js/deployJava2.js"></script>

						<script>
						 var attributes = { code:'com.wd.nas4g.mapdrive.MapDrive.class',
						    archive:'<?php echo $appletUrl ?>/mapdrive/map-drive.jar?v=18',
						    width:'100%', height:'100%', MAYSCRIPT:'true', alt: "<?php echo gettext("GET_JAVA"); ?>"};
						 var parameters =
							 {
								codebase_lookup: 'false',
								mayscript: 'true',
								portalUrl: '<?php echo $portalUrl ?>',
								paths: "<?php echo join(',', $urlArray);?>",
								host: "<?php echo $subDHostName; ?>",
								port: "<?php echo $portNumber; ?>",
								sslPort: "<?php echo $sslPortNumber;?>",
								deviceUserId:"<?php echo $deviceUserId;?>",
								deviceUserAuthCode:"<?php echo $authCode;?>",
								locale: "<?php echo $locale;?>",
								browser: navigator.userAgent,
								isLan: "<?php echo $isLan; ?>",
								debug:"<?php echo $_GET['debug'];?>"
							 };

						 deployJava.runApplet(attributes, parameters, '1.6');
						</script>

					</div>

                </div>

                <div class='bottomGlow'>
                    <!-- <img src="images/WD2go_Glow.png" align='bottom'/> -->
				<div id="siteFooterBottomContainer">
					<img class="footerImage" alt="WD" src="images/wd_footer_icon.png"><span>&nbsp;&nbsp;Copyright &copy; 2011 Western Digital Corporation.  All Rights Reserved.  &nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=trademarks&amp;lang=en">Trademarks</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=privacypolicy&amp;lang=en">Privacy</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=contact&amp;lang=en">Contact WD</a>&nbsp;&nbsp; </span>
				</div>


                </div>

            </div>
	</div>




</body>
<script type="text/javascript" >
    function blockUI() {

		$('div#outerShell').block({
			message: null,
			forceIframe: true,
			css: {
				backgroundColor: '#fff'
	   		}
		});

    }

    function unblockUI() {

		$('div#outerShell').unblock();

    }

    $(document).ready(function() {
        //var appH = $('applet').height();
		var ratio = 1;
		if (window.screen.deviceXDPI) {
			ratio = window.screen.deviceXDPI/96;
		}

		var resize = true;

		if (/Mac OS X 10.7/i.test(navigator.userAgent)) {
		   resize = typeof $('#WDJavaTester').attr('Version') !== 'undefined';
		}

		if (resize) {

	        $('div#appletWrap').height( <?php echo count($urlArray); ?> * 58 / ratio).width(605);
		}

		$('#WDJavaTester').remove();
		$('applet').css('outline', 'none');
		$(window).bind('beforeunload', function() {
			return '<?php echo gettext("LOGOUT_WARNING") ?>';
		});

		// Support KAB link (Can't see your shares?)
		/***************************************************************************************************/
		var locale = "<?php echo $locale;?>";

		if ( locale != null && locale != "" && locale.length == 5 )
		{
			var lang = locale.substring(0,2);
			var kba_number = "";
			var kba_link = "";

			if ( lang != "en" ) {
			 	if ( lang == "cs" ) {
			 		kba_number = "10393";
			 	}
			 	else if ( lang == "fr" ) {
			 		kba_number = "10394";
			 	}
			 	else if ( lang == "de" ) {
			 		kba_number = "10395";
			 	}
			 	else if ( lang == "it" ) {
			 		kba_number = "10396";
			 	}
			 	else if ( lang == "pt" ) {
			 		kba_number = "10397";
			 	}
			 	else if ( lang == "ru" ) {
			 		kba_number = "10398";
			 	}
			 	else if ( lang == "pl" ) {
			 		kba_number = "10399";
			 	}
			 	else if ( lang == "es" ) {
			 		kba_number = "10400";
			 	}
			 	else if ( lang == "zh" ) {
			 		if ( locale == "zh_TW" ) {
			 			kba_number = "10402";
			 		}
			 		else {
			 			kba_number = "10401";
			 		}
			 	}
			 	else {
					if ( $("#kba_link").text() == 'CANT_SEE_YOUR_SHARES' ) {
						$("#kba_link").text("Can't see your shares?");
					}
					return;
			 	}

				kba_link = "http://wdc-pt.custhelp.com/app/answers/detail/a_id/" + kba_number + "/";
				$("#kba_link").attr("href",kba_link);
			}
		}

		if ( $("#kba_link").text() == 'CANT_SEE_YOUR_SHARES' ) {
			$("#kba_link").text("Can't see your shares?");
		}
		/***************************************************************************************************/
    });
</script>
</html>

