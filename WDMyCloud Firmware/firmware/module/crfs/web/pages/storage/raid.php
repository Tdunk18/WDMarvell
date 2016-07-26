<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
</head>

<script type="text/javascript" src="/web/function/raid_define.js"></script>
<script type="text/javascript" src="/web/function/raid.js"></script>
<script type="text/javascript" src="/web/function/raid_diag.js"></script>
<script type="text/javascript" src="/web/function/raid_create_diag.js"></script>
<script type="text/javascript" src="/web/function/raid_reformat_diag.js"></script>
<script type="text/javascript" src="/web/function/raid_remain_diag.js"></script>

<style>
/*RAID Mode Menu*/
.raid_left{
	padding:0px 0px 0px 0px;
	position: relative;
	width:180px;
	height:320px;
	display: inline-block;
}
.raid_left ul{
    position: relative;
	margin: 0;
	padding: 0;
	width:180px;
	height:320px;
}
.raid_left ul li {
    position: relative;
    width: 172px;
    height: 50px;
	margin: 0;
	padding: 0;
	list-style: none;
    color: #4B5A68;
	background-color: #F0F0F0;
    border-bottom: 1px solid #C8C8C8;
    box-sizing: border-box;
}
.raid_left ul li:last-child {
    border-bottom: 0;
}
.raid_left ul li .tlt{
    position: relative;
    width: 100px;
    height: 30px;
	margin: 10px 0 0 10px;
	padding: 5px 0 0;
	float: left;
}
.raid_left ul li .img{
	margin:10px 10px 0px 0px;
	padding:0px 0px 0px 0px;
	position: relative;
	float:right;
	width:25px;
	height:30px;
	/*border: 1px solid green;*/
}
.raid_right{
	padding:10px 0px 0px 0px;
	position: relative;
	width:450px;
	height:320px;
	display: inline-block;
	/*float:left;
	border: 0px solid green;*/
}

/* [-] For RAID Size bar */

#raid_status tr td {
	border: 0px;
}
#raid_status tr td div {
	height: 18px;
	padding: 0px;
}

.sel{
	background-color: #0067A6;
	/*border: 1px solid #0067A6;*/
}

.grayout{
	filter:alpha(opacity=30);opacity:0.3; top:15px;left:0;cursor: text;
}

.list_icon_bar_text {
	font-size: 15px;
	padding-left: 5px !important;
}

#formatdsk_Diag .ui-slider-horizontal,
#formatdsk_Diag .ui-slider-horizontal .ui-slider-handle {
    margin-left: 0px !important;
}

#dskDiag_raidmode_set img {
    position: absolute;
    right: -40px;
    bottom: -35px;
}
#dskDiag_raidmode_set img[src="/web/images/RAID/raidmode_raid5.png"],
#dskDiag_raidmode_set img[src="/web/images/RAID/raidmode_raid10.png"] {
    right: -23px !important;
}
#dskDiag_raidmode_set .tdfield_padding {
    padding-top: 20px !important;
}
</style>

<script type="text/javascript">
var RAID_VolList_timeoutId = 0;	//for settimeout
var intervalId = 0;	//for setInterval
var _SELECT_ITEMS  = new Array();
var HD_STATE = 0;
function raid_get_min_hd_size_info(devs)
{
	var devs_arr = $.trim(devs).split("sd");
	var hd_size_list = new Array();
	var hd_count = 0;
	var hd_total_size = 0;

	for(var d in devs_arr)
	{
		if (devs_arr[d] == "") continue;
		hd_count++;

		for(var i = 0; i < CURRENT_HD_INFO.length; i++)
		{
			if (('sd' + devs_arr[d]) == CURRENT_HD_INFO[i][0])
			{
				hd_size_list.push(parseInt(CURRENT_HD_INFO[i][5], 10) *1024);
				hd_total_size += parseInt(CURRENT_HD_INFO[i][5], 10) *1024;
				break;
			}
		}
	}

	return [hd_count, Math.min.apply(Math, hd_size_list), hd_total_size];
}

