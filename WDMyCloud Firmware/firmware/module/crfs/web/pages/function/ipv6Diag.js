var _LOCAL_ADDR="";
var _ADDR2="";
var ipv6Obj="";
var _IPV6_INIT_DIALOG_FLAG=0;
var _ORG_MODE =["",""];

function init_ipv6_dialog(tb_name,ipv6_mode,lan_port)
{
	if(ipv6_mode=='off')
	{
		set_ipv6_addr(lan_port);
		return;
	}
	$("#ipv6Diag_desc").hide();

	init_button();	
	language();
	
  	ipv6Obj=$("#ipv6Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
	ipv6Obj.load();
	
	$("#ipv6Diag .close").click(function(){							
		SetIPv6Mode("#IPv6Mode_" + lan_port,_ORG_MODE[lan_port],lan_port);
  			});		

	var lan =lan_port;
	var url="";
	if(tb_name=="#ipv6_tb")
		url = "/cgi-bin/network_mgr.cgi?cmd=cgi_get_ipv6";
	else
		url = "/cgi-bin/network_mgr.cgi?cmd=cgi_get_tunnel";
	wd_ajax({
			type:"GET",
			url:url,
			cache:false,
			dataType: "xml",
			success: function(xml) {				
				$(xml).find('interface').each(function(index){
					if(lan==index)
					{
						if(tb_name=="#ipv6_tb")
						{
							//var mode = $(this).find('mode').text();
							var addr = new Array();
							var prefix = new Array();
							$(this).find('item').each(function(index2){
								addr.push($(this).find('addr').text())
								prefix.push ($(this).find('prefix').text())
							});
							//var addr = $(this).find('addr').text();
							//var prefix = $(this).find('prefix').text();
							
							var gw = $(this).find('gw').text();
							var dns1 = $(this).find('dns1').text();
							var dns2 = $(this).find('dns2').text();
							
							chk_ipv6_type(ipv6_mode);
							
							/*if(_BONDING_MODE=="0" || _BONDING_MODE=="2" || _BONDING_MODE=="3")
							{
								if(mode=="off")
								{
									jAlert("IPv6 not support in Round Robin,XOR,Broadcast mode.", _T('_common','error'));
									return;
								}
							}*/
							
							if(ipv6_mode=="off")
							{
								addr[0]="";prefix[0]="";
								gw="";dns1="";dns2="";
							}
							//$("#ipv6_set_tb select[name='ipv6_type']").val(mode);
							
							$("#settings_networkIPv6Addr_text").val(addr[0]);
							$("#settings_networkIPv6Prefix_text").val(prefix[0]);
							$("#settings_networkIPv6GW_text").val(gw);
							$("#settings_networkIPv6DNS1_text").val(dns1);
							$("#settings_networkIPv6DNS2_text").val(dns2);
						}
						else
						{
							var tunnel_enable = $(this).find('tunnel_enable').text();
							var tunnel_username = $(this).find('tunnel_username').text();
							var tunnel_pw = $(this).find('tunnel_pw').text();
							var tunnel_server = $(this).find('tunnel_server').text();
							var tunnel_addr = $(this).find('tunnel_addr').text();
							
							if(tunnel_enable==1)
								$("#f_tunnel_enable").attr("checked",true);
							else
								$("#f_tunnel_enable").attr("checked",false);
							
							chk_tunnel();
							$("#f_tunnel_username").val(tunnel_username);
							$("#f_tunnel_pw").val(tunnel_pw);
							$("#f_tunnel_server").val(tunnel_server);
							//$("#f_tunnel_addr").val(tunnel_addr);
						}
					}
				});
			}
	});	

	var t="" ,t2="";
	if(tb_name=="#ipv6_tb")
	{
		
		t= _T('_ipv6','ipv6_setup')
	}
	else
	{
		t= _T('_dialog_title','ipv6_2')
	}
	
	$("#ipv6Diag_title").html(t);
	
	switch(ipv6_mode)
	{
		case 'auto':
		case 'dhcp':
			ui_tab("#ipv6Diag","#settings_networkIPv6DNS1_text","#settings_networkIPv6Save_button");
			break;
		case 'static':
			ui_tab("#ipv6Diag","#settings_networkIPv6Addr_text","#settings_networkIPv6Save_button");
			break;
	}
	if(_IPV6_INIT_DIALOG_FLAG==1)
		return;
		
	_IPV6_INIT_DIALOG_FLAG=1;
}
function set_ipv6_addr(lan_port)
{
	//var mode = $("#ipv6_type option:selected").val();
	var mode = _IPV6_MODE;
	var addr = $("#settings_networkIPv6Addr_text").val();
	var prefix = $("#settings_networkIPv6Prefix_text").val();
	var gw = $("#settings_networkIPv6GW_text").val();
	var dns1 = $("#settings_networkIPv6DNS1_text").val();
	var dns2 = $("#settings_networkIPv6DNS2_text").val();
	
	if(mode=="static")
	{
		if(addr.length=="")
		{
			jAlert(_T('_ip','msg2'), _T('_common','error'));	//Please enter an IP address.
			return;
		}
		
		if(chk_ipv6_format(addr,0)==-1) return;
		if(chk_ipv6_gw_format(addr,gw,prefix)==-1) return;
		
		
	//		if(!test_ipv6(addr))
	//			return;
		if(gw.length >1)
		{
			if(chk_ipv6_format(gw,1)==-1)
			return;
		}
		
		var gw_array = _CURRENT_ADDR.split(":");
		
		var gw_tmp = _CURRENT_ADDR.slice(0,3)
		//alert(gw_tmp + "_CURRENT_ADDR=" + _CURRENT_ADDR +"\nlen=" +gw_array[0].length + "\ngw[0]=" + gw_array[0])  
		if(gw_array[0].length==3)
		{
			jAlert(_T('_ip','msg24'), _T('_common','error')); //Not a valid gateway address.
			return;			
		}
		
		/* cgi check
		if( (gw_tmp!="fe8") && (gw_tmp!="fe9") && (gw_tmp!="fea") && (gw_tmp!="feb") ) 
		{
			jAlert(_T('_ip','msg24'), _T('_common','error')); //Not a valid gateway address.
			return;
		}*/
			
		if(prefix < 0 || prefix >128 || (parseInt(prefix) - prefix) !=0 )
		{
			jAlert(_T('_ip','msg35'), _T('_common','error'));
			return;
		}

		if (prefix.indexOf(" ") != -1) //find the blank space
		{
	 		jAlert(_T('_ip','msg34'), _T('_common','error'));
			return;
		}
	}

	if(dns1.length >1)
	{
		if(chk_ipv6_format(dns1,2)==-1)
		return;
	}
	
	if(dns2.length >1)
 	{
		if(chk_ipv6_format(dns2,3)==-1)
 		return;
	}
		
	var url = "/cgi-bin/network_mgr.cgi?cmd=cgi_set_ipv6"
		url+= "&f_lan=" + IPV6_SEL_FLAG
		url+= "&f_ipv6_mode=" + mode
		url+= "&f_ipv6_addr=" + addr
		url+= "&f_ipv6_gw=" + gw
		url+= "&f_ipv6_prefix=" + prefix
		url+= "&f_ipv6_dns1=" + dns1
		url+= "&f_ipv6_dns2=" + dns2

	if(mode!="off") ipv6Obj.close();
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback	
	stop_web_timeout();
	wd_ajax({
			type:"GET",
			url:url,
			cache:false,
			async: true,
			success: function() {
				
				if(mode=="off")
					google_analytics_log('ipv6-en', 0);
				else
					google_analytics_log('ipv6-en', 1);
				
				if(mode=="static")
				{
					jLoadingClose();
					_ADDR2 = addr;
					jAlert(_T('_wizard','relogin_msg') , _T('_common','success'),"",redirect2);
				}
				else if(mode=="dhcp" || mode=="auto" )
				{
					setTimeout(direct_ipv6,3000);
				}
			}
	});
	
	if(mode=="off")
	{
		_ADDR2 = _IPV4_IP[0];
		jAlert(_T('_wizard','relogin_msg') , _T('_common','success'),"",redirect3);
		restart_web_timeout();
	}
}
var _GET_INDEX=0;
var _GET_NEW_V6_ADDR="";
function _get()
{
	var new_ip = get_new_ipv6_addr();
	if(new_ip.length<1 && _GET_INDEX<5)
	{
		setTimeout(_get,500);
		_GET_INDEX++;
	}
	//alert(_T('_wizard','relogin_msg') + "\nIP Addr:" + new_ip)
	
	_GET_NEW_V6_ADDR = new_ip;
	jAlert(_T('_wizard','relogin_msg') + "<br>IPv6 Address:" + new_ip , _T('_common','error'),"",ipv6_redirect);
	
}
function ipv6_redirect()
{
	location.replace("http://["+ _GET_NEW_V6_ADDR + "]");	
}

function redirect2()
{
	var v = chk_IP_type();
	
	if(v==6)
	{	
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		setTimeout(function(){
	location.replace("http://["+ _ADDR2 + "]");
		},1000);
	}
	else
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		setTimeout(function(){
			//location.replace("/");
			jLoadingClose();
			do_logout();
		},10000);
	}
}
function redirect3()
{
	location.replace("http://"+ _ADDR2);
	
}

