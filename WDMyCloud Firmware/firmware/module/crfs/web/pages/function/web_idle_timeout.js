var web_idle_time = 0;
var web_hotplug_system_Interval = -1;
var web_idle_time_timeout = -1;
var web_timeout_Interval = -1;
var disable_click_event = false;
var system_reset_chk_id = -1;
var HOME_XML_CURRENT_HD_INFO = "";
var home_device_Interval = -1;
var home_sysinfo_timeout = -1;
function stop_web_timeout(keep_timeout)
{
	var stop_web_timeout_Interval = true;

	if (web_idle_time_timeout != -1)
	{	
		clearTimeout(web_idle_time_timeout);
		web_idle_time_timeout = -1;
	}

	if (!(typeof keep_timeout == "undefined"))
	{
		stop_web_timeout_Interval = !keep_timeout;
		if (keep_timeout == true)
			disable_click_event = true;
	}

	if (stop_web_timeout_Interval)
	{
		clearInterval(web_timeout_Interval);
		web_timeout_Interval = -1;
	}
}

function restart_web_timeout()
{
	stop_web_timeout();

	if (web_idle_time > 0)
	{
		disable_click_event = false;
		web_idle_time_timeout = setTimeout('do_logout()', web_idle_time * 60 * 1000);
	}

	web_timeout_Interval = setInterval('check_web_timeout()', 15000);
}

function check_web_timeout()
{
	if (web_timeout_Interval == -1) { return }; 
	$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/login_mgr.cgi",
		data: {
			cmd:'ui_check_wto',
			username: _login_username
		},
		success:function(r){
			if (web_timeout_Interval == -1) { return };
			if(r != "success")
			{
				stop_web_timeout();
				jAlert( _T('_login','msg5'), _T('_common','error'), null, function(){
					do_logout();
				});
			}
		}
	});
}

function get_web_idle_time()
{
//	if (_g_admin_pwd == 0)  //no check web timeout
//	{
//			web_idle_time = 0;
//			return;
//	}	
	stop_web_timeout();
	$.ajax({
		type: "POST",
		dataType: "json",
		cache: false,
		url: "/web/get_XML_value.php",
		data: {
			nodes: "system_mgr/idle/time"
		},
		success:function(r){
			if (r.success)
				web_idle_time = parseInt(r.info[0], 10);
			else
				web_idle_time = 5;

			restart_web_timeout();
		}
	});
}

function init_web_timeout() //For Login
{
	get_web_idle_time();
	web_timeout_Interval = setInterval('check_web_timeout()', 15000);

	$(document).click(function(e) { 
		var cursor = $(e.target).css("cursor");
		if (cursor == "pointer" && !disable_click_event)
			restart_web_timeout();
	});
}

function deinit_web_timeout()
{
	$(document).unbind("click");
	stop_web_timeout();
	disable_click_event = false;
}

