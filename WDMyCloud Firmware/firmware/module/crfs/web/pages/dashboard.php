<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
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
	font-size:40px;
	FONT-FAMILY: Helvetica;
	color:#4B5A68;
	/*border: 1px solid #363636;*/
}
.WDlabelInfoBoxSmall{
    position: relative;
    top: 9px;
    left: 13px;
	width: 100px;
	font-size: 16px;
}
.TR-TR .WDlabelInfoBoxSmall{
	 top: 18px;
}	
.WDlabelInfoBoxMedium{
	font-size:66px;
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
.WDlabelEjectIconSmall{
	float: left;
	background: url(/web/images/IconListDropdownUSBEjectUp-01.png?r=20150122) no-repeat;
	cursor: pointer;
	height:18px;
	width:18px;
}

.WDlabelEjectIconSmall:hover{
	background: url(/web/images/IconListDropdownUSBEjectUp-01.png?r=20150122) no-repeat;
	cursor: pointer;
	height:18px;
	width:18px;	
}
.WDlabelInfoIconSmall{
	background: url(/web/images/icon/IconListDropdownUSBDevicesInfoUp.png?r=20150122) no-repeat;
	cursor: pointer;
	height:18px;
	width:18px;		
}
.WDlabelInfoIconSmall:hover{
	background: url(/web/images/icon/info_f.png?r=20150122) no-repeat;
	cursor: pointer;
	height:22px;
	width:22px;		
}
.WDlabelDeviceIcon{
	width: 158px;
    height: 200px;
    background: url(/web/images/icon/dev.png?r=20150122) no-repeat;
    position: relative;
    margin-top: 83px;
    margin-left: 20px;
}
.WDlabelOkIcon{
	width:32px;
	height:28px;
	background: url(/web/images/icon/ok.png?r=20150122) no-repeat;
	/*border: 1px solid #363636;*/
}
.WDlabelCautionIcon{
	width:32px;
	height:28px;
	background: url(/web/images/icon/critical_alert.png?r=20150122) no-repeat;
	/*background-size:32px 28px;*/
}
.WDlabelWorryIcon{
	width:32px;
	height:28px;
	background: url(/web/images/icon/worry.png?r=20150122) no-repeat;	
}
.medium_header_div{
	float:left;
	line-height: 38px;
	height:38px;
	width:200px;
	margin-top:5px;
	margin-left:9px;
	/*border: 1px solid #363636;*/
}
.info_div{
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
	bottom: -13px;
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
	line-height: 50px;
	height: 50px;
	width:120px;
	margin-left:45px;
	margin-top: 14px;
	text-align: center;
}
.icon_pos {
	position: absolute;
	top: 28px;
	left: 20px;
}
.TR-TR .icon_pos{
	top: 40px;
}
.tickLabel { 
	font-size: 12px ;
	color:#898989;
	width:25px;
	/*-webkit-transform:scale(0.7);*/
  /*visibility:hidden;*/
}

#home_networkActivity_link .tickLabel { 
	font-size: 7px ;
	color:#262626;
	width:15px;
        visibility:hidden;
	}

.home_uicon{
	background: url(/web/images/icon/homepage_medium_icons.png?r=20150122) no-repeat 0px -156px;
}
.uTotal_title{
	padding-left:30px;
}

.ui-widget-header {
    background: #15ABFF;
}

.ui-widget-content{
		height: 4px;
	        border: 0;
		background: #C8C8C8 !important;;
		border-radius: 0;
}

#non_supported_browser {
    display: none;
}
</style>
<script>

