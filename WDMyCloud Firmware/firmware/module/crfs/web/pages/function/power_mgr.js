var myOptions;
var myOptions_off;
var _ERROR_NUM = 0;
var _g_turn_off_time;
var _g_oled_time;
var _g_power_sch = "";

function ready_power_mgr()
{	
	$("#settings_generalPowerSave_button").click(function(){	
		power_save();
	});
	
	$("#fan_button").click(function(){		
		
	
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_fan",f_fan_type:$("#f_fan_type").val()},
			cache:false,
			async:true,
			success:function(){
				
				}
		});
		jAlert(_T('_common','update_success'), _T('_common','success'));
	});		
	$("#hibernation_button").click(function(){		
		
		//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
		//overlayObj.load();
		jLoading(_T('_common','set') ,'loading' ,'s',"");
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_power_management",f_hdd_hibernation_enable:($("input[name='f_hdd_hibernation_enable']")[0].checked == true?1:0),f_turn_off_time:$("#f_turn_off_time").val()},
			cache:false,
			async:true,			
			//success:function(){setTimeout(function(){overlayObj.close();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);}			
			success:function(){setTimeout(function(){jLoadingClose();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);}			
		});
		return false;
	});
						
			$("#hd_sleep_save").click(function(){
					var v = getSwitch('#settings_generalDriveSleep_switch');
					var t = $("#id_hd_sleep").attr("rel");
//alert("enable="+v+",sleep="+t);
//return;					
					_g_turn_off_time = t;					
					jLoading(_T('_common','set') ,'loading' ,'s',"");
					_DIALOG = "";		
				wd_ajax({
					type:"POST",
					url:"/cgi-bin/system_mgr.cgi",
					data:{cmd:"cgi_power_management",f_hdd_hibernation_enable:v,f_turn_off_time:t},
					cache:false,
					async:true,			
					//success:function(){setTimeout(function(){overlayObj.close();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);}			
					success:function(){setTimeout(function(){jLoadingClose();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);}			
				});	
			});									
			$("#oled_save").click(function(){
				
				var v = getSwitch('#oled_switch');
				var t = $("#id_oled").attr("rel");
//alert("enable="+v+",sleep="+t);
//return;			
					jLoading(_T('_common','set') ,'loading' ,'s',"");
					_DIALOG = "";		
										
					wd_ajax({
								type:"POST",
								url:"/cgi-bin/system_mgr.cgi",
								data:{cmd:"cgi_led",f_led_enable:v,f_time:t},
								cache:false,
								async:true,
								success:function(){
									setTimeout(function(){
											jLoadingClose();
											jAlert(_T('_common','update_success'), _T('_common','success'));},2000);
									}			
							});
				
			});			
				$("#oled_switch").click(function(){
				
				var v = getSwitch('#oled_switch');
				var t = _g_oled_time;
				init_oled_detail();
//alert("enable="+v+",sleep="+t);
//return;				
					wd_ajax({
								type:"POST",
								url:"/cgi-bin/system_mgr.cgi",
								data:{cmd:"cgi_led",f_led_enable:v,f_time:t},
								cache:false,
								async:true,
								success:function(){
									//setTimeout(function(){
									//	jLoadingClose();
									//	jAlert(_T('_common','update_success'), _T('_common','success'));},2000);
									}			
							});
				
			});			
}
	
function init_hd_sleep_detail()
{
	var v = getSwitch('#settings_generalDriveSleep_switch');
	if (v == 1)
		show("hd_sleep_switch_detail")
	else
		hide("hd_sleep_switch_detail")
}	
	
function init_oled_detail()
{
	var v = getSwitch('#oled_switch');
	if (v == 1)
		show("oled_switch_detail")
	else
		hide("oled_switch_detail")
}
function enable_power(on_off)
{			
	wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_power_sch_enable",enable:on_off},
			cache:false,
			async:true,
			success:function(data){			
				google_analytics_log('power-sched-en',on_off);	
			},
			error:function(){
			}
		});
		
	

}


function set_led()
{
		var v = getSwitch('#settings_generalLed_switch')					
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=cgi_led&f_led_enable="+v,
			success: function(data){				
				//setTimeout(function(){hide2('id_idle_save');jLoadingClose();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);
			}			
		});
}

function set_lcd()
{
		var v = getSwitch('#settings_generalLcd_switch')			
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=cgi_lcd&enable="+v,
			success: function(data){		
				
				//setTimeout(function(){hide2('id_idle_save');jLoadingClose();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);
			}			
		});
}function power_cancel()
{		
	if (_g_power_sch == 0)
	{
		hide('power_on_off_switch_detail');
	}
	setSwitch('#settings_generalPowerSch_switch',_g_power_sch);
}

function power_on_off(id)
{
	//var v = $(this).attr("id");
	//alert(id);
	
	if ($("#"+id).hasClass("power_sch_on"))
	{
		$("#"+id).removeClass("power_sch_on").addClass("power_sch_off")
	}
	else
		$("#"+id).removeClass("power_sch_off").addClass("power_sch_on")

}

