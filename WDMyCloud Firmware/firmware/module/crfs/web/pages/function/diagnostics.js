var USED_VOLUME_INFO;
function SMART_Test_ps()
{
	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SMART_Test_ps'},	
			dataType:"xml",
			success: function(xml){
				var res = $(xml).find('res').text();
				
				if (parseInt(res,10) == 0)
				{
					$("#DIV_SMART_Set").show();
					$("#DIV_SMART_State").hide();
				}
				else
				{
					$("#DIV_SMART_Set").hide();
					$("#DIV_SMART_State").show();
					
					$("#DIV_SMART_Test_State").progressbar({value: 0});
					
					SMART_Test_State();
				}	
				
			}//end of success: function(xml){
	}); //end of wd_ajax({	
}
function SMART_Test_Start(typ)
{
	stop_web_timeout(true);
	
	diagnostics_button(0);
	
	var hd_info = INTERNAL_Get_HD_Info();
	var f_device = "";
	var f_type=typ;
	for(var i=0;i<hd_info.length;i++)
	{
		f_device += hd_info[i][1].replace(/0/,'sda').replace(/1/,'sdb').replace(/2/,'sdc').replace(/3/,'sdd');		
	}
	if (f_device.length == 0) return;
	f_device = INTERNAL_FMT_Convert_Device_Name(0,f_device);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
//			async: false,
			cache: false,
			data:{cmd:'cgi_SMART_Test_Start',f_type:f_type,f_device:f_device},	
			dataType:"xml",
			success: function(xml){
				
				$("#DIV_SMART_Test_State").progressbar({value: 0});
				
				$("#DIV_SMART_Set").hide();
				$("#DIV_SMART_State").show();
				
				jLoadingClose();
				SMART_Test_State();
				 
			}//end of success: function(xml){
	}); //end of wd_ajax({	
		
}
function SMART_Test_Stop()
{
	restart_web_timeout();
	
	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SMART_Test_Stop'},	
			dataType:"xml",
			success: function(xml){

				$("#DIV_SMART_RES").empty();
				setTimeout("SMART_Test_Result_Diag(0)", 300);
					
				$("#DIV_SMART_Set").show();
				$("#DIV_SMART_State").hide();
				 
			}//end of success: function(xml){
	}); //end of wd_ajax({	
}
function SMART_Test_State()
{
	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SMART_Test_State'},	
			dataType:"xml",
			success: function(xml){
				var my_res = $(xml).find('finish').text();
				var my_state = 0;
				$('item',xml).each(function(e){
					my_state += parseInt($('state',this).text(), 10);
				}); 
				my_state = (my_state / $(xml).find('item').length);
				
				$('#DIV_SMART_Test_State').progressbar('option', 'value', my_state);
				
				if ( (parseInt(my_state,10) <  100) || ( my_res == "1"))
					timeoutId = setTimeout( "SMART_Test_State()" ,3000);
				else 
				{
					SMART_Test_Result_Diag(1);	
					$("#DIV_SMART_Set").show();
					$("#DIV_SMART_State").hide();
				}		
				
			}//end of success: function(xml){
	}); //end of wd_ajax({	
}


