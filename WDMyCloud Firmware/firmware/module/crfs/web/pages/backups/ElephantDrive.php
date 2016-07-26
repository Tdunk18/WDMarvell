<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="no-cache">
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>

<link rel="stylesheet" type="text/css" href="/web/css/cloud_backups.css?r=3">

<style>
.ElephantDrive_Online {
	background: url(/web/images/elephant_drive/ElephantDrive_on_small.png) no-repeat;
	height:30px;
	line-height: 30px;
}

.ElephantDrive_Offline {
	background: url(/web/images/elephant_drive/ElephantDrive_off_small.png) no-repeat;
	height:30px;
	line-height: 30px;
}

#elephantdrive table div.deleteicon {
	position: relative;
	width: 273px;
	/*border: 1px solid red;*/
}

#elephantdrive table div.deleteicon input {
	padding-right: 10px;
}

.TooltipIcon{
	width:24px;
	height:24px;
	background-image: none;
	/*top:5px;*/
	left:0px;
	display: inline-block;
	position: relative;
	cursor: normal;
	/*border: 1px solid #ff921a;*/
}

.TooltipIcon:hover{
	background-image: none;
}

</style>

<script type="text/javascript">
var i = 0
var ERR_NONE = i++;

//For check
var ERR_EMAIL_USED = i++;
var ERR_CHECK_FAIL = i++;

//For reg
var ERR_EMAIL_EXISTS = i++;
var ERR_REG_FAIL = i++;

//For Login
var ERR_LOCIN_FAIL = i++;
var ERROR_VAULT_LOGIN_USER_NOT_FOUND = i++;
var ERROR_VAULT_LOGIN_INCORRECT_PASSWORD = i++;

var _timeout_id = -1;
var l_email = "";
var l_password = "";
<?php
exec("xmldbc -g /system_mgr/samba/netbios_name", $hostname);
?>
var nas_hostname = "<?=$hostname[0]; ?>";

function check_data(reg_login)
{
	if ($("#backups_ElephantDrive" + reg_login + "Email_text").val() == "")
	{
		jAlert( _T('_elephant_drive','msg1'), "warning");	//Text:Please input E-Mail!
		return false;
	}
	
	if ($("#backups_ElephantDrive" + reg_login + "Password_password").val() == "")
	{
		jAlert( _T('_elephant_drive','msg3'), "warning");	//Text:Please input Password!
		return false;
	}
	
	if (($("#backups_ElephantDrive" + reg_login + "Password_password").val() != $("#backups_ElephantDrive" + reg_login + "VerifyPassword_password").val()) && reg_login == "")
	{
		jAlert( _T('_elephant_drive','msg4'), "warning");	//Text:Please input Password!
		return false;
	}

	return true;
}

function show_error_msg(errcode, fn)
{
	switch(errcode)
	{
		case ERR_EMAIL_USED:
			jAlert( _T('_elephant_drive','msg10'), "warning", null, fn);
			//$("#conn_status_note").html(_T('_elephant_drive', 'msg10'));
			break;
		case ERR_CHECK_FAIL:
			jAlert( _T('_elephant_drive','msg11'), "warning", null, fn);
			//$("#conn_status_note").html(_T('_elephant_drive', 'msg11'));
			break;
		case ERR_EMAIL_EXISTS:
			jAlert( _T('_elephant_drive','msg10'), "warning", null, fn);
			//$("#conn_status_note").html(_T('_elephant_drive', 'msg10'));
			break;
		case ERR_REG_FAIL:
			jAlert( _T('_elephant_drive','msg11'), "warning", null, fn);
			//$("#conn_status_note").html(_T('_elephant_drive', 'msg11'));
			break;
		case ERR_LOCIN_FAIL:
			//jAlert( _T('_elephant_drive','msg12'), "warning", null, fn);
			$("#conn_status_note").html(_T('_elephant_drive', 'msg12'));
			break;
		case ERROR_VAULT_LOGIN_USER_NOT_FOUND:
			//jAlert( _T('_elephant_drive','msg13'), "warning", null, fn);
			$("#conn_status_note").html(_T('_elephant_drive', 'msg13'));
			break;
		case ERROR_VAULT_LOGIN_INCORRECT_PASSWORD:
			//jAlert( _T('_elephant_drive','msg14'), "warning", null, fn);
			$("#conn_status_note").html(_T('_elephant_drive', 'msg14'));
			break;
	}
}