function dashboard_multi_language()
{
	switch(parseInt(MULTI_LANGUAGE, 10))
	{
		case 4:
            $("#placeholder2_title").css('font-size','13px');
			$("#cloud_str").css('font-size','17px');
		break;
		
		case 8:	//jp
				var oBrowser = new detectBrowser();
				if (oBrowser.isGoogle)
				{						
					$("#placeholder2_title").css('-webkit-transform','scale(0.80)').css('margin-left','-10px').css('font-size','9px');
				}
				else
				{	
					$("#placeholder2_title").css('font-size','8px');
				}	
		break;	
		
		case 9:		
                                var oBrowser = new detectBrowser();
				if (oBrowser.isGoogle)
				{						
					$("#home_processDiv3_link").css('-webkit-transform','scale(0.85)').css('font-size','11px').css('margin-left','-13px');
				}
				else
				{	
					$("#home_processDiv3_link").css("font-size","11px");				
				}
	                        $("#placeholder2_title").css('font-size','11px');
			        $("#home_b4_free").css('font-size','28px');											
			  $("#home_b4_capacity_free").css('font-size','56px');											
				break;
		case 13:
		case 15:
			$("#placeholder2_title").css('font-size','11px');
			$("#home_b4_free").css('font-size','28px');
			break;

		case 10:
		 	$("#placeholder2_title").css('font-size','12px');
			$("#diagnostics_state").css('font-size','11px');
			$("#cloud_str").css('font-size','17px');
		break;
		
		case 11:
			$("#home_b4_free").css('font-size','15px');
			$("#home_b4_capacity_free").css('font-size','48px');
		break;
		
		default:
			$("#cloud_str").css('font-size','14px');
			$("#home_b4_free").css('font-size','40px');
		break;
	}
}

function detectBrowser() {
	var sAgent = navigator.userAgent.toLowerCase();
	this.isGoogle = (sAgent.indexOf("chrome") != -1);
	this.isIE = (sAgent.indexOf("msie") != -1); //IE6.0-7
	this.isIE9 = (sAgent.indexOf("msie 9") != -1); //IE9
	this.isIE7 = (sAgent.indexOf("msie 7") != -1); //IE7
	this.isIE8 = (sAgent.indexOf("msie 8") != -1); //IE8
	this.isIE10 = (sAgent.indexOf("msie 10") != -1); //IE10
	this.isFF = (sAgent.indexOf("firefox") != -1); //firefox
	if (!this.isGoogle)
		this.isSa = (sAgent.indexOf("safari") != -1); //safari
	this.isOp = (sAgent.indexOf("opera") != -1); //opera
	this.isNN = (sAgent.indexOf("netscape") != -1); //netscape
	this.isMa = this.isIE; //marthon
	this.isOther = (!this.isIE && !this.isFF && !this.isSa && !this.isOp && !this.isNN && !this.isSa && !this.isGoogle); //unknown Browser
}
function page_load()
{
	/*
	if(VOLUME_NUM==2)
	{
		$(".WDlabelDeviceIcon").css('width','245px').css('margin-top','105px').css('margin-left','20px');
		$(".capacity_icon").css('margin-top','5px');
		
		if(PROJECT_NAME=="MyCloudMirror")
		{
			$(".b6").css('margin-left','-10px');
			$(".b7").css('margin-left','-10px');
		}
	}
	
	
	if(PROJECT_NAME=="MyCloudGen2")
	{
		$(".WDlabelDeviceIcon").css('width','245px').css('margin-top','55px').css('margin-left','20px');
		$(".hdd_icon").css('margin-top','-1px');
	}*/

	TopCurrentIndex=1;
	$(".ButtonArrowLeft").addClass('gray_out');
	$(".ButtonArrowRight").removeClass('gray_out');
	scrollDivRight_Special('main_nav');

	dashboard_multi_language();
	
	var oBrowser = new detectBrowser();
	/*
	if (oBrowser.isGoogle)
	{	
		$("#home_networkActivity_link").css('width','220px').css('height','106px');
		$("#tb_ram").css('margin-top','6px').css('margin-left','2px');
		$("#tb_cpu").css('margin-top','-20px').css('margin-left','2px');
		
		$("#title_ram").css('margin-left','2px');		
		$("#title_cpu").css('margin-left','2px');		
	}
	*/
		
	get_fw_version();
	get_diagnostics_state();
	//chk_fw_upload();

	if (fw_need_boot == -1)
	{
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/system_mgr.cgi",
		data:"cmd=get_auto_fw_version",
		success:function(xml){
				if (fw_need_boot ==1) return;
			$(xml).find('fw').each(function(index){
				var str = "";
				var new_str = $(this).find('new').text();
				if (new_str == 0 || new_str == "-1")
				{
					//str = "no upgrade"
					$("#home_firmwareInfo_value").text(FW_VERSION)
					show('fw_ok');
					hide('fw_error')
				}
				else 
				{
					var version = $(this).find('version').text();
					var path = $(this).find('path').text();
						$("#home_firmwareInfo_value").text(_T('_module','desc25'));
					hide('fw_ok');
					show('fw_error')
				}
			});
		}
	});	
	}
	
	show_user_info();
	ready_device_active();

	CloudIntervalId = setTimeout(get_cloud_count,10);
	
	//fish20140219+ for 86521 "Undefined" error message if Cloud Access is disabled when generating code 
	var remote_access = _REST_Get_Cloud_Info();	//true,false
	if(remote_access=="false")
	{
		$("#create_user_tb input[name='users_mail_text']").addClass("gray_out").attr('readonly','true');
		$("#home_cloud_link").css({'left':'-10px'});
		$("#home_cloud_link").show();
		
		home_show_volume_info("home");
	}
	else
	{
		$("#home_cloud_link").removeClass('gray_out');
		$("#home_cloud_link").show();
		
		//diag_volcapacity_info();
		home_volcapacity_pie();
	}

	//cloud	
	$("#home_cloud_link").click(function(){
		if($(this).hasClass('gray_out')) return;
		if(_LOCAL_LOGIN==0)
		{
			jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
			return;
		}
		init_cloud_access_dialog('home');
	});
	
	//user
	$("#home_user_link").click(function(){
		var create_status = api_do_query_create_status2("iUser");
		if(create_status==-1)
		{
			jAlert(_T('_user','msg45'), "warning");
			return;
		}
		google_analytics_log('Home-Users','');
		
		get_user_list("","home");
		Get_Quota_Info();
		init_create_user_dialog('home');
		/*$("#users_addUserExpires_switch").unbind("click");
	    $("#users_addUserExpires_switch").click(function(){
			var v = getSwitch('#users_addUserExpires_switch');
			display_expires(v);
	});

		init_datepicker();*/
	});
	
	Home_apps_count();
	
	system_reset_chk();
}

