<?php				
	session_start();
?>				
<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
</head>

<style>
.usb_size_bar {
	height: 4px;
	border:0;
	background-color: #C8C8C8;
	border-radius: 0;
}
.usb_size_bar .used_size {
	height: 4px;
	background-color: #15ABFF;
	border-radius: 0;
	width: 0%;
}
#non_supported_browser {
    display: none;
}
</style>
	
<script type="text/javascript">
var load_by_ajax = true;
var user_login = false;
var web_raidroaming_settimeout = -1;
var s_id;
function go_page(_go_url, sel_id, _sub_page, _sub_page_callback)
{
	$("#main_nav .current").removeClass("current");
	$("#main_nav #" + sel_id).addClass("current");

	if (_go_url == "")
		return false;

	if (typeof(page_unload) == "function")
		page_unload();
	
	if (typeof(_sub_page) == "undefined")
		_sub_page = "";

	if (typeof(_sub_page_callback) == "undefined")
		_sub_page_callback = null;

	$.ajax_pool.abortAll();

	$("#main_content").fadeOut('fast', function() {
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
				$("#main_content").fadeIn('fast', function () {
					init_subMenu();
					page_load(_sub_page, _sub_page_callback);
					language();
					ready_button();
					init_button();
					init_select();
				});
			}
		});
	});
	
	google_analytics_log(sel_id,"");
	
	return false;
}

function go_sub_page(_go_url, sel_id, _sub_page_callback)
{
	if (typeof(page_unload) == "function")
		page_unload();

	if ($("#tab_buttons").length > 0)
		$("#tab_buttons").empty();

	$(".LightningSubMenu .LightningSubMenuOn").removeClass("LightningSubMenuOn");
	$(".LightningSubMenu #" + sel_id).addClass("LightningSubMenuOn");

	var sys_time = (new Date()).getTime();
	$("#mainbody").fadeOut('fast', function() {
		wd_ajax({
			type: "GET",
			url: _go_url+"?r=" + sys_time,
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
					page_load(_sub_page_callback);
					language();
					ready_button();
					init_button();
					init_select();
				});
			}
		});
	});
}

