function set_jumbo(lan)
{
	var jumbo_mtu = $("#settings_networkJumbo" + lan+"_select").attr('rel');
	var jumbo_enable = 1;
	if(jumbo_mtu=='1500')  jumbo_enable=0;
	
	var url ="/cgi-bin/network_mgr.cgi?cmd=cgi_jumbo";
		url+="&f_jumbo_enable=" + jumbo_enable + "&f_mtu=" + jumbo_mtu+"&lan=lan" + lan;

	jLoading(_T('_common','set'), 'loading' ,'s',"");
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			jLoadingClose();
			google_analytics_log('jumbo-frame-en',jumbo_enable);
			show_button("#settings_networkJumboSave" + lan+"_button","0");
		}
	});
}
function set_speed(lan)
{
	var lan0_speed = $("#settings_networkSpeed0_select").attr("rel");
	var lan1_speed = $("#settings_networkSpeed1_select").attr("rel");
	
	var url ="/cgi-bin/network_mgr.cgi?cmd=cgi_speed";
		url+="&lan0=" + lan0_speed;

	if(LAN_PORT_NUM!=1)
		url+="&lan1=" + lan1_speed;

	jLoading(_T('_common','set'), 'loading' ,'s',"");
	
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			jLoadingClose();
			show_button("#settings_networkSpeedSave" + lan+"_button","0");
		}
	});
}
var _IPV4_IP=new Array();
var _IPV4_NETMASK = new Array();
var _IPV4_DNS = new Array();
var _BONDING_ENABLE = "";
function get_ipv4_info()
{
	var _mac_array = new Array();
	var _ip_array = new Array();
	var _dns_array = new Array();
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_lan_xml",
			cache:false,
			dataType: "xml",
			success: function(xml) {
				
				var default_gw = $(xml).find('default_gw').text();
				var bonding_enable = $(xml).find('bonding_enable').text();
				var bonding_mode = $(xml).find('bonding_mode').text();
				var lltd_enable = $(xml).find('lltd_enable').text();
				
				_BONDING_ENABLE = bonding_enable;
				
				var gw_tmp = default_gw.replace(/lan0/g,_T('_lan','lan1')).replace(/lan1/g,_T('_lan','lan2'));
				
				reset_sel_item("#default_gw_main",gw_tmp ,default_gw);
				
				$("select[name='gw_select']").val(default_gw);
				
				var partener_speed = new Array();
				var lan_status = new Array();
				$(xml).find('partener_speed').each(function(index){
					var speed = $(this).text();
					partener_speed.push(speed);
				});	
				
				$(xml).find('lan_status').each(function(index){
					var status = $(this).text();
					lan_status.push(status);
				});
								
				//lltd
				setSwitch('#settings_networkLLTD_switch',lltd_enable);
				
				//bonding
				if(bonding_enable=="0" && LAN_PORT_NUM==2)
				{
					$("#ipv4_lan0").show();
					$("#ipv4_lan1").show();
					if(IPV6_FUNCTION==1)
					{
					$("#ipv6_lan0").show();
					$("#ipv6_lan1").show();
					}
					$("#gw_tr").show();
				}
				else
				{
					$("#ipv4_lan0").show();
					$("#ipv4_lan1").hide();
					
					if(IPV6_FUNCTION==1)
					{
					$("#ipv6_lan0").show();
					$("#ipv6_lan1").hide();
					}
					$("#gw_tr").hide();
				}
				/*
				//bonding
				if (bonding_enable=="1")
				{
					$("input[name='bonding_enable']").eq(0).attr("checked",true);
					$("input[name='f_default_gw']").eq(1).attr("disabled",true);
					$("input[name='f_default_gw']").eq(0).attr("checked",true);
					//$("select[name='gw_select']").attr("disabled",true);
					//$("select[name='gw_select']").val("lan0");
				}
				else
					$("input[name='bonding_enable']").eq(1).attr("checked",true);
				
				chk_bonding(bonding_enable);
				*/
				
				//$("select[name='bonding_mode']").val(bonding_mode);

				//$("select[name='gw_select']").val(default_gw);
				/*
				if(default_gw=="lan0")
					$("input[name='f_default_gw']").eq(0).attr("checked",true);
				else
					$("input[name='f_default_gw']").eq(1).attr("checked",true);
				*/
				_IPV4_IP = new Array();											
				_IPV4_NETMASK = new Array();
				_IPV4_DNS = new Array();
				
				$("#mac_div").html("");
				$("#ipv4_address_div").html("");
				$("#ipv4_DNS_address_div").html("");
				$(xml).find('lan').each(function(index){

					var speed = $(this).find('speed').text();
					var dhcp_enable = $(this).find('dhcp_enable').text();
					var ip = $(this).find('ip').text();
					var netmask = $(this).find('netmask').text();
					var gw = $(this).find('gateway').text();
					var dns1 = $(this).find('dns1').text();
					var dns2 = $(this).find('dns2').text();
					var dns3 = $(this).find('dns3').text();
					var mac = $(this).find('mac').text();
					var jumbo_mtu = $(this).find('jumbo_mtu').text();
					var partener_speed = $(this).find('partener_speed').text();
					
					_IPV4_IP.push(ip);
					_IPV4_NETMASK.push(netmask);
					_IPV4_DNS.push(dns1);
					
					if(bonding_enable==1 && index==1)
						return true;
					
					if(LAN_PORT_NUM==1 && index==1) return true;
					
					if(index==0)
					{
						if(bonding_enable==1 || LAN_PORT_NUM==1)
						{
							$("#ipv4_lan0_title").html("IPv4 " + _T('_lan','network_mode'));
							$("#speed_title_lan0").html( _T('_lan','speed'));
							$("#jumbo_title_lan0").html( _T('_lan','jumbo_frame'));
						}
						else
						{
							$("#ipv4_lan0_title").html("IPv4 LAN1 " + _T('_lan','network_mode'));
							$("#speed_title_lan0").html( "LAN 1 " + _T('_lan','speed'));
							$("#jumbo_title_lan0").html( "LAN 1 " +  _T('_lan','jumbo_frame'));
						}
					}
					else
					{
						$("#ipv4_lan1_title").html("IPv4 LAN2 " + _T('_lan','network_mode'));
						$("#speed_title_lan1").html( "LAN 2 " + _T('_lan','speed'));
						$("#jumbo_title_lan1").html( "LAN 2 " +  _T('_lan','jumbo_frame'));
					}
					
					write_speed_option(bonding_enable,partener_speed,speed,index);
					write_jumbo_frame_mtu(jumbo_mtu,index);
					
					SetIPv4Mode("#IPv4Mode_" + index,dhcp_enable,index);
					
					//$("#mac_div").append(mac+"<br>");
					//$("#ipv4_address_div").append(ip+"<br>");
					_mac_array.push(mac);
					_ip_array.push(ip);
					if(partener_speed!=0)
					{
					if(dns1.length!=0)_dns_array.push(dns1);
					if(dns2.length!=0)_dns_array.push(dns2);
					if(dns3.length!=0)_dns_array.push(dns3);
					}
				});
				
				var dns_str="-";
				if(_dns_array.length!=0)
				{
					dns_str = _dns_array.toString().replace(/,/g," , ");
				}
				for(i in _ip_array)
				{
					var idx=i;
					if(lan_status[i]==0 && bonding_enable=="0")
					{
						idx++;
						_ip_array[i] = "LAN" + idx +" "+_T("_vv","desc16");	//Text:Disconnected
					}
				}
				$("#mac_div").append(_mac_array.toString().replace(/,/g," , "));
				$("#ipv4_address_div").append(_ip_array.toString().replace(/,/g," , "));
				$("#ipv4_DNS_address_div").append(dns_str);
			}
	});
}
		
