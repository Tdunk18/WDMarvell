var __year,__mon,__day,__hour,__min,__sec;
var _g_pm = 0;
var loop_time = "";
function time_mapping(timezone)
{
var time_array = new Array(
_T('_time','GMT-12-00'), //(GMT-12:00) International Data Line West";                                                            
_T('_time','GMT-11-00'), //(GMT-11:00) UTC-11";                                                                                  
_T('_time','GMT-10-00'), //(GMT-10:00) Hawaii";                                                                                  
_T('_time','GMT-09-00'),//(GMT-09:00) Alaska";                                                                                  
_T('_time','GMT-08-00'),//(GMT-08:00) Baja California";
_T('_time','GMT-08-00_1'),//(GMT-08:00) Pacific Time (US &amp; Canada)";                                                          
_T('_time','GMT-07-00'),//(GMT-07:00) Mountain Time (US &amp; Canada)";                                                         
_T('_time','GMT-07-00_1'),//(GMT-07:00) Arizona";                                                                                 
_T('_time','GMT-07-00_2'),//(GMT-07:00) Chihuahua, La Paz, Mazatlan";                                                             
_T('_time','GMT-06-00'),//(GMT-06:00) Central America";                
                                                         
_T('_time','GMT-06-00_1'),//(GMT-06:00) Central Time (US &amp; Canada)";                                                          
_T('_time','GMT-06-00_2'), //(GMT-06:00) Guadalajara, Mexico City, Monterrey";                                                     
_T('_time','GMT-06-00_3'),//(GMT-06:00) Saskatchewan";                                                                            
_T('_time','GMT-05-00'),//(GMT-05:00) Indiana (East)";                                                                          
_T('_time','GMT-05-00_1'),//(GMT-05:00) Eastern Time (US &amp; Canada)";                                                          
_T('_time','GMT-09-00_2'),//(GMT-05:00) Bogota, Lima, Quito";                                                                     
_T('_time','GMT-04-30'),//(GMT-04:30) Caracas";                                                                                 
_T('_time','GMT-04-00'),//(GMT-04:00) Atlantic Time (Canada)";   
_T('_time','GMT-04-00_4'),//(GMT-04:00) Cuiaba";                                                               
_T('_time','GMT-04-00_1'),//(GMT-04:00) Georgetown, La Paz, Manaus, San Juan";       
                                             
_T('_time','GMT-04-00_2'),//(GMT-04:00) Asuncion";                                                                                
_T('_time','GMT-04-00_3'),//(GMT-04:00) Santiago";                                                                                
_T('_time','GMT-03-30'),//(GMT-03:30) Newfoundland";                                                                            
_T('_time','GMT-03-00'),//(GMT-03:00) Brasilia";                                                                                
_T('_time','GMT-03-00_1'),//(GMT-03:00) Buenos Aires";                                                                            
_T('_time','GMT-03-00_2'),//(GMT-03:00) Greenland";                                                                               
_T('_time','GMT-03-00_3'),//(GMT-03:00) Cayenne, Fortaleza";                                                                                 
_T('_time','GMT-03-00_4'),//(GMT-03:00) Montevideo";                                                                              
_T('_time','GMT-02-00'),//(GMT-02:00) Mid-Atlantic";                                                                            
_T('_time','GMT-02-00_1'),//(GMT-02:00) UTC-2"; 

                                                                                  
_T('_time','GMT-01-00'),//(GMT-01:00) Azores";                                                                                  
_T('_time','GMT-01-00_1'),//(GMT-01:00) Cape Verde Is.";                                                                          
_T('_time','GMT'),//(GMT) Casablanca";                                                                                    
_T('_time','GMT_1'),//(GMT) Greenwich Mean Time";     
_T('_time','GMT_3'),//(GMT) Dublin, Edinburgh, Lisbon, London";                                                                                                             
_T('_time','GMT_2'),//(GMT) Monrovia, Reykjavik";                                                                           
_T('_time','GMT01-00'),//(GMT+01:00) West Central Africa";                                                                     
_T('_time','GMT01-00_1'),//(GMT+01:00) Brussels, Copenhagen, Madrid, Paris";                                                     
_T('_time','GMT01-00_2'),//(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague";                                       
_T('_time','GMT01-00_3'),//(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna";   
                                     
_T('_time','GMT01-00_4'),//(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb";  
_T('_time','GMT01-00_5'),//(GMT+01:00) Windhoek";                                                        
_T('_time','GMT02-00_9'),//(GMT+02:00) Damascus";                                                         
_T('_time','GMT02-00_10'),//(GMT+02:00) Nicosia";  
_T('_time','GMT02-00_11'),//(GMT+02:00) Istanbul";   
_T('_time','GMT02-00'),//(GMT+02:00) Amman";                                                                                   
_T('_time','GMT02-00_1'),//(GMT+02:00) Beirut";                                                                                  
_T('_time','GMT02-00_3'),//(GMT+02:00) Harare, Pretoria";                                                                        
_T('_time','GMT02-00_4'),//(GMT+02:00) Jerusalem";                                                                               
_T('_time','GMT02-00_5'),//(GMT+02:00) Cairo";      
                                                                             
_T('_time','GMT02-00_6'),//(GMT+02:00) Athens, Bucharest";                                                             
_T('_time','GMT02-00_8'),//(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius";                                           
_T('_time','GMT03-00'),//(GMT+03:00) Baghdad";                                                                                 
_T('_time','GMT03-00_3'),//(GMT+03:00) Kaliningrad, Minsk";   
_T('_time','GMT03-00_1'),//(GMT+03:00) Nairobi";                                                                                 
_T('_time','GMT03-00_2'),//(GMT+03:00) Kuwait, Riyadh";
_T('_time','GMT03-30'),//(GMT+03:30) Tehran";                                                                                  
_T('_time','GMT04-00'),//(GMT+04:00) Baku";                                                                                    
_T('_time','GMT04-00_1'),//(GMT+04:00) Abu Dhabi, Muscat";                                                                       
_T('_time','GMT04-00_2'),//(GMT+04:00) Tbilisi";
_T('_time','GMT03-00_4'),//(GMT+04:00) Moscow, St. Petersburg, Volgograd";
_T('_time','GMT04-00_3'),//(GMT+04:00) Yerevan";                                                                                 
_T('_time','GMT04-00_4'),//(GMT+04:00) Port Louis";                                                                              
_T('_time','GMT04-30'),//(GMT+04:30) Kabul";                                                                                   
_T('_time','GMT05-00_1'),//(GMT+05:00) Islamabad, Karachi";                                                                      
_T('_time','GMT05-00_2'),//(GMT+05:00) Tashkent";                                                                                
_T('_time','GMT05-30'),//(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi";                                                     
_T('_time','GMT05-30_1'),//(GMT+05:30) Sri Jayawardenepura";                                                                     
_T('_time','GMT05-45'),//(GMT+05:45) Kathmandu";                                                                               
_T('_time','GMT06-00_3'),//(GMT+06:00) Ekaterinburg"; 

_T('_time','GMT06-00'),//(GMT+06:00) Astana";                                                                                  
_T('_time','GMT06-00_2'),//(GMT+06:00) Dhaka";                                                                                   
_T('_time','GMT06-30'),//(GMT+06:30) Yangon (Rangoon)";                                                                        
_T('_time','GMT07-00_1'),//(GMT+07:00) Bangkok, Hanoi, Jakarta";                                                                 
_T('_time','GMT07-00_2'),//(GMT+07:00) Novosibirsk";                                                                 

_T('_time','GMT08-00'),//(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi";                                                   
_T('_time','GMT08-00_1'),//(GMT+08:00) Taipei";                                                                                  
_T('_time','GMT08-00_2'),//(GMT+08:00) Kuala Lumpur, Singapore";	//"(GMT+08:00) Irkutsk";                                        
_T('_time','GMT08-00_3'),//(GMT+08:00) Perth"; 					//"(GMT+08:00) Kuala Lumpur, Singapore";                                
_T('_time','GMT08-00_5'),//(GMT+08:00) Krasnoyarsk
    
_T('_time','GMT08-00_4'),//(GMT+08:00) Ulaan Bataar";			//"(GMT+08:00) Perth";                                                
_T('_time','GMT09-00'),//(GMT+09:00) Osaka, Sapporo, Tokyo"; 	//"(GMT+08:00) Ulaan Bataar";                                   
_T('_time','GMT09-00_1'),//(GMT+09:00) Irkutsk"; 				//"(GMT+09:00) Osaka, Sapporo, Tokyo";                                  
_T('_time','GMT09-00_2'),//(GMT+09:00) Seoul";					//"(GMT+09:00) Yakutsk";                                                  
_T('_time','GMT09-30'),//(GMT+09:30) Adelaide";				//"(GMT+09:00) Seoul";                                                  
_T('_time','GMT09-30_1'),//(GMT+09:30) Darwin"; 					//"(GMT+09:30) Adelaide";                                               
_T('_time','GMT10-00'),//(GMT+10:00) Brisbane"; 				//"(GMT+09:30) Darwin";                                                 
_T('_time','GMT10-00_1'),//(GMT+10:00) Canberra, Melbourne, Sydney"; //"(GMT+10:00) Brisbane";                                   
_T('_time','GMT10-00_2'),//(GMT+10:00) Yakutsk";					//"(GMT+10:00) Canberra, Melbourne, Sydney";                            
_T('_time','GMT10-00_3'),//(GMT+10:00) Hobart";					//"(GMT+10:00) Vladivostok";                                            

_T('_time','GMT10-00_4'),//(GMT+10:00) Guam, Port Moresby";		//"(GMT+10:00) Hobart";                                           
_T('_time','GMT11-00'),//(GMT+11:00) Vladivostok";				//"(GMT+10:00) Guam, Port Moresby";                                   
_T('_time','GMT11-00_1'),// (GMT+11:00) Solomon Is., New Caledonia";	
_T('_time','GMT12-00'),//(GMT+12:00) Magadan";
_T('_time','GMT12-00_1'),//(GMT+12:00) Petropavlovsk-Kamchatsky";                                                                
_T('_time','GMT12-00_2'),//(GMT+12:00) UTC+12";                                                                                  
_T('_time','GMT12-00_3'),//(GMT+12:00) Fiji";                                                                      
_T('_time','GMT12-00_4'),//(GMT+12:00) Auckland, Wellington";                                                                    
_T('_time','GMT13-00'),//(GMT+13:00) Nuku'alofa";                                                                              	
_T('_time','GMT13-00_1')//(GMT+13:00) Samoa";
	);

			$('#id_timezone').html(time_array[timezone-1]);	
			$('#id_timezone').attr("rel",timezone);
}

