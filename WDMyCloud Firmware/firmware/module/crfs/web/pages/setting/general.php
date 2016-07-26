<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
</head>

<style>
	.ntp_table
	{
		border-right:1px solid #5A5A5A;
		border-left:1px solid #5A5A5A;
		border-bottom:1px solid #5A5A5A;
		background-color:#212121;
		padding-top:10px;
		padding-bottom:10px;
	}
	
	.ntp_table_top
	{				
		border-top:1px solid #5A5A5A;		
	}
</style>
<script type="text/javascript" src="/web/function/diagnostics.js"></script>
<script type="text/javascript" src="/web/function/general.js"></script>
<script type="text/javascript" src="/web/function/time.js"></script>
<script type="text/javascript" src="/web/function/time_machine.js"></script>
<script type="text/javascript" src="/web/function/power_mgr.js"></script>
<script type="text/javascript" src="/web/function/port.js"></script>
<script type="text/javascript" src="/web/function/device.js"></script>
<script type="text/javascript" src="/web/function/recycle_bin.js"></script>

<script type="text/javascript">
var _SELECT_ITEMS  = new Array("settings_generalTimeZone_select","settings_generalLanguage_select","settings_generalDTHour_select","settings_generalDTMin_select","id_sec_main","remote_f_dev_main","settings_generalTimeout_select");		