function create_log()
{
	document.form_log.submit();
}
function diagnostics_button(flag)
{		
	switch(parseInt(flag,10))
	{
		case 0:	//S.M.A.R.T. testing, formatting or scanning
				if (!$("#settings_utilitiesQuickTest_button").hasClass('gray_out'))	$("#settings_utilitiesQuickTest_button").addClass('gray_out');
				if (!$("#settings_utilitiesFullTest_button").hasClass('gray_out'))		$("#settings_utilitiesFullTest_button").addClass('gray_out');
				if (!$("#settings_utilitiesReset_button").hasClass('gray_out'))		$("#settings_utilitiesReset_button").addClass('gray_out');				
				if (!$("#settings_utilitiesScanDisk_button").hasClass('gray_out'))		$("#settings_utilitiesScanDisk_button").addClass('gray_out');
				if (!$("#settings_utilitiesFormatDisk_button").hasClass('gray_out'))		$("#settings_utilitiesFormatDisk_button").addClass('gray_out');
		break;
		
		case 1:		
				if ($("#settings_utilitiesQuickTest_button").hasClass('gray_out'))	$("#settings_utilitiesQuickTest_button").removeClass('gray_out');
				if ($("#settings_utilitiesFullTest_button").hasClass('gray_out'))		$("#settings_utilitiesFullTest_button").removeClass('gray_out');
				if ($("#settings_utilitiesReset_button").hasClass('gray_out'))		$("#settings_utilitiesReset_button").removeClass('gray_out');					
				if ($("#settings_utilitiesScanDisk_button").hasClass('gray_out'))		$("#settings_utilitiesScanDisk_button").removeClass('gray_out');
				if ($("#settings_utilitiesFormatDisk_button").hasClass('gray_out'))		$("#settings_utilitiesFormatDisk_button").removeClass('gray_out');
		break;
		
		case 2://no volume and hdd exist	
				if (!$("#settings_utilitiesScanDisk_button").hasClass('gray_out'))		$("#settings_utilitiesScanDisk_button").addClass('gray_out');
				if (!$("#settings_utilitiesFormatDisk_button").hasClass('gray_out'))		$("#settings_utilitiesFormatDisk_button").addClass('gray_out');
		break;
		
		case 3://no volume and no hd
			if (!$("#settings_utilitiesQuickTest_button").hasClass('gray_out'))	$("#settings_utilitiesQuickTest_button").addClass('gray_out');
			if (!$("#settings_utilitiesFullTest_button").hasClass('gray_out'))		$("#settings_utilitiesFullTest_button").addClass('gray_out');
			if (!$("#settings_utilitiesRestoreQuick_button").hasClass('gray_out'))		$("#settings_utilitiesRestoreQuick_button").addClass('gray_out');
			if (!$("#settings_utilitiesRestoreFull_button").hasClass('gray_out'))		$("#settings_utilitiesRestoreFull_button").addClass('gray_out');
			if (!$("#settings_utilitiesScanDisk_button").hasClass('gray_out'))		$("#settings_utilitiesScanDisk_button").addClass('gray_out');
			if (!$("#settings_utilitiesFormatDisk_button").hasClass('gray_out'))		$("#settings_utilitiesFormatDisk_button").addClass('gray_out');
		break;
		
	}
}
function Volume_Info_Selector(my_id)
{
	var html_select_open = "";
	
	wd_ajax({
		url:"/cgi-bin/hd_config.cgi",
		type:"POST",
		data:{cmd:'cgi_Volume_Selector_Info'},
		async: false,
	    cache:false,
		dataType:"xml",
		success: function(xml){
			
				html_select_open += '<ul>';
				html_select_open += '<li class="option_list">';          
				html_select_open += '<div id="settings_utilities'+my_id+'_select" class="wd_select option_selected">';
				html_select_open += '<div class="sLeft wd_select_l"></div>';
				html_select_open += '<div class="sBody text wd_select_m" id="settings_utilities'+my_id+'_volume" rel="a">'+_T('_diagnostic','desc9')+'</div>';
				html_select_open += '<div class="sRight wd_select_r"></div>	';
				html_select_open += '</div>';						
				html_select_open += '<ul class="ul_obj"><div>'; 
			
			$('item',xml).each(function(idx){
				
				var my_option_value = $('opt_value',this).text();
				var my_gui_value = ( $('gui_value',this).text() == "All Volume(s)")? _T('_diagnostic','desc9'): $('gui_value',this).text();
								
				html_select_open += "<li id='settings_utilities" +my_id+ "Li" + idx + "_select' class='";
				if (parseInt(idx,10) == 0) html_select_open += "li_start";
				if (parseInt(idx,10) == ($('item',xml).length - 1)) html_select_open += " li_end";
				html_select_open += "' rel='"+my_option_value+"'> <a href=\"#\">" + my_gui_value + "</a></li>";
				
			});	//end of each
			
			html_select_open += '</div></ul>';
			html_select_open += '</li>';
			html_select_open += '</ul>';
		}
	});
	
	return html_select_open;
}
function ScanDisk_get_info()
{	
	var my_html = Volume_Info_Selector("settings_utilitiesScanDisk_select");
	$("#scan_select").empty().append(my_html);
}
function Scandisk_Show_State()
{		
		/* ajax and xml parser start*/
		wd_ajax({
			url: "/xml/scandisk.xml",
			type: "POST",
			async: false,
		    cache:false,
			dataType:"xml",
			success: function(xml){
		
						 var bar_amount= $(xml).find("scandisk>now_bar").text();
						 var bar_state=$(xml).find("scandisk>result").text();
						 var bar_desc=$(xml).find("scandisk>now_volume").text();
						 
						 if ( parseInt(bar_state) == 1 )
						 {
						 	if (intervalId != 0) clearInterval(intervalId);
							 
							$('#scandsk_progressbar').progressbar('option', 'value', 100);
							$("#scandsk_percent").html("&nbsp;" + bar_desc + "&nbsp;100 %");
							
							$("#div_scandsk_state").hide();
							$("#div_scandsk_set").show();
							Scandisk_Diag();
						 }
						 else
						 {
							bar_amount = parseInt(bar_amount, 10);
							
							$('#scandsk_progressbar').progressbar('option', 'value', bar_amount);
							$("#scandsk_percent").html("&nbsp;" + bar_desc +"&nbsp;"+ bar_amount + "%");
						}
				
			}//end of success: function(xml){
				
		}); //end of $.ajax({	
		
}
function ScanDisk()
{
	diagnostics_button(0);
	
	$("#div_scandsk_set").hide();
	$("#div_scandsk_state").show();
	
	$("#scandsk_progressbar").progressbar({value: 0});
	$("#scandsk_percent").html("&nbsp;"+_T( '_format', 'initializing'));
	
	wd_ajax({
			url:"/cgi-bin/scan_dsk.cgi",
			type:"POST",
			data:{
				cmd:'ScanDisk_run_e2fsck',
				f_dev:$("#settings_utilitiesScanDisk_volume").attr('rel')
			},
			cache:false, 
			dataType:"xml",
			success: function(xml){
				
				jLoadingClose();
				
				if (intervalId != 0) clearInterval(intervalId);
				intervalId = setInterval("Scandisk_Show_State()",3000);
			}
	});	
}
function FormatDisk_finish()
{
	wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_FMT_Disk_Finish'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
				if ( $(xml).find("res").text() == "1")
				{  
					go_sub_page('/web/setting/diagnostics.html', 'diagnostics');
				}
			}
		});	// end of ajax
}
function FormatDisk_state()
{
	/* ajax and xml parser start*/
		wd_ajax({
			url:FILE_DM_READ_STATE,
			type:"POST",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
						 var bar_amount="";
						 var bar_state="";
						 var bar_desc="";
						 var bar_errcode="";
						 var mesg="";
						 
						 bar_amount = $(xml).find("dm_state>percent").text();
						 bar_state=$(xml).find("dm_state>finished").text();
						 bar_errcode=$(xml).find("dm_state>errcode").text();
						 bar_desc=$(xml).find("dm_state>describe").text();
						 
						 if ( parseInt(bar_state) == 1 || parseInt(bar_errcode) != 1 )
						 {
						 	if (fmt_timeoutId != 0) clearInterval(fmt_timeoutId);
							
							$("#format_progressbar").progressbar('option', 'value', 100);
							$("#format_percent").html("&nbsp;&nbsp;100%&nbsp;");
							
							FormatDisk_finish();
							restart_web_timeout();
						 }
						 else
						 {
						 	
						 	bar_amount = bar_amount;
						
							switch(parseInt(bar_desc))	
							{
//								case 2:
//									bar_desc = _T('_format','initializing') + "...";	//Text:Initializing
//								break;
								
								case 3:
								case 9:
									bar_desc = "Volume_1 " + _T('_format','formatting'); //Text:Volume_1 Formatting
								break;
								
								case 4:
								case 10:
									bar_desc = "Volume_2 " + _T('_format','formatting'); //Text:Volume_2 Formatting
								break;
								
								case 5:
								case 11:
									bar_desc = "Volume_3 " + _T('_format','formatting'); //Text:Volume_3 Formatting	
								break;
								
								case 6:
								case 12:
									bar_desc = "Volume_4 " + _T('_format','formatting'); //Text:Volume_4 Formatting	
								break;
								
								case 7://std to raid1,resize
									bar_desc = "&nbsp;";
								break;
								
								case 8://std to raid1,resize
									bar_desc = "&nbsp;";
								break;
								
								default:	
									bar_desc = "&nbsp;";
								break;
							}
							
							$("#format_progressbar").progressbar('option', 'value', parseInt(bar_amount,10));
							$("#format_state").html("&nbsp;&nbsp;" + bar_desc + "&nbsp");
							$("#format_percent").html("&nbsp;&nbsp;" + bar_amount + "%&nbsp;&nbsp;");
						}	
				
			}//end of success: function(xml){
				
		}); //end of wd_ajax({	
}
var view = 0;
function replace_class(t)
{
	if (t == "offl_chk" || t=="hdVerify" || t == "sata_disk")
		return "DISK";
	else if (t == "fan_control")
		return "FAN";
	else if (t == "ftp" || t == "pure-ftpd")
		return "FTP";	
	else if (t == "rpc.mountd")
		return "NFS";
	else if (t == "rtc")
		return "RTC";			
	else if (t == "smbd")
		return "SAMBA";		
	else if (t.indexOf('cgi') != -1 || t=="chk_io" || t=="mail_daemon" || t=="send_mail_event_at_cron")
		return "SYSTEM";			
	else if (t == "usbmount")
		return "USB"
	else 
		return "Others"		
}
function view_log()
{
//	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	SORT_USED = "";

		level_select();
		filter_select();
		init_select();

	if (view == 0 )
	{				
			wd_ajax({
				url: "/cgi-bin/system_mgr.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'cgi_get_log_item',total:'800'},
				dataType:"html",
				success: function(data){		
					$("#settings_utilitiesLogTotal_value").text(data);						
				}//end of success: function(xml){
		}); //end of wd_ajax({					
		
		var log_tb_class_width = new Array(
				/*0:/web/addons/eula/en-US.html*/ "95",
				/*1:/web/addons/eula/fr-FR.html*/	"95",
				/*2:/web/addons/eula/it_IT.html*/	"95",
				/*3:/web/addons/eula/de-DE.html*/	"103",
				/*4:/web/addons/eula/es-ES.html*/	"95",
				/*5:/web/addons/eula/zh-CN.html*/	"95",
				/*6:/web/addons/eula/zh-TW.html*/	"95",
				/*7:/web/addons/eula/ko-KR.html*/	"95",
				/*8:/web/addons/eula/ja-JP.html*/	"95",
				/*9:/web/addons/eula/ru-RU.html*/	"95",
				/*10:/web/addons/eula/pt-BR.html*/	"95",
				/*11:/web/addons/eula/cs-CZ.html*/	"95",
				/*12:/web/addons/eula/nl-NL.html*/	"95",
				/*13:/web/addons/eula/hu-HU.html*/	"103",
				/*14:/web/addons/eula/no-NO.html*/	"103",
				/*15:/web/addons/eula/pl-PL.html*/	"95",
				/*16:/web/addons/eula/sv-SE.html*/	"108",
				/*17:/web/addons/eula/tr-TR.html*/	"95");
				
			var log_tb_info_width = new Array(
				/*0:/web/addons/eula/en-US.html*/ "560",
				/*1:/web/addons/eula/fr-FR.html*/	"560",
				/*2:/web/addons/eula/it_IT.html*/	"560",
				/*3:/web/addons/eula/de-DE.html*/	"556",
				/*4:/web/addons/eula/es-ES.html*/	"560",
				/*5:/web/addons/eula/zh-CN.html*/	"560",
				/*6:/web/addons/eula/zh-TW.html*/	"560",
				/*7:/web/addons/eula/ko-KR.html*/	"560",
				/*8:/web/addons/eula/ja-JP.html*/	"560",
				/*9:/web/addons/eula/ru-RU.html*/	"560",
				/*10:/web/addons/eula/pt-BR.html*/	"560",
				/*11:/web/addons/eula/cs-CZ.html*/	"560",
				/*12:/web/addons/eula/nl-NL.html*/	"560",
				/*13:/web/addons/eula/hu-HU.html*/	"556",
				/*14:/web/addons/eula/no-NO.html*/	"556",
				/*15:/web/addons/eula/pl-PL.html*/	"560",
				/*16:/web/addons/eula/sv-SE.html*/	"551",
				/*17:/web/addons/eula/tr-TR.html*/	"560");		
	
		$("#log_tb").flexigrid({				
			url: '/cgi-bin/system_mgr.cgi',		
			dataType: 'json',
			cmd: 'cgi_log_system',
			colModel : [
				{display: _T('_time','date'), name : 'level', width : 65, sortable : true, align: 'left'},
				{display: _T('_time','date'), name : 'date', width : 170, sortable : true, align: 'left'},
				//{display: _T('_time','time'), name : 'time', width : 70, sortable : true, align: 'left'},
				{display: _T('_time','time'), name : 'class', width : log_tb_class_width[parseInt(MULTI_LANGUAGE, 10)], sortable : true, align: 'left'},
				{display: _T('_logs','info'), name : 'info', width : log_tb_info_width[parseInt(MULTI_LANGUAGE, 10)], sortable : true, align: 'left'}			
				],
			sortname: $("#log_filter").val(),
			sortorder: "asc",
			usepager: true,
			useRp: true,		
			rp: 10,
			showTableToggleBtn: true,
			onChangeSort: true,
			width: 890,
			height: 'auto',
			errormsg: _T('_common','connection_error'),
			nomsg: _T('_common','no_items'),
			noSelect:true,
			pclass:"log",
			resizable:false,
			preProcess:function(r)
			{					
				var len = 0;	
				for(var key in r.rows)
				{	
						len = key;
						if (r.rows[key]['cell'][0] == "2")
						{
							r.rows[key]['cell'][0] = '<img src="/web/images/icon/critical_alert.png" style="margin-left:0px;"></img>';
						}
						else if (r.rows[key]['cell'][0] == "4")
						{
							r.rows[key]['cell'][0] = '<img src="/web/images/icon/worry.png" style="margin-left:0px;"></img>';
						}							
						else
						{
							r.rows[key]['cell'][0] = '<span class="alert_icon_i" style="margin-left:0px;"></span>';
				                }
				                r.rows[key]['cell'][3] = r.rows[key]['cell'][3].replace(/</g, '&lt;');
						r.rows[key]['cell'][3] = r.rows[key]['cell'][3].replace(/>/g, '&gt;');							
					//	r.rows[key]['cell'][2] = replace_class(r.rows[key]['cell'][2])					
					len = parseInt(len)+1;
				}
				
				$("#settings_utilitiesLogNum_value").text(len);
				return r;
			},			
			onSuccess:function(){
					$("#tooltip").remove();
					$('#log_tb tbody tr').each(function (index) {
						var info = $('#log_tb tbody tr:eq('+index+') td:eq(3)').text();
					$('#id_test').text("");
						$('#id_test').append(info);
						var element = $('#id_test')						
						if (element.width() > 500) {						
						$('#log_tb tbody tr:eq('+index+') td:eq(3)').bind({
							mouseout: function () { // do something on click 
							$("#tooltip").remove();
						},
							mouseover: function (event) {					
							$("#tooltip").remove();
							showTooltip(event.pageX + 10, event.pageY - 20, info);
						}
						});		
						}	
					});//	$('#log_tb tbody tr').each
				
				if (view == 0)
				{				
					$(".scrollbar_log").jScrollPane({isbottom:readlog,isUsed:scrollused});	
//					if (typeof($(".scrollbar_log .jspDrag").css("height")) == "undefined")
//				  		$(".LogListDiv li").css("width","928px")
//				 	else 		
//				 		$(".LogListDiv li").css("width","920px")
					setTimeout(function(){logtb_reload(),10000});
					
				}
				
					view = 1;							
				setTimeout(function(){
				 $(".scrollbar_log").jScrollPane({isbottom:readlog,isUsed:scrollused});				
//				 if (typeof($(".scrollbar_log .jspDrag").css("height")) == "undefined")
//				  		$(".LogListDiv li").css("width","928px")
//				 else 		
//				 		$(".LogListDiv li").css("width","910px")
					},200);
			}	
		});
	}
	else
	{
			var _SCROLL_USED = 0;
				
				var define_tb = new Array("level","time","class");
			var found = 0;
			var sort1 = "";
			var sort2 = "";
			//level,time,class
			for (var j = 0;j<define_tb.length;j++)
			{
				if (define_tb[j] == SORT_USED)
				{
					found = 1;				
					sort1 = style;
				}	
			}
			if (found == 0 )
			{
				var k = $("#id_level").attr("rel");
				if (k == 0) sort1 = "all"
				else if (k == 1) sort1 = "info"
				else if (k == 2) sort1 = "warning"
				else if (k == 3) sort1 = "critical"
				//--------------
				sort2 = $("#id_filter").attr("rel");					
			}
				
				
				
								wd_ajax({
								url: "/cgi-bin/system_mgr.cgi",
								type: "POST",
								async: false,
								cache: false,
								data:{cmd:'cgi_get_log_item',total:'800',sort:sort1,sort2:sort2},
								dataType:"html",
								success: function(data){					
									$("#settings_utilitiesLogTotal_value").text(data);						
									$("#tooltip").remove();					
								}//end of success: function(xml){
						}); //end of wd_ajax({					
						
						
		$("#log_tb").flexReload();
	}	

	var obj=$("#LogDiag").overlay({fixed:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});				
	adjust_dialog_size("#LogDiag","1000","600");
	obj.load();
	$("#LogDiag.WDLabelDiag").css("top","-50px").css("left","110px");
	
	ui_tab("#LogDiag","#settings_utilitiesLogLevel_select","#settings_utilitiesLogClose_button");
		
}
function log_clear()
{	
		wd_ajax({
								url: "/cgi-bin/system_mgr.cgi",
								type: "POST",
								async: false,
								cache: true,
								data:{cmd:'cgi_log_clear'},
								dataType:"html",
								success: function(data){													
								}//end of success: function(xml){
						}); //end of wd_ajax({					
}
function log_close()
{
	//var element = $(".scrollbar_log").jScrollPane({isbottom:readlog,isUsed:scrollused});
	//var api = element.data('jsp');	
	$(".jspPane").css("top", "0px");
}
function filter_log()
{
	var element = $(".scrollbar_log").jScrollPane({autoReinitialise: true});
	var api = element.data('jsp');

	if($('.scrollbar_log').outerHeight() + api.getContentPositionY() >= api.getContentHeight())
{
	    alert('You are at the bottom bro');
	}
	
	
	$('#log_tb').flexOptions({
		sortname: $("#log_filter").val(),		
	}).flexReload();		
		setTimeout(function(){
					$(".scrollbar_log").jScrollPane();	
					jLoadingClose();
					},200);
}
var LOG_USED = 0;
function readlog()
{		
		if ($("#settings_utilitiesLogTotal_value").text() == $("#settings_utilitiesLogNum_value").text()) return;
		var l = $('#log_tb tbody tr').length;		
		var p = Math.floor(l/10)+1;				
		
	if (LOG_USED ==1 ) return;
	LOG_USED = 1;	
					
//	var Loading_Overly = $('.LightningUpdating').overlay({oneInstance:false,expose: '#333333',api:true,closeOnClick:false,closeOnEsc:false});		
//	if (typeof (Loading_Overly) != "undefined" && Loading_Overly!= null)
//	{
//		if (Loading_Overly.isOpened() == true) return;
//	}	
//	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
	
			wd_ajax({
				url: "/cgi-bin/system_mgr.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'cgi_log_system',page:p},	
				dataType:"json",
				success: function(r){				
					
					//jLoadingClose();
			
				var len=0;
				
					for(var key in r.rows)
					{
						len = key
						if (r.rows[key]['cell'][0] == "2")
						{
							r.rows[key]['cell'][0] = '<img src="/web/images/icon/critical_alert.png" style="margin-left:0px;"></img>';
						}
						else if (r.rows[key]['cell'][0] == "4")
						{
							r.rows[key]['cell'][0] = '<img src="/web/images/icon/worry.png" style="margin-left:0px;"></img>';
						}							
						//else if (r.rows[key]['cell'][0] == "6")
						else 
						{
							r.rows[key]['cell'][0] = '<span class="alert_icon_i" style="margin-left:0px;"></span>';
						}							
						//r.rows[key]['cell'][2] = replace_class(r.rows[key]['cell'][2])
						r.rows[key]['cell'][3] = r.rows[key]['cell'][3].replace(/</g, '&lt;');
						r.rows[key]['cell'][3] = r.rows[key]['cell'][3].replace(/>/g, '&gt;');	
							
						$("#log_tb tbody tr:last").after("<tr><td ><div style='text-align: left; width: 65px;'>"+r.rows[key]['cell'][0]+"</div></td><td><div style='text-align: left; width: 170px;'>"+r.rows[key]['cell'][1]+"</div></td><td><div style='text-align: left; width: 95px;'>"+r.rows[key]['cell'][2]+"</div></td><td><div style='text-align: left; width: 500px;'><span style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:470px'>"+r.rows[key]['cell'][3]+"</span></div></td></tr>")											


					}
								
					
					$('#log_tb tbody tr').each(function (index) {
						var info = $('#log_tb tbody tr:eq('+index+') td:eq(3)').text();
					$('#id_test').text("");
						$('#id_test').append(info);
						var element = $('#id_test')						
						if (element.width() > 500) {
						
					$('#log_tb tbody tr:eq('+index+') td:eq(3)').bind({
				mouseout: function () { // do something on click 
					$("#tooltip").remove();
				},
				mouseover: function (event) {
					// do something on mouseenter 


					$("#tooltip").remove();
					showTooltip(event.pageX + 10, event.pageY - 20, info);
					}
			});
						
						
						
					}	
					});
					
					
					var j = parseInt($("#settings_utilitiesLogNum_value").text(),10)+parseInt(len,10)+parseInt(1,10);
					$("#settings_utilitiesLogNum_value").text(j);
					
						setTimeout(function(){
						$(".scrollbar_log").jScrollPane();						
						LOG_USED = 0;					
						
							
						},200);
						
					
				}//end of success: function(xml){
		}); //end of wd_ajax({	


}