function ready_time()
{
		$("#id_ntp_main_top").find(".option_list ul li a").click(function() {	
			var v = $(this).text();		
			$("#settings_generalNTPServer_text").val(v);	
		});
						
	/*-----------------------------------------------------------------------------
	*/
	
	/*-----------------------------------------------------------------------------
	*/
	$("#settings_generalTimeZoneSave_button").click(function(){	
			
		var timezone_value = $("#id_timezone").attr("rel");		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_timezone",f_timezone:timezone_value},
			cache:false,
			async:true,
			success:function(){					

					jLoadingClose();
					hide('settings_generalTimeZoneSave_button');
			
					xml_load_t();				
				}			
		});
		return false;
	});
	
	/*-----------------------------------------------------------------------------
	*/
	
	
}

function save_pc()
{		
		$("#hd_time_Diag").overlay().close();		
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
		
		var now = new Date();	 		 
		var year = now.getFullYear();	
		var mon = now.getMonth()+1;
		var day = now.getDate();  
		var hour = now.getHours()
		var min = now.getMinutes()   
		var sec = now.getSeconds()    
	
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_manual_time",f_year:year,f_month:mon,f_day:day,f_hour:hour,f_min:min,f_sec:sec},
			cache:false,
			async:true,
			success:function(){							
					jLoadingClose();
					jAlert(_T('_common','update_success') + "<br><br>" + _T('_time','msg4'), _T('_common','success'));
					xml_load_t();				
				}
		});
}

