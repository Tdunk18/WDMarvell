var NEW_IP="";
var _ROUTE_FORM_ACTION="";
var ROUTE_ADD=1;
var ROUTE_MODIFY=2;
	
function set_ip_addr(lan_tb,lan_port)
{
	var dns1 = $(lan_tb +" input[name='settings_networkDNS1_text']").val();
	var dns2 = $(lan_tb +" input[name='settings_networkDNS2_text']").val();
	var dns3 = $(lan_tb +" input[name='settings_networkDNS3_text']").val();
	
	var vlan_enable=0,vlan_id="";
	if(VLAN_FUNCTION==1)
	{
		vlan_enable = getSwitch('#settings_networkVLAN_switch');
		vlan_id = $("#vlan_tr input[name='settings_networkVLANID_text']").val();
	}
			
	var dhcp_enable = $("#IPv4Mode_" + lan_port).attr('rel');
	if(dhcp_enable=="0")
	{
		var str = _T('_ip','msg40');
		jConfirm('M', str,_T('_common','info'),'ipv4',function(r){
			if(r)
			{
				_post_lock();
			}//end of if(r)
		
		});//end of parent.jConfirm(...
	}
	else
	{
		_post_lock()
	}

	function _post_lock()
	{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		
	//get_lan_status();
	_DIALOG.close();
	
	setTimeout("stop_web_timeout()",1000);
		var dhcpFlag = $("#IPv4Mode_" + lan_port).attr('rel');
	
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi",
				data:{cmd:"cgi_setip_lock",lan:_LAN_FLAG,dhcp:dhcpFlag},
			cache:false,
			success: function(data){
				post_set_ip(dhcp_enable);
			}
	});
	}

	function post_set_ip(dhcp_enable)
	{
		//modify ip
		//var dhcp_enable = $(lan_tb +" input:checked[name='f_dhcp_enable']").val();
		//var dhcp_enable = $("#IPv4Mode").attr('rel');
		var ip = $(lan_tb +" input[name='settings_networkIP_text']").val();
		var gw = $(lan_tb +" input[name='settings_networkGW_text']").val();
		var netmask =$(lan_tb +" input[name='settings_networkMask_text']").val();
		var dns_manual = $(lan_tb +" input:checked[name='f_dns_auto']").val();
		
		var set_url = "/cgi-bin/network_mgr.cgi?cmd=cgi_ip&f_dhcp_enable="+dhcp_enable+"&f_ip="+ip+
					"&f_gateway="+gw+"&f_netmask="+netmask+
					"&f_dns1="+dns1+"&f_dns2="+dns2+"&f_dns3="+dns3+
					"&vlan_enable=" + vlan_enable+
					"&vlan_id=" + vlan_id+
					"&f_dns_manual="+ dns_manual +
					"&lan="+_LAN_FLAG;

		wd_ajax({
				type:"GET",
				url:set_url,					
				cache:false,
				dataType: "text",
				success: function(data){
					get_new_ip(_LAN_FLAG);
				}
		});
	}	
}

function directory_ui()
{	
	_DIALOG="";
	jLoadingClose();
	
	//alert(NEW_IP)
	if(NEW_IP=="0.0.0.0")
	{
		//alert(_T('_wizard','relogin_msg2'))
		jAlert(_T('_wizard','relogin_msg2'), _T('_common','success'));
	}
	else
	{
		//alert(_T('_wizard','relogin_msg'))
		
		jAlert(_T('_wizard','relogin_msg'), _T('_common','success'),"",redirect);
		
	}
}
function redirect()
{
	var portocol = window.location.protocol;
	var port = window.location.port;
	
	(port.length==0) ?port="": port=":" + port;
	
	var url = portocol + "//" + NEW_IP + port;
	
	if(chk_IP_type()==4)
	location.replace(url);
	else
		location.replace("/");
	
	}
