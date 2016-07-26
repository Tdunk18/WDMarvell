<?php
/**
 * \file mapdrive/accessDenied.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once('secureCommon.inc');

?>

<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge" >
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">		
		<LINK REL=StyleSheet HREF="css/main.css" TYPE="text/css">
		<style>
		.contentTables td {
            color: #FFFFFF;
        }

        .formTable .roundBox input {
            height: 48px;
        }	
		</style>

		
		<script type="text/javascript" src="js/jquery.js"> </script>
	</head>

<div class="backgroundTopGradient">
<div id="container">
	<?php include ('header.inc') ?>
    <!--- Add Content Here --->
			<div class="topGrad">
				<!-- <img src='images/WD2go_ColorStrip.png'/> -->

				
				<div class="contentTables">
		            <span class='title'><?php echo gettext('ACCESS_DENIED')?></span>
					<div class='titleSeperatorSpacing'>
						<div class='titleSeperator'>
						</div>
					</div>
					
					<br/>
					<p>
						<?php
							$_link_ = '"logout.php"'; 
							eval('echo "' . addslashes(gettext('ACCESS_DENIED_CONTENT')) . '";');

						?>
					</p>
			
				</div>		
				
				<div class='bottomGlow'>
					<!-- <img src="images/WD2go_Glow.png" align='bottom'/> -->
					<div id="siteFooterBottomContainer">
					    	<img src="images/wd_footer_icon.png" alt="WD" class="footerImage" ><span>&nbsp;&nbsp;Copyright &copy; 2011 Western Digital Corporation.  All Rights Reserved.  &nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://products.wdc.com/?id=wd2go&amp;type=trademarks&amp;lang=en" target="_blank">Trademarks</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://products.wdc.com/?id=wd2go&amp;type=privacypolicy&amp;lang=en" target="_blank">Privacy</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://products.wdc.com/?id=wd2go&amp;type=contact&amp;lang=en" target="_blank">Contact WD</a>&nbsp;&nbsp; </span>
				    </div>
				</div>		
													 				
			</div>	
	<!-- End content here -->
</div>	
	</body>
</html>