function xml_load_t()
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
				var timezone = $(this).find('timezone').text();
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
						hide('time_detail');
						show('ntp_set_tb');
				}
				else
				{
						
					show('time_detail');			
					hide('ntp_set_tb');
				}	
													
				time_mapping(timezone);						
				$('#id_timeout').html(idle+" "+_T('_common','minutes'));					
				
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
				$( "#settings_generalDTDatepicker_text" ).datepicker( "option", "dateFormat", datepicker_date_format);
				
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
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }
	});
}
function xml_status()
{	
	if ($("#settings_generalNTPServer_text").val() == "")
	{	
		//jAlert(_T('_common','update_success'), _T('_common','success'));
		document.getElementById("id_status").innerHTML  = ""	
	}
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_time_status",	
		dataType: "xml",	
		success: function(xml){			
			$(xml).find('time').each(function(){
			
				var status = $(this).find('status').text();
				if (status == "done")
				{					
						document.getElementById("id_status").innerHTML  = _T('_common','success');												
						$("#hd_ntp_Diag").overlay().close();						
				}	
				else
				{												 
					document.getElementById("id_status").innerHTML = _T('_time','msg1');				
					jAlert(_T('_time','msg1'), _T('_common','error'));
				}	
			 }); 
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }  

	});	
}