function page_unload()
{
	clearTimeout(loop_main);
	clearTimeout(loop_network);
	clearTimeout(loop_memory);
	clearTimeout(loop_cpu);
	clearTimeout(loop_process);
	clearTimeout(CloudIntervalId);
	clearTimeout(h_loop_fw);
	
	$("#home_networkActivity_link").unbind("plothover");
	count_main = 0;	
	count_network = 0;
	count_cpu = 0;
	count_memory = 0;
	plot2 = 0;	
}


var h_loop_fw = -1;
var fw_need_boot = -1;
function chk_fw_upload()
{	
	return;	
		wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=chk_fw_upload",
		success: function (data) {		
			if (data == "upload_complete")   
			{	
					fw_need_boot = 1;
					var oBrowser = new detectBrowser();
					
					if (MULTI_LANGUAGE == 9 || MULTI_LANGUAGE == 10)
					{										
						if (oBrowser.isGoogle)
						{	
							$("#fw_s_info").css("line-height","20px");						
						}										
						$("#home_firmwareInfo_value").text(_T('_firmware','reboot_required')).css('font-size','8px');
					}	
					else if (MULTI_LANGUAGE == 12 || MULTI_LANGUAGE == 13)		
						$("#home_firmwareInfo_value").text(_T('_firmware','reboot_required')).css('font-size','9px');
					else if (	MULTI_LANGUAGE == 15)
					{
						if (oBrowser.isGoogle)
						{	
							$("#fw_s_info").css("line-height","20px");						
						}	
						$("#home_firmwareInfo_value").text(_T('_firmware','reboot_required')).css('font-size','7px');
					}	
					else 	
						$("#home_firmwareInfo_value").text(_T('_firmware','reboot_required')).css('font-size','10px');
							
					$("#home_firmwareInfo_value").parent().next().css("display","none");
					hide('fw_ok');
					show('fw_error')
					clearTimeout(h_loop_fw);
					return;
			}		
			h_loop_fw = setTimeout(chk_fw_upload,60000);		
		}
	});	
}
</script>