function page_load()
{
	page_unload();
	
	var sys_time = (new Date()).getTime();
	$.getScript("/web/lib/msg.php?r=" + sys_time, function(){
	   // Here you can use anything you defined in the loaded script
	   $("#max_size_tag").html(dictionary['maximum_size']);
	   $("#maximum_size_waring").html(dictionary['maximum_size_waring']);
	});
	
	writeLangSelector();
	init_general();
	ready_time();	
	ready_power_mgr();
	//tooltip
	$("#tip_ntp").attr('title',_T('_tip','gen_ntp'));		
	$("#tip_tm").attr('title',_T('_tip','gen_tm'));	//Enable Time Machine backups to this device.
	$("#tip_drive").attr('title',_T('_tip','gen_drive'));//"Enable sleep mode on your drive to save energy."	
	$("#tip_led").attr('title',_T('_tip','gen_led'));//"Enables/Disables system LEDs."	
	$("#tip_lcd").attr('title',_T('_tip','gen_lcd'));//Turns LCD Off after 10 minutes of inactivity.
	$("#tip_cloud").attr('title',_T('_tip','gen_cloud'));//"Enables or disables cloud access to your device."
	$("#tip_status").attr('title',_T('_tip','gen_status'));	//"Displays the current status of your cloud access connection."
	$("#tip_timeout").attr('title',_T('_tip','gen_timeout'));	//"Configure the default time to enforce for automatically logging out."
	$("#tip_recovery").attr('title',_T('_tip','gen_recovery'));//"The Power Recovery feature will automatically restart your device from a previously unexpected shutdown due to a power failure."
	$("#tip_dashboard").attr('title',_T('_tip','dashboard'));//Enable or disable access to this management web interface through the internet.
	
	init_tooltip();	

	//time machine
	get_tm_info();
	
	init_switch();
	init_select();		
	
	if(OLED_FUNCTION==1) {$("#lcd_div").show();}
	if(LED_FUNCTION==1) {$("#led_div").show();}	
	if(POWER_FUNCTION==1) {$("#power_recover_div").show();}
	if(POWER_SCH_FUNCTION!=0) {$("#power_sch_div").show();}
	if(DASHBOARD_ACCESS_FUNCTION==1) {$("#dashboard_access_tr").show();}
	if(RECYCLE_BIN_FUNCTION==1) {$("#settings_general_recycle_div").show();}
	
	//time machine
    $("#settings_generalTM_switch").click(function(){
    	var v = getSwitch('#settings_generalTM_switch');
    	var tm_enable="";
		if( v==1)
		{
			$("#settings_generalTM_link").show();
			tm_enable=1;
		}
		else
		{
			$("#settings_generalTM_link").hide();
			tm_enable=0;
			Set_TM_Enable(tm_enable);
		}
	});
		
	$("#settings_generalNTP_switch").click(function(){
	
	var v = getSwitch('#settings_generalNTP_switch');
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	if (v == 0) 
	{
		show('time_detail');
		hide('ntp_set_tb')		
	}	
	else
	{
		hide('time_detail')
		show('ntp_set_tb')
	}		
	
	var v = $("#settings_generalNTPServer_text").val();
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_ntp_time",f_ntp_enable:getSwitch('#settings_generalNTP_switch'),f_ntp_server:v},
			cache:false,
			async:true,
			success:function(){
				jLoadingClose();
				xml_load_t();
			}
		});
	});
	
	//power on/off schedule			
	$("#settings_generalPowerSch_switch").click(function(){
		var v = getSwitch('#settings_generalPowerSch_switch');
		if (v == 1) 
			show('power_on_off_switch_detail')
		else
		{	
				jLoading(_T('_common','set') ,'loading' ,'s',""); 	
			hide('power_on_off_switch_detail')	
		enable_power(v);				
				_g_power_sch = 0;		
		setTimeout(jLoadingClose,500);
			}
	});
	
	$("#settings_generalDriveSleep_switch").click(function(){
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
		var v = getSwitch('#settings_generalDriveSleep_switch');
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_power_management",f_hdd_hibernation_enable:v,f_turn_off_time:$("#f_turn_off_time").val()},
			cache:false,
			async:true,			
			success:function(){
				jLoadingClose()
			}			
		});
	});
		
	$("#settings_generalLed_switch").click(function(){			
		jLoading(_T('_common','set') ,'loading' ,'s',""); 	
		set_led();				
		setTimeout(jLoadingClose,500);
	});
	
	$("#settings_generalLcd_switch").click(function(){			
		jLoading(_T('_common','set') ,'loading' ,'s',""); 	
		set_lcd();	
		setTimeout(jLoadingClose,500);
	});
		
	$("#settings_generalPowerRecovery_switch").click(function(){					
			jLoading(_T('_common','set'), 'loading' ,'s',"");				
			var v = getSwitch('#settings_generalPowerRecovery_switch');													
				wd_ajax({
					type:"POST",
					url:"/cgi-bin/system_mgr.cgi",
					data:{cmd:"cgi_power_recovery",f_recovery_enable:v},
					cache:false,
					async:true,
					success:function(){
						jLoadingClose();								
						}			
				});				
	});
				
		
	Cloud_StatusID = setTimeout("_REST_Get_Device_Status('general')", 10);
	Internet_StatusID = setInterval(_REST_Get_Internet_Access, 3000);	
		
	$("#settings_generalCloud_switch").click(function(){
		if($(this).hasClass('gray_out')) return;
		if(_LOCAL_LOGIN==0)
		{
			jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
			return;
		}
				
		var manual_port_forward = _Device_Status_Array.manual_port_forward;
		var manual_external_http_port = _Device_Status_Array.manual_external_http_port;
		var manual_external_https_port = _Device_Status_Array.manual_external_https_port;
		var parameter="";
		if(manual_port_forward=='true')
		{
			parameter = "&manual_port_forward=TRUE&manual_external_http_port="+
						 manual_external_http_port + "&manual_external_https_port=" + manual_external_https_port;
		}
		var v = getSwitch('#settings_generalCloud_switch');
		if (v == 1) 
		{
			jConfirm('M',_T('_cloud','msg6'),_T('_cloud','msg7'),"cloud3",function(r){
				if(r)
				{
			_REST_Set_Cloud_Access("true",parameter);
					google_analytics_log('cloudaccess-en',1);
				}
				else
				{
					setSwitch('#settings_generalCloud_switch',0);
				}
		    });
		}
		else
		{	
			jConfirm('M',_T('_cloud','msg5'),_T('_common','warning'),"cloud",function(r){
				if(r)
				{
			_REST_Set_Cloud_Access("false",parameter);
					google_analytics_log('cloudaccess-en',0);
		}
				else
				{
					setSwitch('#settings_generalCloud_switch',1);
				}
		    });
			
		}
	});
	
	$("#settings_generalUSBContent_switch").click(function(){
		if($(this).hasClass('gray_out')) return;
		
		if(_LOCAL_LOGIN==0)
		{
			jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
			return;
		}
	
		var v = getSwitch('#settings_generalUSBContent_switch');
		(v==1)? v="true":v="false";
		_REST_set_external_volume_scan(v);
	});
	_REST_get_external_volume_scan();
	get_dashboard_cloud_access_info();
		
	hide_select();		
	
	//device
	$("#settings_generalDeviceName_button").click(function() {			
		set_device('name');
	});
	
	$("#settings_generalDesc_button").click(function() {			
		set_device('desc');
	});
		
	init_recycle_bin_diag();//Recycle Bin
}
var Cloud_StatusID,Internet_StatusID;
function page_unload()
{
	clearTimeout(Cloud_StatusID);
	clearTimeout(loop_time);	
	clearInterval(Internet_StatusID);	
}
function set_time_diag()
{
	$("input:text").inputReset();
	//var hd=$("#hd_time_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	$("#hd_time_Diag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();	
	$("#hd_time_Diag.WDLabelDiag").css("left","210px").css("margin-top","-50px");		
		
		init_button();	
		time_select();	
		init_select();
		hide_select();
		language();
		xml_load_t();
	
		ui_tab("#hd_time_Diag","#settings_generalDTHour_select","#settings_generalDTSave_button");
		
		$("#datepicker_img").mouseover(function() {
		$(this).attr("src","/web/images/icon/Icon_Calendar_blue_32x32.png");
		
	});

	$("#datepicker_img").mouseout(function() {
		$(this).attr("src","/web/images/icon/Icon_Calendar_DrkGray_32x32.png");
		
	});
}
function set_ntp_diag()
{
	$("input:text").inputReset();
		
	var hd=$("#hd_ntp_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false	});						
	hd.load();
	adjust_dialog_size("#hd_ntp_Diag",700,500);	
	init_button();	
	language();
	xml_load_t();
	init_ntp_value();
	hide('id_ntp_wait');
}
function save_ntp()
{
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_ntp_time",f_ntp_enable:getSwitch('#settings_generalNTP_switch'),f_ntp_server:$("#settings_generalNTPServer_text").val()},
		cache:false,
		async:true,
		success:function(){
				//overlayObj.close();					
				//_DIALOG = "";					
//					if ($("#f_ntp_server").val() == "")
//					{
//							_DIALOG = ""
//							jLoadingClose();
//					}	
//					else
				{
					jLoadingClose();
					xml_status();
				}			
				
					
				xml_load_t();
				
			}
	});
}

function open_date()
{		
	 $.datepicker._showDatepicker($('#settings_generalDTDatepicker_text')[0]);
}