function get_new_ipv6_addr(flag)
{
	var addr= new Array();
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_ipv6&flag=" + flag,
			async:false,
			cache:false,
			dataType: "xml",
			success: function(xml) {

				$(xml).find('interface').each(function(index){
					var mode = $(this).find('mode').text();
					$(this).find('item').each(function(i){
						addr.push($(this).find('addr').text());
					});
				});
			}
	});
	
	var new_ip ="";
	if(addr[0].length<1)
		new_ip = _LOCAL_ADDR;
	else
		new_ip = addr[0];
		
	return new_ip;
}

function set_tunnel()
{
//	var grid = $("#tunnel_tb");
//	var selected_count =$('.trSelected',grid).length;
//	if(selected_count==0)
//	{
//		jAlert(_T('_user','msg2'), _T('_common','error'));
//		return;
//	}

//	var v=$('.trSelected td:nth-child(1) div',grid).text();
//	var lan="";
//	
//	$('#tunnel_tb > tbody > tr td:nth-child(1) div').each(function(index){  
//		var tmp = $(this).text();
//		if(v==tmp)
//			lan=index;
//	});
		
	var tunnel_enable = $("#f_tunnel_enable").prop("checked");
	var tunnel_server = $("#f_tunnel_server").val();
	var tunnel_name = $("#f_tunnel_username").val();
	var tunnel_pw = $("#f_tunnel_pw").val();

	if(tunnel_enable)
	{
		if(tunnel_server.length <1)
		{
			jAlert(_T('_ip','msg37'), _T('_common','error'));
			return;
		}

		tunnel_enable=1;
	}
	else
		tunnel_enable=0;
		
	var url = "/cgi-bin/network_mgr.cgi?cmd=cgi_set_tunnel"
		url+= "&f_lan=" + IPV6_SEL_TUNNEL_FLAG
		url+= "&f_tunnel_enable=" + tunnel_enable
		url+= "&f_tunnel_server=" + tunnel_server
		url+= "&f_tunnel_name=" + tunnel_name
		url+= "&f_tunnel_pw=" + tunnel_pw

    //var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	//	overlayObj.load();
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		
	wd_ajax({
			type:"GET",
			url:url,
			cache:false,
			async: false,
			success: function() {
				get_tunnel_info();
				//overlayObj.close();
				jLoadingClose();
			}
	});	
}
// substr_count
//
// Support function; a javascript version of an original PHP function
// Found at: http://kevin.vanzonneveld.net

