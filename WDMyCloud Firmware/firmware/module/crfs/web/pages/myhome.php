<!doctype html>
<html>
<head>
<link rel="shortcut icon" href="/web/images/Logo_16x16.ico">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
<title></title>
</head>

<style>
.s_icon{
	float:left;
	margin-top:6px;
	margin-left:6px;
}
.m_icon{
	float:left;
	margin-top:10px;
	margin-left:10px;
}
.capacity_icon{
	margin-left:10px;
	margin-top:10px;
	float:left;
}
.hdd_icon{
	margin-left:40px;
	float:left;
}
.WDlabelHeaderBoxLarge{
	font-size:36px;
	FONT-FAMILY: Helvetica;
	color:#898989;
}
.WDlabelInfoBoxLarge{
	font-size:110px;
	FONT-FAMILY: Helvetica;
	color:#bebebe;	
}
.WDlabelInfoSizeBoxLarge{
	font-size:58px;
	FONT-FAMILY: Helvetica;
	color:#898989;
	/*border: 1px solid #363636;*/
	
}
.WDlabelInfoFreeBoxLarge{
	font-size:42px;
	FONT-FAMILY: Helvetica;
	color:#898989;
	/*border: 1px solid #363636;*/
}
.WDlabelInfoBoxSmall{
	font-size:20px;
	FONT-FAMILY: Helvetica;
	color:#bebebe;
	width:100px;
	/*border: 1px solid #363636;*/
}
.WDlabelInfoBoxMedium{
	font-size:60px;
    color: #4b5a68;
	width:100px;	
}
.WDlabelHeaderBoxSmail{
	font-size:14px;
	color:#898989;	
}
.WDlabelHeaderBoxMedium{
    font-size: 18px !important;
    color: #85939c;
}
.WDlabelDeviceIcon{
	width:175px;
	height:176px;
	background: url(/web/images/icon/dev.png) no-repeat;
	position: relative;
	margin-top:50px;
	margin-left:80px
	/*border: 1px solid #363636;*/
}
.WDlabelOkIcon{
	width:32px;
	height:28px;
	background: url(/web/images/icon/ok.png) no-repeat;
	/*border: 1px solid #363636;*/
}
.WDlabelWorryIcon{
	width:32px;
	height:28px;
	background: url(/web/images/icon/worry.png) no-repeat;	
}
.header_div
{
	float:left;
	line-height: 38px;
	height:52px;
	width:360px;
	margin-top: 5px;
	/*border: 1px solid #363636;*/
}
.s_header_div
{
	float:left;
	line-height: 30px;
	height:30px;
	width:100px;
	margin-left:5px;
	/*border: 1px solid #363636;*/
}
.medium_header_div{
	float:left;
	line-height: 38px;
	height:38px;
	width:150px;
	margin-top:9px;
	/*border: 1px solid #363636;*/
}
.info_div {
    position: relative;
    top: 32px;
	line-height: 96px;
    font-size: 150px;
    color: #4B5A68;
    text-align: center;
}
.size_div{
	position: relative;
	width:80px;
	height:55px;	
	float:left;
}
.arrow_div{
	margin-right:20px;
	float:right;
}
.s_arrow_div{
	position: relative;
	right: -151px;
    bottom: -3px;
	clear: left;
}
.m_arrow_div{
	position: relative;
	right: 10px;
	bottom: 2px;
	float: right;
	clear: left;
}
.s_info_div {
	height: 30px;
	float: left;
	line-height: 30px;
	margin-left: 44px;
    color: #4b5a68;
}
.m_info_div{
	float:left;
	line-height: 60px;
	height: 65px;
	width:120px;
	margin-left:45px;
	margin-top: 14px;
	text-align: center;
}
.icon_pos{
	position: relative;
	top:23px;
	left:36px;
}
.tickLabel { 
	font-size: 7px ;
	color:#262626;
	}

.home_uicon{
	background: url(/web/images/icon/homepage_medium_icons.png) no-repeat 0px -156px;
}
.uTotal_title{
	padding-left:30px;
}

.qs_text ._text {
    font-size: 18px;
    color: #85939C;
}
.qs_text #total_ftp_downloads,
.qs_text #total_http_downloads,
.qs_text #total_p2p_downloads {
    font-size: 34px;
    font-weight: 100;
    color: #4B5A68;
}
.b8 {
    width: 232px !important;
}
#non_supported_browser {
    display: none;
}
</style>

<script>
var go_sub_page_direct = "";

