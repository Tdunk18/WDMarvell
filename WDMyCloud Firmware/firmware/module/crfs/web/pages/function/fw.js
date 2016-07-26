function start_upload_fw() {
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		async: true,
		data: {
			cmd: "check_power_sch"
		},
		dataType: 'html',
		success: function (data) {
			if (data == "error") {
				//The power off schedule time is close to the system time, it must be larger than 10 minutes.
				jAlert(_T('_firmware', 'msg10'), _T('_common', 'error'));
				return false;
			} else {
				clear_percentage();
				if (upload_frame.$("#file").val() == "") {
					jAlert(_T('_system', 'msg5'), _T('_common', 'error'));
					return;
				}
				//	var overlayObj=parent.$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
				var overlayObj = $("#overlay").overlay({
					expose: '#000',
					api: true,
					closeOnClick: false,
					closeOnEsc: false
				});
				overlayObj.load();
				$("#settings_fimrwareImpore_button").hide();
				show_msg();
				upload_frame.run();
			}
		}
	})
}

function show_msg() {
	$("#id_msg").show();

	//Warning: Firmware update in progress.<br>Please do not restart or shut down the Lightning 4a.
	var str = _T('_firmware', 'msg16')
	document.getElementById('id_msg').innerHTML = str;

}

function closeload() {
	var overlayObj = $("#overlay").overlay({
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false
	});
	overlayObj.close()
	$("#id_msg").hide();
}

function dialog_hide_button() {
	$("#overlay .f_button").hide();
}

function dialog_show_button() {
	$("#overlay .f_button").show();
	$("#overlay .f_button").focus();
}

function startdownload(flag) {	
	dialog_hide_button();
			  	
	var overlayObj = $("#overlay").overlay({
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false
	});
	overlayObj.load();

	$("#fw_upgrading_show").hide();
	$("#fw_downloading_show").show();
	$("#id_msg").text(_T('_firmware','msg16'));
	$("#id_msg").show();
	
	setTimeout('stop_web_timeout(true);', 1000);	
	if (flag != "eula")
	{
	stop_get_name_mpapping();
}
}

function startload() {

	$("#fw_upgrading_show").show();
	$("#fw_downloading_show").hide();

	show_msg();
}

function show_percentage() {
	$("#id_result").show()
}

function hide_percentage() {
	$("#id_result").hide()
}

function set_percentage(data) {
	$(".id_percentage").html(data + "%");
	set_bar_v(data);
}

function clear_percentage() {
	$(".id_percentage").html("0%");
}

function msg() {
}
function upload_uP_success(){
	$("#overlay").overlay().close();

	var overlayObj = $("#rebootDiag").overlay({
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false
	});
	overlayObj.load();
	count();

	stop_web_timeout();

}
function upload_fw_success() {

$("#overlay").overlay().close();


	var overlayObj = $("#rebootDiag").overlay({
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false
	});
	overlayObj.load();
	count();
//	wd_ajax({
//		type: "POST",
//		async: true,
//		cache: false,
//		url: "/cgi-bin/system_mgr.cgi",
//		dataType: 'html',
//		data: "cmd=cgi_restart"
//	}); //end of .ajax...

	stop_web_timeout();

	//call reboot cgi	

}

function fw_check() {
	document.form_firm.submit();
}

function upload_Up_msg() {
	//startload();
	//var str = "Now, device update OLED firmware. Don't power up the device. ; 
	var str = _T('_firmware', 'msg8')
	//parent.$("#id_msg").show();			
	$("#id_msg").html(str);
}

function upload_uP_ok() {
	//	var str = _T('_firmware','msg9')
	$("#overlay").hide();


	var overlayObj = $("#rebootDiag").overlay({
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false
	});
	overlayObj.load();
	count();

	stop_web_timeout();		
}


/*
 ******************************for auto update firmware**********************************
 */
var loop_auto_fw_status = -1;