function   isDate(xx)  
{  
//	x=new   Date(xx)  
//	if(isNaN(x) || xx.length!=10)
//	{
//	   jAlert(_T('_time','msg2'), _T('_common','error'));
//	   return 1;
//	}
	return 0;
}  
	
	
function writeTimeout()
{
	
			$('#id_timeout_top_main').empty();				
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_generalTimeout_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_timeout\" rel=\""+_g_idle+"\">"+_g_idle+" "+_T('_common','minutes')+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_timeout_li'>"
				my_html_options+="<div class='scrollbar_idle'>";
				my_html_options+="<li id='settings_generalTimeoutLi1_select' class=\"li_start\" rel=\"5\"><a href='#' onclick='set_idle(\""+5+"\");'>5 "+_T('_common','minutes')+"</a>";									
				var j = 1;
				for (var i = 6;i<30;i++)
				{		
					j++;	
					my_html_options+="<li id='settings_generalTimeoutLi"+j+"_select' rel=\""+i+"\"><a href='#' onclick='set_idle(\""+i+"\");'>"+i+" "+_T('_common','minutes')+"</a>";		
					
				}
				var e = j+1;
				my_html_options+="<li id='settings_generalTimeoutLi"+e+"_select' class=\"li_end\" rel='30'><a href='#' onclick='set_idle(\""+30+"\");'>30 "+_T('_common','minutes')+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";											
				$("#id_timeout_top_main").append(my_html_options);	
}	
	