function getUrlParam(_url, name)
{
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(_url);
	if (results)
		return results[1] || 0;
	else
		return "";
}

function go_page(_go_url, sel_id)
{
	if (typeof(page_unload) == "function")
		page_unload();

	$("#main_nav .current").removeClass("current");
	$("#main_nav #" + sel_id).addClass("current");

	$.ajax_pool.abortAll();

	$("#main_content").fadeOut(1000, function() {
		wd_ajax({
			type: "GET",
			url: _go_url,
			dataType: "html",
			cache: false,
			async: false,
			success: function(_html) {
				//unbind all buttons
				$('#append_diag *').unbind();
				$('#main_content *').unbind();

				$('#append_diag').empty();
				$('#main_content').html(_html);
			},
			complete: function () {
				$("#main_content").fadeIn(500, function () {
					go_sub_page_direct = getUrlParam(_go_url, "sub");
					page_load();
					go_sub_page_direct = "";
					language();
					ready_button();
					init_button();
					init_select();
					
				});
			}
		});
	});
	return false;
}

function go_sub_page(_go_url, sel_id)
{
	if (typeof(page_unload) == "function")
		page_unload();

	if ($("#tab_buttons").length > 0)
		$("#tab_buttons").empty();

	$(".LightningSubMenu .LightningSubMenuOn").removeClass("LightningSubMenuOn");
	$(".LightningSubMenu #" + sel_id).addClass("LightningSubMenuOn");

	$("#mainbody").fadeOut('fast', function() {
		wd_ajax({
			type: "GET",
			url: _go_url,
			dataType: "html",
			cache: false,
			async: false,
			success: function(_html) {
				//unbind all buttons
				$('#append_diag *').unbind();
				$('#main_content *').unbind();
	
				$('#append_diag').empty();
				$('#mainbody').html(_html);
			},
			complete: function () {
				$("#mainbody").fadeIn('fast', function () {
					page_load();
					language();
					ready_button();
					init_button();
					init_select();
				});
			}
		});
	});
	return false;
}

function page_load()
{
	$("#login_name").text(getCookie("username")+",");
	document.title = DEV_NAME;
	ready_init();
	get_web_idle_time();
	get_language("myhome");
	restart_get_name_mpapping();
		
	switch(parseInt(MULTI_LANGUAGE, 10))		
	{
		case 1:
		case 2:
		case 4:
		case 8:
		case 9:
		case 10:
		case 11:
		case 15:
		case 17:
			$("#user_wfs").css("top","50px");
			break;
			
	}	
	go_page('/web/myHome/myhome.php', 'nav_dashboard');

	web_timeout_Interval = setInterval('check_web_timeout()', 15000);

	$(document).click(function(e) { 
		var cursor = $(e.target).css("cursor");
		if (cursor == "pointer" && !disable_click_event)
			restart_web_timeout();
	});
}

function home_page_unload()
{
	$(document).unbind("click");
	stop_web_timeout();
	stop_get_name_mpapping();
	$.ajax_pool.abortAll();
}

var get_name_mapping_interval_hdd = -1;
//var get_name_mapping_interval_usb = -1;
function restart_get_name_mpapping()
{
	stop_get_name_mpapping();
	get_Name_Mapping_Hame("");
}

function stop_get_name_mpapping()
{
	clearTimeout(get_name_mapping_interval_hdd);
	get_name_mapping_interval_hdd = -1;

	//clearInterval(get_name_mapping_interval_usb);
	//get_name_mapping_interval_usb = -1;
}
</script>

<?php
//Check Apps, For Menu
$show_app_menu = false;
$xml = simplexml_load_file("/var/www/xml/apkg_all.xml");
foreach($xml->apkg->item as $key => $val)
{
	if ($val->enable == "1" && $val->user_control == "0")
	{
		$show_app_menu = true;
		break;
	}
}
?>