function level_select()
{
	var _g_level = 0;
	var select_array = new Array(
	//	1,2,3
		//"<span style='height:24px;padding-top:6px;float: left;font-size:15px;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+_T('_user','all')+"</span>",
	
		"<table border='0' cellspacing='0' cellpadding='0' height=0><tr><td></td><td><div style='padding-left:3px;padding-top:2px'>"+_T('_user','all')+"</div></td></tr></table>",
		"<table class='ul_obj_alert' border='0' cellspacing='0' cellpadding='0' height=0><tr><td><span class='a_icon_i' ></span></td><td>&nbsp;"+_T('_media','info')+"</td></tr></table>",
		"<table class='ul_obj_alert' border='0' cellspacing='0' cellpadding='0' height=0><tr><td><span class='a_icon_w' ></span></td><td>&nbsp;"+_T('_common','warning')+"</td><tr></table>",
		"<table class='ul_obj_alert' border='0' cellspacing='0' cellpadding='0' height=0><tr><td><span class='a_icon_c' ></span></td><td>&nbsp;"+_T('_home','critical')+"</td></table>"
		);

		var select_v_array = new Array(
			0,1,2,3);

		SIZE = 3;
		SIZE2 = 2;

		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}

		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_level_top_main').empty();

		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_utilitiesLogLevel_select\" class=\"wd_select option_selected\">";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_level\" rel='" + _g_level + "' style='padding-top:4px;'>" + map_table(_g_level) + "</div>";
		
		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_level_li'><div>"
		my_html_options += "<li id=\"settings_utilitiesLogLevelLi1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\"><a href='#' onclick='sort_tb(\"all\",\"\")'>" + select_array[0] + "</a>";
		my_html_options += "<li id=\"settings_utilitiesLogLevelLi2_select\" rel=\"" + select_v_array[1] + "\" ><a href='#' onclick='sort_tb(\"info\",\"\")'>" + select_array[1] + "</a>";
		my_html_options += "<li id=\"settings_utilitiesLogLevelLi3_select\" rel=\"" + select_v_array[2] + "\" ><a href='#' onclick='sort_tb(\"warning\",\"\")'>" + select_array[2] + "</a>";

		var j = select_array.length - 1;
		my_html_options += "<li id=\"settings_utilitiesLogLevelLi4_select\" class=\"li_end\" rel='" + select_v_array[j] + "' ><a href='#' onclick='sort_tb(\"critical\",\"\")'>" + select_array[select_array.length - 1] + "</a>";
		my_html_options += "</div></ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_level_top_main").append(my_html_options);

		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
					if (a[i][1] == rel) {
						return a[i][0];
					}
			}
		}
}