function check_login_status()
{
	wd_ajax({
		url: "/web/backups/elephant_drive.php",
		type: "POST",
		data: {
			attion: "check_login",
		},
		//async: false,
		cache: false,
		dataType: "json",
		success: function(r) {
			_timeout_id = setTimeout("check_login_status()", 3000);
			if (r.errcode == ERR_NONE)
			{
				$("#conn_status").attr('class', "ElephantDrive_Online");
				$("#conn_status").attr('title', _T('_elephant_drive', 'msg6'));
				if (first_login)
					$("#conn_status_note").html(
						String.format(_T('_elephant_drive', 'new_device_backup_wizard'),
							r.user,
							r.session,
							r.date,
							r.tab,
							nas_hostname.toLowerCase()
						)
					);
				else
					$("#conn_status_note").html(_T('_remote_backup', 'ready'));
				$("#conn_status_online_note").html(_T('_elephant_drive', 'view_file_link'));
				$("#backups_ElephantDriveLogin1_button").hide();
				$("#backups_ElephantDriveLogout_button").show();
			}
			else
			{
				$("#conn_status_online_note").empty();
				$("#conn_status").attr('class', "ElephantDrive_Offline TooltipIcon");
				$("#conn_status").attr('title', _T('_elephant_drive', 'msg7'));

				if (l_email != "" && l_password != "")
				{
					if (r.errcode == ERROR_VAULT_LOGIN_USER_NOT_FOUND)
						$("#conn_status_note").html(_T('_elephant_drive','msg13'));
					else if (r.errcode == ERROR_VAULT_LOGIN_INCORRECT_PASSWORD)
						$("#conn_status_note").html(_T('_elephant_drive','msg14'));
					else if (r.errcode == ERR_LOCIN_FAIL)
						$("#conn_status_note").html(_T('_elephant_drive','msg12'));
				}
				else
				{
					$("#conn_status_note").html("");
				}
				$("#backups_ElephantDriveLogin1_button").show();
				$("#backups_ElephantDriveLogout_button").hide();
			}
		}
	});
}

function get_config()
{
	wd_ajax({
		url: "/web/backups/elephant_drive.php",
		type: "POST",
		data: {
			attion: "get_conig",
		},
		//async: false,
		cache: false,
		dataType: "xml",
		success: function(xml) {
			var e_enable = $(xml).find('enable').text();
			setSwitch('#backups_ElephantDrive_switch', parseInt(e_enable, 10));
			l_email = $(xml).find('email').text();
			l_password = $(xml).find('password').text();

			if (getSwitch('#backups_ElephantDrive_switch') == 1)
			{
				_timeout_id = setTimeout("check_login_status()", 2000);
				$("#DIV_Elephant_drive").show();
				$("#status_info").css('visibility', 'visible');
				$("#conn_status_note").html(_T('_elephant_drive', 'msg8'));
			}
			else
			{
				$("#DIV_Elephant_drive").hide();
				$("#status_info").css('visibility', 'hidden');
				$("#conn_status_note").html('');
			}
		}
	});
}

var first_login = false;
function save_elephant_conf()
{
	jLoading(_T('_common','set'), 'loading', 's', ""); 

	var ele_enable = getSwitch('#backups_ElephantDrive_switch');
	clearTimeout(_timeout_id);

	wd_ajax({
		url: "/web/backups/elephant_drive.php",
		type: "POST",
		data: {
			attion: "apply",
			e_enable: ele_enable,
			e_email: l_email,
			e_password: l_password
		},
		//async: false,
		cache: false,
		dataType: "json",
		timeout: 30000,
		success: function(r) {
			jLoadingClose();
			show_error_msg(r.errcode, null);
			if (r.errcode == ERR_NONE && ele_enable == "1")
			{
				first_login = true;
				check_login_status();
			}
		},
		error: function(x, t, m) {
			jLoadingClose();
			show_error_msg(ERR_LOCIN_FAIL, null);
		}
	});
}

