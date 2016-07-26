var ScanDsk_DIAG_INIT = 0;
var ScanDskObj;

function diagnostics_clearMyTimer()
{
	if (timeoutId != 0) window.clearInterval(timeoutId);
}
function HD_Scandisk_Submit()
{	
	wd_ajax({
			url:"/cgi-bin/scan_dsk.cgi",
			type:"POST",
			data:{cmd:'ScanDisk_run_e2fsck',f_dev:$("#settings_utilitiesScanDisk_volume").attr('rel')},
			async:false,
		   cache:false, 
			dataType:"xml",
			success: function(xml){
				
			}
	});
}
function HD_Scandisk_Check_SYS_Finish_State()
{
   wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_Check_Disk_Remount_State'},
			async: false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
				if (timeoutId != 0) diagnostics_clearMyTimer();
				
				if ( $(xml).find("res").text() == "1")
				{
					$("#ScanDskDiag_wait").hide();
					ScanDskObj.close();
					
					go_sub_page('/web/setting/diagnostics.html', 'diagnostics');
				}
				else
					window.setTimeout("HD_Scandisk_Check_SYS_Finish_State()",3000);
			}
	});	
}

function HD_Scandisk_Finish()
{
	restart_web_timeout();
	
	wd_ajax({
			url: "/cgi-bin/scan_dsk.cgi",
			type: "POST",
			data:{cmd:'ScanDisk_Finish'},
			async:false,
		    cache:false,
			dataType:"xml",
			success: function(xml){
				if ( $(xml).find("res").text() == "1")
				{
				     window.setTimeout("HD_Scandisk_Check_SYS_Finish_State()",500);
				}	
			}
	});
}

