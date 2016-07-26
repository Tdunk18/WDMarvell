var _g_language = 0;
var _g_timezone = 1;
var _g_idle = 5;
function time_select()
{
	var new_hour = __hour;
	var start="",end="";
	
	if(TIME_FORMAT=="12")
	{
	if (__hour >12)
		new_hour = new_hour -12;
		
		pm_select();
		
		start = 1;
		end = 12;
	}
	else
	{
		$('#id_pm_top_main').empty();
		start = 0;
		end = 23;
	}

				$('#id_hour_top_main').empty();				
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_generalDTHour_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
	my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_hour\" rel=\"" + new_hour + "\">"+new_hour+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_hour_li'>"
				my_html_options+="<div class='scrollbar_time'>";
	
	write_li(start,end);
	
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";											
				$("#id_hour_top_main").append(my_html_options);	


			$('#id_min_top_main').empty();				
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_generalDTMin_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_min\" rel=\""+__min+"\">"+__min+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_min_li'>"
				my_html_options+="<div class='scrollbar_time'>";
				my_html_options+="<li class=\"li_start\" rel=\"0\"><a href='#'>0</a>";									
				for (var i = 1;i<59;i++)
				{		
					my_html_options+="<li rel=\""+i+"\"><a href='#'>"+i+"</a>";		
				}
				my_html_options+="<li class=\"li_end\" rel='59'><a href='#'>59</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";											
				$("#id_min_top_main").append(my_html_options);	

			$('#id_sec_top_main').empty();				
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_sec_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sec\">"+__sec+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sec_li'>"
				my_html_options+="<div class='scrollbar_time'>";
				my_html_options+="<li class=\"li_start\" rel=\"0\"><a href='#'>0</a>";									
				for (var i = 1;i<59;i++)
				{		
					my_html_options+="<li rel=\""+i+"\"><a href='#'>"+i+"</a>";		
				}
				my_html_options+="<li class=\"li_end\" rel='59'><a href='#'>59</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";											
				$("#id_sec_top_main").append(my_html_options);	
			
	
	function write_li(start,end)
	{
		for (var i = start;i<= end ;i++)
		{
			if(i==start)
				my_html_options+="<li class=\"li_start\" rel=\""+i+"\"><a href='#'>"+i+"</a>";		
			else if(i==end)
				my_html_options+="<li class=\"li_end\" rel=\""+i+"\"><a href='#'>"+i+"</a>";
			else
				my_html_options+="<li rel=\""+i+"\"><a href='#'>"+i+"</a>";	
		}
	}
}


function pm_select()
{
	var select_array = new Array(
			//0,1,2,3,4
			"AM","PM"
			);



	var select_v_array = new Array(
			0,1
			);

			SIZE = 2;
			SIZE2 = 2;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}




			$('#id_pm_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_generalDTPm_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_pm\" rel='"+_g_pm+"'>"+map_table(_g_pm)+"</div>";				
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_pm_li'><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_pm_top_main").append(my_html_options);	
				
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}




function add_user_ntp()
{
	show('id_ntp_user');hide('settings_generalNTPServerAdd_button');
	draw_ntp_table_ui();
		
	
	
	//var v = $("#id_ntp_user").css("display")
	//alert(v);
}
function draw_ntp_table_ui()
{
	var v = $("#id_ntp_user").css("display")
	
	$(".ntp_table:eq(1)").removeClass("ntp_table_top");		
	$(".ntp_table:eq(0)").removeClass("ntp_table_top");		
		
	if (v == "none")
	{
		$(".ntp_table:eq(1)").addClass("ntp_table_top");	
		ui_tab('#hd_ntp_Diag',"#settings_generalNTPServerAdd_button","#settings_generalNTPServerSave_button");
	}
	else
	{
		$("#settings_generalNTPServer_text").focus();				
		$(".ntp_table:eq(0)").addClass("ntp_table_top");		
		ui_tab('#hd_ntp_Diag',"#settings_generalNTPServer_text","#settings_generalNTPServerSave_button");			
	}
}