function HomeinitDiag(url, target_id, callback)
{
	if (typeof(target_id) == "undefined")
		target_id = null;

	if (typeof(callback) != "function")
		callback = null;

	$.ajax({
		url: url,
		dataType: 'html',
		success: function(data) {
			if (target_id)
				$("#" + target_id).append(data);
			else
				$("#append_diag").append(data);

			if (callback)
				callback();
		}
	});
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

function safepoint_check_status()
{
	if(typeof(SAFEPOINTS_FUNCTION) !== 'undefined')
	{
		if (SAFEPOINTS_FUNCTION == 1)
		{
			wd_ajax({ //Check safepoint
				url: "/web/addons/safepoints_api.php",
				type: "POST",
				data: {
					action: "do_recover_get_status"
				},
				cache: false,
				dataType: "json",
				success: function(r) {
					if (!r.success) return;
					if (r.result == "0") //Safepoint running
						go_page('/web/addons/app.php', 'nav_addons', 'safepoints', function() { safepoints_show_restore_dialog(); });
				}
			});
		}
	}
}
function page_load()
{
	if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
	{
		$("#nav_storage").hide();
	}
	else
		$("#nav_storage").show();

	if (SHUTDOWN_FUNCTION == 0)
		$("#home_shutdown_link").hide();


	$("#login_name").text(getCookie("username")+",");

	var my_count = $("#main_nav ul li").length - $("#main_nav ul li:hidden").length;
	$("#main_nav ul").css('width', my_count* 146 + 26*3 +12 );	
	detectTimeFormat();
	ready_init();
	init_wizard();
	get_usb_list();
	get_alert_list();

	restart_get_name_mpapping();
	home_get_language();
	home_device_Interval = setInterval('home_devive_status()', 5000);
	Home_Load_SYSINFO();
	if (MODEL_NAME != "GLCR" || MODEL_NAME !="BAGX")
	{
		Home_RAIDRoaming_Check();
	}	

	$.ajax({
		type: "POST",
		url: '/cgi-bin/login_mgr.cgi',
		dataType: "xml",
		cache: false,
		data: {
			cmd: 'cgi_check_hd_state'
		},
		success: function(xml) {
			/*
				0 -> don't need to format HD
	            1 -> create all,all disk(s) need to format 
	            2 -> newly insert hd,need to format
	            3 -> rebuild RAID1/RAID5/RAID10
	            5 -> hd format done,need to finish
	            6 -> RAID1/RAID5/RAID10 Re-SYNC Now 
	            7 -> When UPS low bettery
	            8 -> Check formatting now??
	            9 -> disks sequence are not valid.
	            10 -> wipe
	            11 -> isRoaming
	        */    
			var res = $(xml).find('res').text();
			switch(parseInt(res, 10))
			{
				case 1://create all,all disk(s) need to format
				case 2://newly insert hd,need to format
				case 3://rebuild RAID1/RAID5/RAID10
				case 8://formatting
				case 9://disks sequence are not valid.
					go_page('/web/storage/storage.html', 'nav_storage');
				break;
				
				default://Load first page
					go_page('/web/dashboard.php', 'nav_dashboard');
					safepoint_check_status();
				break;
			}//end of switch
		}//end of success
	});//end of ajax

	s_id = '<?php echo session_id();?>';
}

function home_page_unload()
{
	stop_get_name_mpapping();
	clear_get_usb_list_Timer();
	$.ajax_pool.abortAll();
	clearTimeout(loop_main);
	clearTimeout(CloudIntervalId);
	clearTimeout(web_raidroaming_settimeout);
	clearTimeout(_REST_USER_CODE_ID);
	clearTimeout(Cloud_StatusID);
	clearInterval(home_device_Interval);
	clearTimeout(home_sysinfo_timeout);
	loop_main = -1;
}
function home_get_language()
{
	$.ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_general",	
		cache:false,
		async:false,
		dataType: "xml",	
		success: function(xml){			
			//time
			$(xml).find('time').each(function(){				
				var language = $(this).find('language').text();	
				MULTI_LANGUAGE = language;	//in define.js
				switch(parseInt(language, 10))		
				{
					case 1:
					case 2:
					case 4:
					case 13:
					case 17:
//						  $(".logout").css("background-image","url(/web/images/icon/logout_normal_x1.png)")
//						  $('.logout').hover( function(){
//						      $(this).css('background-image', 'url(/web/images/icon/logout_over_x1.png)');
//						   },
//						   function(){
//						      $(this).css('background-image', 'url(/web/images/icon/logout_normal_x1.png)');
//						   });
					break;
		
					case 3:
					case 8:
//						 $(".logout").css("background-image","url(/web/images/icon/logout_normal_x2.png)")
//						 $('.logout').hover( function(){
//						      $(this).css('background-image', 'url(/web/images/icon/logout_over_x2.png)');
//						 },
//						 function(){
//						      $(this).css('background-image', 'url(/web/images/icon/logout_normal_x2.png)');
//						 });
					break;
				}//end of switch	
			});		 			
		},
		error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		}
	});
}
function detectTimeFormat()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_time",	
		cache:false,
		async:true,
		dataType: "xml",	
		success: function(xml){			
			$(xml).find('time').each(function(){				
				TIME_FORMAT = $(this).find('time_format').text();							
			 });
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }
	});
}
</script>