function writeTimeZoneSelector()
{
	var time_array = [
			{id:"1",tz:_T('_time','GMT-12-00')},	//(GMT-12:00) International Data Line West"
			{id:"2",tz:_T('_time','GMT-11-00')},	//(GMT-11:00) UTC-11"
			{id:"3",tz:_T('_time','GMT-10-00')},	//(GMT-10:00) Hawaii"
            {id:"4",tz:_T('_time','GMT-09-00')},	//(GMT-09:00) Alaska"
            {id:"5",tz:_T('_time','GMT-08-00')},	//(GMT-08:00) Baja California"
            {id:"6",tz:_T('_time','GMT-08-00_1')},	//(GMT-08:00) Pacific Time (US &amp; Canada)"
            {id:"7",tz:_T('_time','GMT-07-00')},	//(GMT-07:00) Mountain Time (US &amp; Canada)"
            {id:"8",tz:_T('_time','GMT-07-00_1')},	//(GMT-07:00) Arizona"
            {id:"9",tz:_T('_time','GMT-07-00_2')},	//(GMT-07:00) Chihuahua, La Paz, Mazatlan"
            {id:"10",tz:_T('_time','GMT-06-00')},	//(GMT-06:00) Central America"
            {id:"11",tz:_T('_time','GMT-06-00_1')},	//(GMT-06:00) Central Time (US &amp; Canada)"
            {id:"12",tz:_T('_time','GMT-06-00_2')},	//(GMT-06:00) Guadalajara, Mexico City, Monterrey"
            {id:"13",tz:_T('_time','GMT-06-00_3')},	//(GMT-06:00) Saskatchewan"
            {id:"14",tz:_T('_time','GMT-05-00')},	//(GMT-05:00) Indiana (East)"
            {id:"15",tz:_T('_time','GMT-05-00_1')},	//(GMT-05:00) Eastern Time (US &amp; Canada)"
            {id:"16",tz:_T('_time','GMT-09-00_2')},	//(GMT-05:00) Bogota, Lima, Quito"
            {id:"17",tz:_T('_time','GMT-04-30')},	//(GMT-04:30) Caracas"
            {id:"18",tz:_T('_time','GMT-04-00')},	//(GMT-04:00) Atlantic Time (Canada)"
            {id:"19",tz:_T('_time','GMT-04-00_4')},	//(GMT-04:00) Cuiaba"
            {id:"20",tz:_T('_time','GMT-04-00_1')},	//(GMT-04:00) Georgetown, La Paz, Manaus, San Juan"
            {id:"21",tz:_T('_time','GMT-04-00_2')},	//(GMT-04:00) Asuncion"
            {id:"22",tz:_T('_time','GMT-04-00_3')},	//(GMT-04:00) Santiago"
            {id:"23",tz:_T('_time','GMT-03-30')},	//(GMT-03:30) Newfoundland"
            {id:"24",tz:_T('_time','GMT-03-00')},	//(GMT-03:00) Brasilia"; 
            {id:"25",tz:_T('_time','GMT-03-00_1')},	//(GMT-03:00) Buenos Aires"
            {id:"26",tz:_T('_time','GMT-03-00_2')},	//(GMT-03:00) Greenland"
            {id:"27",tz:_T('_time','GMT-03-00_3')},	//(GMT-03:00) Cayenne, Fortaleza"
            {id:"28",tz:_T('_time','GMT-03-00_4')},	//(GMT-03:00) Montevideo"
            {id:"29",tz:_T('_time','GMT-02-00')},	//(GMT-02:00) Mid-Atlantic"
            {id:"30",tz:_T('_time','GMT-02-00_1')},	//(GMT-02:00) UTC-2"
            {id:"31",tz:_T('_time','GMT-01-00')},	//(GMT-01:00) Azores"
            {id:"32",tz:_T('_time','GMT-01-00_1')},	//(GMT-01:00) Cape Verde Is."
            {id:"33",tz:_T('_time','GMT')},			//(GMT) Casablanca"
            {id:"34",tz:_T('_time','GMT_1')},		//(GMT) Greenwich Mean Time"
            {id:"35",tz:_T('_time','GMT_3')},		//(GMT) Dublin, Edinburgh, Lisbon, London"
            {id:"36",tz:_T('_time','GMT_2')},		//(GMT) Monrovia, Reykjavik"
            {id:"37",tz:_T('_time','GMT01-00')},	//(GMT+01:00) West Central Africa"
            {id:"38",tz:_T('_time','GMT01-00_1')},	//(GMT+01:00) Brussels, Copenhagen, Madrid, Paris"
            {id:"39",tz:_T('_time','GMT01-00_2')},	//(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague"
            {id:"40",tz:_T('_time','GMT01-00_3')},	//(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"
            {id:"41",tz:_T('_time','GMT01-00_4')},	//(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb"
            {id:"42",tz:_T('_time','GMT01-00_5')},	//(GMT+01:00) Windhoek"
            {id:"43",tz:_T('_time','GMT02-00_9')},	//(GMT+02:00) Damascus"
            {id:"44",tz:_T('_time','GMT02-00_10')},	//(GMT+02:00) Nicosia"
            {id:"45",tz:_T('_time','GMT02-00_11')},	//(GMT+02:00) Istanbul"
            {id:"46",tz:_T('_time','GMT02-00')},	//(GMT+02:00) Amman"
            {id:"47",tz:_T('_time','GMT02-00_1')},	//(GMT+02:00) Beirut"
            {id:"48",tz:_T('_time','GMT02-00_3')},	//(GMT+02:00) Harare, Pretoria"
            {id:"49",tz:_T('_time','GMT02-00_4')},	//(GMT+02:00) Jerusalem"
            {id:"50",tz:_T('_time','GMT02-00_5')},	//(GMT+02:00) Cairo"
            {id:"51",tz:_T('_time','GMT02-00_6')},	//(GMT+02:00) Athens, Bucharest"
            {id:"52",tz:_T('_time','GMT02-00_8')},	//(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius"
            {id:"53",tz:_T('_time','GMT03-00')},	//(GMT+03:00) Baghdad"
            {id:"54",tz:_T('_time','GMT03-00_3')},	//(GMT+03:00) Kaliningrad, Minsk"
            {id:"55",tz:_T('_time','GMT03-00_1')},	//(GMT+03:00) Nairobi"
            {id:"56",tz:_T('_time','GMT03-00_2')},	//(GMT+03:00) Kuwait, Riyadh"
			{id:"61",tz:_T('_time','GMT03-00_4')},	//(GMT+03:00) Moscow, St. Petersburg, Volgograd"
            {id:"57",tz:_T('_time','GMT03-30')},	//(GMT+03:30) Tehran"
            {id:"58",tz:_T('_time','GMT04-00')},	//(GMT+04:00) Baku"
            {id:"59",tz:_T('_time','GMT04-00_1')},	//(GMT+04:00) Abu Dhabi, Muscat"
            {id:"60",tz:_T('_time','GMT04-00_2')},	//(GMT+04:00) Tbilisi"
            {id:"62",tz:_T('_time','GMT04-00_3')},	//(GMT+04:00) Yerevan"
            {id:"63",tz:_T('_time','GMT04-00_4')},	//(GMT+04:00) Port Louis"
            {id:"64",tz:_T('_time','GMT04-30')},	//(GMT+04:30) Kabul"
            {id:"65",tz:_T('_time','GMT05-00_1')},	//(GMT+05:00) Islamabad, Karachi"
            {id:"66",tz:_T('_time','GMT05-00_2')},	//(GMT+05:00) Tashkent"
            {id:"67",tz:_T('_time','GMT05-30')},	//(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"
            {id:"68",tz:_T('_time','GMT05-30_1')},	//(GMT+05:30) Sri Jayawardenepura"
            {id:"69",tz:_T('_time','GMT05-45')},	//(GMT+05:45) Kathmandu"
            {id:"70",tz:_T('_time','GMT06-00_3')},	//(GMT+06:00) Ekaterinburg"
            {id:"71",tz:_T('_time','GMT06-00')},	//(GMT+06:00) Astana"
            {id:"72",tz:_T('_time','GMT06-00_2')},	//(GMT+06:00) Dhaka"
            {id:"73",tz:_T('_time','GMT06-30')},	//(GMT+06:30) Yangon (Rangoon)"
            {id:"74",tz:_T('_time','GMT07-00_1')},	//(GMT+07:00) Bangkok, Hanoi, Jakarta"
            {id:"75",tz:_T('_time','GMT07-00_2')},	//(GMT+07:00) Novosibirsk"
            {id:"76",tz:_T('_time','GMT08-00')},	//(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi"
            {id:"77",tz:_T('_time','GMT08-00_1')},	//(GMT+08:00) Taipei"
            {id:"78",tz:_T('_time','GMT08-00_2')},	//(GMT+08:00) Kuala Lumpur, Singapore";	//"(GMT+08:00) Irkutsk"
            {id:"79",tz:_T('_time','GMT08-00_3')},	//(GMT+08:00) Perth"; 					//"(GMT+08:00) Kuala Lumpur, Singapore"
            {id:"80",tz:_T('_time','GMT08-00_5')},	//(GMT+08:00) Krasnoyarsk
            {id:"81",tz:_T('_time','GMT08-00_4')},	//(GMT+08:00) Ulaan Bataar";			//"(GMT+08:00) Perth"
            {id:"82",tz:_T('_time','GMT09-00')},	//(GMT+09:00) Osaka, Sapporo, Tokyo"; 	//"(GMT+08:00) Ulaan Bataar"
            {id:"83",tz:_T('_time','GMT09-00_1')},	//(GMT+09:00) Irkutsk"; 				//"(GMT+09:00) Osaka, Sapporo, Tokyo"
            {id:"84",tz:_T('_time','GMT09-00_2')},	//(GMT+09:00) Seoul";					//"(GMT+09:00) Yakutsk"
            {id:"85",tz:_T('_time','GMT09-30')},	//(GMT+09:30) Adelaide";				//"(GMT+09:00) Seoul";
            {id:"86",tz:_T('_time','GMT09-30_1')},	//(GMT+09:30) Darwin"; 					//"(GMT+09:30) Adelaide"
            {id:"87",tz:_T('_time','GMT10-00')},	//(GMT+10:00) Brisbane"; 				//"(GMT+09:30) Darwin"
            {id:"88",tz:_T('_time','GMT10-00_1')},	//(GMT+10:00) Canberra, Melbourne, Sydney"; //"(GMT+10:00) Brisbane"
            {id:"89",tz:_T('_time','GMT10-00_2')},	//(GMT+10:00) Yakutsk";					//"(GMT+10:00) Canberra, Melbourne, Sydney";
            {id:"90",tz:_T('_time','GMT10-00_3')},	//(GMT+10:00) Hobart";					//"(GMT+10:00) Vladivostok"
            {id:"91",tz:_T('_time','GMT10-00_4')},	//(GMT+10:00) Guam, Port Moresby";		//"(GMT+10:00) Hobart"
            {id:"92",tz:_T('_time','GMT11-00')},	//(GMT+11:00) Vladivostok";				//"(GMT+10:00) Guam, Port Moresby";
            {id:"93",tz:_T('_time','GMT11-00_1')},	//(GMT+11:00) Solomon Is., New Caledonia"
            {id:"94",tz:_T('_time','GMT12-00')},	//(GMT+12:00) Magadan"
			{id:"95",tz:_T('_time','GMT12-00_1')},	//(GMT+12:00) Petropavlovsk-Kamchatsky"
			{id:"96",tz:_T('_time','GMT12-00_2')},	//(GMT+12:00) UTC+12"
			{id:"97",tz:_T('_time','GMT12-00_3')},	//(GMT+12:00) Fiji"
			{id:"98",tz:_T('_time','GMT12-00_4')},	//(GMT+12:00) Auckland, Wellington"
			{id:"99",tz:_T('_time','GMT13-00')},	//(GMT+13:00) Nuku'alofa"
			{id:"100",tz:_T('_time','GMT13-00_1')}	//(GMT+13:00) Samoa"
	];

	$('#id_timezone_top_main').empty();
	var my_html_options="";
	my_html_options+="<ul>";
	my_html_options+="<li class='option_list'>";
	my_html_options+="<div id=\"settings_generalTimeZone_select\" class=\"edit_select wd_select option_selected\" >";
	my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
	my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_timezone\"></div>";
	my_html_options+="<div class=\"sRight wd_select_r\"></div>";
	my_html_options+="</div>";
	my_html_options+="<ul class='ul_obj' id='id_timezone_li' style='height:300px;'>"	
	my_html_options+='<div class="scrollbar_timezone">';

	$.each(time_array, function(){
		my_html_options+="<li id=\"settings_generalTimeZoneLi"+this.id+"_select\" rel=\""+this.id+"\"><a href='#' onclick='show(\"settings_generalTimeZoneSave_button\");'>"+this.tz+"</a>";
	});

	my_html_options+="</div>";	
	my_html_options+="</ul>";
	my_html_options+="</li>";
	my_html_options+="</ul>";

	$("#id_timezone_top_main").append(my_html_options);

	time_mapping(_g_timezone);
	$(this).addClass('hovered_item');
}


