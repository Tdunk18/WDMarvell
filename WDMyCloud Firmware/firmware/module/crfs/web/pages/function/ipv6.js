var _BONDING_MODE="";
var IPV6_TimeID;
var _IPV6_LOCAL_ADDR = new Array();
function get_ipv6_info()
{
	var str="";
	var reload_flag=0;
	_IPV6_LOCAL_ADDR = new Array();
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_ipv6",
			cache:false,
			dataType: "xml",
			success: function(xml) {
				
				var bonding_enable = parseInt ($(xml).find('bonding_enable').text(),10);
				_BONDING_MODE = $(xml).find('bonding_mode').text();
				
				var local_addr = _LOCAL_ADDR;
				var addr= new Array();
				var prefix = new Array();
				var addr2= new Array();
				var prefix2 = new Array();
				var count=0;
				var addr_array = new Array();
				var prefix_array = new Array();
				var dns_addr = new Array();
				var lan_link = new Array();
				var lan_status = new Array();
				$(xml).find('interface').each(function(index){
					var mode = $(this).find('mode').text();
					var partener_speed = $(this).find('partener_speed').text();
					var status =$(this).find('lan_status').text();
					
					lan_link.push(partener_speed);
					lan_status.push(status);

					if(bonding_enable==1 && index==1)
						return true;
						
					if(LAN_PORT_NUM==1 && index==1) return true;
						
					if(index==0)
					{
						if(bonding_enable==1 || LAN_PORT_NUM==1)
						{
							$("#ipv6_lan0_title").html("IPv6 " + _T('_lan','network_mode'));
						}
						else
						{
							$("#ipv6_lan0_title").html("IPv6 LAN1 " + _T('_lan','network_mode'));
						}
					}
					else
					{
						$("#ipv6_lan1_title").html("IPv6 LAN2 " + _T('_lan','network_mode'));
					}
											
					$(this).find('item').each(function(i){
						var ipaddr = $(this).find('addr').text();

						if(bonding_enable==1 && index==0)
						{
							if(ipaddr.length!=0 && mode!='off')
							{
							addr.push($(this).find('addr').text());
							}
						}
						else
						{
							if(ipaddr.length!=0 && mode!='off' && partener_speed!=0)
							{
							addr2.push($(this).find('addr').text());
							}
						}
					});
						
					

					write_bonding_option(mode,_BONDING_MODE);

					var gw = $(this).find('gw').text();
					var dns1 = $(this).find('dns1').text();
					var dns2 = $(this).find('dns2').text();
					
					if(partener_speed!=0)
					{
					if(dns1.length!=0) dns_addr.push(dns1);
					if(dns2.length!=0) dns_addr.push(dns2);
					}
					
					var text_color = "";
					var show_ip_flag=1;
					var local_addr = $(this).find('local_addr').text();
					if(mode=="off")
					{
						show_ip_flag=0;				
					}
					else
					{
						if(partener_speed!=0)
						{
						_IPV6_LOCAL_ADDR.push(local_addr);
					}
					}
						
					if(mode=="auto") 
					{
						reload_flag=1;
					}
					else if(mode=="dhcp")
					{
						if(bonding_enable==0 )
						{
							if(addr2.toString()=="")
							{
								show_ip_flag=0;
								reload_flag=1;
							}
						}
						else 
						{
							if(addr.toString()=="")
							{
								show_ip_flag=0;
								reload_flag=1;
							}
						}	
					}
					
					if(_ORG_MODE[index]=="")
					{
						SetIPv6Mode("#IPv6Mode_" + index,mode ,index);
						_ORG_MODE[index] = mode;
					}
						});
					
				if(bonding_enable==1)
					{
						addr_array = addr;
					}
					else
					{
						addr_array = addr2;
					}
						
				var spl="";
				var addr_str ="";
				var str= "LAN1 "+_T("_vv","desc16") + " , ";	//Text:Disconnected
				var str2= " , "+ "LAN2 "+_T("_vv","desc16");	//Text:Disconnected
				if(addr_array.length!=0) {spl=" , ";}
				
				if(bonding_enable==1)
				{
					addr_str = _IPV6_LOCAL_ADDR.toString() + spl + addr_array.toString().replace(/,/g," , ");
				}
				else
				{
					if(_IPV6_LOCAL_ADDR.length==0)
					{
						addr_str="";
					}
					else
					{
						if(lan_status[0]==0)
				{
					addr_str = str +_IPV6_LOCAL_ADDR.toString() + spl + addr_array.toString().replace(/,/g," , ");
				}
						else if(lan_status[1]==0 && LAN_PORT_NUM==2)
				{
					addr_str = _IPV6_LOCAL_ADDR.toString() + spl + addr_array.toString().replace(/,/g," , ") + str2;
				}
						else
						{
							addr_str = _IPV6_LOCAL_ADDR.toString() + spl + addr_array.toString().replace(/,/g," , ");
						}
					}
				}

				
				if(addr_str.length==0) {addr_str="-";}
				$("#ipv6_address_div").html( addr_str);
				
				var dns_str = dns_addr.toString().replace(/,/g," , ");
				if(dns_str.length==0) {dns_str="-";}
				
				$("#ipv6_DNS_address_div").html(dns_str);
				
				if(reload_flag==1) 
				{
					IPV6_TimeID = setTimeout(get_ipv6_info,5000);
				}
			}
	});	
}
function get_tunnel_info()
{
	var str="";
	var reload_flag="";
	wd_ajax({
			type:"GET",
			url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_tunnel",
			cache:false,
			dataType: "xml",
			success: function(xml) {
				
				//$('#my_scroll').jScrollPane({showArrows:true, scrollbarWidth: 15, arrowSize: 16});
				var bonding_enable = $(xml).find('bonding_enable').text();
				$(xml).find('interface').each(function(index){
					if(bonding_enable==1 && index==1)
						return true;

					var tunnel_enable = $(this).find('tunnel_enable').text();
					var tunnel_username = $(this).find('tunnel_username').text();
					var tunnel_pw = $(this).find('tunnel_pw').text();
					var tunnel_server = $(this).find('tunnel_server').text();
					var tunnel_addr = $(this).find('tunnel_addr').text();
										
					str+= "<tr>";
					if(index==0)
					{
						var _text="";
						if(bonding_enable==1)
							_text= _T('_lan','merge');
						else
							_text= _T('_lan','lan1');
							
						str+= "<td>" + _text + "</td>";
					}
					else
						str+= "<td>" + _T('_lan','lan2') + "</td>";
					
					str+= "<td>" + tunnel_addr + "</td>";
					str+= "<td>" + tunnel_server + "</td>";
					str+= "<td>" + tunnel_username + "</td>";
															
					if(tunnel_enable==0)
						str+= "<td>" + _T('_remote_backup','no')  + "</td>";
					else
					{
						if(tunnel_addr.length==0)
						{
							reload_flag = 1;
						}
						str+= "<td>" + _T('_remote_backup','yes')  + "</td>";
					}
						
				});
				
				var w = $(window).width() - 328;
				w = parseInt(w/2,10);
				if (w < 120) w = 150;
				
				var tb = '<table border="0" id="tunnel_tb" name="tunnel_tb"> <thead><tr>'+
							'<th width="80">'+_T('_ipv6','interface')+'</th>'+
							'<th width="' + w + '">'+_T('_lan','ip_address')+'</th>'+
							'<th width="'+ w + '">'+_T('_ipv6','tunnel_server')+'</th>'+
							'<th width="70">'+_T('_ipv6','tunnel_username')+'</th>'+
							'<th width="50">'+_T('_common','enable')+'</th>'+
							'</tr></thead>';

				document.getElementById("tunnel_list_div").innerHTML =tb+"<tbody>"+ str +"</tbody></table>"
				$("#tunnel_tb").addClass("tb_flexme");
				//var ww = $(window).width() - 65;
				var ww=650;
				var hh = 48;
				
				if ( ww < 0) ww = 100;
				if (ww<=460)
					hh= 58;
					
				var oBrowser = new detectBrowser();
			 	if (oBrowser.isFF || oBrowser.isIE9 || oBrowser.isIE7 || oBrowser.isSa || oBrowser.isOp || oBrowser.isGoogle)
			    	hh=80;
				 	
				$(".tb_flexme").flexigrid({
					width: ww,
					height: hh/2,
					singleSelect:true,
					resizable : false
				});
				
				if(reload_flag ==1) setTimeout(get_tunnel_info,5000);
			}
	});
}