<body>
	<div class="b4">
	  <div class="WDlabelHeaderBoxLarge header_div"><span class="_text" lang="_home" datafld="capacity">Capacity</span></div>
	  <div style="display:none" id="home_volcapity_pei">
	  <div id="VolCapity_pei" class="graph"></div>
	  <div class="WDlabelInfoFreeBoxLarge" id="home_b4_free" style="position: absolute; left: 90px; top: 130px; width:120px; text-align:center;"></div>
		</div>
		
	  <div id="home_volcapity_info" style="display:none;clear: both;margin-top:0 !important;">
	  	<div class="WDlabelInfoBoxLarge info_div" id="home_b4_capacity_info" style="margin-top:0;position: relative;top: 60px;"></div>
			<div class="WDlabelInfoSizeBoxLarge" id="home_b4_capacity_size" style="display: inline-block;font-size: 78px;position: relative;top: 85px;padding-right: 34px;padding-left: 150px;color: #85939c;">GB</div>
			<div class="WDlabelInfoFreeBoxLarge" id="home_b4_capacity_free" style="display: inline-block;font-size: 78px;position: relative;top: 85px;color: #85939c; text-transform: lowercase;">
	                <span class="_text" lang="_home" datafld="free"></span>
	   </div>
			</div>
	</div>
	<div class="b5">
		<div class="WDlabelHeaderBoxLarge header_div"><span class="_text" lang="_menu" datafld="device">Device</span></div>
		<div class="WDlabelDeviceIcon"></div>

	<div class="b6">
		<div class="WDlabelHeaderBoxSmail s_header_div"><span class="_text" lang="_home" datafld="diagnostics">Diagnostics</span></div>
		<div class="icon_pos" id="diagnostics_icon"></div>
		<div class="WDlabelInfoBoxSmall s_info_div" style="border: 0px solid red;"><span id="diagnostics_state"></span></div>
		<div class="WDlabelArrowIconSmall s_arrow_div" id="smart_info" onclick="diag_smart_info();"></div>
	</div>

	<div class="b7" id="home_fw_link">
		<div class="WDlabelHeaderBoxSmail s_header_div"><span class="_text" lang="_home" datafld="firmware">Firmware</span></div>
		<div class="WDlabelWorryIcon icon_pos" id="fw_error" style="display:none"></div>
		<div class="WDlabelOkIcon icon_pos" id="fw_ok" style="display:none"></div>
		
		<div class="WDlabelInfoBoxSmall s_info_div" id="fw_s_info"><span id="home_firmwareInfo_value"></span></div>
			<div class="WDlabelArrowIconSmall s_arrow_div" id="home_fw_link" onclick="open_h_diag();"></div>
		</div>
	</div>

	<!--<div class="hr_0" style="clear:left"><div class="hr_1"></div></div>-->
	<div class="LightningDeviceFrame"></div>
	<div class="LightningBottomFrame">
		<div class="b8_active">
			<div class="WDlabelHeaderBoxMedium m_header_div str_nowrap" id="placeholder2_title"><span class="_text" lang="_monitor" datafld="network_active"></span></div>
			<table cellspacing=0 cellpadding=0 border=0>
				<tr>
						<td>														
						<div id="home_networkActivity_link" style="margin-top: 10px; width:220px; height:106px;" onclick="diag_active();diag_active_open('id_network');" ></div>
						</td>	
						<td width="14">
						<div class="network_activity_vr"></div>
						</td>	
						<td>
							<div id="tb_cpu" style="margin-top:-9px;margin-left:5px;">
							<span id="title_cpu" style='margin-left:3px;-webkit-transform:scale(0.88); display:inline-block;font-size:11px'>CPU</span>
							<table class="cpu-tb" id="home_cpuDetail_link"  cellspacing='0' cellpadding='0' style="cursor:pointer;" onclick="diag_active();diag_active_open('id_cpu');">
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							</table>	
							</div>
						<!--	<div style="margin-top:7px;"> -->
							<div id="tb_ram" style="margin-top:7px;margin-left:5px;">
							<span id="title_ram" style='margin-left:3px;-webkit-transform:scale(0.88); display:inline-block;font-size:11px'>RAM</span>
							<table class="cpu-tb" id="home_ramDetail_link"  cellspacing='0' cellpadding='0' style="cursor:pointer;" onclick="diag_active();diag_active_open('id_memory');">
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							<tr><td></td></tr>
							</table>
							</div>
						</td>
						<td>
							<div class="WDlabelArrowIconSmall" id="home_networkActivityDetail_link" onclick="diag_active()"></div>
						</td>
				</tr>	
			</table>
		</div>	
		<div class="b8">
			<div class="WDlabelHeaderBoxMedium m_header_div str_nowrap" id="cloud_str"><span class="_text" lang="_cloud" datafld="cloud_dev"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="home_cloudDevices_value">0</div>
			<div class="WDlabelAddIconSmall m_arrow_div gray_out" id="home_cloud_link" style="display:none"></div>
		</div>	
		<div class="b8">
			<div class="m_icon"></div>
            <div class="WDlabelHeaderBoxMedium m_header_div uTotal_title str_nowrap" id="users_dash_text"><span class="_text" lang="_menu_title" datafld="users"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="home_user_value"></div>
			<div class="WDlabelAddIconSmall m_arrow_div" id="home_user_link" style="display:none"></div>
		</div>	
		<div class="b8">
			<div class="WDlabelHeaderBoxMedium m_header_div"><span class="_text" lang="_menu_title" datafld="app"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="home_apps_count"></div>
			<div class="WDlabelArrowIconSmall m_arrow_div" id="home_apps_link"></div>
		</div>
	</div>