function page_load()
{
	$("#conn_status").attr('title', _T('_elephant_drive', 'msg7'));
	init_switch();
	init_tooltip();
	get_config();

	$("#backups_ElephantDrive_switch").click(function(){
		save_elephant_conf();
		if (getSwitch('#backups_ElephantDrive_switch') == 1)
		{
			$("#DIV_Elephant_drive").show();
			$("#status_info").css('visibility', 'visible');
 			$("#conn_status_note").html(_T('_elephant_drive', 'msg8'));
		}
		else
		{
			$("#DIV_Elephant_drive").hide();
			$("#status_info").css('visibility', 'hidden');
			$("#conn_status").attr('class', "ElephantDrive_Offline TooltipIcon");
		}
	});

	$("#backups_ElephantDriveRegister1_button").click(function(){
		$("#ElephantDrive_title").html(_T('_elephant_drive', 'register'));
		$("#ElephantDriveDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();
		$('#ele_Register').show();

		$("input:text").inputReset();
		$("input:password").inputReset();
	});
	
	$("#backups_ElephantDriveRegister2_button").click(function() {
		if (!check_data(''))
			return false;

		$("#ElephantDriveDiag").overlay().close();
		$('#ele_Register').hide();

		jLoading(_T('_common','set'), 'loading', 's', ""); 

		clearTimeout(_timeout_id);

		wd_ajax({
			url: "/web/backups/elephant_drive.php",
			type: "POST",
			data: {
				attion: "create",
				e_email: $("#backups_ElephantDriveEmail_text").val(),
				e_password: $("#backups_ElephantDrivePassword_password").val()
			},
			//async: false,
			cache: false,
			dataType: "json",
			success: function(r) {
				jLoadingClose();
				show_error_msg(r.errcode,
					function(r) {
						if (r.errcode == ERR_NONE)
						{
							_DIALOG = "";
							jAlert( _T('_elephant_drive','reg_success'), "info");
						}
						else
						{
							$("#ElephantDriveDiag").overlay().load();
							$('#ele_Register').show();
						}
				});
				if (r.errcode == ERR_NONE)
				{
					//set to login dialog
					$('#backups_ElephantDriveLoginEmail_text').val($('#backups_ElephantDriveEmail_text').val());
					$('#backups_ElephantDriveLoginPassword_password').val($('#backups_ElephantDrivePassword_password').val());

					//reset register
					$('#backups_ElephantDriveEmail_text').val('');
					$('#backups_ElephantDrivePassword_password').val('');
					$('#backups_ElephantDriveVerifyPassword_password').val('');
				}
			}
		});
	});

	$("#ElephantDriveDiag .close").click(function(){
		$("#ElephantDriveDiag").overlay().close();
		$('#ele_Register').hide();
	});

	$("#backups_ElephantDriveLogin1_button").click(function(){
		if (l_email != "" && l_password != "")
		{
			$("#backups_ElephantDriveLoginEmail_text").val(l_email);
			$("#backups_ElephantDriveLoginPassword_password").val(l_password);
			l_email = "";
			l_password = "";
		}

		$("#ElephantDrive_title").html(_T('_elephant_drive', 'login'));
		$("#ElephantDriveDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();
		$('#ele_Login').show();

		$("input:text").inputReset();
		$("input:password").inputReset();
	});
	
	$("#backups_ElephantDriveLogin2_button").click(function() {
		if (!check_data('Login'))
			return false;

		clearTimeout(_timeout_id);

		$("#ElephantDriveDiag").overlay().close();
		$('#ele_Login').hide();

		$("#conn_status_note").html(_T('_elephant_drive', 'msg9')); //Connecting...

		$("#conn_status").attr('class', "ElephantDrive_Offline TooltipIcon");
		$("#conn_status").attr('title', _T('_elephant_drive', 'msg7'));
		l_email = $("#backups_ElephantDriveLoginEmail_text").val();
		l_password = $("#backups_ElephantDriveLoginPassword_password").val();
		save_elephant_conf();
	});

	$("#ElephantDriveDiag .close").click(function(){
		$("#ElephantDriveDiag").overlay().close();
		$('#ele_Login').hide();
	});

	$("#backups_ElephantDriveLogout_button").click(function() {
		jLoading(_T('_common','set'), 'loading', 's', ""); 
		clearTimeout(_timeout_id);
		wd_ajax({
			url: "/web/backups/elephant_drive.php",
			type: "POST",
			data: {
				attion: "logout",
				e_enable: getSwitch('#backups_ElephantDrive_switch')
			},
			cache: false,
			dataType: "json",
			success: function(r) {
				l_email = "";
				l_password = "";
				$('#backups_ElephantDriveLoginEmail_text').val("");
				$('#backups_ElephantDriveLoginPassword_password').val("");
				$("#conn_status_online_note").empty();
				$("#conn_status_note").empty();
				$("#conn_status").attr('class', "ElephantDrive_Offline TooltipIcon");
				$("#conn_status").attr('title', "");
				$("#backups_ElephantDriveLogin1_button").show();
				$("#backups_ElephantDriveLogout_button").hide();
			},
			complete: function() {
				jLoadingClose();
			}
		});
	});

	$("#elephant_link").html(String.format(_T("_elephant_drive", "elephant_link_tml"), ELEPHANTDRIVE_LINK_ID, ELEPHANTDRIVE_LINK_ID));
}

function page_unload()
{
	clearTimeout(_timeout_id);
}
</script>

<body>
<table border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td style="padding-right: 7px; width: 40px;">
			<img src="/web/images/elephant_drive/ElephantDrive_display.png" style="height: 40px;" border="0">
		</td>
		<td>
			<div class="h1_content header_2">
				<span class="_text" lang="_elephant_drive" datafld="title"></span>
			</div>
		</td>
	</tr>
	<tr>
		<td class="tdfield_padding" colspan="2">
			<span class="_text" lang="_elephant_drive" datafld="key_featuresNote"></span>
			<div>
				<span class="_text" id="elephant_link"></span>
				<br>
				<br>
			</div>
		</td>
	</tr>
</table>

<div class="field_top">
	<table border="0" cellpadding="0" cellspacing="0">
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_elephant_drive" datafld="title"></span>
			</td>
			<td class="tdfield_padding">
				<input id="backups_ElephantDrive_switch" name="backups_ElephantDrive_switch" class="onoffswitch" type="checkbox" value="true">
			</td>
			<td id="status_info" class="tdfield_padding tdfield_padding_left_10">
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td style="padding-right: 10px;">
							<span class="_text" lang="_elephant_drive" datafld="conn_status"></span>
						</td>
						<td>
							<div id="conn_status" class="ElephantDrive_offline TooltipIcon" style="width: 30px; float: left;"></div>
							<div id="conn_status_note" class="ElephantDrive_Offline" style="padding-left: 35px;"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</div>

<div id="DIV_Elephant_drive">
	<br>
	<table border="0" cellpadding="0" cellspacing="0">
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_elephant_drive" datafld="access_backups"></span>
			</td>
			<td class="tdfield_padding">
				<button type="button" id="backups_ElephantDriveLogin1_button"><span class="_text" lang="_elephant_drive" datafld="login"></span></button>
				<button type="button" id="backups_ElephantDriveLogout_button" style="display: none;"><span class="_text" lang="_menu" datafld="logout"></span></button>
			</td>
			<td class="tdfield_padding">
				<button type="button" id="backups_ElephantDriveRegister1_button"><span class="_text" lang="_elephant_drive" datafld="register"></span></button>
			</td>
		</tr>
	</table>
	<br>
	<div id="conn_status_online_note"></div>
</div>

<div style="padding-bottom: 30px;"></div>

<div id="ElephantDriveDiag" class="WDLabelDiag" style="display:none;">
	<div id="ElephantDrive_title" class="WDLabelHeaderDialogue WDLabelHeaderDialogueElephantDriveIcon">
		<span class="_text" lang="_elephant_drive" datafld=""></span>
	</div>

	<div align="center"><div class="hr"><hr></div></div>

	<!-- Register -->
	<div id="ele_Register" style="display:none;">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse" bordercolor="#111111" width="100%" height="100">
					<tr>
						<td class="tdfield">
							<span class="_text" lang="_elephant_drive" datafld="e_mail"></span>
						</td>
						<td class="tdfield_padding">
							<input type="text" name="backups_ElephantDriveEmail_text" id="backups_ElephantDriveEmail_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield">
							<span class="_text" lang="_elephant_drive" datafld="password"></span>
						</td>
						<td class="tdfield_padding">
							<input type="Password" name="backups_ElephantDrivePassword_password" id="backups_ElephantDrivePassword_password">
						</td>
					</tr>
					<tr>
						<td class="tdfield">
							<span class="_text" lang="_elephant_drive" datafld="verify_password"></span>
						</td>
						<td class="tdfield_padding">
							<input type="Password" name="backups_ElephantDriveVerifyPassword_password" id="backups_ElephantDriveVerifyPassword_password">
						</td>
					</tr>
				</table>
			</div>	
		</div>
		
		<div class="hrBottom2"><hr></div>
		<button type="button" id="backups_ElephantDriveCancel1_button" class="ButtonMarginLeft_40px close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" id="backups_ElephantDriveRegister2_button" class="ButtonRightPos2"><span class="_text" lang="_elephant_drive" datafld="register"></span></button>
	</div><!-- end of Register -->
	
	<!-- Login -->
	<div id="ele_Login" style="display:none;">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse" bordercolor="#111111" width="100%" height="100">
					<tr>
						<td class="tdfield">
							<span class="_text" lang="_elephant_drive" datafld="e_mail"></span>
						</td>
						<td class="tdfield_padding">
							<input type="text" name="backups_ElephantDriveLoginEmail_text" id="backups_ElephantDriveLoginEmail_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield">
							<span class="_text" lang="_elephant_drive" datafld="password"></span>
						</td>
						<td class="tdfield_padding">
							<input type="Password" name="backups_ElephantDriveLoginPassword_password" id="backups_ElephantDriveLoginPassword_password">
						</td>
					</tr>
					<tr>
						<td colspan="2" height="40">
						</td>
					</tr>
					<tr>
						<td colspan="2" height="40">
							<span class="_text" lang="_elephant_drive" datafld="forgot_password"></span>
						</td>
					</tr>
				</table>
			</div>	
		</div>
		
		<div class="hrBottom2"><hr></div>
		<button type="button" id="backups_ElephantDriveCancel2_button" class="ButtonMarginLeft_40px close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" id="backups_ElephantDriveLogin2_button" class="ButtonRightPos2"><span class="_text" lang="_elephant_drive" datafld="login"></span></button>
	</div><!-- end of Login -->
</div>
</body>
</html>	