function manual_time(){	
			
		var date_tmp = $("#settings_generalDTDatepicker_text").val();	
		if (isDate(date_tmp) == 1)return;
				
		//e.g. 2013/10/05
		if (DATE_FORMAT == "YYYY-MM-DD")
		{
				$("#f_year").val(date_tmp.substring(0,4));
				$("#f_month").val(date_tmp.charAt(5)+date_tmp.charAt(6));
				$("#f_day").val(date_tmp.charAt(8)+date_tmp.charAt(9));				
		}				
		else if (DATE_FORMAT == "MM-DD-YYYY")
		{	
					$("#f_year").val(date_tmp.substring(6,date_tmp.length));
				$("#f_month").val(date_tmp.charAt(0)+date_tmp.charAt(1));
				$("#f_day").val(date_tmp.charAt(3)+date_tmp.charAt(4));			
		}			
		else if (DATE_FORMAT == "DD-MM-YYYY")
		{
		$("#f_year").val(date_tmp.substring(6,date_tmp.length));
				$("#f_month").val(date_tmp.charAt(3)+date_tmp.charAt(4));
				$("#f_day").val(date_tmp.charAt(0)+date_tmp.charAt(1));			
		}												
		y = $("#f_year").val();
		m = $("#f_month").val();
		d = $("#f_day").val();
		var str = "year="+y+",month="+m+",day="+d
//alert(str);
	
//		if (date_tmp.charAt(4) == "/")
//		{
//				$("#f_year").val(date_tmp.substring(0,4));
//				$("#f_month").val(date_tmp.charAt(5)+date_tmp.charAt(6));
//				$("#f_day").val(date_tmp.charAt(8)+date_tmp.charAt(9));				
//		}				
//		else
//		{
//		$("#f_year").val(date_tmp.substring(6,date_tmp.length));
//				$("#f_month").val(date_tmp.charAt(3)+date_tmp.charAt(4));
//				$("#f_day").val(date_tmp.charAt(0)+date_tmp.charAt(1));			
//		}												
		var hour = $("#id_hour").text();
		
		if(TIME_FORMAT=="12")
		{
		var t = $("#id_pm").text();
		if (t == "PM")
		{
			if (hour!=12)
				hour = parseInt(hour,10)+12;		
		}		
		else
		{
			if (hour==12)
				hour = 0;
		}	
		}
		
		
var str = "day="+$("#f_day").val();
str+= ",month="+$("#f_month").val();		
str+= ",year="+$("#f_year").val();		
str+= ",day="+$("#f_day").text();		
		str+= ",hour="+	hour	
str+= ",min="+$("#id_min").text();		
str+= ",sec="+$("#id_sec").text();		

//alert(str);
//return;
		$("#hd_time_Diag").overlay().close();
				
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_manual_time",f_year:$("#f_year").val(),f_month:$("#f_month").val(),f_day:$("#f_day").val(),f_hour:hour,f_min:$("#id_min").text(),f_sec:0},
			cache:false,
			async:true,
			success:function(){
				
					jLoadingClose();
					jAlert(_T('_common','update_success') + "<br><br>" + _T('_time','msg4'), _T('_common','success'));
					xml_load_t();			
				}			
		});
	
	return false;
	}
