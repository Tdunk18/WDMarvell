<?php
/**
 * \file mapdrive/header.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

function getSysProp($key) {
        $cmd = "awk 'BEGIN{FS=\"=\"} /$key/{print \$2}' /etc/system.conf";
        $lines = array();
        exec($cmd, $lines, $retVal);
        $ret = "";
        if ($retVal != 0) {
                //error
        } else {
                $ret = $lines[0];
        }

        $ret = trim($ret, "\"");
        return $ret;
}
$productName = getSysProp("modelNameUI");

$userName = isset($_SESSION['username']) ? $_SESSION['username'] : NULL;

?>

<div class="">
        <div id="layout" style="margin:0px;padding:29px 23px 30px;border:0px none; height:3px">
               
        <!-- <a href="http://www.wdc.com/"><img src="images/LogoMyCloudWebPortal.png" style="float: left; margin:0px;padding:22px -16px -15px 20px;border:0px"></a> -->
        <a href="http://www.wdc.com/"><img src="images/LogoMyCloudWebPortal.png" style="float: left; margin:0px;padding:5px 310px 54px 34px;border:0px;border:0px"></a>
		<div id="title" style="padding:8px 20px 0px 10px">
            <a><!-- <?= $productName ?> <?php echo getDeviceUserDisplayName();?></a> --> <!-- </div> -->
                <!-- <div id="menu" > -->
					<span><?php echo $userName; ?></span>
					<?php if (!empty($userName)) {?>
	                    <span class="separator">|</span>
                    	<a href="<?php echo "$portalUrl/getDevices.do"?>"><?php echo str_replace("_", " ", gettext("WD_DEVICES")) ?></a>
	                    <span class="separator">|</span>
                    	<a href="logout.php"><?php echo gettext("LOGOUT") ?></a>
                    <?php }?>

                </div>
        </div>
</div>