function show_time(index)
{
	for (var i = 1;i<8;i++)
	{
		$("#id_time"+i).hide();
	}
	$("#id_time"+index).show();
	
	var j;
	if (index == 7)
	{
		j = 0;			
	}
	else
	{
		j = index;
	}	
	$(".mwt_border .arrow_t_out").css("left",60+j*72+'px');
	$(".mwt_border .arrow_t_int").css("left",60+j*72+'px');	
	
	var k = 0;
	var day  = new Array("settings_generalPowerSun","settings_generalPowerMon","settings_generalPowerTue","settings_generalPowerWed","settings_generalPowerThu","settings_generalPowerFri","settings_generalPowerSat");
	
	for (var t = 0;t<7;t++)
	{
		var on = 0;
		var off = 0;
		for (var i = 12*k;i<12*(k+1);i++)
		{
			if ($("#settings_power"+parseInt(i+1)+"_button").hasClass("power_sch_off"))
			{				
				off++;
			}
			else
			{				
				on++
			}						
		}

		$("#"+day[t]).removeClass("power_sch_on").removeClass("power_sch_empty").removeClass("power_sch_half");
		if (on == 12)
			$("#"+day[t]).addClass("power_sch_on")
		else if(off == 12)
			$("#"+day[t]).addClass("power_sch_empty")
		else
			$("#"+day[t]).addClass("power_sch_half")
				
		k++;
	}	
	
}


function power_init()
{
	var v_sch = "";
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_power_mgr_xml",	
		async: false,
		cache: false,
		dataType: "html",	
		success: function(data){			
				v_sch = data;
			},
		 error:function(xmlHttpRequest,error){   
  		 }  
	});

	
//	v_sch = "0,0,1,1,0,0,0,0,0,0,0,0";//sun
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //1 
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //2
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //3
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //4
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //5
//	v_sch += ",0,0,0,0,0,0,0,0,0,0,0,0"; //6
	
	
	var sch_array = v_sch.split(","); 
	var i = 0;
	var j = 0;
	var k = 0;
	var day  = new Array("settings_generalPowerSun","settings_generalPowerMon","settings_generalPowerTue","settings_generalPowerWed","settings_generalPowerThu","settings_generalPowerFri","settings_generalPowerSat");
	
	for (var t = 0;t<7;t++)
	{
		var on = 0;
		var off = 0;
		for (var i = 12*k;i<12*(k+1);i++)
		{
			if (sch_array[i] == 0)
			{
				$("#settings_power"+(i+1)+"_button").addClass("power_sch_off")
				off++;
			}
			else
			{
				$("#settings_power"+(i+1)+"_button").addClass("power_sch_on")
				on++
			}						
		}
		$("#"+day[t]).removeClass("power_sch_on").removeClass("power_sch_empty").removeClass("power_sch_half");
		if (on == 12)
			$("#"+day[t]).addClass("power_sch_on")
		else if(off == 12)
			$("#"+day[t]).addClass("power_sch_empty")
		else
			$("#"+day[t]).addClass("power_sch_half")
				
		k++;
	}	
}
function power_save()
{
	var str = "";
	for (var i = 1;i<85;i++)
	{
		if ($("#settings_power"+i+"_button").hasClass("power_sch_off"))
		{
			if (i == 84)		
				str+="0";
			else	
				str+="0,";
		}	
		else	
		{	
			if (i == 84)
				str+="1";
			else
				str+="1,";	
		}	
	}
	
	var command = "cmd=cgi_power_sch&enable=1&schedule="+str;
	
	$("#power_Diag").overlay().close();
	jLoading(_T('_common','set'), 'loading' ,'s',"");
		
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:command,
			cache:false,
			async:true,
			success:function(data){			
				jLoadingClose();
				google_analytics_log('power-sched-en',"1");	
				_g_power_sch = 1;
			},
			error:function(){
			}
		});
}

function power_draw_tb()
{
	
	var tb_name = new Array("id_time7","id_time1","id_time2","id_time3","id_time4","id_time5","id_time6");
	var str = "";	
	for (var i = 0;i<7;i++)
	{
		str += 	'<table id="'+tb_name[i]+'"  class="tbl" border="0" cellspacing="0" cellpadding="0" height="0" style="display:none">';
		str += 	'<tr>';
		str += 	'<td width="32" align="center" ></td>';
		str +=	'<td width="30" align="center" ></td>';
		str +=	'<td width="40" align="center" ></td>';
		str +=  '<td width="72" align="center" >12-2</td>';
		str +=  '<td width="72" align="center" >2-4</td>';
		str +=  '<td width="72" align="center" >4-6</td>';
		str +=  '<td width="72" align="center" >6-8</td>';
		str +=  '<td width="72" align="center" >8-10</td>';
		str +=  '<td width="72" align="center" >10-12</td>';
		str +=	'</tr>';
		str +=	'<tr>';
		str +=	'<td><img src="/web/images/icon/power_sch/icon-schedule-am.png" width=32 height=32></td>';
		str +=	'<td>AM</td>';
		str +=	'<td></td>';		
		str +=	'<td><div id="settings_power'+parseInt(1+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(2+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(3+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(4+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(5+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(6+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'</tr>';
		str +=	'<tr>';
		str +=	'<td><img src="/web/images/icon/power_sch/icon-schedule-pm.png" width=32 height=32></td>';
		str +=	'<td>PM</td>';
		str +=	'<td></td>';
		str +=	'<td><div id="settings_power'+parseInt(7+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';
		str +=	'<td><div id="settings_power'+parseInt(8+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';																
		str +=	'<td><div id="settings_power'+parseInt(9+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';															
		str +=	'<td><div id="settings_power'+parseInt(10+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';							
		str +=	'<td><div id="settings_power'+parseInt(11+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';							
		str +=	'<td><div id="settings_power'+parseInt(12+i*12,10)+'_button" onclick="power_on_off(this.id)"></div></td>';																				
		str +=	'</tr>';
		str +=	'</table>';
	}	
	$("#power_tb_content").html(str);
	power_init();
	$("#id_time7").show();	
	$(".mwt_border .arrow_t_out").css("left",60);
	$(".mwt_border .arrow_t_int").css("left",60);	
	setTimeout(function(){
	$("#power_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();
	},200);

}