function substr_count (haystack, needle, offset, length)
{
    var pos = 0, cnt = 0;

    haystack += '';
    needle += '';
    if (isNaN(offset)) {offset = 0;}
    if (isNaN(length)) {length = 0;}
    offset--;

    while ((offset = haystack.indexOf(needle, offset+1)) != -1){
        if (length > 0 && (offset+needle.length) > length){
            return false;
        } else{
            cnt++;
        }
    }

    return cnt;
}

// test_ipv4
// Test for a valid dotted IPv4 address
// Ported from: http://www.dijksterhuis.org/regular-expressions-csharp-practical-use/

function test_ipv4(ip)
{
   var match = ip.match(/(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|255[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/);
   return match != null;
}

// test_ipv6
// Test if the input is a valid ipv6 address. Javascript version of an original PHP function.
// Ported from: http://crisp.tweakblogs.net/blog/2031
function test_ipv6(ip)
{
	if (ip.length<3)
	{
		//return ip == "::";
		jAlert(_T('_ip','msg2'), _T('_common','error'));	//Please enter an IP address.
		return false;
	}
	
	// Check if part is in IPv4 format
	if (ip.indexOf('.')>0)
	{
	    lastcolon = ip.lastIndexOf(':');
	
	    if (!(lastcolon && test_ipv4(ip.substr(lastcolon + 1))))
	    {
	    	jAlert(_T('_ip','msg8'), _T('_common','error'));	//Not a valid IP address.
	        return false;
	    }
	
	    // replace IPv4 part with dummy
	    ip = ip.substr(0, lastcolon) + ':0:0';
	}
	
	// Check uncompressed
	if (ip.indexOf('::')<0)
	{
		var match = ip.match(/^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i);
		
		if(match==null)
			jAlert(_T('_ip','msg8'), _T('_common','error'));
			
		return match != null;
	}
	
	// Check colon-count for compressed format
	if (substr_count(ip, ':'))
	{
		var match = ip.match(/^(?::|(?:[a-f0-9]{1,4}:)+):(?:(?:[a-f0-9]{1,4}:)*[a-f0-9]{1,4})?$/i);
		
		if(match==null)
			jAlert(_T('_ip','msg8'), _T('_common','error'));
			
		return match != null;
	} 
	
	// Not a valid IPv6 address
	return false;
}

function chk_ipv6_type(v)
{
	if(v=="static")
	{
		$("#settings_networkIPv6Addr_text").attr("disabled",false);
		$("#settings_networkIPv6Prefix_text").attr("disabled",false);
		$("#settings_networkIPv6GW_text").attr("disabled",false);
		$("#settings_networkIPv6Prefix_text").removeClass("gray_out");
		$("#settings_networkIPv6Addr_text").removeClass("gray_out");
		$("#settings_networkIPv6GW_text").removeClass("gray_out");
	}
	else
	{
		$("#settings_networkIPv6Addr_text").attr("disabled",true);
		$("#settings_networkIPv6Prefix_text").attr("disabled",true);
		$("#settings_networkIPv6GW_text").attr("disabled",true);
		$("#settings_networkIPv6Prefix_text").addClass("gray_out");
		$("#settings_networkIPv6Addr_text").addClass("gray_out");
		$("#settings_networkIPv6GW_text").addClass("gray_out");
	}
}

function chk_tunnel()
{
	var tunnel_enable=$("#f_tunnel_enable").prop("checked");

	if(tunnel_enable)	//enable
	{
		$("#f_tunnel_server").attr("disabled",false);
		$("#f_tunnel_username").attr("disabled",false);
		//$("#f_tunnel_addr").attr("disabled",false);
		$("#f_tunnel_pw").attr("disabled",false);
	}
	else
	{
		$("#f_tunnel_server").attr("disabled",true);
		$("#f_tunnel_username").attr("disabled",true);
		//$("#f_tunnel_addr").attr("disabled",true);
		$("#f_tunnel_pw").attr("disabled",true);
	}
}
var _CURRENT_ADDR="";
function chk_ipv6_format(addr,addr_type)
{
	var msg=new Array(_T('_ip','msg8'),_T('_ip','msg24'),_T('_ip','msg38'),_T('_ip','msg39'))
	
	var v="";
	if (addr.length<3)
	{
		//return ip == "::";
		jAlert(msg[addr_type], _T('_common','error'));	//Please enter an IP address.
		v=-1;
	}
	else
	{
		wd_ajax({
				type:"GET",
				url:"/cgi-bin/network_mgr.cgi?cmd=cgi_chk_ipv6_addr&addr=" + addr,
				cache:false,
				async: false,
				dataType: "xml",
				success: function(xml) {
					v = $(xml).find('addr_format').text();
					_CURRENT_ADDR = $(xml).find('addr').text();
				}
		});
		
		if(v==-1)
			jAlert(msg[addr_type], _T('_common','error') ); 	//Not a valid IP address.
	}

	return v;
}
function chk_ipv6_gw_format(addr,gw,prefix)
{
	var v=0;
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_chk_gw_addr&ipv6Addr=" + addr+"&gateway=" + gw+"&prefix_length=" + prefix,
			cache:false,
			async: false,
			dataType: "xml",
			success: function(xml) {
				v = $(xml).find('addr_format').text();
			}
	});
	
	if(v==-1)
		jAlert(_T('_ip','msg24'), _T('_common','error')); 	//Not a valid gateway address.

	return v;
}
function direct_ipv6()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	var new_ip = _LOCAL_ADDR.split("/");
	
	var v = chk_IP_type();
	
	jLoadingClose();
	if(v==6)
	{
	jLoadingClose();
	location.replace("http://["+ new_ip[0] + "]/web/setting/ipv6.html");
}
	else
	{
		setTimeout(function(){
			//location.replace("/");
			do_logout();
		},5000);
	}	
}

function chk_IP_type()
{
	var hostname = location.hostname;
	
	hostname = hostname.split(":")
	var url="";
	if(hostname.length > 2)
		return 6;
	else
		return 4;
}

function unset_session()
{
	wd_ajax({
		type: "GET",
		url: "/web/php/session.php",
		dataType: "html",
		cache: false,
		async: false,
		success: function(_html) {

		},
		complete: function () {

		}
	});
}