<body onload="page_load()">
<div class="b2">
	<div class="wd_logo">
		<div class="wd_dev"></div>
		<!-- [+] topDiag -->
		<table class="small_menu" cellspacing="0" cellpadding="0" border="0">
			<tr>	
				<td style="padding-left:10px;">
					<!-- Login -->
						<div class="select_menu">
						<ul>
							<li class="option_list">
								<div id="id_logout" class="wd_select option_selected">
									<div class="sLeft wd_select_l"></div>
									<div class="sBody text wd_select_m toolbar_item" id="logout_toolbar" style="min-width:70px;">
										<div class="top_usericon"></div>
								</div>
									<div class="sRight wd_select_r"></div>
								</div>
								<ul class="ul_obj_wizard" style="margin-top:0;width: auto; height: auto;right:0px;">
									<li>
										<div style="padding: 5px;cursor:default;">
											<table broder=0>
												<tr>
													<td>
														<span class="_text" lang="_home" datafld="welcome"></span>  <span id="login_name"></span>
												</td>
												</tr>
												</table>	
										</div>
									</li>
									<li id="home_logout_li">
										<div id="home_logout_link" class="logout">
											<span class="_text" lang="_menu" datafld="logout"></span>
										</div>
									</li>	
					            </ul>
					        </li>
						</ul>
					</div>
				</td>
			</tr>	
		</table>	
		<!-- [-] topDiag -->
	</div>
</div>

<div class="b1">
	<div class="u_b3">
		<table border='0' cellspacing="0" cellpadding="0" width="100%">
			<tr>
				<td style="display: none;">
					<div class="ButtonArrowLeft" onmousedown="scrollDivLeft('main_nav')" onmouseup="clearTimeout(timerLeft)">
						<div class="ButtonArrowLeftListUp"></div>
					</div>
				</td>
				<td>
					<div style="width:964px;height:90px;border:0px solid yellow;overflow:hidden">
						<div class="nav_container" id="main_nav_container">
							<nav class="top_nav" id="main_nav">
								<ul>
									<li class="main_nav_li group2 current" id="nav_dashboard">
										<div id="nav_dashboard_link" onClick="go_page('/web/myHome/myhome.php', 'nav_dashboard');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="home"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="user_nav_downloads">
										<div id="nav_downloads_link" onClick="go_page('/web/myHome/downloads.html', 'user_nav_downloads');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_p2p" datafld="download_title"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="user_nav_wfv">
										<div id="nav_wfs_link" onClick="go_page('/web/addons/web_file_server.html', 'user_nav_wfv');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu" datafld="web_file_server"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_app" style="<?=(!$show_app_menu) ? "display: none;" : ""; ?>">
										<div id="nav_apps_link" onClick="go_page('/web/myHome/apps.html', 'nav_app');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu" datafld="addon"></div>
										</div>
									</li>
								</ul>
							</nav>
						</div>
					</div>
				</td>
				<td style="display: none;">
					<div class="ButtonArrowRight" onmousedown="scrollDivRight('main_nav')">
						<div class="ButtonArrowRightListUp"></div>
					</div> 
				</td>
			</tr>
		</table>
	</div>

	<div id="main_content" style=""></div>

	<div id="main_diag">
		<?php include("./open_file_select_Diag.php"); ?>
	</div>

	<div id="append_diag"></div>
</div>

    <div id="non_supported_browser">
        <div id="non_supported_browser_container">
            <div id="non_supported_browser_header"><span class="_text" lang="_login" datafld="msg9"></span></div>
            <div id="non_supported_browser_content">
				<span class="_text" lang="_login" datafld="msg10"></span>
            </div>
        </div>
    </div>

    <!--[if lte IE 9]>
    <style type="text/css">
        .b2,
        .b1,
        .WDLabelDiag {
            display: none !important;
        }
        #non_supported_browser {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            display: block !important;
            width: auto;
            height: auto;
            background rgb(75, 90, 104);
            background: rgba(75, 90, 104, .6);
        }
        #non_supported_browser_container {
            width: 480px;
            margin: 130px auto 0;
            padding: 20px;
            border: 1px solid #E6E6E6;
            background-color: #eee;
            background-image: -webkit-gradient(linear, left top, left bottom, from(#f0f0f0), to(#ececec));
            background-image: -webkit-linear-gradient(top, #f0f0f0, #ececec);
            background-image: -moz-linear-gradient(top, #f0f0f0, #ececec);
            background-image: -ms-linear-gradient(top, #f0f0f0, #ececec);
            background-image: linear-gradient(top, #f0f0f0, #ececec);
            filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,StartColorStr='#f0f0f0', EndColorStr='#ececec');
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }
        #non_supported_browser_header {
            font-size: 20px;
            color: #4B5A68;
            margin-bottom: 14px;
        }
        #non_supported_browser_content {
            padding: 20px;
            background: #FAFAFA;
        }
        #non_supported_browser_content p {
            padding: 0;
            margin: 0;
        }
        #non_supported_browser_content p:last-child {
            padding: 0;
            margin: 14px 0 0;
        }
    </style>
<![endif]-->
    
</body>	
</html>