<body onLoad="page_load();" onunload="page_unload();">
<div class="b2">
	<div class="wd_logo">
		<div class="wd_dev"></div>
		<!-- [+] topDiag -->
		<table class="small_menu" cellspacing="0" cellpadding="0" border="0">
			<tr>	
				<td>
					<!-- USB Storage -->
					<div class="select_menu" style="background:none;border:none;">
						<ul>
							<li class="option_list">
								<div id="id_usb" class="wd_select option_selected" style="outline:none;">
										<img src="/web/images/nav/usb.png"/>
								</div>
								<ul class="ul_obj_usb" style="margin-top:35px;width: auto; height: auto;">
									<li>
										<div style="padding: 5px">
											There are no USB devices found.
										</div>
									</li>
					            </ul>
					        </li>
						</ul>
					</div>
				</td>
				<td style="padding-left:10px">
					<!-- Msg Alert -->
					<div class="select_menu">
						<ul>
							<li class="option_list">
								<div id="id_alert" class="wd_select option_selected" style="outline:none;">
										<div id="id_alertIcon" class="alertIcon"></div>
								</div>
								
								<span id='yes_alert' style='display:none'>
									<ul class="ul_obj_alert" id="ul_alert" style="margin-top:35px;">
										<span id="obj_alert_content"></span>
									</ul>
								</span>
								<span id='no_alert' style='display:none'>
									<ul class="ul_obj_alert_no" style="margin-top:35px;width: auto; height: auto;">
										<li>
											<div style="padding: 5px">
											<span class="_text" lang="_notification" datafld="no_alert"></span>
											</div>
										</li>
									</ul>
								</span>
							</li>
						</ul>
					</div>
				</td>
				<td style="padding-left:10px;">
					<!-- Getting started -->
					<div class="select_menu">
						<ul>
							<li class="option_list">
								<div id="id_help" class="wd_select option_selected" style="outline:none;">
										<img src="/web/images/nav/help.png"/>
								</div>									
					            <ul class="ul_obj_wizard" id="ul_wizard" style="margin-top: 35px;">
									<li>
										<div>
											<span id="home_gettingStarted_icon"></span>
											<div class="hitem _text" id="home_gettingStarted_link" lang="_top" datafld="wizard"></div>
										</div>
									</li>
									<li>
										<div>
											<span id="home_help_icon"></span>
											<div class="hitem _text" id="home_help_link" lang="_top" datafld="help"></div>
										</div>
									</li>
									<li>
										<div>
											<span id="home_support_icon"></span>
											<div class="hitem _text" id="home_support_link" lang="_top" datafld="support"></div>
										</div>
									</li>
									<li>
										<div>
											<span id="home_about_icon"></span>
											<div class="hitem _text" id="home_about_link" lang="_top" datafld="about"></div>
										</div>
									</li>
					            </ul>
							</li>
						</ul>
					</div>
				</td>
				<td style="padding-left:10px;">
					<!-- Login -->
					<div class="select_menu">
						<ul>
							<li class="option_list">
								<div id="id_logout" class="wd_select option_selected" style="outline:none;">
										<img src="/web/images/nav/user.png"/>
								</div>
		
							<!--	<ul class="ul_obj_logout" style="margin-top:8px;width: auto; height: auto; padding: 3px 4px; border: 1px solid; border-color: black; -moz-box-shadow: 1px 1px 5px black; -webkit-box-shadow: 1px 1px 5px black; box-shadow: 1px 1px 5px black;"> -->
							<ul class="ul_obj_wizard" style="margin-top:35px;width: auto; height: auto;right:0px;">
									<li>
										<div style="padding: 5px;cursor:default;">
											<table broder=0>
												<tr>
													<td>
														<span class="_text" lang="_home" datafld="welcome"></span> <span id="login_name"></span>
												</td>
												</tr>
												</table>	
										</div>
									</li>
									<li>
										<div id="home_shutdown_link" onclick="dev_shutdown();">
										<span class="_text" lang="_utilities" datafld="shutdown"></span>
										</div>
									</li>
									<li>
										<div id="home_reboot_link" onclick="dev_reboot();">
										<span class="_text" lang="_utilities" datafld="reboot"></span>
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
	<div class="b3">
		<table border='0' cellspacing="0" cellpadding="0">
			<tr>
				<td>
					<div id="nav_left_link" class="ButtonArrowLeft gray_out" onmousedown="scrollDivLeft('main_nav')">
						<div class="ButtonArrowLeftListUp"></div>
					</div>
				</td>
				<td>
					<div style="width: 912px; height: 90px; border:0; overflow:hidden;">
						<div id="main_nav_container" class="nav_container">
							<nav class="top_nav" id="main_nav">
								<ul>
									<li class="main_nav_li group2 current" id="nav_dashboard">
										<div id="nav_dashboard_link" onClick="go_page('/web/dashboard.php', 'nav_dashboard');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="home"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_users">
										<div id="nav_users_link" onClick="go_page('/web/users/users.html', 'nav_users');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="users"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_shares">
										<div id="nav_shares_link" onClick="go_page('/web/shares/shares.html', 'nav_shares');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="shares"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_remoteaccess">
										<div id="nav_cloudaccess_link" onClick="go_page('/web/cloud/cloud.html', 'nav_remoteaccess');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="cloud_access"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_safepoints">
										<div id="nav_backups_link" onClick="go_page('/web/backups/backups.html', 'nav_safepoints');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="backups"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_storage" style="display:none">
										<div id="nav_storage_link" onClick="go_page('/web/storage/storage.html', 'nav_storage');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="storage"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_addons">
										<div id="nav_apps_link" onClick="go_page('/web/addons/app.php', 'nav_addons');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="app"></div>
										</div>
									</li>
									<li class="main_nav_li group2" id="nav_settings">
										<div id="nav_settings_link" onClick="go_page('/web/setting/setting.html', 'nav_settings');">
											<div class="menu_icon"></div>
											<div class="main_nav_link_title _text" lang="_menu_title" datafld="settings"></div>
										</div>
									</li>
								</ul>
							</nav>
						</div>
					</div>
				</td>
				<td>
					<div id="nav_right_link" class="ButtonArrowRight" onmousedown="scrollDivRight('main_nav')">
						<div class="ButtonArrowRightListUp"></div>
					</div> 
				</td>
			</tr>
		</table>
	</div>

	<div id="main_content" style="display: none;">
		<?php
		$c_path = $_SERVER['DOCUMENT_ROOT']."web";
		//include("$c_path/dashboard.html");
		?>
	</div>

	<div id="main_diag">
		<?php include("./open_file_select_Diag.php"); ?>

	<!-- [+] Tempera_Diag -->
		<div id="Temperature_Diag" class="WDLabelDiag" style="display:none;">
			
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueInfoIcon"><span class="_text" lang="_system" datafld="msg12"></span></div>
			<div align="center"><div class="hr"><hr></div></div>
			
				<div class="WDLabelBodyDialogue">
					
                                     <span class="_text" lang="_system" datafld="msg11"></span><br>
				</div>
		</div>
		<!-- [+] HD_HotPlug_Diag -->
		<div id="HD_HotPlug_Diag" class="WDLabelDiag" style="display:none;">
			
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueHDDIcon"><span class="_text" lang="_disk_mgmt" datafld="title4"></span></div>
			<div align="center"><div class="hr"><hr></div></div>
			
				<div class="WDLabelBodyDialogue">
					<span class="_text" lang="_raid" datafld="msg8" id="home_hotplug_desc"></span><br>
				</div>
		</div>

		<!-- [+] alertDiag -->
		<div id="alertDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueMailIcon">
				<span class="_text" lang="_menu" datafld="email"></span>			
			</div>
		
			<div align="center"><div class="hr"><hr/></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				
				<table id="id_alert_tb" border='0' cellspacing="0" cellpadding="0" width="460">
				<tr>
					<td height="40" colspan="2">	
						<div id="id_alert_icon"><div id="id_alert_msg"></div></div>
						
					</td>	
				</tr>	
				<tr>
				<td height="40" colspan="2">	
					<div id="id_alert_desc" style="width:460px"></div>
				</td>	
				</tr>
				<tr>
					<td height="40">
							<div id="id_alert_time" ></div>
					</td>	
					<td height="40" align="right">
						<span class="_text" lang="_common" datafld="code"></span>:<span id="id_alert_error_code"></span>
					</td>	
				</tr>	
			</table>
			</div>

			<div class="hrBottom2"><hr/></div>	
			<button class="ButtonRightPos2 close " id="home_alertClose_button"><span class="_text" lang="_button" datafld="close"></span></button>
		</div>
		<div id="alertAllDiag" class="WDLabelDiag" style="display:none;">
		<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueMailIcon"><span class="_text" lang="_menu" datafld="email"></span>	</div>			
		<div align="center"><div class="hr"><hr/></div></div>
		<div class="WDLabelBodyDialogue">
		<div class="scrollbar_alert">
						<div id="id_alert_all"></div>
		</div>
		</div>	
		<div class="hrBottom2"><hr/></div>	
		<button class="ButtonMarginLeft_40px close" id="home_alertDelAll_button" onclick="remove_all();"><span class="_text" lang="_button" datafld="dismiss_all"></span></button>
		<button class="ButtonRightPos2 close " id="home_alertViewClose_button"><span class="_text" lang="_button" datafld="close"></span></button>
		</div>
		<!-- reboot dialog -->
		<div id="rebootDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueInfoIcon">
				<span class="_text" lang="_utilities" datafld="reboot"></span>
			</div>
			<div align="center"><div class="hr"><hr/></div>
			</div>
			<div class="WDLabelBodyDialogue">
			<img src="/web/images/SpinnerSun.gif" border=0 style="margin-bottom:-10px;">	
			<span class="_text" lang="_utilities" datafld="msg2"></span>
			</div>	
			<div class="hrBottom2"><hr/></div>	
		</div>
		<div id="shutdownDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueInfoIcon">
					<span class="_text" lang="_utilities" datafld="shut_down"></span>
			</div>
			<div align="center"><div class="hr"><hr/></div>
			</div>
			<div class="WDLabelBodyDialogue">
				<span class="_text" lang="_utilities" datafld="msg3"></span>
			</div>
			<div class="hrBottom2"><hr/></div>
		</div>
		
		
		<!-- [-] alertDiag -->

		<!-- [+] HomeDiag -->
		<div id="USBDetailDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueUSBIcon">
				<span class="_text" lang="_home" datafld="usb_details"></span>
			</div>
		
			<div align="center"><div class="hr"><hr></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				<table border="0" width="100%" cellpadding="0" cellspacing="0"  style="font-size: 16px;">
					<tr>
						<td style="width: 200px; height: 30px;">
							<span class="_text" lang="_home" datafld="usb_device_name"></span>
						</td>
						<td>
							<span id="usb_device_name"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_manufacturer"></span>
						</td>
						<td>
							<span id="usb_vendor"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_model"></span>
						</td>
						<td>
							<span id="usb_model"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_serial_number"></span>
						</td>
						<td>
							<span id="usb_sn"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_firmware_version"></span>
						</td>
						<td>
							<span id="usb_version"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_Size"></span>
						</td>
						<td>
							<span id="usb_size"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_vv" datafld="desc3"></span>
						</td>
						<td>
							<span id="usb_Port"></span>
						</td>
					</tr>
				</table>
			</div>
			
			<div class="hrBottom2"><hr/></div>
			<button type="button" id="home_USBAlertClose1_button" class="ButtonRightPos2 close"><span class="_text" lang="_button" datafld="close"></span></button>
		</div>
		
		<div id="USBUnmountDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueUSB_WarningIcon">
				<span class="_text" lang="_home" datafld="usb_eject_title"></span>
			</div>
		
			<div align="center"><div class="hr"><hr/></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				<div class="_text" lang="_home" datafld="usb_eject_msg"></div>
			</div>
			
			<div class="hrBottom2"><hr/></div>
			<button type="button" id="home_USBAlertCancel1_button" class="ButtonMarginLeft_40px close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" id="home_USBAlertOK1_button" class="ButtonRightPos2 OK"><span class="_text" lang="_button" datafld="Ok"></span></button>
		</div>

		<div id="USBUnlockDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueUSBIcon">
				<span class="_text" lang="_home" datafld="usb_unlock_device"></span>
			</div>
		
			<div align="center"><div class="hr"><hr/></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				<form id="usb_unlock_form" onSubmit="return false;">
					<table border="0" width="100%" cellpadding="0" cellspacing="0" style="font-size: 16px;">
						<tr>
							<td style="width: 200px; height: 40px;">
								<span class="_text" lang="_home" datafld="usb_device_name"></span>
							</td>
							<td>
								<span id="usb_unlock_device_name"></span>
							</td>
						</tr>
						<tr>
							<td style="width: 200px; height: 40px;">
								<span class="_text" lang="_home" datafld="usb_password"></span>
							</td>
							<td>
								<input type="password" name="usb_unlock_password" id="usb_unlock_password" size="18" value="">
							</td>
						</tr>
						<tr>
							<td style="width: 200px; height: 40px;">
								<span class="_text" lang="_home" datafld="usb_password_hint"></span>
							</td>
							<td id="usb_unlock_password_hint"></td>
						</tr>
						<tr>
							<td style="width: 200px; height: 40px;">
								<span class="_text" lang="_home" datafld="usb_save_password"></span>
							</td>
							<td>
								<label class="LightningCheckbox">
									<input type="checkbox" name="usb_unlock_save_password" id="usb_unlock_save_password" value="1">
									<span></span>
								</label>
							</td>
						</tr>
					</table>
				</form>
			</div>
			
			<div class="hrBottom2"><hr/></div>
			<button type="button" id="home_USBAlertCancel2_button" class="ButtonMarginLeft_40px close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" id="home_USBAlertSave1_button" class="ButtonRightPos2 save"><span class="_text" lang="_button" datafld="save"></span></button>
		</div>
		
		<div id="USB_UPSDetailDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueUSBIcon">
				<span class="_text" lang="_home" datafld="ups_details"></span>
			</div>
		
			<div align="center"><div class="hr"><hr></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				<table border="0" width="100%" cellpadding="0" cellspacing="0"  style="font-size: 16px;">
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_manufacturer"></span>
						</td>
						<td>
							<span id="ups_manufacturer"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="ups_barrery_charge"></span>
						</td>
						<td>
							<span id="ups_barrery_charge"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="ups_status"></span>
						</td>
						<td>
							<span id="ups_status"></span>
						</td>
					</tr>
				</table>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" id="home_USBAlertClose2_button" class="ButtonRightPos2 close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		</div>
		
		<div id="USB_MTPDetailDiag" class="WDLabelDiag" style="display:none;">
			<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueUSBIcon">
				<span class="_text" lang="_home" datafld="usb_details"></span>
			</div>
		
			<div align="center"><div class="hr"><hr></div>
			</div>
		
			<div class="WDLabelBodyDialogue">
				<table border="0" width="100%" cellpadding="0" cellspacing="0"  style="font-size: 16px;">
					<tr>
						<td style="width: 200px; height: 30px;">
							<span class="_text" lang="_home" datafld="usb_device_name"></span>
						</td>
						<td>
							<span id="mtp_device_name"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_manufacturer"></span>
						</td>
						<td>
							<span id="mtp_vendor"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_model"></span>
						</td>
						<td>
							<span id="mtp_model"></span>
						</td>
					</tr>
					<tr>
						<td style="width: 200px; height: 35px;">
							<span class="_text" lang="_home" datafld="usb_serial_number"></span>
						</td>
						<td>
							<span id="mtp_sn"></span>
						</td>
					</tr>
				</table>
			</div>
			
			<div class="hrBottom2"><hr/></div>
			<button type="button" id="home_USBAlertClose3_button" class="ButtonRightPos2 close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		</div>
		<!-- [-] HomeDiag -->
		
		<div id="HomeRAID_Diag" class="WDLabelDiag" style="width:650px;height:350px;">
		<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueHDDIcon" id="RAID_Diag_title"><span class="_text" lang="_raid" datafld="title4"></span></div>
		<div align="center"><div class="hrBottom2" style="margin:20px 40px 0px 50px;"><hr></div></div>
		
		<!-- RAID Dialog :  Roaming -->
			<div id="HomeRAID_Roaming" style="display:none">
				<div class="WDLabelBodyDialogue" style="height:200px;">
					<div class="dialog_content" style="width:500px;text-align:justify;text-justify:inter-ideograph;border:0px solid red;">
						<span class="_text" lang="_raid" datafld="msg1"></span>
					</div>
				</div>
				
				<div class="hrBottom2"><hr></div>
				<button type="button" id="home_RAIDRoamingCancel1_button" class="ButtonLeftPos close"><span class="_text" lang="_button" datafld="Cancel"></span></button>
				<button type="button" id="home_RAIDRoamingNext1_button" class="ButtonRightPos1"><span class="_text" lang="_button" datafld="Ok"></span></button>
			</div>
		</div>
		
		<?php include("./WebHelp.php"); ?>
	</div>

	<div id="append_diag"></div>
