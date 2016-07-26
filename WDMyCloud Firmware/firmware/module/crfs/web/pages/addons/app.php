<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache">
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
<style>

#Apps_Diag .file_input_div{
	position: relative;
	width:auto;
	height:auto;
}

#Apps_Diag .file_input_hidden
{
	cursor: pointer;
	font-size: 50px;
	position: absolute;
	right: 0px;
	top: 0px;
	opacity: 0;
	filter: alpha(opacity=0);
	-ms-filter: "alpha(opacity=0)";
	-khtml-opacity: 0;
	-moz-opacity: 0;
}

/* [+] For Apps Install bar */
#Apps_InstallApps_parogressbar .ui-widget-header {
	background: #15ABFF;
}

#Apps_InstallApps_parogressbar .ui-widget-content {
    background: #15ABFF;
}
#Apps_InstallApps_parogressbar{
    border: 0;
    background-color: #DCDCDC;
}
.ui-progressbar .ui-progressbar-value {
	border: 0;
    border-radius: 0 !important;
    margin: 0;
}
/* [-] For Apps Install bar */
#AppsEulaText{
	background-color:#fff;
}
#AppsEula_iframe{
	width:100%;
	height:100%;
	border:none;
}

#AppsDiag_Browse_List .LightningCheckbox span{
	left: 5px;
}

#Apps_Diag .grayout{
	filter:alpha(opacity=30);opacity:0.3; top:15px;left:0;cursor: text;
}

</style>
</head>

<!-- Upload File -->
<script language="javascript" src="/web/jquery/ajaxfileupload/ajaxfileupload.js"></script>
<script type="text/javascript" src="/web/dsdk/js/constants.js"></script>
<script type="text/javascript" src="/web/dsdk/js/util.js"></script>
<script type="text/javascript" src="/web/dsdk/js/language.js"></script>
<script type="text/javascript" src="/web/dsdk/js/application_ui.js"></script>
<script type="text/javascript" src="/web/function/app_menu.js"></script>
<script type="text/javascript" src="/web/function/appsDiag.js"></script>

<script type="text/javascript">
function page_load(_sub_page, _sub_page_callback)
{
	if(FTP_DOWNLOADS_FUNCTION==1) $("#ftp_downloads").show();
	if(P2P_DOWNLOADS_FUNCTION==1) $("#p2p").show();
	if(WEB_FILE_VIEWER_FUNCTION==1) $("#web_file_server").show();
	if(typeof(SAFEPOINTS_FUNCTION) !== 'undefined') if (SAFEPOINTS_FUNCTION == 1) $("#safepoints").show();
	if(typeof(APP_INSTALL_FUNCTION) !== 'undefined') if (APP_INSTALL_FUNCTION == 1) $("#app_install_tb").show();

	switch(_sub_page)
	{
		case "safepoints":
			if(typeof(SAFEPOINTS_FUNCTION) !== 'undefined')
				if (SAFEPOINTS_FUNCTION == 1)
					go_sub_page('/web/addons/safepoints.php', 'safepoints', _sub_page_callback);
		break;

		default:
			go_sub_page('/web/addons/http_downloads.html', 'http_downloads');
	}

	/*	HD_Status:
		0 -> No Volume
		1 -> volume is ok
		2 -> S.M.A.R.T. Test now
		3 -> Formating now
		4 -> Scaning Disk
		5 -> No Disk
		6 -> disks sequence are not valid.
	*/

	HD_Status(0,function(hd_status){

		load_app_info(function(MyRes){		//Load app_info.xml
			load_app_info_xml();
			load_app_menu(); 		//Load APP menu, Add by Ben, 2013/04/30

			if((apps_list.length == 64) || (parseInt(hd_status,10) != 1))
			{
				if ( !$("#apps_installed_button").hasClass("gray_out") ) $("#apps_installed_button").addClass("gray_out");
			}
			else
			{
				if ($("#apps_installed_button").hasClass("gray_out"))	$("#apps_installed_button").removeClass("gray_out");

				if ( !$("#apps_installed_button").hasClass("gray_out") ){
					$(".LightningLabelButtonVericalListAppsInstalled").addClass("TooltipIcon").attr('title',_T('_module','tip2'));
					init_tooltip();
				}
			}
		});//end of 	load_app_info(...

		currentIndex=1;
		$(".ButtonArrowTop").addClass('gray_out');
		scrollDivTop_User('SubMenuDiv');

		switch(parseInt(MULTI_LANGUAGE, 10))
		{
			case 1:
				$("#web_file_server a").css('font-size','15px');
				break;
			case 9:
			case 15:
			{
				$("#web_file_server a").css('font-size','12px');
				break;
			}
			case 10:
				$("#web_file_server a").css('font-size','13px');
				break;
		}
	})// end of HD_Status(0,function(hd_status){
}
function page_unload()
{
}
</script>

<body>
<!-- banner 2nd layout -->
<table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
	<tr valign="bottom">
		<td width="250" align="left"><div class="header_1" style="width: auto;"><span class="_text" lang="_menu" datafld="addon"></span></div></td>
		<td style="padding-bottom:15px;" align="left"><div id="apps_msg" class="_text" lang="_module" datafld="desc32" style="display:none"></div></td>
		<td style="padding-bottom:15px;" align="right"><div id="div_apps_upgrade"></div></td>

	</tr>
</table>
<div class="hr_0"><div class="hr_1"></div></div>
<!-- banner 2nd layout -->