function language_mapping(language)
{
var lang_array = new Array(
"English",
"Francais",
"Italiano",
"Deutsch",
"Espanol",
"简体中文",      
"繁體中文",		
"한국어",        
"日本語",
"Русский",  
"Português",
"Čeština",
"Nederlands",
"Magyar",
"Norsk",
"Polski",
"Svenska",
"Türkçe");
	
	
	$('#id_language').html(lang_array[language]);	
	
}
function set_title()
{
		document.title = $('#settings_generalDeviceName_text').val() + DEV_NAME;
}
function show_device(event)
{
	if (event.keyCode == 9) return;
	show('settings_generalDeviceName_button');
}
function show_desc(event)
{	
	if (event.keyCode == 9)
	{	
		return;	
	}
	show('settings_generalDesc_button');
}
function keydown_desc(event)
{
	return;
	if (event.keyCode == 9)
	{
		if ($("#settings_generalDesc_button").css("display") == "none")
		{
			setTimeout(function(){
				$("#settings_generalLanguage_select").focus();
				},200);

		}	
		return;	
	}
}
function writeLangSelector()
{
	$('#id_language_top_main').empty();		
	var my_html_options="";	
	my_html_options+="<ul>";
	my_html_options+="<li class='option_list'>";
	my_html_options+="<div id=\"settings_generalLanguage_select\" class=\"edit_select wd_select option_selected\" >";
	my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
	my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_language\" rel=\"0\">English</div>";
	my_html_options+="<div class=\"sRight wd_select_r\"></div>";
	my_html_options+="</div>";
	
	if (MODEL_NAME == "BAGX")
	{
		my_html_options+="<ul class='ul_obj' id='id_languag_li'><div>";
		my_html_options+="<li id=\"settings_generalLanguageLi1_select\" rel=\"0\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">English</a></li>";	
		my_html_options+="<li id=\"settings_generalLanguageLi9_select\" rel=\"8\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">日本語</a></li>";
		my_html_options+="</div></ul>";
	}
	else
	{	
		my_html_options+="<ul class='ul_obj' id='id_languag_li' style='height:250px;'>"	
		my_html_options+='<div class="language_scroll">';				
		my_html_options+="<li id=\"settings_generalLanguageLi1_select\" rel=\"0\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">English</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi2_select\" rel=\"1\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Français</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi3_select\" rel=\"2\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Italiano</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi4_select\" rel=\"3\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Deutsch</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi5_select\" rel=\"4\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Español</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi6_select\" rel=\"5\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">简体中文</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi7_select\" rel=\"6\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">繁體中文</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi8_select\" rel=\"7\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">한국어</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi9_select\" rel=\"8\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">日本語</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi10_select\" rel=\"9\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Русский</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi11_select\" rel=\"10\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Português</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi12_select\" rel=\"11\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Čeština</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi13_select\" rel=\"12\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Nederlands</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi14_select\" rel=\"13\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Magyar</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi15_select\" rel=\"14\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Norsk</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi16_select\" rel=\"15\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Polski</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi17_select\" rel=\"16\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Svenska</a></li>";
		my_html_options+="<li id=\"settings_generalLanguageLi18_select\" rel=\"17\" ><a href=\"#\" onclick=\"show('settings_generalLanguageSave_button');show('settings_generalLanguageCancel_button')\">Türkçe</a></li>";			
		my_html_options+="</div>";	
		my_html_options+="</ul>";
	}	
	my_html_options+="</li>";
	my_html_options+="</ul>";
	
		
	$("#id_language_top_main").append(my_html_options);				

}
</script>
<body>
	<div class="h1_content header_2"><span class="_text" lang="_device" datafld="title"></span></div>																														
	<div>
		<table border="0"  cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td class="tdfield">																						
				<span class="_text" lang="_device" datafld="name"></span>																								
			</td>	
			<td class="tdfield_padding">
				<input maxLength="15" type="text" name="settings_generalDeviceName_text" id="settings_generalDeviceName_text" onkeyup="show_device(event);" >
			</td>	
			<td width="10"></td>											
			<td class="tdfield_padding">
				<button type="button" id="settings_generalDeviceName_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
			</td>	
		</tr>
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_device" datafld="device_description"></span>
			</td>	
			<td class="tdfield_padding">											
				<input maxLength="42" type="text" name="settings_generalDesc_text" id="settings_generalDesc_text" onkeyup="show_desc(event);" onkeydown="keydown_desc(event)" >
			</td>	
			<td width="10"></td>											
			<td class="tdfield_padding">
				<button type="button" id="settings_generalDesc_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
			</td>	
		</tr>
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_device" datafld="serial_number"></span>
			</td>
			<td class="tdfield_padding">
				<div id="settings_generalSerialNum_value"></div>											
			</td>									
		</tr>	
		</table>																						
	</div>				
	<!-- hidden input -->
	<input type="hidden" name="settings_networkWorkgroup_text" id="settings_networkWorkgroup_text">
	<!-- hidden input end -->								
										
																															
	<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>  
	<div class="h1_content header_2"><span class="_text" lang="_time" datafld="title"></span></div>	
									
	<div class="tdfield_padding_top_5">
		<table border="0"  cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_menu" datafld="language"></span>							
			</td>
			<td class="tdfield_padding">
					<div class="select_menu" id="id_language_top_main"></div>
			</td>
			<td class="tdfield_padding tdfield_padding_left_10">						
				<button type="button" id="settings_generalLanguageSave_button" class="select_button" style="display:none" onclick="lang_save();"><span class="_text" lang="_button" datafld="save"></span></button>&nbsp;
				<button type="button" id="settings_generalLanguageCancel_button" class="select_button" style="display:none" onclick="lang_cancel();"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			</td>	
		</tr>
	</table>
	</div>									  
	<table border="0"  cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td class="tdfield">
				<span class="_text" lang="_time" datafld="timezone"></span>
			</td>
			<td class="tdfield_padding">
				<div class="select_menu" id="id_timezone_top_main"></div>
			</td>
			<td class="tdfield_padding tdfield_padding_left_10">
				<button class="select_button" type="button" id="settings_generalTimeZoneSave_button" style="display:none"><span class="_text" lang="_button" datafld="save"></span></button>
			</td>
		</tr>
	</table>
								
<!-- ntp -->
			  <form method="post" action="/cgi-bin/system_mgr.cgi" id="form_ntp" name="form_ntp">
	<input type="hidden" name="f_ntp_enable" id="f_ntp_enable" value="1" >
						<input type="hidden" name="cmd" value="cgi_ntp_time">
			  		<table  border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_time" datafld="ntp_service"></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalNTP_switch" name="settings_generalNTP_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">	
						</td>	
						<td class="tdfield_padding tdfield_padding_left_10">
											<div class="TooltipIcon" id="tip_ntp"></div>
					</td>
					</tr>
					</table>
			  					  					  					  					  	
					</form>	
					