function get_new_ip(lan)
{	
	wd_ajax({
		type: "GET",
		url:"/cgi-bin/network_mgr.cgi",
		data:{cmd:"cgi_get_lan_xml2",lan:lan},
		dataType: "xml",
		cache: false,
		error:function(){
		},		
		success: function(xml) {
				var ip_tmp = new Array();
				ip_tmp.push($(xml).find('ip1').text());
				ip_tmp.push($(xml).find('ip2').text());
							
				var h = location.host;
				if(h==LAN_IP[0])	//lan0 enter
				{
					if(_LAN_FLAG==0)
					{
						//modify lan0
						NEW_IP = ip_tmp[0];
					}
					else
					{
						//modify lan1
						NEW_IP = LAN_IP[0];
					}
				}
				else if(h==LAN_IP[1])
				{
					//lan1 enter
					if(_LAN_FLAG==0)
					{
						//modify lan0
						NEW_IP = LAN_IP[1];
					}
					else
					{
						//modify lan1
						NEW_IP = ip_tmp[1];
					}
				}
				else
				{
					if(_LAN_FLAG==0)
					{
						//modify lan0
						NEW_IP = ip_tmp[0];
					}
					else
					{
						//modify lan1
						NEW_IP = ip_tmp[1];
					}
				}
				
				if(_BONDING_ENABLE==1)
					setTimeout(directory_ui,30000); //15000
				else
				setTimeout(directory_ui,30000); //2000
		}
	});
}
function check_jumbo()
{
		if(document.form_jumbo.f_jumbo_enable[1].checked == true )
				hide('id_mtu')			
		else
			show('id_mtu');			
}

function init_lan(lan_tb,lan_port)
{
	
	var enable = $("#IPv4Mode_" + lan_port).attr("rel");

	if (enable  == 1)
	{	
		$(lan_tb +" input[name='settings_networkIP_text']").attr("disabled",true);
		$(lan_tb +" input[name='settings_networkMask_text']").attr("disabled",true);	
		$(lan_tb +" input[name='settings_networkGW_text']").attr("disabled",true);

		$(lan_tb +" input[name='settings_networkIP_text']").addClass("gray_out");
		$(lan_tb +" input[name='settings_networkMask_text']").addClass("gray_out");	
		$(lan_tb +" input[name='settings_networkGW_text']").addClass("gray_out");
				
		
//		for (var i=0;i<4;i++)
//		{
//			_ip[i].attr("disabled",true);
//			_netmask[i].attr("disabled",true);
//			_gateway[i].attr("disabled",true);
//		}
		
		$(lan_tb + " input[name='f_dns_auto']").eq(0).attr("disabled",false);
	}
	else
	{	
		$(lan_tb +" input[name='settings_networkIP_text']").attr("disabled",false);
		$(lan_tb +" input[name='settings_networkMask_text']").attr("disabled",false);	
		$(lan_tb +" input[name='settings_networkGW_text']").attr("disabled",false);		

		$(lan_tb +" input[name='settings_networkIP_text']").removeClass("gray_out");
		$(lan_tb +" input[name='settings_networkMask_text']").removeClass("gray_out");	
		$(lan_tb +" input[name='settings_networkGW_text']").removeClass("gray_out");
			
//		for (var i=0;i<4;i++)
//		{
//			_ip[i].attr("disabled",false);
//			_netmask[i].attr("disabled",false);
//			_gateway[i].attr("disabled",false);
//		}
							
		$(lan_tb + " input[name='f_dns_auto']").eq(0).attr("disabled",true);
		$(lan_tb + " input[name='f_dns_auto']").eq(1).attr("checked",true);
		init_dns(lan_tb);
	}
}
function init_dns(lan_tb)
{
	var auto = $(lan_tb +' input:checked[name="f_dns_auto"]').val();

	if (auto == 0)
	{
		$(lan_tb +" input[name='settings_networkDNS1_text']").attr("disabled",true);
		$(lan_tb +" input[name='settings_networkDNS2_text']").attr("disabled",true);
		$(lan_tb +" input[name='settings_networkDNS3_text']").attr("disabled",true);
		
		$(lan_tb +" input[name='settings_networkDNS1_text']").addClass("gray_out");
		$(lan_tb +" input[name='settings_networkDNS2_text']").addClass("gray_out");
		$(lan_tb +" input[name='settings_networkDNS3_text']").addClass("gray_out");
	}
	else
	{
		$(lan_tb +" input[name='settings_networkDNS1_text']").attr("disabled",false);
		$(lan_tb +" input[name='settings_networkDNS2_text']").attr("disabled",false);
		$(lan_tb +" input[name='settings_networkDNS3_text']").attr("disabled",false);		

		$(lan_tb +" input[name='settings_networkDNS1_text']").removeClass("gray_out");
		$(lan_tb +" input[name='settings_networkDNS2_text']").removeClass("gray_out");
		$(lan_tb +" input[name='settings_networkDNS3_text']").removeClass("gray_out");	
	}
}
function write_gw_option(bonding_enable)
{				
	var option= "<option value='lan0'>" + _T('_lan','lan1') + "</option>";	//LAN 1

  	if(bonding_enable=="0")

		option+="<option value='lan1'>" + _T('_lan','lan2') + "</option>";	//LAN 2

  	$("select[name='gw_select']").append(option);
  	
  	//$("select[name='interface_select'] option").each(function(i, option){ $(option).remove(); });
  	//$("select[name='interface_select']").append(option);
}