function check_hotplug_system_status()
{	
	$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/hd_config.cgi",
		data: {cmd:'cgi_hotplug_status'},
		success:function(xml){
			var my_res = $(xml).find('res').text();
			
			switch( parseInt(my_res, 10))
			{
				case 1: //system busy
					HOME_XML_CURRENT_HD_INFO = "";
					setTimeout('check_hotplug_system_status()', 3000);
				break;
				
				default:
					restart_web_timeout();
					$("#HD_HotPlug_Diag").overlay().close();
					
					chk_hdd_status(function(cntDisk,res,eula){//fish20140825+ for check hdd
						if(cntDisk==0 && res==0)
						{
							window.location.reload(); 
							return;
						}
						else
						{
							home_device_Interval = setInterval('home_devive_status()', 5000);
						}
					});

				break;
			}
		}
	});
}
var _g_temperature_high = 0;
function home_devive_status()
{
		$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/home_mgr.cgi",
		data: {cmd:'8'},
		success:function(xml){
			var my_res = $(xml).find('res').text();
			
			if(parseInt(my_res, 10)!= 0)
			{
				clearInterval(home_device_Interval);
				home_device_Interval = -1;
			}
			
			switch( parseInt(my_res, 10))
			{
				case 1: //temperature is too hight
					if ($("#Temperature_Diag").css("display") != "block" && $("#HD_HotPlug_Diag").css("display") != "block")
						{
							adjust_dialog_size('#Temperature_Diag',400, 300);
							var overlayObj=$("#Temperature_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
							overlayObj.load();	
							stop_web_timeout(true);
							_g_temperature_high = 1;
						}		
				break;
				
				case 2:	//system busy
					if ($("#Temperature_Diag").css("display") == "block")
								$("#Temperature_Diag").overlay().close();
					
					adjust_dialog_size('#HD_HotPlug_Diag',400, 300);
					$("#HD_HotPlug_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
					$("#HD_HotPlug_Diag").overlay().load();
					$("#home_hotplug_desc").html(_T('_raid','msg8'));
					
					stop_web_timeout(true);

					check_hotplug_system_status();
				break;
				
				default:
					if (_g_temperature_high == 1)
						{
							//check temperature is downloading
							if ($("#Temperature_Diag").css("display") == "block")
								$("#Temperature_Diag").overlay().close();		
							restart_web_timeout();							
							_g_temperature_high = 0;
						}	
				break;
			}
		}
	});
}
function system_reset_chk()
{
	HD_Status(1,function(hd_state){
	clearTimeout(system_reset_chk_id);
	
	if($(".WDLabelDiag").css("display") == "block")
	{ 
		system_reset_chk_id = setTimeout(system_reset_chk,5000);
		return;
	}	
	switch(parseInt(hd_state))
	{		
		case 3://tmp/form_restore - formatting
			wd_ajax({
				url:"/cgi-bin/system_mgr.cgi",
				data: {cmd:'cgi_chk_restore'},
				type:"POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){					
						if ( parseInt($(xml).find("res").text(),10) == 0 )
						{				
							system_reset_chk_id = setTimeout(system_reset_chk,5000);
							return;							 					
						}
						else
						{
							  var system_restore_typ = $(xml).find("restore_type").text();
							 
								wd_ajax({
									url:"/xml/cgi_fmt_gui_log.xml",
									type:"POST",
									async:false,
									cache:false,
									dataType:"xml",
									success: function(xml){
										
											if ( parseInt($(xml).find("my_type").text(),10) == 15 )
											{				
												$("#formatQ_progressbar").progressbar({value: 0});
												$("#formatQ_percent").html("&nbsp;&nbsp;0%&nbsp;&nbsp;");							
												fmt_QtimeoutId = setTimeout(Restore_FormatDisk_state,1000);
									 			setTimeout(stop_web_timeout, 1000);	
												
												if (system_restore_typ == "full")
												{
													$("#Restore_title").empty().html(_T('_utilities','full_factory_restore'));
													$("#settings_utilitiesRestoreSwitchToQuick_button").show();
												}	
												else
												{
													$("#Restore_title").empty().html(_T('_utilities','quick_factory_restore'));	
													$("#settings_utilitiesRestoreSwitchToQuick_button").hide();
												}		
													
												var overlayObj=$("#RestoreFullDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
												overlayObj.load();	
												 					
											}
									}
								});		
					
						}	
				}
			});		
			
		break;
	
		default:
			system_reset_chk_id = setTimeout(system_reset_chk,5000);
		break;
	}//end of switch
	});

}
function chk_hdd_status(callback)
{
	$.ajax({
		type: "POST",
		cache: false,
		dataType:"xml",
		url: "/web/php/noHDD.php",
		data: {cmd:'getDiskStatus'},
		success:function(xml){
			var cntDisk = parseInt($(xml).find('cntDisk').text(),10);
			var res = parseInt($(xml).find('res').text(),10);
			var eula = parseInt($(xml).find('eula').text(),10);
			if(callback)
			{
				callback(cntDisk,res,eula);
			}
		}
	});
}function sata_power_off()
{
	$.ajax({
		type: "POST",
		cache: false,
		dataType:"xml",
		url: "/web/php/noHDD.php",
		data: {cmd:'setSataPower',enable:"disable"},
		success:function(xml){
		}
	});	
}