<!-- ntp server settings-->
				<table border="0"  cellspacing="0" cellpadding="0" height="0" id="ntp_set_tb">
					<tr>
					<td class="tdfield">
								<span class="_text" lang="_time" datafld="ntp_server"></span>			 
					</td>		
					<td class="tdfield_padding">							
							<span id="Settings_generallPrimaryServer_value" ></span> <a href="javascript:set_ntp_diag();" id="settings_generalPrimaryServer_link" class="edit_detail"  style="margin-left:10px;" ><span class="_text" lang="_p2p" datafld="config"></span>>></a>
					</td>
					<td>
					</td>	
				</tr>
			</table>
				
<!-- date and time -->	
			<table border="0"  cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield">
						 	<span class="_text" lang="_time" datafld="current_time"></span>			 
					</td>		
					<td class="tdfield_padding">
							<div id="settings_generalDateTime_value"></div>  
					</td>		
					<td class="tdfield_padding">						
						<a href="javascript:set_time_diag();" style="margin-left:10px;" class="edit_detail" id="time_detail" tabindex="0"><span class="_text" lang="_p2p" datafld="config"></span>>></a>
					</td>
				</tr>
				<tr>
					<td class="tdfield">
						 <span class="_text" lang="_time" datafld="time_format">Time Format</span>			 
					</td>		
					<td class="tdfield_padding">
						<div class="select_menu">
							<ul>
								<li class="option_list">
									<div id="settings_generalTimeFormat_select" class="wd_select option_selected">
										<div class="sLeft wd_select_l"></div>
										<div class="sBody text wd_select_m" id="f_time_format" rel="12">12</div>
										<div class="sRight wd_select_r"></div>
									</div>
									<ul class="ul_obj">
										<div>
											<li id="settings_generalTimeFormatLi1_select" rel="12"><a href="#" onclick="set_time_format('12');">12</a></li>
											<li id="settings_generalTimeFormatLi2_select" rel="24"><a href="#" onclick="set_time_format('24');">24</a></li>
										</div>
									</ul>
								</li>
							</ul>
						</div>							
					</td>		
					<td>							
					</td>
				</tr>
				<tr>
					<td class="tdfield">
						 <span class="_text" lang="_time" datafld="date_format">Date Format</span>			 
					</td>		
					<td class="tdfield_padding">
						<div class="select_menu">
							<ul>
								<li class="option_list">
									<div id="settings_generalDateFormat_select" class="wd_select option_selected">
										<div class="sLeft wd_select_l"></div>
										<div class="sBody text wd_select_m" id="f_date_format" rel="YYYY-MM-DD">YYYY-MM-DD</div>
										<div class="sRight wd_select_r"></div>
									</div>
									<ul class="ul_obj" style="width:120px;">
										<div>
											<li id="settings_generalDateFormatLi1_select" rel="YYYY-MM-DD" style="width:110px"><a href="#" onclick="set_date_format('YYYY-MM-DD');">YYYY-MM-DD</a></li>
											<li id="settings_generalDateFormatLi2_select" rel="MM-DD-YYYY" style="width:110px"><a href="#" onclick="set_date_format('MM-DD-YYYY');">MM-DD-YYYY</a></li>
											<li id="settings_generalDateFormatLi3_select" rel="DD-MM-YYYY" style="width:110px"><a href="#" onclick="set_date_format('DD-MM-YYYY');">DD-MM-YYYY</a></li>
										</div>
									</ul>
								</li>
							</ul>
						</div>							
					</td>		
					<td>							
					</td>
				</tr>
			</table>
							
			<!-- cloud access-->
			<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>  
			<div class="h1_content header_2"><span class="_text" lang="_cloud" datafld="title">Cloud Access</span></div>
			<table border="0" cellspacing="0" cellpadding="0" >	
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="service">Cloud Service</span></td>
					<td class="tdfield_padding">
						<table border="0" cellspacing="0" cellpadding="0" >	
							<tr>
								<td>
									<input id="settings_generalCloud_switch" name="settings_generalCloud_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">	
					</td>
								<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_cloud"></div>
					</td>
								<td style="padding-left:20px;">
						<div id="settings_generalCloud_link" style="display:none;margin-left:10px;"><a href="javascript:init_cloud_option_diag();" class="edit_detail" tabindex="0"><span class="_text" lang="_p2p" datafld="config"></span>>></a></div>
					</td>	
				</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="status">Connection Status</span></td>
					<td class="tdfield_padding">
						<table border="0" cellspacing="0" cellpadding="0" >
							<tr>
								<td><span id="cloud_status_value"></span></td>
								<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_status"></div>
					</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr id="cloud_status_tr">
					<td></td>
					<td colspan="3" style="padding-top:10px;"><span id="cloud_statusInfo_value"></span></td>
				</tr>
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="usb_availability">USB Content Availability</span></td>
					<td class="tdfield_padding" colspan="3">
						<table border="0" cellspacing="0" cellpadding="0" >	
							<tr>
								<td>
									<input id="settings_generalUSBContent_switch" name="settings_generalUSBContent_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">	
								</td>
								<td style="padding-left:10px;">
								<!--<div class="TooltipIcon" id="tip_cloud"></div>-->
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr id="dashboard_access_tr" style="display:none">
					<td class="tdfield_170"><span class="_text" lang="_cloud" datafld="dash_access"></span></td>
					<td class="tdfield_padding" colspan="3">
						<table border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td>
									<input id="settings_generalCloudDashboard_switch" name="settings_generalCloudDashboard_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
					</td>
								<td style="padding-left:10px;">
									<div class="TooltipIcon" id="tip_dashboard"></div>
								</td>
								<td style="padding-left:20px;">
									<a href="javascript:init_dashboard_diag();" style="display:none" class="edit_detail" id="dashboard_conf_div"><span class="_text" lang="_p2p" datafld="config"></span>>></a>											
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>				
<!-- energy saver -->
		<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>  
								<div class="h1_content header_2"><span class="_text" lang="_energy" datafld="energy_saver"></span></div>								
								<div style="display:">						
						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="drive_sleep"></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalDriveSleep_switch" name="settings_generalDriveSleep_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td  class="tdfield_padding tdfield_padding_left_10">
						<div class="TooltipIcon" id="tip_drive"></div>
					</td>	
					</tr>
					</table>
					</div>				
					<div style="display:none" id="led_div">
						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="led" ></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalLed_switch" name="settings_generalLed_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>	
						<td class="tdfield_padding tdfield_padding_left_10">
							<div class="TooltipIcon" id="tip_led"></div>
						</td>	
					</tr>
					</table>
					</div>
							<div style="display:none" id="lcd_div">
						
						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="lcd"></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalLcd_switch" name="settings_generalLcd_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>	
						<td class="tdfield_padding tdfield_padding_left_10" style="display:none">
							<div class="TooltipIcon" id="tip_lcd"></div>
						</td>	
					</tr>
					</table>
					</div>									
				
						<div id="power_recover_div" style="display:none">
						
						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="p_recovery"></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalPowerRecovery_switch" name="settings_generalPowerRecovery_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td class="tdfield_padding tdfield_padding_left_10">
							<div class="TooltipIcon" id="tip_recovery"></div>
						</td>							
					</tr>
					</table>
					</div>							
					<div id="power_sch_div" style="display:none" >						
						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="p_sch"></span>						
						</td>
						<td class="tdfield_padding">
							<input id="settings_generalPowerSch_switch" name="settings_generalPowerSch_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>			
						<td class="tdfield_padding tdfield_padding_left_10">
							<span onclick="power_draw_tb();" style="margin-left:10px;" id="power_on_off_switch_detail" class="edit_detail"><span class="_text" lang="_p2p" datafld="config"></span>>></span>							
						</td>				
					</tr>
					
					</table>
					</div>			