function HD_Scandisk_Check(flag)
{
	/*
		flag:
			0 -> run e2fsck,
			2 -> running,
			1 -> finish,
	*/
	$("#Diagnostics_Diag_title").html(_T('_diagnostic','desc6'));
	ScanDskObj = $("#Diagnostics_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
	
	switch(parseInt(flag))
	{
		case 1:	//scan disk finish
			HD_Scandisk_Result_Info();
			$("#ScanDskDiag_res").show();
		break;
		
		case 2:	//scan disk now
			if (timeoutId != 0) diagnostics_clearMyTimer();
			timeoutId = setInterval("HD_Scandisk_show_state()",3000);
			scan_init_progressbar(0);
			
			$("#ScanDskDiag_bar").show();
		break;
		
		default://run e2fsck
			HD_Scandisk_Submit();
			scan_init_progressbar(0);
			
			if (timeoutId != 0) diagnostics_clearMyTimer();
			timeoutId = setInterval("HD_Scandisk_show_state()",3000);
				
			$("#ScanDskDiag_bar").show();
		break;
	}
	init_button();
	language();	
	ScanDskObj.load();
	
	if (ScanDsk_DIAG_INIT == 1) return;
	ScanDsk_DIAG_INIT = 1;
	
	$("#Diagnostics_Diag .close").click(function(){
		if (timeoutId != 0) diagnostics_clearMyTimer();
		ScanDskObj.close();
	});

	$("#settings_utilitiesScanDiskFinish_button").click(function(){
		
		$("#ScanDskDiag_res").hide();
		$("#ScanDskDiag_wait").show();
		
		HD_Scandisk_Finish();
	});	
}

function scan_init_progressbar(bar)
{
	var msg = _T('_format','initializing') + "...";	//Text:Initializing...
	
	$("#scandsk_state").html(msg);
	$("#scandsk_progressbar").progressbar({value: bar});
	$("#scandsk_percent").html("&nbsp;" + bar +"%");
}

function HD_Scandisk_Result_Info()
{
	/* ajax and xml parser start*/
		wd_ajax({
			url:"/xml/scandisk_result.xml",
			type:"POST",
			async:false,
		    cache:false,
			dataType:"xml",
			success: function(xml){
				
				var html_tr = "";
				$('item',xml).each(function(e){
					var my_vol = $('volume',this).text();
					var my_res = $('result',this).text();
					my_res = my_res.replace(/SUCCESS/,_T('_diagnostic','desc13'))
							       .replace(/FAILED/,_T('_download','fail'));
					
					if ((e%2)==0)
		 				html_tr += "<tr id=\"row"+e+"\">";
		 			else
		 				html_tr += "<tr id=\"row"+e+"\" class=\"erow\">";
		 			
		 			html_tr += "<td><div style=\"text-align: left; width: 100px;border:0px solid red;\">"+$.trim(my_vol)+"</div></td>";
    				html_tr += "<td><div style=\"text-align: left; width: 450px;border:0px solid red;\">"+$.trim(my_res)+"</dev></td>";	
		 			html_tr += "</tr>";
				});	
				
				$('#scandsk_reslst').empty();
				$('#scandsk_reslst').append(html_tr);
				
			},//end of success: function(xml){
			error:function (xhr, ajaxOptions, thrownError){
				window.setTimeout("HD_Scandisk_Result_Info()",2000);
			}	
		}); //end of wd_ajax({	
}	
function SMART_Test_Diag_init(res)
{
	adjust_dialog_size("#Diagnostics_Diag",400,"");
}

function SMART_Test_Result_Diag(res)
{	
	switch(parseInt(MULTI_LANGUAGE, 10))
	{
		case 4:
			$("#Diagnostics_Diag_title").css('font-size','14px');
		break;
		
		case 9:
		case 17:
			$("#Diagnostics_Diag_title").css('font-size','16px');
		break;
		
		default:
			$("#Diagnostics_Diag_title").css('font-size','20px');
		break;
	}
	
	restart_web_timeout();
	SMART_Test_Diag_init(1);
	
	$("#Diagnostics_Diag_title").html(_T("_diagnostic","desc3"));
	
	if (parseInt(res) == 0) 
	{
		jLoadingClose();
		$("#DIV_SMART_RES").html(_T("_diagnostic","desc4"));
	
	}
	else
	{		
		wd_ajax({
				url: "/cgi-bin/smart.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'cgi_SMART_Test_State'},	
				dataType:"xml",
				success: function(xml){
					var t = $(xml).find("type").text();
					var my_html = "<table>";
					$('item',xml).each(function(e){
														
							my_html += "<tr>";
							my_html += "<td valign=top>";
							my_html += (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")? _T('_button','test'):$('slot',this).text();
							my_html += "</td>";
							my_html += "<td>";
							if ($('res',this).text().indexOf("Pass")!= -1)//Success
							{
									my_html += (t == "smart_short")? _T('_smart','quick_pass'):_T('_smart','full_pass');
							}
							else	//Fail
							{
									if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
										my_html += (t == "smart_short")?_T('_smart','quick_fail_glcr'):_T('_smart','full_fail_glcr');
									else
										my_html += (t == "smart_short")?_T('_smart','quick_fail'):_T('_smart','full_fail');
							}	
							my_html += "</td>";
							my_html += "</tr>";
							
					}); 
					my_html += "</table>";
				
					$("#DIV_SMART_RES").html(my_html);
				}//end of success: function(xml){
		}); //end of wd_ajax({	
	}
	var SMARTObj = $("#Diagnostics_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	init_button();
	language();
	
	INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
 	$("#SMART_Res").show();
	adjust_dialog_size("#Diagnostics_Diag",500,"");
	SMARTObj.load();
 	
 	$("#Diagnostics_Diag .close").click(function(){
		
		wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SMART_Test_Result_Remove'},	
			dataType:"xml",
			success: function(xml){
				}//end of success: function(xml){
		}); //end of wd_ajax({
		
		SMART_Test_Diag_init(0);
		SMARTObj.close();
		
	  	go_sub_page('/web/setting/diagnostics.html', 'diagnostics');
	});
}

function Scandisk_Diag()
{
	HD_Scandisk_Result_Info();
			
	adjust_dialog_size("#Diagnostics_Diag",630,"");		
			
	$("#Diagnostics_Diag_title").html(_T('_diagnostic','desc6'));
	ScanDskObj = $("#Diagnostics_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
	$("#ScanDskDiag_res").show();

	init_button();
	language();	
	ScanDskObj.load();
	
	$("#Diagnostics_Diag .close").click(function(){
		
		INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
		INTERNAL_DIADLOG_BUT_UNBIND('Diagnostics_Diag');
		
	});

	$("#settings_utilitiesScanDiskFinish_button").click(function(){
		
		$("#ScanDskDiag_res").hide();
		$("#ScanDskDiag_wait").show();
		
		HD_Scandisk_Finish();
	});	
}
function WipeDisk_diskmgr(volume_info)
{
	if (volume_info.toString() == "") return;
	
	wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{
				cmd:'cgi_FMT_Wipe_DiskMGR',
				f_wipe_volume_info:volume_info.toString()},
			async:false,
		    cache:false, 
			dataType:"xml",
			success: function(xml){
				$("#Diagnostics_Diag").overlay().close();
				jLoadingClose();
				fmt_timeoutId = setInterval('FormatDisk_state();', 3000);
			}
	});	
}
function WipeDisk_Diag(vol)
{
	var my_width = "450px";
	var my_height = "450px";
	$("#Diagnostics_Diag").width(my_width);
	$(".hr").width(my_width);
	
	$("#Diagnostics_Diag_title").html(_T('_diagnostic','desc10'));
	var WipeObj = $("#Diagnostics_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
	$("#FormatDiag_wipe").show();
	
	$("input:checkbox").checkboxStyle();
	init_button();
	language();	
	WipeObj.load();
	
	$("#Diagnostics_Diag .close").click(function(){
		INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
		INTERNAL_DIADLOG_BUT_UNBIND('Diagnostics_Diag');
		WipeObj.close();
		
		$("#Diagnostics_Diag").width("650px");
		$(".hr").width("650px");
	});
	
	$("#settings_utilitiesFormatDiskNext5_button").click(function(){
		stop_web_timeout();
		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		setTimeout(function(){
		
			var my_info = new Array();	
			/*
				my_info[0] = volume
				my_info[1] = wipe
				my_info[2] = mount, ex:/dev/sda2 or /dev/md1
				my_info[3] = disk, ex:sda or sdasdb or sdasdbsdc or sdasdbsdcsdd
				my_info[4] = used device, ex:/dev/sda2 /dev/sdb2 /dev/sdc2 /dev/sdd2
				my_info[5] = all volume(s), ex: 1 -> true, 0 -> false 
			*/
			
			wd_ajax({
					url: FILE_USED_VOLUME_INFO,
						type: "POST",
					async:false,
					cache:false,
					dataType:"xml",
					success: function(xml){
//						USED_VOLUME_INFO.length = 0;
						USED_VOLUME_INFO = xml;
					},
	            error:function (xhr, ajaxOptions, thrownError){}  
			});	
			
			if (vol == "a")	//all volume
			{
				var idx = 0;
				$('volume_info > item', USED_VOLUME_INFO).each(function(){
					if( parseInt($('mount_status',this).text(), 10)==1 ){
						my_info[idx] = new Array();	
						my_info[idx][0] = $('volume',this).text();
						my_info[idx][1] = ($("#settings_utilitiesFormatDiskWipe_chkbox").attr("checked") == "checked")?1:0;
						my_info[idx][2] = $('mount',this).text();  
						my_info[idx][3] = $('device',this).text();
						my_info[idx][4] = $('used_device',this).text();
						my_info[idx][5] = '1';
						idx++;
					}
				});//end of each
			}
			else	
			{
				var vol_info = vol.split("_");
				if (vol_info.length == 2)
				{
					$('volume_info > item', USED_VOLUME_INFO).each(function(e){
						if (parseInt($('volume',this).text(),10) == parseInt(vol_info[1],10))
						{
							my_info[0]= new Array();	
							my_info[0][0] = $('volume',this).text();
							my_info[0][1] = ($("#settings_utilitiesFormatDiskWipe_chkbox").attr("checked") == "checked")?1:0;
							my_info[0][2] = $('mount',this).text();  
							my_info[0][3] = $('device',this).text();
							my_info[0][4] = $('used_device',this).text();
							my_info[0][5] = '0';
						}  
						
					});//end of each
				}
			}	
			
			diagnostics_button(0);
			$("#div_formatdisk_set").hide();
			$("#div_formatdisk_state").show();
			
			$("#format_state").html(_T('_format','initializing') + "...");
			$("#format_progressbar").progressbar({value: 0});
			$("#format_percent").html("&nbsp;&nbsp;0%&nbsp;&nbsp;");		
			
			WipeDisk_diskmgr(my_info);
			
		 },500);	//end of setimeout
	});	
}
function System_Test_Result_Show(str)
{
	var my_html = 'none';
	
	switch(str)
	{
		case "passed":
			my_html = '<div class="list_icon" style="cursor:default">';
			my_html += '<div class="passed" style="cursor:default"></div>';
			my_html += '</div>';
		break;
		
		case "failed":
			my_html = '<div class="list_icon" style="cursor:default">';
			my_html += '<div class="failed" style="cursor:default"></div>';
			my_html += '</div>';
		break;
	}
	
	return my_html;
}
var _jScrollPane = "";
function System_Test_Result()
{
	wd_ajax({
				url: "/xml/sys_diag.xml",
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
					//RTC Test
					if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX" || MODEL_NAME =="BG2Y")
					{
						$("#tr_systest_rtc").hide();
					}
					else
					{	
						var my_html = System_Test_Result_Show($(xml).find("rtc").text());
						$("#DIV_SYSTest_RTC").html(my_html);
						$("#tr_systest_rtc").show();
					}	
					
					my_html = System_Test_Result_Show($(xml).find("usb1").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_USB1").html(my_html);
							$("#tr_systest_usb1").show();
					}		
					else
						$("#tr_systest_usb1").hide();
					
					my_html = System_Test_Result_Show($(xml).find("usb2").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_USB2").html(my_html);
							$("#tr_systest_usb2").show();
					}		
					else	
						$("#tr_systest_usb2").hide();
						
					my_html = System_Test_Result_Show($(xml).find("usb3").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_USB3").html(my_html);
							$("#tr_systest_usb3").show();
					}		
					else	
						$("#tr_systest_usb3").hide();	
						
					my_html = System_Test_Result_Show($(xml).find("usb4").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_USB4").html(my_html);
							$("#tr_systest_usb4").show();
					}		
					else	
						$("#tr_systest_usb4").hide();		
						
					my_html = System_Test_Result_Show($(xml).find("hdd1").text());
					if ( my_html != "none" )
					{
							if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
							{
								$("#td_systest_drive1_title").html($("#td_systest_drive1_title").text().replace(/1/,""));
							}
							$("#DIV_SYSTest_Drive1").html(my_html);
							$("#tr_systest_drive1").show();
					}		
					else
						$("#tr_systest_drive1").hide();	
					
					my_html = System_Test_Result_Show($(xml).find("hdd2").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_Drive2").html(my_html);
							$("#tr_systest_drive2").show();
					}		
					else
						$("#tr_systest_drive2").hide();		
					
					my_html = System_Test_Result_Show($(xml).find("hdd3").text());
					if ( my_html != "none" )
					{
							$("#DIV_SYSTest_Drive3").html(my_html);
							$("#tr_systest_drive3").show();
					}		
					else
						$("#tr_systest_drive3").hide();			
					
					my_html = System_Test_Result_Show($(xml).find("hdd4").text());
					if ( my_html != "none" )
					{
						$("#DIV_SYSTest_Drive4").html(my_html);
						$("#tr_systest_drive4").show();			
					}	
					else
						$("#tr_systest_drive4").hide();			
					
					my_html = System_Test_Result_Show($(xml).find("memory").text());
					$("#DIV_SYSTest_Memory").html(my_html);
					
					my_html = System_Test_Result_Show($(xml).find("temperature").text());
					$("#DIV_SYSTest_Temperature").html(my_html);
					
					if (parseInt(VOLUME_NUM,10) == 1)
					{
						$("#tr_systest_fan").hide();
					}
					else
					{	
						my_html = System_Test_Result_Show($(xml).find("fan").text());
						$("#DIV_SYSTest_Fan").html(my_html);
						$("#tr_systest_fan").show();
					}
					
					var cut = 0;
					$('#DiagnosticsDiag_systemtest_flexigrid .bDiv table tr:visible').each(function(idx) {
							if ( $(this).css('display') != 'none')
							{		
									(cut%2==0)?$(this).css('background','#F0F0F0'):$(this).css('background','#DCDCDC');
									cut++;			
							}
							
					});
					
					_jScrollPane = $("#DiagnosticsDiag_systemtest_content").jScrollPane();
				},
            error:function (xhr, ajaxOptions, thrownError){}  
	});	
}
function System_Test_Status()
{
	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SysTest_Status'},	
			dataType:"xml",
			success: function(xml){
				var res = $(xml).find("res").text();
				if (parseInt(res, 10) == 1)
				{
					$("#DiagnosticsDiag_systemtest_wait").hide();
					$("#DiagnosticsDiag_systemtest_flexigrid").show();
					
					System_Test_Result();
					
					restart_web_timeout();
				}	
				else
				{
					if (systest_timeoutId != 0) clearTimeout(systest_timeoutId);
					systest_timeoutId = setTimeout("System_Test_Status()", 3000);
				}	
				
			}//end of success: function(xml){
	}); //end of wd_ajax({
}

