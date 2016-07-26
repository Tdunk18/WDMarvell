<?php
/**
 * \file mapdrive/localAuth.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once('secureCommon.inc');

use Auth\User\UserSecurity;

if ( strcasecmp($_SERVER['REQUEST_METHOD'], 'post') === 0 ) { 
    $userSecurity = UserSecurity::getInstance();

    $localName = $_POST["localUserName"];
    $localPwd = $_POST["localPassword"];

    if ($userSecurity->authenticateLocalUser($localName, $localPwd)) {
        header('Location: /mapdrive/mapDrive.php?mapkey='.$_SESSION['mapkey']);
        return;
    } else {
        $error =  gettext('AUTH_FAILED');
    }
}

?>

<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge" >
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<LINK REL=StyleSheet HREF="css/main.css" TYPE="text/css">
        <base href="/mapdrive/" />
		<script type="text/javascript" src="js/jquery.js"> </script>
		<title><?php echo getDeviceUserDisplayName();?>My Book Live</title>
        <link rel="shortcut icon" href="/images/WD2go_Favicon.ico" type="image/x-icon"/>
	</head>

<body id="container" class="backgroundTopGradient">

	<?php include('header.inc');?>


				
		<form name="localAuthForm" method="post" action="" id="loginForm">			
            <input name="localUserName" type="hidden" value='<?php echo $_SESSION['username']?>'/>
			
			<div class="topGrad">
				<!--  <img src='images/WD2go_ColorStrip.png'/> -->

				
				<div class="contentTablesAuth">
            	<!-- <span class='title'><?php echo gettext("WELCOME") ?> <?php echo $_SESSION['username']?></span> -->
					<div class='titleSeperatorSpacing'>
						<!-- <div class='titleSeperator'></div> -->
					</div>
					
					<br/>
					<table class="formTable">

						<tr>
							<td valign='middle'><?php echo gettext("PASSWORD") ?><br/></td>
							<td>
								<div class='roundBox'>
									<div class="roundBoxRight">
										<input  type='password' size='40' class='textInput' value='' name='localPassword'/>
									</div>
								</div>
							</td>
                            <td valign='middle'><a class='errorAlert'></a></td>
						</tr>
						<tr>
							<td valign='middle'></td>
							<td>
								<div class=" errorAlert" style="height:10px; padding-left:18px;" > 
								<?= $error ?>
								</div>
							</td>
							<td valign='middle'></td>
						</tr>
<!--
						<tr>
							<td>&nbsp;</td>

							<td>
								<div style="margin-left: 9px;">

									<input type='checkbox' name='remmeberMe'/>&nbsp;
									<div style="display:inline-block;">
										<a class='normalTitle'><?php echo gettext('REMEMBER_ME') ?></a>
										&nbsp;&nbsp;
									</div>

								</div>

							</td>
							<td>&nbsp;</td>
						</tr>
-->
						<tr>
							<td>&nbsp;</td>
							<td align='right'>

								<a href="<?php echo $portalUrl . '/getDevices.do'?>" style="float:left" class="button">
									<span style="padding-right:15px; padding-left: 15px"><?php echo gettext('CANCEL') ?></span> 
								</a>
								<a href="#" id ="submit" style="float:left" class="button">
									<span style="padding-right:15px; padding-left: 15px"><?php echo gettext('SIGN_IN') ?></span> 
								</a>


							</td>							
							<td valign='middle'><a class='errorAlert'></a></td>
						</tr>

					</table>					
				</div>

				<div class='bottomGlow'>
					  <!-- <img src="images/WD2go_Glow.png" align='bottom'/> -->
					<div id="siteFooterBottomContainer">
										    	<img class="footerImage" alt="WD" src="images/wd_footer_icon.png"><span>&nbsp;&nbsp;Copyright &copy; 2011 Western Digital Corporation.  All Rights Reserved.  &nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=trademarks&amp;lang=en">Trademarks</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=privacypolicy&amp;lang=en">Privacy</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a target="_blank" href="http://products.wdc.com/?id=wd2go&amp;type=contact&amp;lang=en">Contact WD</a>&nbsp;&nbsp; </span>
					</div>
					  
				</div>		
													 				
			</div>						
		</form>

		<script type="text/javascript">
		(function() {
			$(document).ready(function() {
				//init sign in button
				$('a.button#submit').click(function(e) {
                    e.preventDefault();
					$('form#loginForm').submit();
				});
				
//              Checkbox was commented out -- removing this, too.	
//				//init checkbox
//				$('input[type=checkbox]').each(function(i,e) {
//				    var $chkbox = $(e);
//				    var $stylebox = $('<span class="checkbox_unchecked"> </span>');
//				    $stylebox.data('isChecked', false);
//				    
//				    $chkbox.hide();
//				    $stylebox.insertBefore($chkbox);
//				    
//				    //install event listener
//				    $stylebox.click(function() {
//				    	if ($stylebox.data('isChecked')) {
//				    		$stylebox.removeClass();
//				    		$stylebox.addClass('checkbox_unchecked');
//				    		$chkbox.attr('checked', false);
//				    		$stylebox.data('isChecked', false);
//				    	} else {
//				    		$stylebox.removeClass();
//				    		$stylebox.addClass('checkbox_checked');
//				    		
//				    		$chkbox.attr('checked', true);
//				    		$stylebox.data('isChecked', true);
//				    	}
//				    	
//				    });
//
//				});
			});

		})();
		</script>
	</body>
</html>