<!-- time out -->

						<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr>
						<td class="tdfield">
								<span class="_text" lang="_energy" datafld="timeout"></span>						
						</td>
						<td class="tdfield_padding">							
							<div class="select_menu" id="id_timeout_top_main"></div>
						</td>		
					<td class="tdfield_padding tdfield_padding_left_10">
							<div class="TooltipIcon" id="tip_timeout"></div>
					</td>
					</tr>
					</table>
<!-- time out end -->										
							
		<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>  
		<div class="h1_content header_2"><span class="_text" lang="_time_machine" datafld="title"></span></div>					
		<table border="0"  cellspacing="0" cellpadding="0" height="0">
			<tr>
				<td class="tdfield">
					<span class="_text" lang="_menu" datafld="time_machine"></span>						
				</td>
				<td class="tdfield_padding">
					<input id="settings_generalTM_switch" name="settings_generalTM_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
				</td>
					<td class="tdfield_padding tdfield_padding_left_10">
						<div class="TooltipIcon" id="tip_tm"></div>
					</td>					
					<td class="tdfield_padding tdfield_padding_left_10">
						<a href="javascript:init_tm_diag();" style="display:none" class="edit_detail" id="settings_generalTM_link"><span class="_text" lang="_p2p" datafld="config"></span> >></a>
				</td>				
			</tr>	
		</table>
		
		<div id="settings_general_recycle_div" style="display:none">
		<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>  
		<div class="h1_content header_2 _text" lang="_menu" datafld="service"></div>					
		<table border="0" cellspacing="0" cellpadding="0" height="0">
			<tr>
				<td class="tdfield">
					<span class="_text" lang="_network_access" datafld="recycle_title"></span>
				</td>
				<td class="tdfield_padding">
					<button type="button" onclick="clear_recycle_bin_folder();" name="settings_recycleBinClear_button" id="settings_recycleBinClear_button"><span class="_text" lang="_button" datafld="clear"></span></button>
				</td>
				<td class="tdfield_padding tdfield_padding_left_10">
					<a class="edit_detail" id="settings_recycleBinConfig_link" name="settings_recycleBinConfig_link" href="#" onClick="return false;"><span class="_text" lang="_p2p" datafld="config"></span> >></a>
				</td>
			</tr>
		</table>			
		</div>			
			<br><br><br><br>

<!-- tm dialog -->
<div id="tmDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue LightningLabelHeaderDialogueTMIcon" id="tmDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
		
	<!-- tmDiag_set-->
	<div id="tmDiag_set">	
		<div class="WDLabelBodyDialogue">
			<div><span class="_text" lang="_time_machine" datafld="desc"></span></div>
			<table id="tm_sel_tb" border="0" cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield"><span class="_text" lang="_time_machine" datafld="sel"></span></td>
					<td class="tdfield_padding">
						<div id="tm_div" class="select_menu"></div>
					</td>
				</tr>
				<tr>
					<td class="tdfield"><span id="max_size_tag"></span></td>
					<td class="tdfield_padding">
						<div id="settings_generalTM_loading"></div>
						<div id="settings_generalTM_slider" style="display:none"></div>
						<span id="time_machine_slider_value" style="display:none"></span>
					</td>
				</tr>
				<tr>
					<td class="tdfield"></td>
					<td class="tdfield_padding">
						<span id="maximum_size_waring"></span>
						<input type="hidden" id="time_machine_backup_enabled" name="backup_enabled" value="" /> <input type="hidden" id="time_machine_backup_size_limit" name="backup_size_limit" value="0" />
					</td>
				</tr>
			</table>			
			<div id="tm_info" class="field_top" style="display:none"></div>
		</div> <!-- body end -->
		<div class="hrBottom2"><hr/></div>
		<button type="button" class="ButtonMarginLeft_40px close" id="settings_generalTMCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" class="ButtonRightPos2" id="settings_generalTMSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
	</div> <!-- tmDiag_set end -->
</div> <!-- tmDiag end -->