<div id="smartDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue">
		<span class="_text" lang="_home" datafld="diagnostics">Diagnostics</span>
	</div>
	<div align="center"><div class="hr"><hr></div></div>
	<div class="WDLabelBodyDialogue">
		<div class="dialog_content">
			<table width="650px">
				<tr>
					<td style="word-wrap: break-word;word-break: break-all;text-align: justify;"><span class="_text" lang="_home" datafld="desc3"></span><br><br></td>
				</tr>
			</table>		
	
			<table border="0" cellSpacing="0" cellPadding="0" style="border-collapse: collapse" bordercolor="#000000" width="350px" id="smartDiag_wait">
				<tr><td height="100" width="95%" align="center"><img src="/web/images/SpinnerSun.gif" style="margin-bottom:-10px;">&nbsp;<span class="_text" lang="_common" datafld="wait">Waiting...</span></td></tr>
			</table>
			
				<div style="display:none" class="flexigrid" id="home_diagnosticsFlexigrid">
			<div class="home_diagnostics_scroll">
					<div class="bDiv" style="width: auto;">
						<table id="smart_hd_list" border="0" cellpadding="0" cellspacing="0">
							<tbody>
								<tr id="row1">
									<td align="left"><div style="text-align: left; width: 305px;"><span class="_text" lang="_home" datafld="temperature">Temperature</span></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsSysTemper_value">--</div></td>							
								</tr>
								<tr id="row2" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;" id="home_diagnosticsDrive1"></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsDrive1Temper_value">--</div></td>							
								</tr>
								<tr id="row3" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;" id="home_diagnosticsDrive2"></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsDrive2Temper_value">--</div></td>							
								</tr>
								<tr id="row4" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;" id="home_diagnosticsDrive3"></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsDrive3Temper_value">--</div></td>							
								</tr>
								<tr id="row5" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;" id="home_diagnosticsDrive4"></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsDrive4Temper_value">--</div></td>							
								</tr>
								<tr id="row6" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;"><span class="_text" lang="_home" datafld="desc7">Fan Speed</span></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsFanTemper_value">--</div></td>							
								</tr>
								<tr id="row7">
									<td align="left"><div style="text-align: left; width: 305px;"><span class="_text" lang="_home" datafld="desc8">Drive Status</span></div></td>
									<td align="right"><div style="text-align: right; width: 250px;" id="home_diagnosticsDriveStatus_value">--</div></td>							
								</tr>
								<tr id="row8" style="display:none">
									<td align="left"><div style="text-align: left; width: 305px;"><span class="_text" lang="_home" datafld="desc9">RAID Status</span></div></td>
									<td align="right"><div style="width: 250px;" id="home_diagnosticsRaidStatus_value">--</div></td>							
								</tr>
							</tbody>
						</table>
					</div><!--end of bDiv -->	
				</div><!--end of flexigrid-->
			</div>
			
		</div>	
	</div>
	<div class="hrBottom2"><hr/></div>
	<button type="button" class="ButtonRightPos2 close" id="home_diagnosticsClose1_button"><span class="_text" lang="_button" datafld="close"></span></button>