var LAN_STATUS = new Array();
function get_lan_status()
{
	LAN_STATUS = new Array();
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_lan_status",
			cache:false,
			async: false,
			dataType: "xml",
			success: function(xml) {					
				LAN_STATUS.push($(xml).find('lan1_speed').text())
				LAN_STATUS.push($(xml).find('lan2_speed').text())
			}
	});
}

function show_vlan_id(v)
{
	if(v=='1')
	{
		$("#vlan_tr").show();
	}
	else
	{
		$("#vlan_tr").hide();
	}
//		$(lan_tb +" input[name='settings_networkVLANID_text']").attr("disabled",false);
//	else
//		$(lan_tb +" input[name='settings_networkVLANID_text']").attr("disabled",true);
}
var _LAN_FLAG="";
var _OLD_IP_ADDR="";
var LAN_IP = new Array();
var _INIT_IPV4_DIALOG_FLAG=0;
function init_ipv4_dialog(dhcp,lan_port)	//dhcp 0:static 1:dhcp	lan_port 0 or 1
{
	var _TITLE = _T('_dialog_title','lan_1');
	$("#ipv4Diag_desc").show();
	$("#ipv4Diag_ip").hide();
	$("#ipv4Diag_vlan").hide();
	$("#ipv4Diag_complited").hide();
	
	$("#settings_networkIPv4Next4_button span").html(_T('_button','apply'));
	/*
	if(dhcp=="1")
	{
		$("#settings_networkIPv4Next4_button span").html(_T('_button','apply'));
	}
	else
	{
		$("#settings_networkIPv4Next4_button span").html(_T('_button','Next'));
	}*/
	
	language();
	
	if(dhcp=="1")
	{
		switch(parseInt(MULTI_LANGUAGE, 10))
		{
			case 1:
				$("#vlan_td1").css("width","215px");
				$("#vlan_td2").css("width","215px");
			case 2:
			case 3:
			case 4:
			case 8:
			case 10:
			case 13:
				adjust_dialog_size("#ipv4Diag","750","600");
				$("#dhcp_tr").css('width','700px');
				break;
			case 9:
				adjust_dialog_size("#ipv4Diag","750","600");
				$("#dhcp_tr").css('width','700px');
				$(".tdfield_80").css('width','250px');
				break;
			case 15:
				$("#vlan_td1").css("width","170px");
				$("#vlan_td2").css("width","170px");
				adjust_dialog_size("#ipv4Diag","680","600");
				break;
			case 17:
				$("#vlan_td1").css("width","130px");
				$("#vlan_td2").css("width","130px");
				adjust_dialog_size("#ipv4Diag","750","600");
				break;
			case 5:
			default:
		adjust_dialog_size("#ipv4Diag","690","600");
				break;
		}
		
		$("#dhcp_tr").show();
	}
	else
	{
		switch(parseInt(MULTI_LANGUAGE, 10))
		{
			case 1:
				$("#vlan_td1").css("width","215px");
				$("#vlan_td2").css("width","215px");
				adjust_dialog_size("#ipv4Diag","650","520");
				break;
			case 3:
			case 10:
				adjust_dialog_size("#ipv4Diag","650","520");
				break;
			case 15:
				$("#vlan_td1").css("width","170px");
				$("#vlan_td2").css("width","170px");
				adjust_dialog_size("#ipv4Diag","650","500");
				break;
			case 9:
				$(".tdfield_80").css('width','250px');
				adjust_dialog_size("#ipv4Diag","680","520");
				break;
			case 17:
				$("#vlan_td1").css("width","130px");
				$("#vlan_td2").css("width","130px");
				adjust_dialog_size("#ipv4Diag","540","520");
				break;
			default:
		adjust_dialog_size("#ipv4Diag","540","520");
				break;
		}
		
		$("#dhcp_tr").hide();	
	}
	
  	var ipv4Obj=$("#ipv4Diag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
	ipv4Obj.load();
	$("#ipv4Diag").center();
	//$("#ipv4Diag.WDLabelDiag").css("top","-50px").css("left","110px");
	
	$("#ipv4Diag .close").click(function(){							
		$('#ipv4Diag .close').unbind('click');							
		ipv4Obj.close();
		SetIPv4Mode("#IPv4Mode_" + lan_port,_IPv4Mode[lan_port],lan_port);
	});
	
	_DIALOG = ipv4Obj;
		
	var grid = $("#ipv4_tb");

	var lan =lan_port;
	_LAN_FLAG =lan_port;
	
	var t=_T('_format','step')+" 1: " + _T('_ipv6','ipv4_setup');
	if(lan=="0")
	{
		if(_BONDING_ENABLE==1)
			t=_T('_format','step')+" 1: " + _T('_ipv6','ipv4_setup3');
	}
	else
	{
		t=_T('_format','step')+" 1: " + _T('_ipv6','ipv4_setup2');
	}
	
	ui_tab("#ipv4Diag","#settings_networkIPv4Cancel1_button","#settings_networkIPv4Next1_button");
	
	$("#ipv4Diag_title").html(_TITLE);
	
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_lan_xml",
			cache:false,
			async: false,
			dataType: "xml",
			success: function(xml) {
				
				var lan_tb="#lan_tb";
				
				var default_gw = $(xml).find('default_gw').text();
				var bonding_enable = $(xml).find('bonding_enable').text();
				var bonding_mode = $(xml).find('bonding_mode').text();	
							
				LAN_IP = new Array();
				$(xml).find('lan').each(function(index){
					
					LAN_IP.push( $(this).find('ip').text() );
					
					if(lan==index)
					{
						var dhcp_enable = $(this).find('dhcp_enable').text();		
						var ip = $(this).find('ip').text();
						var netmask = $(this).find('netmask').text();
						var gateway = $(this).find('gateway').text();
						var dns1 = $(this).find('dns1').text();
						var dns2 = $(this).find('dns2').text();
						var dns3 = $(this).find('dns3').text();
						var vlan_enable = $(this).find('vlan_enable').text();
						var vlan_id = $(this).find('vlan_id').text();
						var dns_manual = $(this).find('dns_manual').text();
						
						_OLD_IP_ADDR = ip;
						
						$(lan_tb+" input[name='settings_networkIP_text']").val(ip);
						$(lan_tb+" input[name='settings_networkMask_text']").val(netmask);							
						$(lan_tb+" input[name='settings_networkGW_text']").val(gateway);
						$(lan_tb+" input[name='settings_networkDNS1_text']").val(dns1);
						$(lan_tb+" input[name='settings_networkDNS2_text']").val(dns2);
						$(lan_tb+" input[name='settings_networkDNS3_text']").val(dns3);

						setSwitch('#settings_networkVLAN_switch',vlan_enable);
		
						$("#vlan_tr input[name='settings_networkVLANID_text']").val(vlan_id);
						
						init_lan(lan_tb,lan);
						show_vlan_id(vlan_enable);
						
						//dns_manual
						if (dns_manual=="1" || dhcp==0)
							$(lan_tb + " input[name='f_dns_auto']").eq(1).attr("checked",true);
						else
							$(lan_tb + " input[name='f_dns_auto']").eq(0).attr("checked",true);
						init_dns(lan_tb);						
					}
				});
				
				$("input:text").inputReset();
			}
	});	
		
	//if(_INIT_IPV4_DIALOG_FLAG==1)
	//	return;
		
	//_INIT_IPV4_DIALOG_FLAG =1;
	
	//ipv4Diag_desc's button
	$("#settings_networkIPv4Next1_button").unbind('click');
    $("#settings_networkIPv4Next1_button").click(function(){				
		$("#ipv4Diag_desc").hide();
		$("#ipv4Diag_ip").show();
		$("#ipv4Diag_title").html(t);
		
		ui_tab("#ipv4Diag","#settings_networkIP_text","#settings_networkIPv4Next2_butotn");
	});

	//ipv4Diag_ip's button
	var t2=_T('_format','step')+" 2: " + _T('_dialog_title','lan_2');
	$("#settings_networkIPv4Next2_butotn").unbind('click');
    $("#settings_networkIPv4Next2_butotn").click(function(){
		var lan_tb = "#lan_tb";
		if( check_field_lan("",lan_tb) == 1) return ;
		
		var dhcp_enable = $(lan_tb +" input:checked[name='f_dhcp_enable']").val();

		if(_BONDING_ENABLE==0)
		{
			if(dhcp_enable==0)
			if (check_2LAN_mask("",lan_tb,_LAN_FLAG,_IPV4_IP,_IPV4_NETMASK) == 1) return false;
		}
			
		$("#ipv4Diag_ip").hide();
		if(VLAN_FUNCTION==1)
		{
			$("#ipv4Diag_vlan").show();
			$("#ipv4Diag_title").html(t2);
			ui_tab("#ipv4Diag","#tab_span","#settings_networkIPv4Next3_button");
		}
		else
		{
			write_ipv4_summary(lan_port);
			$("#ipv4Diag_complited").show();
			$("#ipv4Diag_title").html(_T('_dialog_title','time_machine_2'));
			ui_tab("#ipv4Diag","#settings_networkIPv4Back4_button","#settings_networkIPv4Next4_button");
		}
	});
	$("#settings_networkIPv4Back2_button").unbind('click');
    $("#settings_networkIPv4Back2_button").click(function(){				
		$("#ipv4Diag_ip").hide();
		$("#ipv4Diag_desc").show();
		$("#ipv4Diag_title").html(_TITLE);
	});
	
	//ipv4Diag_vlan's button
	$("#vlan_td1").unbind('keydown');
	$("#vlan_td1").keydown(function(e) {
		if(e.keyCode == 9) {
			setTimeout(function(){
				ui_tab("#ipv4Diag","#vlan_span .checkbox_container","#settings_networkIPv4Next3_button");
			}, 100);
		}
	});
	$("#settings_networkIPv4Next3_button").unbind('keydown');
	$("#settings_networkIPv4Next3_button").keydown(function(e) {
		if(e.keyCode == 9) {
			setTimeout(function(){
				ui_tab("#ipv4Diag","#vlan_span .checkbox_container","#settings_networkIPv4Next3_button");
			}, 100);
		}
	});
				
	$("#settings_networkIPv4Next3_button").unbind('click');
    $("#settings_networkIPv4Next3_button").click(function(){
		//var vlan_enable = $("#vlan_tb input:checked[name='vlan_enable']").val();
		var vlan_enable = getSwitch('#settings_networkVLAN_switch');
		var vlan_id = $("#vlan_tr input[name='settings_networkVLANID_text']").val();
		
		if(vlan_enable==1)
		{
			if(vlan_id <= 0 || vlan_id >= 4095 || (parseInt(vlan_id) - vlan_id) !=0 )
			{
				jAlert(_T('_ip','msg32'), _T('_common','error'));
				return;
			}
			
			if (vlan_id.indexOf(" ") != -1) //find the blank space
		 	{
		 		jAlert(_T('_ip','msg33'), _T('_common','error'));
		 		return;
			}
		}
		
		$("#ipv4Diag_vlan").hide();
		write_ipv4_summary(lan_port);
		$("#ipv4Diag_complited").show();
		$("#ipv4Diag_title").html(_T('_dialog_title','import_user_4'));
		ui_tab("#ipv4Diag","#settings_networkIPv4Back4_button","#settings_networkIPv4Next4_button");
	});
	
	$("#settings_networkIPv4Back3_button").unbind('click');
    $("#settings_networkIPv4Back3_button").click(function(){				
		$("#ipv4Diag_vlan").hide();
		$("#ipv4Diag_ip").show();
		$("#ipv4Diag_title").html(t);
		
		ui_tab("#ipv4Diag","#settings_networkIP_text","#settings_networkIPv4Next2_butotn");
	});
	
	//ipv4Diag_complited's button
	$("#settings_networkIPv4Back4_button").unbind('click');
    $("#settings_networkIPv4Back4_button").click(function(){
    	$("#ipv4Diag_complited").hide();
    	if(VLAN_FUNCTION==1)		
		{
			$("#ipv4Diag_vlan").show();
			$("#ipv4Diag_title").html(t2);
			ui_tab("#ipv4Diag","#tab_span","#settings_networkIPv4Next3_button");
		}
		else
		{
			$("#ipv4Diag_ip").show();
			$("#ipv4Diag_title").html(t);
			ui_tab("#ipv4Diag","#settings_networkIP_text","#settings_networkIPv4Next2_butotn");
		}
	});
	
	$("#settings_networkIPv4Next4_button").unbind('click');
	$("#settings_networkIPv4Next4_button").click(function(){
		set_ip_addr("#lan_tb",lan_port);
	});
}
function chk_bonding(v)
{
	if(v=='1')
	{
		$("input[name='f_default_gw']").eq(0).attr("checked",true);
		$("input[name='f_default_gw']").eq(1).attr("disabled",true);
		$("select[name='bonding_mode']").attr("disabled",false);
	}
	else
	{
		$("input[name='f_default_gw']").eq(1).attr("disabled",false);
		$("select[name='bonding_mode']").attr("disabled",true);
	}
}
function write_ipv4_summary(lan_port)
{
	var lan_tb = "#lan_tb";
	//var dhcp_enable = $(lan_tb +" input:checked[name='f_dhcp_enable']").val();
	var dhcp_enable = $("#IPv4Mode_" + lan_port).attr('rel');

	//var vlan_enable = $("#vlan_tb input:checked[name='vlan_enable']").val();
	var vlan_enable = getSwitch('#settings_networkVLAN_switch');
	var vlan_id = $("#vlan_tr input[name='settings_networkVLANID_text']").val();

	var ip="-",gw="-",netmask="-";
	
	if(dhcp_enable==0)
	{
		ip = $(lan_tb +" input[name='settings_networkIP_text']").val();
		gw = $(lan_tb +" input[name='settings_networkGW_text']").val();
		netmask =$(lan_tb +" input[name='settings_networkMask_text']").val();
	}

	var dns1 = $(lan_tb +" input[name='settings_networkDNS1_text']").val();
	var dns2 = $(lan_tb +" input[name='settings_networkDNS2_text']").val();
	var dns3 = $(lan_tb +" input[name='settings_networkDNS3_text']").val();
	var dns_manual = $(lan_tb +" input:checked[name='f_dns_auto']").val();
	
	var showdns_array = new Array();
	if(dhcp_enable==1 && dns_manual==0)	
	{
		showdns_array.push("-");
	}
	else
	{
		if(dns1.length!=0) showdns_array.push(" "+dns1 + " ");
		if(dns2.length!=0) showdns_array.push(" "+dns2 + " ");
		if(dns3.length!=0) showdns_array.push(" "+dns3 + " ");
	}
	
	var _DHCP_TEXT = _T('_lan','static_ip');
	if(dhcp_enable==1)
		_DHCP_TEXT = _T('_lan','dhcp_client');
	
	var _INTER_TEXT= _T('_lan','lan1');
	if(_BONDING_ENABLE==1)
		_INTER_TEXT= _T('_lan','merge');
	else if(_LAN_FLAG==1)
		_INTER_TEXT= _T('_lan','lan2');
	
	var _VLAN_TEXT = _T('_common','enable')
	var _VLAN_ID_TEXT = vlan_id;
	if(vlan_enable==0)
	{
		_VLAN_TEXT = _T('_common','disable')
		_VLAN_ID_TEXT = "-"
	}
	
	//write comfirm info
	var str = "<table width='450' height='280' style='table-layout:fixed'>";
	if(LAN_PORT_NUM==2)
	{
		str += "<tr><td width='150'>" + _T('_ipv6','interface') + "</td><td id='settings_networkInterface_value'>" +_INTER_TEXT +"</td></tr>";
	}
		str += "<tr><td>" + _T('_ipv6','mode') + "</td><td id='settings_networkMode_value'>" + _DHCP_TEXT + "</td></tr>";
		if(VLAN_FUNCTION==1)
		{
			str += "<tr><td>" + _T('_lan','vlan') + "</td><td id='settings_networkVLAN_value'>" + _VLAN_TEXT + "</td></tr>";
			str += "<tr><td>" + _T('_lan','vlan_id') + "</td><td id='settings_networkVLANID_value'>" + _VLAN_ID_TEXT + "</td></tr>";
		}
		str += "<tr><td>" + _T('_lan','ip_address') + "</td><td id='settings_networkIP_value'>" + ip + "</td></tr>";
		str += "<tr><td>" + _T('_lan','gateway') + "</td><td id='settings_networkGW_value'>" + gw + "</td></tr>";
		str += "<tr><td>" + _T('_lan','subnet_mask') + "</td><td id='settings_networkNetmask_value'>" + netmask + "</td></tr>";
		str += "<tr><td>" + _T('_lan','dns') + "</td><td id='settings_networkDNS_value'>" + showdns_array.toString() + "</td></tr></table>";
		
	document.getElementById("ipv4_confirm").innerHTML = str;
}

function auto_fill_dns()
{
	var lan_tb = "#lan_tb";
	
	$(lan_tb +" input[name='settings_networkDNS1_text']").val("8.8.8.8");
	$(lan_tb +" input[name='settings_networkDNS2_text']").val("8.8.4.4");
	$(lan_tb +" input[name='settings_networkDNS3_text']").val("");
}

function vlanEvent(e)
{
	if (e.keyCode=='13')
		$("#settings_networkVLAN_switch").click();
}