function page_load()
{	
	$("#tip_raid").attr('title',_T('_tip','raid'));
	init_tooltip();	
	
	INTERNAL_FMT_Load_USED_VOLUME_INFO();
	INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();
	INTERNAL_FMT_Load_SYSINFO();
	INTERNAL_FMT_Load_VOLUME_ENCRYPTION();
	
	var menu_hd_ve = 0;
	$('volume_info > item', USED_VOLUME_INFO).each(function(e){
			if ( ($('volume_encrypt',this).text() == "1") && menu_hd_ve == 0 ) menu_hd_ve = 1;
	});//end of each 
	(menu_hd_ve == 0)?$("#hd_ve").hide():$("#hd_ve").show();
	
	/*	HD_Status:
		0 -> No Volume 
		1 -> volume is ok
		2 -> S.M.A.R.T. Test now		
		3 -> Formating now
		4 -> Scaning Disk 
		5 -> No Disk
		6 -> disks sequence are not valid.
	*/
	
	HD_Status(1,function(HD_STATE){	
		if ( parseInt(HD_STATE,10) != 0 && parseInt(HD_STATE,10) != 3 )
		{
			$('volume_info > item', USED_VOLUME_INFO).each(function(e){
					if ( ($('volume_encrypt',this).text() == "1") && menu_hd_ve == 0 ) menu_hd_ve = 1;
				});//end of each
				
				HD_Config_AutoRebuild_Get_Info();
		}	
		HD_Config_FMT_CGI_Log();
		
	});//end of HD_Status(1,function(HD_STATE){	
	RAID_Volume_list();
	
	init_switch();
	
	$("#storage_raidAutoRebuild_switch").click(function(){	
    	HD_Config_Set_Auto_Rebuild_Info();
  });	
    
	$("#storage_raidManuallyRebuild_button").click(function(){
		if ( $(this).hasClass('gray_out') ) return;
				
		$(this).addClass('gray_out'); 
		RAID_Manually_Rebuild_dialog();
	});
	
	$("#storage_raidChangeRAIDMode_button").click(function(){
		
		jConfirm('M', _T('_raid','desc90'), _T('_common','warning') ,"warning" ,function(r){
			if(r)
			{
				if (parseInt(RAID_VolList_timeoutId,10) != 0)	clearTimeout(RAID_VolList_timeoutId);
				if (parseInt(intervalId,10) != 0) 	clearInterval(intervalId);
			
		    	FMT_CREATEALL_DATA_INIT = 0;
				FMT_CreateAll_Data_Init('0');
				window.setTimeout("init_formatdsk_dialog('0')",500);
			}
    	});	//end of jConfirm
    });
    $("#storage_raidSetupRAIDMode_button").click(function(){
    	
    	FMT_CREATEALL_DATA_INIT = 0;
    	
    	FMT_CreateAll_Data_Init('0');
    	window.setTimeout("init_formatdsk_dialog('0')",500);
    });
}

function page_unload()
{
	if (parseInt(RAID_VolList_timeoutId,10) != 0)	clearTimeout(RAID_VolList_timeoutId);
	if (parseInt(intervalId,10) != 0) 	clearInterval(intervalId);
	clearTimeout(internal_fmt_load_sysinfo_timeout);
}
</script>

<body>
<!-- Block 1 :  Auto-Rebuild Configuration -->
<div class="h1_content header_2"><span class="_text" lang="_raid" datafld="title1"></span></div>	
<div class="field_top" id="div_raid_desc">
	<table border="0">
		<tr>
			<td class="tdfield"><span class="_text" lang="_raid" datafld="desc1"></span></td>
			<td class="tdfield_padding" colspan="2"><div id="raid_healthy"></div></td>
		</tr>
		<tr>
			<td class="tdfield">&nbsp;</td>
			<td class="tdfield_padding" colspan="2"><div id="raid_healthy_desc"></div></td>
		</tr>
		
		<tr id="storage_RAIDAutoRebuild_tr" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_raid" datafld="desc4"></span></td>
			<td class="tdfield_padding" colspan="2">
					<table width="auto" border="0">
						<tr>
							<td id="storage_RAIDAutoRebuildswitch_td"><input id="storage_raidAutoRebuild_switch" name="storage_raidAutoRebuild_switch" class="onoffswitch gray_out" type="checkbox" value="true"></td>
							<td id="storage_RAIDAutoRebuildtip_td" style="width:25px;"><div class="TooltipIcon" id="tip_raid" style=""></div></td>
							<td id="storage_RAIDManuallyRebuildbutton_td" style="padding-top : 0px;"><button id="storage_raidManuallyRebuild_button" class="_text" style="display:none;" lang="_raid" datafld="desc84"></button></td>
						</tr>	
					</table>	
			</td>	
		</tr>	
	</table>			
</div>

<!-- Block 2 : Hard Drive Configuration -->
<div class="hr_0_content" style="margin-top:30px;margin-bottom:30px;"><div class="hr_1"></div></div>
<div class="h1_content header_2"><span class="_text" lang="_raid" datafld="title2"></span></div>																
<br>
<table id="vol_list"></table>
<br>
<!-- 1.button : Change RAID Mode -->
<button type="button" id="storage_raidChangeRAIDMode_button" style="display:none"><span class="_text" lang="_raid" datafld="button2"></span></button>
<!-- button : Set RAID Type and Re-Format end-->

<!-- 2.button : Setup RAID Mode -->
<button type="button" id="storage_raidSetupRAIDMode_button" style="display:none"><span class="_text" lang="_raid" datafld="button5"></span></button></button><br>
<!-- button : Setup RAID Mode end-->

<div class="field_top" id="div_reamin" style="display:none">
 	<span class="_text" lang="_raid" datafld="desc63"></span>
 </div>	
<br>&nbsp;<br>

<?php
include("./raid_diag.html");
include("./raid_create_diag.html");
include("./raid_remain_diag.html");
?>
</body>
</html>