function filter_select()
{
	var _g_filter = 'All';
	if (MODEL_NAME == "LT4A")
	{
	         var select_array = new Array(
			"All","DISK","FAN","FTP","MTP","RTC","SAMBA","SYSTEM","USB","OTHER");
		
	         var select_v_array = new Array(
			"All","DISK","FAN","FTP","MTP","RTC","SAMBA","SYSTEM","USB","OTHER");
	}
	else
	{	
		if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
		{
			 var select_array = new Array(
			"All","DISK","FTP","MTP","NFS","RTC","SAMBA","SYSTEM","USB","OTHER");
		
	         var select_v_array = new Array(
			"All","DISK","FTP","MTP","NFS","RTC","SAMBA","SYSTEM","USB","OTHER");
		}
		else
		{	
	         var select_array = new Array(
			"All","DISK","FAN","FTP","MTP","NFS","RTC","SAMBA","SYSTEM","USB","OTHER");
		
	         var select_v_array = new Array(
			"All","DISK","FAN","FTP","MTP","NFS","RTC","SAMBA","SYSTEM","USB","OTHER");
	         }		
	}		

		SIZE = select_v_array.length;
		SIZE2 = 2;

		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}

		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_filter_top_main').empty();

		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_utilitiesLogFilter_select\" class=\"wd_select option_selected\">";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_filter\" rel='" + _g_filter + "'>" + map_table(_g_filter) + "</div>";
		
		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_filter_li' ><div>"
		my_html_options += "<li id=\"settings_utilitiesLogFilterLi1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\" ><a href='#' onclick='sort_tb(\"\",\""+select_v_array[0]+"\")'>" + select_array[0] + "</a>";

		for (var i = 1; i < select_array.length - 1; i++) {
			my_html_options += "<li id=\"settings_utilitiesLogFilterLi"+(i+1)+"_select\" rel=\"" + select_v_array[i] + "\" ><a href='#' onclick='sort_tb(\"\",\""+select_v_array[i]+"\")'>" + select_array[i] + "</a>";
		}
		var j = select_array.length - 1;
		my_html_options += "<li id=\"settings_utilitiesLogFilterLi"+(j+1)+"_select\" class=\"li_end\" rel='" + select_v_array[j] + "' ><a href='#' onclick='sort_tb(\"\",\""+select_v_array[select_array.length - 1]+"\")'>" + select_array[select_array.length - 1] + "</a>";
		my_html_options += "</div></ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_filter_top_main").append(my_html_options);

		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
					if (a[i][1] == rel) {
						return a[i][0];
					}
			}
		}
}
var SORT_USED = ""
function sort_tb(style,style2,style3)
{
	var define_tb = new Array("level","time","class");
	var found = 0;
	var sort1 = "";
	var sort2 = "";
	var sort3 = "";
	//level,time,class
//	for (var j = 0;j<define_tb.length;j++)
//  {
//		if (define_tb[j] == style)
//		{
//			found = 1;
//	SORT_USED = style			
//			sort1 = style;
//			var tb = 	"<table border='0' cellspacing='0' cellpadding='0' height=0><tr><td></td><td height=30>"+_T('_user','all')+"</td></tr></table>"
//			reset_sel_item("#settings_utilitiesLogLevel_select",tb,"0");
//			reset_sel_item("#settings_utilitiesLogFilter_select","All","All");
//		}	
//	}
//	if (found == 0 )

		
		if (style !="")
		{
			sort1 = style
			sort2 = $("#id_filter").attr("rel");
		}	
		else if (style2 != "")
		{
			k = $("#id_level").attr("rel");
			if (k == 0) sort1 = "all"
			else if (k == 1) sort1 = "info"
			else if (k == 2) sort1 = "warning"
			else if (k == 3) sort1 = "critical"
			sort2 = style2;
		}	
		else if (style3 != "")
		{
			k = $("#id_level").attr("rel");
			if (k == 0) sort1 = "all"
			else if (k == 1) sort1 = "info"
			else if (k == 2) sort1 = "warning"
			else if (k == 3) sort1 = "critical"
			sort2 = $("#id_filter").attr("rel");
			sort3 = style3;
			SORT_USED = style3;
	}
		
	wd_ajax({
				url: "/cgi-bin/system_mgr.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'cgi_get_log_item',total:'800',sort:sort1,sort2:sort2,sort3:sort3},
				dataType:"html",
				success: function(data){					
					$("#settings_utilitiesLogTotal_value").text(data);						
					$("#tooltip").remove();									
				}//end of success: function(xml){
		}); //end of wd_ajax({					
		
		$("#log_tb").flexReload();
	//	setTimeout(function(){logtb_reload()},10000);		
}
var _SCROLL_USED = 0;
function scrollused()
{
	_SCROLL_USED = 1;	
}
function logtb_reload()
{
	if (_SCROLL_USED == 0 )	
	{				
			var define_tb = new Array("level","time","class");
			var found = 0;
			var sort1 = "";
			var sort2 = "";
			var sort3 = SORT_USED;	
			//level,time,class
//			for (var j = 0;j<define_tb.length;j++)
//			{
//				if (define_tb[j] == SORT_USED)
//				{
//					found = 1;				
//					sort1 = style;
//				}	
//			}
//			if (found == 0 )
			{
				var k = $("#id_level").attr("rel");
				if (k == 0) sort1 = "all"
				else if (k == 1) sort1 = "info"
				else if (k == 2) sort1 = "warning"
				else if (k == 3) sort1 = "critical"
				//--------------
				sort2 = $("#id_filter").attr("rel");					
			}
		
			
		wd_ajax({
				url: "/cgi-bin/system_mgr.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'cgi_get_log_item',total:'800',sort:sort1,sort2:sort2,sort3:sort3},
				dataType:"html",
				success: function(data){					
					$("#settings_utilitiesLogTotal_value").text(data);						
				}//end of success: function(xml){
		}); //end of wd_ajax({					
		
		$("#log_tb").flexReload();
		setTimeout(function(){logtb_reload()},10000);		
	}	
}
function set_extendedlog()
{
    jLoading(_T('_common','set') ,'loading' ,'s',"");
    var v = getSwitch('#settings_utilitiesExtendedLog_switch');
    if (v == 1)
    {
        extended_switch(1);
    }
    else
    {
        extended_switch(0);
    }
    setTimeout(jLoadingClose,500);
}
function extended_switch(v)
{
    wd_ajax({
        type: "POST",
        async: true,
        cache: false,
        dataType: "html",
        url: "/cgi-bin/system_mgr.cgi",
        data: "cmd=cgi_set_extendedlog&switch="+v,
        success: function () {
        }
    });
}
function get_extendedlog()
{
    wd_ajax({
        type: "POST",
        dataType: "xml",
        url: "/cgi-bin/system_mgr.cgi",
        data: "cmd=cgi_get_extendedlog",
        success: function (xml) {
            var enable=$(xml).find('extendedlog_info > enable').text();
			if(enable != "-1")
            	setSwitch('#settings_utilitiesExtendedLog_switch',enable);
        }
    });
}