</div>


<!-- full restore -->
<div id="RestoreFullDiag" class="WDLabelDiag" style="display:">
<div id="Restore_title" class="WDLabelHeaderDialogue WDLabelHeaderDialogueDefaultIcon"><span class="_text" lang="_utilities" datafld="full_factory_restore"></span></div>
<div align="center"><div class="hr"><hr></div></div>
<div class="WDLabelBodyDialogue" >
<table cellspacing="0" cellpadding="0" border="0" width="90%">
<tr>
	<td class="tdfield" colspan="2">
		<img src="/web/images/SpinnerSun.gif" border="0" style="margin-bottom:-10px;">		
		<span class="_text" lang="_utilities" datafld="msg4"></span>				
	</td>	
</tr>
<tr>						
	<td colspan="2">
		<table cellspacing="0" cellpadding="0" border="0">
		<tr>
			<td style="padding-top : 20px;"><div id="formatQ_progressbar" style="width:250px;"></div></td>
			<td style="width:55px;padding-top : 20px;"><div id="formatQ_percent"></div></td>							
		</tr>
		</table>
	</td>					
</tr>	
</table>
</div>	
<div class="hrBottom2"><hr></div>
<button type="button" onclick="switch_quick_restore();" id="settings_utilitiesRestoreSwitchToQuick_button" class="ButtonRightPos1" style="display:none"><span class="_text" lang="_button" datafld="switch_to_quick"></span></button>
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