</div>

<div id="AppsDiag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue"><span class="_text" lang="_module" datafld="desc3"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	<div id="AppsDiag_list" style="display:none;">	
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content scrollbar_home_applist">
				<!-- <table id="apps_list"></table> --> 
				<div class="flexigrid" style="width: 600px;">
					<div class="hDiv">
						<div class="hDivBox"></div><!-- hDivBox -->
					</div><!-- hDiv -->
					<div class="bDiv" style="height: auto;">
						<table cellspacing="0" cellpadding="0" border="0">
							<tbody id="Home_APPList_tbody"></tbody>
						</table>
					</div><!-- bDiv -->
					</div><!-- flexigrid -->
			</div>
		</div>
		<div class="hrBottom2"><hr></div>
		<button type="button" class="ButtonRightPos2 close" id="home_appsClose1_button"><span class="_text" lang="_button" datafld="close"></span></button>
	</div>	
	
	<div id="AppsDiag_detail" style="display:none;">	
		<div class="WDLabelBodyDialogue" >
			<table border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="desc21"></span>:</td>
						<td></td>	
						<td class="tdfield_padding"><div id="apps_details_name"></div></td>	
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_module" datafld="version">Version</span>:</td>
						<td class="tdfield_padding"></td>	
						<td class="tdfield_padding"><div id="apps_details_verison"></div></td>	
					</tr>
					
					<tr>
						<td class="tdfield"><span  class="_text" lang="_module" datafld="desc20">Installed on</span>:</td>
						<td class="tdfield_padding"></td>	
						<td class="tdfield_padding"><div id="apps_details_installon"></div></td>	
					</tr>
					
					<tr id="TR_AppsDiag_detail_URL">
						<td class="tdfield"><span class="_text" lang="_module" datafld="desc7">Configuration URL</span>:</td>
						<td class="tdfield_padding"></td>	
						<td class="tdfield_padding"><div id="home_appsConfig_link"></div></td>	
					</tr>
			</table>  
		</div>
	<div class="hrBottom2"><hr></div>
	<button type="button" class="ButtonMarginLeft_40px" id="home_appsBack2_button"><span class="_text" lang="_button" datafld="back"></span></button>
	<button type="button" class="ButtonRightPos2 close" id="home_appsClose2_button"><span class="_text" lang="_button" datafld="close"></span></button>
	</div>
</div>

<iframe id="upload_frame" name="upload_frame" width="100%" height="0px" frameborder="0" scrolling="no" src="/web/setting/upload.html"></iframe>

<?php
$c_path = $_SERVER['DOCUMENT_ROOT']."web";
require("$c_path/activeDiag.html");
require("$c_path/setting/fwDiag.html");
require("$c_path/users/usersDiag.html");
require("$c_path/cloud/cloudDiag.html");
?>
    
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
        .b4,
        .b5,
        .LightningDeviceFrame,
        .LightningBottomFrame,
        .smartDiag,
        .AppsDiag {
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