function set_bonding()
{
	var bonding_enable =0;
	
	var bonding_mode = $("#settings_networkBonding_select").attr("rel");
	if(bonding_mode!="off") {bonding_enable=1;}

	var url ="/cgi-bin/network_mgr.cgi?cmd=cgi_bonding"
		url+="&bonding_enable=" + bonding_enable
		url+="&bonding_mode=" + bonding_mode

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			
	wd_ajax({
		type:"GET",
		cache:false,
		url:url,
		success: function(data){

		}
	});
	
	setTimeout(show_message,7000);
}
function show_message()
{
	jLoadingClose();
	
	jAlert(_T('_wizard','relogin_msg'), _T('_common','warning'),"",goto_login_page);
	
}
function goto_login_page()
{
	/*
	var goto_ip ="";	
	var bonding_enable = $("input:checked[name='bonding_enable']").val();
	if(bonding_enable==1)
		goto_ip = _IPV4_IP[0];
	else
	{
		var h = location.host;
		if(h==_IPV4_IP[0])	//lan0 enter
			goto_ip = _IPV4_IP[0];
		else
			goto_ip = _IPV4_IP[1];
	}*/
							
	do_logout();						
//				var h = location.host;
//				
//	h = h.split(":")
//	var url="";
//	if(h.length > 2)
//		url = "http://[" +location.host + "]";
//		else
//		url = "http://" + location.host;
//						
//	window.location=url;
		
}
function write_speed_option(bonding_enable,partener_speed,speed,lan)	//lan: 0,1
{
	$("#lan" + lan + "_speed").hide();
	
	/*if(MODEL_NAME=="BNEZ" || MODEL_NAME=="BBAZ")
	{
		if(LINK_SPEED_FUNCTION==1)
		{
		if(bonding_enable==0)
	{
		$("#lan" + lan + "_speed").show();
	}
		else
		{
			$("#lan" + lan + "_speed").hide();
		}
	}
	}
	else */if(LINK_SPEED_FUNCTION==1)
	{
		if(bonding_enable==1 && lan==1)
			$("#lan" + lan + "_speed").hide();
		else
	$("#lan" + lan + "_speed").show(); //lan%s_speed
	}
	else if(LINK_SPEED_FUNCTION==0)
	{
		$("#lan" + lan + "_speed").hide();
	}
			
		
	var option_1000="";
			
	if(partener_speed!=100 && partener_speed!=0)
		option_1000 = '<li rel="1000" class="li_end" id="settings_networkSpeedLi2_select"> <a href="#" onclick=\'show_button("#settings_networkSpeedSave'+ lan + '_button","1")\'>' + '1000' + "</a></li>";
					
	var sel_text = speed;
	switch(speed)
	{
		case '0':
			sel_text = _T('_lan','auto');
			break;
	}
	
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div class="wd_select option_selected" id="speed_main">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="settings_networkSpeed' + lan + '_select" rel="' + speed + '">'+ sel_text +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj"><div>'; 
		option += '<li rel="0" class="li_start" id="settings_networkSpeedLi0_select"> <a href="#" onclick=\'show_button("#settings_networkSpeedSave' + lan + '_button","1")\'>' + _T('_lan','auto') + "</a></li>";
		option += '<li rel="100" id="settings_networkSpeedLi1_select"> <a href="#" onclick=\'show_button("#settings_networkSpeedSave' + lan + '_button","1")\'>' + '100' + "</a></li>";
		option += option_1000;
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
		
		$("#speed_div_lan"+lan).html(option);	
		init_select();					
}
function write_jumbo_frame_mtu(val,lan)
{
	if(JUMBO_FUNCTION==1)
	{
	$("#lan" + lan + "_jumbo").show(); //lan%s_jumbo
	}
	
	var sel_option="";
	switch(val)
	{
		case '1500':
			sel_option = _T('_common','off') + "(1500)";
			break;
		default:
			sel_option = val;
			break;
	}
		
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div class="wd_select option_selected" id="jumbo_main">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="settings_networkJumbo' + lan + '_select" rel="' + val + '">'+ sel_option +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj" style="height:290px"><div>'; 
		option += '<li rel="9000" class="li_start" id="settings_networkJumboLi0_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "9000" + '</a></li>';
		option += '<li rel="8000" id="settings_networkJumboLi1_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "8000" + '</a></li>';
		option += '<li rel="7000" id="settings_networkJumboLi2_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "7000" + '</a></li>';
		option += '<li rel="6000" id="settings_networkJumboLi3_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "6000" + '</a></li>';
		option += '<li rel="5000" id="settings_networkJumboLi4_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "5000" + '</a></li>';
		option += '<li rel="4000" id="settings_networkJumboLi5_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "4000" + '</a></li>';
		option += '<li rel="3000" id="settings_networkJumboLi6_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "3000" + '</a></li>';
		option += '<li rel="2000" id="settings_networkJumboLi7_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + "2000" + '</a></li>';
		option += '<li rel="1500" class="li_end" id="settings_networkJumboLi8_select"> <a href="#" onclick=\'show_button("#settings_networkJumboSave' + lan + '_button","1")\'>' + _T('_common','off') + "(1500)" + '</a></li>';
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
		
		$("#jumbo_div_lan" + lan).html(option);
		init_select();
}
function write_bonding_option(ipv6_mode,bonding_mode)
{
	var option="";

	if(BONDING_FUNCTION==1)
	{
		
		if(typeof $("#bonding_mode").html() == "undefined" || $("#bonding_mode").html().length!=0) return;
		
		$("#bonding_tr").show();
		
		var mode=bonding_mode;
		if(mode!="off")
		{
			mode = parseInt(bonding_mode,10)+1;
			mode = _T('_bonding','mode' + mode);
		}
		else
		{
			mode=_T('_common','off');
		}
		
		var option = "";
			option += '<ul>';
			option += '<li class="option_list">';          
			option += '<div id="bonding_f_dev_main" class="wd_select option_selected">';
			option += '<div class="sLeft wd_select_l"></div>';
			option += '<div class="sBody text wd_select_m" id="settings_networkBonding_select" rel="' + bonding_mode + '">'+ mode +'</div>';
			option += '<div class="sRight wd_select_r"></div>';
			option += '</div>';						
			option += '<ul class="ul_obj"><div>'; 
			option += '<li rel="0" class="li_start" id="settings_networkBondingLi0_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode1') + '</a></li>';
			option += '<li rel="1" id="settings_networkBondingLi1_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode2') + '</a></li>';
			option += '<li rel="2" id="settings_networkBondingLi2_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode3') + '</a></li>';
			option += '<li rel="3" id="settings_networkBondingLi3_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode4') + '</a></li>';
			option += '<li rel="4" id="settings_networkBondingLi4_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode5') + '</a></li>';
			option += '<li rel="5" id="settings_networkBondingLi5_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode6') + '</a></li>';
			option += '<li rel="6" id="settings_networkBondingLi6_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_bonding','mode7') + '</a></li>';
			option += '<li rel="off" class="li_end" id="settings_networkBondingLi7_select"> <a href="#" onclick=\'show_button("#settings_networkBondingSave_button","1")\'>' + _T('_common','off') + '</a></li>';
			option += '</div></ul>';
			option += '</li>';
			option += '</ul>';
		
		$("#bonding_mode").html(option);
		init_select();
	}
}
var _IPv4Mode=["",""];
var _LANPort="";
function SetIPv4Mode(obj,val,lan_port)
{	
	_IPv4Mode[lan_port]=val;
	$(obj).attr('rel',val);	//init rel value
	
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
		
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
		
		open_ip_diag(lan_port);
	});
	
	$(obj).show();
}
function SetIPv6Mode(obj,val,lan_port)
{	
	_IPV6_MODE = val;
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
	
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	
		_IPV6_MODE = $(this).val();
		IPV6_SEL_FLAG = lan_port;	
		init_ipv6_dialog("#ipv6_tb",$(this).val(),lan_port);
	});
	
	$(obj).show();
}
function open_ip_diag(lan_port)
{
	var ip_mode = $("#IPv4Mode_" + lan_port).attr('rel');
	init_ipv4_dialog(ip_mode,lan_port);
	_LANPort = lan_port;
}

function set_default_gw(default_gw)
{
	var url ="/cgi-bin/network_mgr.cgi?cmd=cgi_default_gw";
	url+="&default_gw=" + default_gw;

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	wd_ajax({
		type:"GET",
		cache:false,
		url:url,
		cache:false,
		success: function(){
			jLoadingClose();
		}
	});
}