<!-- left menu -->
<table cellspacing=0 cellpadding=0 border=0>
	<tr>
		<td valign="top">
			<ul id="apps_appUp_link" class="ButtonArrowTop" onmousedown="scrollDivDown('SubMenuDiv')" style="display:none">
				<li class="ButtonArrowUpListUp"></li>
			</ul>
			<div id="SubMenuDiv">
				<div class="LightningSubMenubg">
					<ul class="LightningSubMenu">
						<li class="" id="http_downloads"><a id="apps_httpdownloads_link" href="javascript:go_sub_page('/web/addons/http_downloads.html', 'http_downloads');apps_button_active();"><span class="_text" lang="_menu" datafld="http_downloads"></span></a></li>
						<li class="" id="ftp_downloads" style="display:none"><a id="apps_ftpdownloads_link" href="javascript:go_sub_page('/web/addons/ftp_downloads.html', 'ftp_downloads');apps_button_active();"><span class="_text" lang="_menu" datafld="ftp_downloads"></span></a></li>
						<li class="" id="p2p" style="display:none"><a id="apps_p2pdownloads_link" href="javascript:go_sub_page('/web/addons/p2p.html', 'p2p');apps_button_active();"><span class="_text" lang="_menu" datafld="p2p_downloads"></span></a></li>
						<li class="" id="web_file_server" style="display:none"><a id="apps_webfileviewer_link" href="javascript:go_sub_page('/web/addons/web_file_server.html', 'web_file_server');apps_button_active();"><span class="_text" lang="_menu" datafld="web_file_server"></span></a></li>
						<li class="" id="safepoints" style="display: none;"><a id="apps_safepoints_link" href="javascript:go_sub_page('/web/addons/safepoints.php', 'safepoints');apps_button_active();"><span class="_text" lang="_menu" datafld="safepoints"></span></a></li>
					</ul>
				</div>
			</div>
			<ul id="apps_appDown_link" class="ButtonArrowBottom" onmousedown="scrollDivUp('SubMenuDiv')" style="display:none">
				<li class="ButtonArrowDownListUp"></li>
			</ul>


			<div style="padding-left: 27px;">
				<!-- apps install/delete start-->
				<table id="app_install_tb" border="0" height="50" cellspacing="0" cellpadding="0" height="0" style="display:none">
					<tr>
						<td width="90" align="right" style="padding-top:10px">
							<div id="apps_del_button" class="VericalListButton2 LightningLabelButtonVericalListAppsDel gray_out" onclick="apps_Del();"></div>
						</td>
						<td width="90" align="right" style="padding-top:10px">
							<div id="apps_installed_button" class="VericalListButton2 LightningLabelButtonVericalListAppsInstalled gray_out" onclick="apps_borwse_diag();"></div>
						</td>
					</tr>
				</table>

			</div>
			<!-- apps install/delete end -->
		</td>
		<td valign="top">
			<div class="r_content mainbody" id="mainbody" style="border:0px solid red;"></div>
		</td>
	</tr>
</table>

<div id="app_dialog" style="display: none;">
	<div id="apkg_template" style="display: none;">
		<table cellspacing=0 cellpadding=0 border="0" height="100%" id="apps_info">
			<tr>
				<td style="padding-right: 7px; width: 47px;" id="app_icon">
				</td>
				<td>
					<div class="h1_content header_2">
						<span id="app_show_name"></span>
					</div>
				</td><!--
				<td align="right">
					<div class="edit_detail" id="apps_detail">
						<span class="_text" lang="_module" datafld="desc2"></span>
					</div>
				</td>-->
			</tr>
			<tr>
				<td class="tdfield_padding" colspan="3">
					<span id="app_description"></span>
				</td>
			</tr>
			<tr id="apps_note_tr" style="display:none">
				<td class="tdfield_padding" colspan="3">
					<span  class="_text" lang="_module" datafld="desc32"></span>
				</td>
			</tr>
			<tr>
				<td colspan="3">
					<div class="hr_0_content"><div class="hr_1"></div></div>

					<table border="0"  cellspacing="0" cellpadding="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="desc21"></span>:</td>
						<td></td>
						<td class="tdfield_padding"><div id="apps_install_details_name"></div></td>
					</tr>

					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="version">Version</span>:</td>
						<td></td>
						<td class="tdfield_padding"><div id="apps_install_details_verison"></div></td>
					</tr>

					<tr>
						<td class="tdfield"><span  class="_text" lang="_module" datafld="desc20">Installed on</span>:</td>
						<td width="20px"></td>
						<td class="tdfield_padding"><div id="apps_install_details_installon"></div></td>
					</tr>

					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="desc7">Configuration URL</span>:</td>
						<td width="20px"></td>
						<td class="tdfield_padding">
							<button type="button" id="apps_config_button" style="display:none"><span class="_text" lang="_p2p" datafld="config"></span></button>
						</td>
					</tr>

					<!--Button-->
					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="desc26"></span>:</td>
						<td width="20px"></td>
						<td class="tdfield_padding" >
							<table cellspacing=0 cellpadding=0 border="0" width="300px"><tr>
								<td>
									<div id="apps_runAppSwitch_div"></div>
								</td>
							</tr></table>
						</td>
					</tr>
					</table>
				</td>
			</tr>
		</table>
	</div>
</div>

<?php include("./appsDiag.html"); ?>

</body>
</html>