function chk_update_status()
{
	var chk_hd_status = 0;
	wd_ajax({
			type:"POST",
			async:false,
			cache:false,
			url:"/cgi-bin/hd_config.cgi",
			data:{cmd:'cgi_Detect_Dangerous'},
			dataType: "xml",
			success: function(xml){										
				var res = $(xml).find('res').text();					
				//Device shutdown,restore,restarted or update fimrware is prohibited when disk formatting/disk resize/disk rebuild/disk migrate/firmware uploading is in progress.			
				if ( parseInt(res) != 0)
				{	
					jAlert(_T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
					chk_hd_status = 1;
				}						
			}//end of success
		});	// end of ajax				
	
	//check auto fw
//		wd_ajax({
//		type: "POST",
//		async: false,
//		cache: false,
//		url: "/cgi-bin/system_mgr.cgi",
//		data: "cmd=chk_fw_upload",
//		success: function (data) {							
//			if (data == "upload_complete")			             
//			{							
//				jAlert(_T('_firmware','msg13'), "info");
//				chk_hd_status = 1;
//			}		
//		}	
//	});	
	return chk_hd_status;
}

function open_diag(id) {
	if ($("#"+id).hasClass('gray_out')) return;
	
	if (chk_update_status() == 1) return;
	//jLoading(_T('_common','set') ,'loading' ,'s',""); 
	jLoading(_T('_common', 'set'), 'Retrieving', 's', "");
	//language();
	//location.replace("/web/setting/firmware.html");	
	var obj;
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=get_auto_fw_version&method=1",
		dataType: 'xml',
		success: function (xml) {
			jLoadingClose();
			$(xml).find('fw').each(function (index) {
				var str = "";
				var new_str = $(this).find('new').text();
				if (new_str == "0" || new_str == "-1") {
								
					if (new_str == "-1")
					{
						$("#id_fw_networkerror").show();
						$("#id_fw_uptodate").hide();
					}
					else
					{
						$("#id_fw_networkerror").hide();
						$("#id_fw_uptodate").show();
					}
					obj = $("#FWDiag").overlay({
						expose: '#000',
						api: true,
						closeOnClick: false,
						closeOnEsc: false
					});
					obj.load();
//					adjust_dialog_size("#FWDiag",420,250);
					init_button();
					language();

                                        } else {
					obj = $("#FWUpdateDiag").overlay({
						expose: '#000',
						api: true,
						closeOnClick: false,
						closeOnEsc: false
					});
					var version = $(this).find('version').text();
					var path = $(this).find('path').text();

					obj.load();
//					adjust_dialog_size("#FWUpdateDiag",400,400);

					init_button();
					language();
					$("#id_auto_new_firm_version").text(version);
					$("#id_auto_new_firm_note").attr("href",$(this).find('releasenote').text());
					$(".scrollbar_autofw").jScrollPane();

					$("#FWUpdateDiag .close").click(function () {
						$('#FWUpdateDiag .close').unbind('click');
						clearTimeout(loop_auto_fw_status);
						obj.close();
						show('id_new_fw_td');
						hide('id_ck_fw_td');
						hide('id_ck_fw_td_tip')
					});
				}
			});
		}

	});

}