<!-- cloud dialog -->
<div id="CloudDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue2 WDLabelHeaderDialogueCloudIcon" id="editCloudDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	
	<!-- sendCloudMailDiag -->
	<div id="sendCloudMailDiag">
		<div class="WDLabelBodyDialogue">
			<div style="margin-top:10px;" class="_text" lang="_cloud" datafld="reg_desc1"></div>
			<div style="margin-top:40px;" class="_text" lang="_cloud" datafld="reg_desc2"></div>
		</div><!-- WDLabelBodyDialogue end -->
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonRightPos2" id="send_cloudMail_button"><span class="_text" lang="_button" datafld="Ok"></span></button>
	</div>

	<!-- editCloudMailDiag -->
	<div id="editCloudMailDiag">
		<div class="WDLabelBodyDialogue">
			<div style="margin-top:10px;" class="_text" lang="_cloud" datafld="update_desc"></div>
			<div style="margin-top:20px;">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_cloud" datafld="old_mail"></span></td>
						<td class="tdfield_padding">
							<div id="cloud_old_mail_address"></div>
						</td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_cloud" datafld="new_mail"></span>*</td>
						<td class="tdfield_padding">
							<input id="cloud_mail_text" type="text" name="cloud_mail_text" value="">
						</td>
					</tr>
				</table>
			</div>
			<div style="float:right;margin-top:50px;">*<span class="_text" lang="_cloud" datafld="required"></span></div>
		</div><!-- WDLabelBodyDialogue end -->
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonMarginLeft_40px close" id="cloud_editMailClose_button"><span class="_text" lang="_button" datafld="close"></span></button>
		<button class="ButtonRightPos2" id="cloud_editMailSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
	</div>
	
	<!-- cloudAddAccessDiag (home.html)-->
	<div id="cloudAddAccessDiag">
		<div class="WDLabelBodyDialogue">
			<div class="_text tdfield_padding" lang="_cloud" datafld="desc"></div>
			<div class="_text tdfield_padding" lang="_cloud" datafld="step_desc"></div>
			<div class="hrBottom2"><hr/></div>
			<table border="0" cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield">Select a User</td>
					<td class="tdfield_padding">
						<div class="select_menu" id="cloud_user_select"></div>
					</td>
				</tr>
			</table>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonMarginLeft_40px close" ><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button class="ButtonRightPos2" id="home_cloudGetCode_button"  onclick="get_code($('#home_cloudUser_select').attr('rel'),'home')"><span class="_text" lang="_cloud" datafld="get"></span></button>
	</div>
					
</div>
<div id="CloudGetDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue2 WDLabelHeaderDialogueCloudIcon" id="CloudGetDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	<!-- cloudGetCodeDiag -->
	<div id="cloudGetCodeDiag">
		<div class="WDLabelBodyDialogue">
			<div class="_text" lang="_cloud" datafld="add_desc"></div>
			<br>
			<table border="0" cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="code"></span></td>
					<td class="tdfield_padding"><div id="code_info"></div></td>
				</tr>
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="expiration"></span></td>
					<td class="tdfield_padding"><div id="expiration_info" class="shortDateFormat"></div></td>
				</tr>
			</table>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonRightPos2 close"><span class="_text" lang="_button" datafld="Ok"></span></button>
	</div>	
</div>
<div id="CloudOptionDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue2 WDLabelHeaderDialogueCloudIcon" id="CloudOptionDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	<!-- optionDiag -->
	<div id="optionDiag">
		<div class="WDLabelBodyDialogue">
			<div class="_text tdfield_padding" lang="_cloud" datafld="option_desc"></div>
			<div class="hrBottom2"><hr/></div>
			<table border="0" cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="connectivity"></span></td>
					<td class="tdfield_padding">
						<table border="0" cellspacing="0" cellpadding="0" height="0">
							<tr>
								<td>
									<span id="cloud_connectivity" style="display:none"><button class="left_button" value="auto" id="settings_generalCloudAuto_button"><span class="_text" lang="_cloud" datafld="auto">Auto</span></button><button id="settings_generalCloudManual_button" class="middle_button" value="manual"><span class="_text" lang="_cloud" datafld="manual">Manual</span></button><button id="settings_generalCloudWinXP_button" class="right_button" value="winxp"><span class="_text" lang="_cloud" datafld="win">Win XP</span></button></span>
								</td>
								<td class="tdfield_padding_left_10"><div class="TooltipIcon" id="tip_connecitvity"></div></td>
							</tr>
						</table>						
					</td>
				</tr>
				<tr>
					<td class="tdfield"></td>
                    <td class="tdfield_padding">
                    	<div id="connectivity_desc"></div>
                    </td>
				</tr>
				<tr id="port_tr" style="display:none">
					<td colspan="2">
						<table id="option_tb" border="0" cellspacing="0" cellpadding="0" height="0">
							<tr>
								<td class="tdfield">
									<div class="_text" lang="_cloud" datafld="part1"></div>
								</td>
								<td class="tdfield_padding">
									<input name="settings_generalCloudHTTPPort_text" id="settings_generalCloudHTTPPort_text" type="text" class="input_x2">
								</td>
							</tr>
							<tr>
								<td class="tdfield">
									<div class="_text" lang="_cloud" datafld="part2"></div>
								</td>
								<td class="tdfield_padding">
									<input name="settings_generalCloudHTTPSPort_text" id="settings_generalCloudHTTPSPort_text" type="text" class="input_x2">
								</td>
							</tr>
						</table>	
					</td>
				</tr>
				<tr>
					<td class="tdfield"><span class="_text" lang="_cloud" datafld="wd2go_db"></span></td>
					<td class="tdfield_padding">
						<table border="0" cellspacing="0" cellpadding="0" height="0">
							<tr>
								<td><button id="settings_generalCloudRebuild_button" onclick="wd2go_db_rebuild()"><span class="_text" lang="_cloud" datafld="rebuild"></span></button></td>
								<td class="tdfield_padding_left_10"><div class="TooltipIcon" id="tip_cloud_rebuild"></div></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			<div style="float:right;display:none;margin-top: -15px;" id="required_div">* <span class="_text" lang="_cloud" datafld="required"></span></div>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonMarginLeft_40px close" id="settings_generalCloudCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button class="ButtonRightPos2" onclick="set_cloud_option()" id="settings_generalCloudSave_button"><span class="_text" lang="_button" datafld="apply"></span></button>
	</div>	
</div>