function System_Test_Diag()
{	
	stop_web_timeout(true);

	wd_ajax({
			url: "/cgi-bin/smart.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_SysTest'},	
			dataType:"xml",
			success: function(xml){
				jLoadingClose();
				
				if (systest_timeoutId != 0) clearTimeout(systest_timeoutId);
				systest_timeoutId = setTimeout("System_Test_Status()", 1000);
				
			}//end of success: function(xml){
	}); //end of wd_ajax({	
	
	SMART_Test_Diag_init(1);	
	$("#Diagnostics_Diag_title").html(_T('_diagnostic','button4'));
	
	var SYSTestObj = $("#Diagnostics_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	init_button();
	language();
	
	INTERNAL_DIADLOG_DIV_HIDE('Diagnostics_Diag');
 	$("#DiagnosticsDiag_systemtest").show();
	
	SYSTestObj.load();
 	
 	$("#Diagnostics_Diag .close").click(function(){
 		
 		if (systest_timeoutId != 0) clearTimeout(systest_timeoutId);
				
		if (_jScrollPane != "")
		{
			var api = _jScrollPane.data('jsp');
			api.destroy();
			_jScrollPane = "";
		}
		
		SYSTestObj.close();

		$("#DiagnosticsDiag_systemtest_wait").show();
		$("#DiagnosticsDiag_systemtest_flexigrid").hide();
		
		$("#Diagnostics_Diag .close").unbind('click');
				
// 		jLoading(_T('_common','set'), 'loading' , 's', ""); 
// 		wd_ajax({
//			url: "/cgi-bin/smart.cgi",
//			type: "POST",
//			async: false,
//			cache: false,
//			data:{cmd:'cgi_SysTest_kill'},	
//			dataType:"xml",
//			success: function(xml){
//				
//					jLoadingClose();
//					
//				}//end of success: function(xml){
//			}); //end of wd_ajax({	
	});
}