function open_h_diag() {
	
	$("#home_fwUpdateInstall_button").removeClass('gray_out');
		HD_Status(0,function(hd_status){					
			if (hd_status == 0)
			{					
				$("#home_fwUpdateInstall_button").addClass('gray_out');				
			}
			//else
			{
					wd_ajax({
							type: "POST",
							async: true,
							cache: false,
							url: "/cgi-bin/system_mgr.cgi",
							data: "cmd=chk_fw_upload",
							success: function (data) {	
								if (data == "uploading" || data == "upload_complete")
								{
									$("#home_fwUpdateInstall_button").addClass('gray_out');									
								}		
								else
								{									
										var chk_hd_status = 0;
										wd_ajax({
												type:"POST",
												async:false,
												cache:false,
												url:"/cgi-bin/hd_config.cgi",
												data:{cmd:'cgi_Detect_Dangerous'},
												dataType: "xml",
												success: function(xml){										
													var res = $(xml).find('res').text();						
													//Device shutdown,restore,restarted or update fimrware is prohibited when disk formatting/disk resize/disk rebuild/disk migrate/firmware uploading is in progress.			
													if ( parseInt(res) != 0)
													{	
														jAlert(_T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
														chk_hd_status = 1;
													}						
												}//end of success
											});	// end of ajax				
										
										if (chk_hd_status == 1) return;
																
										jLoading(_T('_common', 'set'), 'Retrieving', 's', "");
										var obj;
										wd_ajax({
											type: "POST",
											async: true,
											cache: false,
											url: "/cgi-bin/system_mgr.cgi",
											data: "cmd=get_auto_fw_version&method=1",
											dataType: 'xml',
											success: function (xml) {
												jLoadingClose();
												$(xml).find('fw').each(function (index) {
													var str = "";
													var new_str = $(this).find('new').text();
													if (new_str == "0" || new_str == "-1") {
									
															if (new_str == "-1")
															{
																$("#id_fw_networkerror").show();
																$("#id_fw_uptodate").hide();
															}
															else
															{
																$("#id_fw_networkerror").hide();
																$("#id_fw_uptodate").show();
															}
														obj = $("#FWDiag").overlay({
															expose: '#000',
															api: true,
															closeOnClick: false,
															closeOnEsc: false
														});
													
														obj.load();
														init_button();
														language();
									
														$("#FWDiag .close").click(function () {
															$('#FWDiag .close').unbind('click');
															obj.close();
														});
									
													} else {
														obj = $("#hFWUpdateDiag").overlay({
															expose: '#000',
															api: true,
															closeOnClick: false,
															closeOnEsc: false					
														});
														var version = $(this).find('version').text();
														var path = $(this).find('path').text();
									
														$("#id_h_auto_new_firm_version").text(version);
														$("#id_h_auto_new_firm_note").attr("href",$(this).find('releasenote').text());
											
														obj.load();
									
														if (MULTI_LANGUAGE == "15")
																adjust_dialog_size("#hFWUpdateDiag",570,"");
														init_button();
														language();
									
														$(".scrollbar_autofw").jScrollPane();
									
														$("#hFWUpdateDiag .close").click(function () {
															$('#hFWUpdateDiag .close').unbind('click');
															clearTimeout(loop_auto_fw_status);
															obj.close();
														});
													}
												});
											}
									
										});																		
								}
							}
					});
			}
	})
}

function fw_install(id)
{	
	if ($("#"+id).hasClass("gray_out")) return;
	
	var flag = 0
	if ($("#eulaFWUpdateDiag").css('display') == "block")
	{
			$("#eulaFWUpdateDiag").overlay().close();
			flag = "eula"
	}		

	if ($("#FWUpdateDiag").css('display') == "block")
			$("#FWUpdateDiag").overlay().close();

	if ($("h#FWUpdateDiag").css('display') == "block")
			$("#hFWUpdateDiag").overlay().close();

	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		dataType: 'html',
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=set_auto_fw",
		success: function (data) {
			clear_percentage();
			set_percentage("0");
			startdownload(flag);
			fw_status();
		}
	});

}

function fw_status() {
	clearTimeout(loop_auto_fw_status);
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=get_auto_fw_status",
		dataType: 'html',
		success: function (data) {
			if (data == -1)
			{
				$("#overlay").overlay().close();
				jAlert(_T('_backup', 'desc13'), _T('_common', 'error'));		
				restart_web_timeout();
				restart_get_name_mpapping();
			}	
			else if (data == 200) {			
				//startload();
				var sys_time = (new Date()).getTime();
					$("#upload_frame").attr("src", "/web/setting/firmware_result.html?r=" + sys_time);
			} else {
				if (data == "") data = 0;			
				set_percentage(data);
				loop_auto_fw_status = setTimeout(fw_status, 1000);
			}
		},
		error:function(){		
			loop_auto_fw_status = setTimeout(fw_status, 1000);
		}
	});

}
var _init_fw_bar = 0;

function set_bar_v(v) {
	if (_init_fw_bar == 0) {
		$("#fw_parogressbar").progressbar({
			value: 0
		});
	} else
		_init_fw_bar = 1;

	$("#fw_parogressbar").show();
	$("#fw_parogressbar").progressbar('option', 'value', parseInt(v, 10));
	//	}	
}

function hide_upload_show() {
	hide('fw_upgrading_show');
	hide('fw_downloading_show');
}

function error_msg(str) {
	$("#fw_parogressbar").hide();
	$("#id_msg").html(str);
	$("#settings_fimrwareImpore_button").show();
}
function fw_set_iframe_width(v)
{		
	$("#upload_frame").css("width",v+60);    			
}