<div id="DashboardCloudDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue2 WDLabelHeaderDialogueCloudIcon" id="DashboardCloudDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	<!-- DashboardCloudAccessDiag -->
	<div id="DashboardCloudAccessDiag">
		<div class="WDLabelBodyDialogue">
			<table id="DashboardCloudAccess_tb" border="0" cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td class="tdfield">
						<div class="_text" lang="_cloud" datafld="part1"></div>
					</td>
					<td class="tdfield_padding">
						<input name="settings_generalCloudHTTPPort_text" id="settings_generalCloudHTTPPort_text" type="text" class="input_x2">
					</td>
				</tr>
				<tr>
					<td class="tdfield">
						<div class="_text" lang="_cloud" datafld="part2"></div>
					</td>
					<td class="tdfield_padding">
						<input name="settings_generalCloudHTTPSPort_text" id="settings_generalCloudHTTPSPort_text" type="text" class="input_x2">
					</td>
				</tr>
			</table>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonMarginLeft_40px close" ><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button class="ButtonRightPos2" onclick="set_port('#DashboardCloudAccess_tb')"><span class="_text" lang="_button" datafld="apply"></span></button>
	</div>
</div>
<div id="DashboardPwDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue2 WDLabelHeaderDialogueCloudIcon" id="DashboardPwDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	<!-- DashboardCloudAccessDiag -->
	<div id="pwDiag">
		<div class="WDLabelBodyDialogue">
			<div class="_text maxwidth" lang="_cloud" datafld="enable_desc2"></div>
			<table id="dash_pw_tb" border="0" cellspacing="0" cellpadding="0" height="0" >
				<tr>
					<td class="tdfield"><span class="_text" lang="_user" datafld="pw"></span></td>
					<td class="tdfield_padding">
						<input type="password" name="settings_generalPW_password" id="settings_generalPW_password" maxlength="16">
					</td>
					<td class="tdfield_padding tdfield_padding_left_10"><div class="TooltipIconError tip_pw_error"></div></td>
				</tr>
				<tr>
					<td class="tdfield"><span class="_text" lang="_user" datafld="confirm_password"></span></td>
					<td class="tdfield_padding">
						<input type="password" name="settings_generalConfirmPW_password" id="settings_generalConfirmPW_password" maxlength="16">
					</td>
					<td class="tdfield_padding tdfield_padding_left_10"><div class="TooltipIconError tip_pw2_error"></div></td>
				</tr>
			</table>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button class="ButtonMarginLeft_40px close" id="settings_generalDashboardCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button class="ButtonRightPos2" id="settings_generaiDashboardSave_button" onclick="set_dashboard();"><span class="_text" lang="_button" datafld="apply"></span></button>
	</div>
</div>

<!-- cloud message dialog -->
<div id="cloud_msg_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue LightningStatusPanelIconCloud" id="cloud_msg_title"></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="hd_ntp_set">
		<div class="WDLabelBodyDialogue">
			<div style="padding-top:10px;" class="_text" lang="_cloud" datafld="msg2"></div>
		</div>
	</div>
</div>

<!-- time dialog -->
<div id="hd_time_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueTimeIcon" id="hd_time_Diag_title"><span class="_text" lang="_time" datafld="time_d_header"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="hd_time_set">
		<div class="WDLabelBodyDialogue">
					<br><span class="_text" lang="_time" datafld="time_d_desc"></span><br><br>
						<div style="border-top: 1px solid #333333;">					
						<br>	
						<form method="post" action="/cgi-bin/system_mgr.cgi" id="form_m_time" name="form_m_time">
							
							<div style="display:none">						
													year<input type="text" name="f_year" id="f_year"><br>
													month<input type="text" name="f_month" id="f_month"><br>
													day<input type="text" name="f_day" id="f_day"><br>																							
												</div>
							
									<input type="hidden" name="cmd" value="cgi_manual_time">
									<table border="0"  cellspacing="0" cellpadding="0" height="0">
									<tr>
										<td width="100">			
									      	<span class="_text" lang="_time" datafld="date">Date</span>
										</td>
										<td> 
											 <input type="text" id="settings_generalDTDatepicker_text" class="datepicker" name="f_date" onkeydown="return;">
											 
												
											
										</td>

										<td style="display:">
											&nbsp;&nbsp;
										
										<img src="/web/images/icon/Icon_Calendar_DrkGray_32x32.png" border=0 onclick="open_date();" style="cursor:pointer" id="datepicker_img"> 
										</td>	
									</tr>
									</table>
					
					
									<table border="0"  cellspacing="0" cellpadding="0" height="0" style="margin-top:20px;">
									<tr>
										<td width="100">											
											<span class="_text" lang="_time" datafld="time">Time</span>
										</td>
										<td>						
												<div class="select_menu" id="id_hour_top_main"></div>
										</td>			
										<td>
											&nbsp;:&nbsp;
										</td>						
										<td>						
												<div class="select_menu" id="id_min_top_main"></div>
										</td>			
										<td>
											&nbsp;&nbsp;
										</td>	
										<td>						
												<div class="select_menu" id="id_pm_top_main"></div>
										</td>	
										<td style="display:none">						
												<div class="select_menu" id="id_sec_top_main"></div>
										</td>																			
									</tr>
									</table>
						</form>
					</div>
			</div>	
		<div class="hrBottom2"><hr></div>
		<button class="ButtonMarginLeft_40px close" id="settings_generalDTCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button class="ButtonMarginLeft_20px" id="settings_generalDTComputer_button" onclick="save_pc();"><span class="_text" lang="_button" datafld="set_time"></span></button>
		<button class="ButtonRightPos2" id="settings_generalDTSave_button" onclick="manual_time();"><span class="_text" lang="_button" datafld="save"></span></button>		
	</div>
</div>