function drawTime(format)
{		
	clearTimeout(loop_time);
	TIME_FORMAT = format;
	var time = new Date();
	time.setYear(__year);
	time.setMonth(__mon-1);		
	time.setDate(__day);
	time.setHours(__hour);
	time.setMinutes(__min);
	time.setSeconds(__sec);

	var str="";
	if(format=="12") 
	{
		str = time.toString(Date.CultureInfo.formatPatterns.fullDateTime.replace(/H/g,"h"));		
	}
	else
	{
		var tmp = Date.CultureInfo.formatPatterns.fullDateTime.replace(/tt/g,"").replace(/h/g,"H");
		str = time.toString(tmp);
	}
	str = str.replace(/\'/g, '');	
  $('#settings_generalDateTime_value').html(str); 
  __sec++; 
	loop_time = setTimeout(function(){drawTime(format)},1000);	
}

function set_time_format(format)
{
	//format 12 or 24
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_time_format",f_time_format:format},
		cache:false,
		async:true,
		success:function(){					
			drawTime(format);
			TIME_FORMAT = format;
			
			if (format == "12")
				google_analytics_log('time-format', '0');	
			else if (format == "24")
				google_analytics_log('time-format', '1');	
				
			jLoadingClose();
		}			
	});	
				 	 
}
function set_date_format(format)
{
	if (DATE_FORMAT == format) return;
	//format 12 or 24
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	if (DATE_FORMAT == "YYYY-MM-DD")
	{
		google_analytics_log('date-format-ymd', '0');	
		
		if (format == "MM-DD-YYYY")
		{
			google_analytics_log('date-format-dmy', '0');
		}
		else if (format == "DD-MM-YYYY")
		{
			google_analytics_log('date-format-mdy', '0');
		}	
		
	}
	else if (DATE_FORMAT == "MM-DD-YYYY")
	{
		google_analytics_log('date-format-mdy', '0');	
		
		if (format == "YYYY-MM-DD")
		{
			google_analytics_log('date-format-dmy', '0');
		}
		else if (format == "DD-MM-YYYY")
		{
			google_analytics_log('date-format-ymd', '0');
		}	
	}	
	else if (DATE_FORMAT == "DD-MM-YYYY")
	{
		google_analytics_log('date-format-dmy', '0');	
		
		if (format == "YYYY-MM-DD")
		{
			google_analytics_log('date-format-mdy', '0');
		}
		else if (format == "MM-DD-YYYY")
		{
			google_analytics_log('date-format-ymd', '0');
		}	
	}	
			
	
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_date_format",f_date_format:encodeURIComponent(format)},
		cache:false,
		async:true,
		success:function(){							
			DATE_FORMAT = format;
			jLoadingClose();
			xml_load_t();	
			date_init();
			
			if (format == "YYYY-MM-DD")
			{
				google_analytics_log('date-format-ymd', '1');	
			}
			else if (format == "MM-DD-YYYY")
			{
				google_analytics_log('date-format-mdy', '1');	
			}	
			else if (format == "DD-MM-YYYY")
			{
				google_analytics_log('date-format-dmy', '1');	
			}	
		}			
	});	
				 	 
}