function del_user_ntp()
{
	hide('id_ntp_user');
	show('settings_generalNTPServerAdd_button');
	draw_ntp_table_ui();
	$("#settings_generalNTPServer_text").val("");
	
	setTimeout(xml_load_t,1000);
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_ntp_time",f_ntp_enable:getSwitch('#settings_generalNTP_switch'),f_ntp_server:$("#settings_generalNTPServer_text").val()},
		cache:false,
		async:true,
		success:function(){				
				//xml_load_t();				
			}
	});
	
}

function init_ntp_value()
{	
	if ($("#settings_generalNTPServer_text").val() == "")
	{
			//$(".ntp_table:eq(1)").addClass("ntp_table_top");
			hide('id_ntp_user');	
			show('settings_generalNTPServerAdd_button')								
	}
	else
	{
		//	$(".ntp_table:eq(0)").addClass("ntp_table_top");		
			show('id_ntp_user')			
			hide('settings_generalNTPServerAdd_button');						
	}	
	
	draw_ntp_table_ui();
}
function set_idle(v)
{		
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=cgi_idle&f_idle="+v,
			success: function(data){		
				jLoadingClose();					
				get_web_idle_time();				
			}			
		});
}
var _HOST="";
var intervalId;
function set_device(fType)
{
	var v  = new Array($("#settings_networkWorkgroup_text"),$("#settings_generalDeviceName_text"),$("#settings_generalDesc_text"));		
	if (value_check(v) == 1) return false;
	
	if(fType=="workgroup")
	{
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
	var str = "cmd=cgi_device&hostname="+ encodeURIComponent($('#settings_generalDeviceName_text').val()) +
				"&workgroup=" + encodeURIComponent($('#settings_networkWorkgroup_text').val()) +
				"&description=" + encodeURIComponent($('#settings_generalDesc_text').val())
	wd_ajax({
		type: "POST",			
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data:str,
	   	success:function(){
	   			jLoadingClose();	   			   				   				   		 		 		  
					$("input:text").inputReset();
					hide2('settings_networkWorkgroupSave_button');
		   		}			
		 });
	}
	else
	{
		var name = $('#settings_generalDeviceName_text').val();
		var desc = $('#settings_generalDesc_text').val();
		if(fType=="name")
		{
			DeviceInfo.name = name;
			desc = DeviceInfo.desc;
			
			jConfirm('M',_T('_device','msg15'),_T('_common','warning'),"",function(r){
				if(r)
				{
					jLoading(_T('_common','set') ,'loading' ,'s',""); 
					_post_devname();
				}
		    });
	    
		}
		else
		{
			jLoading(_T('_common','set') ,'loading' ,'s',""); 
			DeviceInfo.desc = desc;
			name = DeviceInfo.name;
			_post_devname();
		}		
		}
	
	function _post_devname()
	{
		set_title();
		_REST_Device_Desc(name,desc,function(){
		if(fType=="name")
		{
			hide('settings_generalDeviceName_button');
				
				get_host_info(function(v){
					if(v=="y")
					{
						var host = $('#settings_generalDeviceName_text').val();
						var port = location.port;
						(port==80 || port=="") ?port="": port=":"+port;
						var url = location.protocol + "//" + host + port;
						_HOST = url;
					   	if(window.attachEvent){
					        document.getElementById("page_target").attachEvent('onload', pageCallback);
					    }
					    else{
					        document.getElementById("page_target").addEventListener('load', pageCallback, false);
					    }
					    document.form_page_load.action=url;
						
						intervalId = setInterval(function(){
							document.form_page_load.submit();
						},3000);

						/*
						setTimeout(function(){
							//location.replace(url);
							jLoadingClose();
						},30000);*/
					}
					else
						jLoadingClose();
				});
				$("input:text").inputReset();
		}
		else
		{
				$("input:text").inputReset();
			hide('settings_generalDesc_button');
				jLoadingClose();
		}
		});
	   		}			
	 return false;		
}
function pageCallback()
{
	if (intervalId != 0) clearInterval(intervalId);
	setTimeout(function(){
		location.replace(_HOST);
	},5000);
}
var DeviceInfo = new Array();
function init_general()
{
		wd_ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_general",	
		cache:false,
		dataType: "xml",	
		success: function(xml){			
			//time
			$(xml).find('time').each(function(){			
				var timezone = $(this).find('timezone').text();
				_g_timezone = timezone;
				var ntp_enable = $(this).find('ntp_enable').text();				
				var ntp_server = $(this).find('ntp_server').text();				
				var year = $(this).find('year').text();			
				var mon = $(this).find('mon').text();
				var day = $(this).find('day').text();
				var hour = $(this).find('hour').text();
				var min = $(this).find('min').text();
				var sec = $(this).find('sec').text();										
				var idle = $(this).find('idle').text();	
				var time_format = $(this).find('time_format').text();
				var date_format = $(this).find('date_format').text();
				DATE_FORMAT = date_format;
				_g_idle = idle;
				var language= $(this).find('language').text();				
				_g_language = language;
				$('#id_language').attr("rel",language);	
				language_mapping(language)
				//time				
				$("#settings_generalNTPServer_text").val(ntp_server);		
				
				if (ntp_server!= "")
				{
					$("#Settings_generallPrimaryServer_value").text(ntp_server);
				}		
				else
					$("#Settings_generallPrimaryServer_value").text("time.windows.com");
				//ntp_enable			
				setSwitch('#settings_generalNTP_switch',ntp_enable);
				if (ntp_enable == "1")				
				{
						hide('time_detail')
						show('ntp_set_tb')
				}
				else
				{
						
					show('time_detail');			
					hide('ntp_set_tb')
				}	
													
				$('#id_timeout').html(idle);	
				
				$('#f_year').attr("value",year);				
				$('#f_month').attr("value",mon);					
				$('#f_day').attr("value",day);	
		
				__year = year;
				__mon = mon;			
				__day = day;
				__hour = hour;
				__min = min;
				__sec = sec;
						
				drawTime(time_format);
				reset_sel_item("#settings_generalTimeFormat_select",time_format,time_format);
				reset_sel_item("#settings_generalDateFormat_select",date_format,date_format);
						
				if (hour>=12)
						_g_pm = 1;		
				else 		
					_g_pm = 0;		
				//$("#id_now_timezone").text(  _T('_time','timezone') +" : " + $("#f_timezone option:selected").text());
				$("#id_now_timezone").text(  _T('_time','timezone') +" : " + $("#id_timezone").text());
									
									
				if (mon.length<2) {mon="0"+mon};
				if (day.length<2) {day="0"+day};
														
				var datepicker_date_format = "yy-mm-dd";				
				if (DATE_FORMAT == "YYYY-MM-DD")
				{						
						datepicker_date_format = "yy-mm-dd";
				}			
				else if (DATE_FORMAT == "MM-DD-YYYY")
				{										
						datepicker_date_format = "mm-dd-yy";	
				}			
				else if (DATE_FORMAT == "DD-MM-YYYY")
				{						
						datepicker_date_format = "dd-mm-yy";					
				}			
				$('#settings_generalDTDatepicker_text').datepicker({
						changeMonth: false,
						changeYear: false,
						gotoCurrent: false,
						dateFormat:datepicker_date_format					
				});
				if (DATE_FORMAT == "YYYY-MM-DD")
				{
						$("#settings_generalDTDatepicker_text").val(year+"-"+mon+"-"+day);					
				}			
				else if (DATE_FORMAT == "MM-DD-YYYY")
				{					
						$("#settings_generalDTDatepicker_text").val(mon+"-"+day+"-"+year);						
				}			
				else if (DATE_FORMAT == "DD-MM-YYYY")
				{
						$("#settings_generalDTDatepicker_text").val(day+"-"+mon+"-"+year);							
				}
				
			 });
			 
			 //device
			 $(xml).find('device_info').each(function(){
			
				var name = $(this).find('name').text();
				var workgroup = $(this).find('workgroup').text();
				var description = $(this).find('description').text();				
				var lmb = $(this).find('lmb').text();
				var ssh = $(this).find('ssh').text();
				var rsync = $(this).find('rsync').text();
				
				var serial_number = $(this).find('serial_number').text();
				$("#settings_generalSerialNum_value").text(serial_number)
				$("#settings_generalDeviceName_text").val(name);
				$("#settings_networkWorkgroup_text").val(workgroup);
				$("#settings_generalDesc_text").val(description);
				
				DeviceInfo.name = name;
				DeviceInfo.desc = description;
			}); 
			 //power management
			 $(xml).find('power').each(function(){		
				var hdd_hibernation_enable = $(this).find('hdd_hibernation_enable').text();
				var turn_off_time = $(this).find('turn_off_time').text();		
				_g_turn_off_time = turn_off_time;							
				setSwitch('#settings_generalDriveSleep_switch',hdd_hibernation_enable);										
				init_hd_sleep_detail();												
				var recovery_enable = $(this).find('recovery_enable').text();							
				setSwitch('#settings_generalPowerRecovery_switch',recovery_enable);				
				var power_off_sch_enable = $(this).find('power_off_enable').text();								
				_g_power_sch = 	power_off_sch_enable;							
			
				setSwitch('#settings_generalPowerSch_switch',power_off_sch_enable);
				if (power_off_sch_enable == 1)
					show('power_on_off_switch_detail')
				else
					hide('power_on_off_switch_detail')
				
				$("input[name='f_hdd_hibernation_enable']").eq(1-parseInt(hdd_hibernation_enable,10)).attr("checked",true);			
				$("#f_turn_off_time").val(turn_off_time);
							
				if (hdd_hibernation_enable == 1)
					$("#id_turn_off_hard").show()
									
				if (power_off_sch_enable == 0)
					$("#id_power_off_sch").hide()
				
				var led_enable = $(this).find('led_enable').text();						
				setSwitch('#settings_generalLed_switch',led_enable)
				
				var lcd_enable = $(this).find('lcd_enable').text();									
				setSwitch('#settings_generalLcd_switch',lcd_enable)										
				writeTimeout();
				writeTimeZoneSelector();									
				init_select();								
				$("input:text").inputReset();		
				$("input:password").inputReset();								
			 }); 
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }
	});
}
function lang_cancel()
{
		language_mapping(_g_language);
		hide('settings_generalLanguageSave_button');
		hide('settings_generalLanguageCancel_button');
}
function lang_save()
{	
	jLoading(_T('_common','set') ,'loading' ,'s',""); 		
	var str = "cmd=cgi_language&f_language="+ $('#id_language').attr('rel');
	wd_ajax({
		type: "POST",			
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data:str,
	   	success:function(){
	   			jLoadingClose();	   			   				   				   		 		 		  				
					hide('settings_generalLanguageSave_button');
					hide('settings_generalLanguageCancel_button');
					_REST_Language(language_array2[$("#id_language").attr("rel")]);
//					ready_language();
//					$('.b1').next().remove();
//					ready_init();
//					var lang = $('#f_language').attr('rel');
//					if (lang == "1" || lang == "2" || lang == "4" ||lang == "13" || lang == "14" || lang == "17")
//					{
//						$(".logout").css("background-image","url(/web/images/icon/logout_normal_x1.png)")
//						$(".logout:hover").css("background-image","url(/web/images/icon/logout_over_x1.png)")
//					}
//					else
//					{
//						$(".logout").css("background-image","url(/web/images/icon/logout_normal.png)")
//						$(".logout:hover").css("background-image","url(/web/images/icon/logout_over.png)")
//					}	
//					
//					go_page('/web/setting/setting.html', 'nav_settings');
					setTimeout(function(){	
						window.location.reload(true);
						},1000);
	   		}			
	 });	
	 return false;		
}

function get_host_info(callback)
{
	wd_ajax({
		type: "GET",
		url:"/cgi-bin/network_mgr.cgi",
		data:{cmd:"cgi_get_lan_xml"},
		dataType: "xml",
		cache: false,
		error:function(){
		},		
		success: function(xml) {
				var ip1 = $(xml).find('ip').eq(0).text();
				var ip2 = $(xml).find('ip').eq(1).text();
				var hostFlag = "";
				var h = location.hostname;
				if(h==ip1 || h==ip2)
				{
					hostFlag ="n";
				}
				else
				{
					hostFlag ="y";
				}
				
				if(callback) callback(hostFlag);
		}
	});
}