<!-- ntp dialog-->
<div id="hd_ntp_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueNTPIcon" id="hd_ntp_Diag_title"><span class="_text" lang="_time" datafld="ntp_title"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="hd_ntp_set">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<span class="_text" lang="_time" datafld="ntp_desc"></span>			
			<div style="border-top: 1px solid #333333;">
				<br><br>					
			<ul class="nListDiv">
					<li id="id_ntp_user">
						<div class="div1"></div>
						<div class="div2_input">					
							<input type="text" name="settings_generalNTPServer_text" id="settings_generalNTPServer_text" onkeyup="show('settings_generalNTPServerDel_link')">							
						</div>
						<div class="div3">	<span class="_text" lang="_time" datafld="ntp_user"></span></div>						
						<div class="div4">						
							<a href="javascript:del_user_ntp();" id="settings_generalNTPServerDel_link" class="del" style="margin-top:16px;"></a>								
						</div>											
					</li>
					<li>
							<div class="div1"></div>
						<div class="div2">time.windows.com</div>
						<div class="div3">Microsoft NTP service</div>						
						<div class="div4"></div>											
					</li>
					<li>
							<div class="div1"></div>
						<div class="div2">pool.ntp.org</div>
						<div class="div3">NTP pool service</div>						
						<div class="div4"></div>											
					</li>
			</ul>
					<br><br>
					<table border="0"  cellspacing="0" cellpadding="0" height="0">
						<tr><td>
						<button id="settings_generalNTPServerAdd_button" onclick="add_user_ntp();" ><span class="_text" lang="_time" datafld="add_ntp"></span></button>					
					</td></tr>
				</table>
				</div>		
					<span id="id_ntp_wait" style="display:none"><img border=0 src="/web/images/SpinnerSun.gif"></span>
			</div>	
		</div>
		<div class="hrBottom2"><hr></div>
		<button type='button' class='ButtonLeftPos close' id="settings_generalNTPServerCancel_button_"><span class="_text" lang="_button" datafld="Cancel"></span></button>		
		<button type='button' class='ButtonRightPos1' id="settings_generalNTPServerSave_button" onclick="save_ntp();"><span class="_text" lang="_button" datafld="save"></span></button>
	</div>
</div>
<!-- ntp status dialog -->
<div id="hd_ntp_status_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueHDDIcon" id="hd_ntp_Diag_title"><span class="_text" lang="_time" datafld="ntp_status"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="hd_ntp_set">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
					<div id="id_status"></div>								
			</div>	
		</div>
		<div class="hrBottom2"><hr></div>
  	<div class="LightningButton ButtonRightPos1 close" id="ntp_button" lang="_button" datafld="close"></div> 
	</div>
</div>
<!-- power dialog -->

<div id="power_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue WDLabelHeaderDialoguePowerIcon" id="hd_ntp_Diag_title"><span class="_text" lang="_energy" datafld="p_sch"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="power_set">
		<div class="WDLabelBodyDialogue">
					<div class="dialog_content" style="overflow:hidden">
							<table border="0" cellspacing="0" cellpadding="0" height="0" width="546">
								<tr>
									<td width="42"></td>
									<td width="72" align="center">S</td>
									<td width="72" align="center">M</td>
									<td width="72" align="center">T</td>
									<td width="72" align="center">W</td>
									<td width="72" align="center">T</td>
									<td width="72" align="center">F</td>
									<td width="72" align="center">S</td>								
								</tr>
								<tr>
									<td width="42"></td>									
									<td width="72" align="center"><div id="settings_generalPowerSun" onclick="show_time(7);"></td>
									<td width="72" align="center"><div id="settings_generalPowerMon" onclick="show_time(1);"></td>
									<td width="72" align="center"><div id="settings_generalPowerTue" onclick="show_time(2);"></td>
									<td width="72" align="center"><div id="settings_generalPowerWed" onclick="show_time(3);"></td>
									<td width="72" align="center"><div id="settings_generalPowerThu" onclick="show_time(4);"></td>
									<td width="72" align="center"><div id="settings_generalPowerFri" onclick="show_time(5);"></td>
									<td width="72" align="center"><div id="settings_generalPowerSat" onclick="show_time(6);"></td>							
								</tr>
							</table>	
					<!--	<div class="triangle"></div>-->
						<br>
						<div class="mwt_border">							
							<span class="arrow_t_int"></span>
    					<span class="arrow_t_out"></span>    					
    					<span id="power_tb_content">
    					</span>	
						</div>
						
					<!--	<div class="wizard_add_email_container">
					
						</div>	
						-->
					</div>	
		</div>
		<div class="hrBottom2"><hr/></div>							
		<button class="ButtonMarginLeft_40px close" id="settings_generalPowerCancel_button" onclick="power_cancel();"><span class="_text" lang="_button" datafld="Cancel"></span></button>		
		<button class="ButtonRightPos2" id="settings_generalPowerSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
</div>
</div>

<!-- recycle bin dialog -->
<div id="recycleBinDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueDFSIcon" id="recycleBinDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>

		<div>
			<div class="WDLabelBodyDialogue">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td height="50" width="200"><div class="_text field" lang="_recycle" datafld="auto_clear"></div></td>
						<td colspan="2">
							<input id="settings_recycleBin_switch" name="settings_recycleBin_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
					</tr>
					<tr id="recycle_bin_clear_days_div">
						<td height="50">
							<div class="_text field" lang="_recycle" datafld="clear_days_1"></div>
						</td>
						<td>
							<input maxLength="5" style="width: 50px;" type="text" name="settings_recyclBinClearDays_text" id="settings_recyclBinClearDays_text">
							<span class="_text" lang="_recycle" datafld="clear_days_2"></span>
						</td>
						<td class="tdfield_padding tdfield_padding_left_10"><div class="TooltipIconError tip_clear_day_error"></div></td>
					</tr>
				</table>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px close" name="settings_recycleBinCancel_button" id="settings_recycleBinCancel_button" ><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" name="settings_recycleBinSave_button" id="settings_recycleBinSave_button" onclick="save_recycle_bin_info();"><span class="_text" lang="_button" datafld="save"></span></button>
		</div>
</div>
<!-- recycle bin end -->
<iframe id="page_target" name="page_target" style="display:none;width:0;height:0"></iframe>	
<form name="form_page_load" id="form_page_load" method="post" action="" target="page_target"></form>	
</body>
</html>
