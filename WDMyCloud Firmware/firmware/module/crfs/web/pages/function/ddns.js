var num = 0;
var error_num = 0;
var _g_ddns_enable;
var _g_ddns_username;
var _g_ddns_pwd;
var _g_ddns_domain;
var _g_ddns_server;
var _g_ddns_timeout;
var ddns_status_loop = -1;


function set_ddns(enable)			
{	
	/***************************
		add check function
	******************************/
	if (doCheckAll_ddns(enable) == 1){return false;}	
	document.getElementById("settings_networkDdnsStatus_value").innerHTML=""			

 _g_ddns_enable = enable
	if (enable== 1)
	{	 
	 _g_ddns_username = $("#settings_networkDdnsUsername_text").val();
	 _g_ddns_pwd = $("#settings_networkDdnsPwd_text").val();
	 _g_ddns_domain = $("#settings_networkDdnsDomain_text").val(); 
	 _g_ddns_server = $("#id_ddns_server").attr("rel");
	}	
	else
	{
		_DIALOG = "";
	}	
	
setSwitch('#settings_networkDdns_switch',enable);								
init_ddns();	
var str = "";
var s = $("#id_ddns_server").attr("rel");
var d = $("#settings_networkDdnsDomain_text").val()
var u = $("#settings_networkDdnsUsername_text").val();
var pwd = $("#settings_networkDdnsPwd_text").val();
var pwd2 = $("#settings_networkDdnsVerifyPwd_text").val();

str = "e="+enable+",s="+s+",d="+d+",u="+u+",pwd="+pwd+",pwd2="+pwd2;

	clearTimeout(ddns_status_loop);
	var overlayObj=$("#ddns_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	overlayObj.close();
	jLoading(_T('_common','set') ,'loading' ,'s',"");	
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/network_mgr.cgi",
		data:{	cmd:"cgi_ddns",
			 	f_enable:enable,
				f_ddns_server:_g_ddns_server,
				f_ddns_domain:$("#settings_networkDdnsDomain_text").val(),
				f_ddns_username:$("#settings_networkDdnsUsername_text").val(),
				f_ddns_password:$("#settings_networkDdnsPwd_text").val(),
				f_ddns_re_password:$("#settings_networkDdnsVerifyPwd_text").val()
			 },
		cache:false,
		async:true,
		success:function(){
					jLoadingClose();
					google_analytics_log('ddns-en', enable);	
//				setTimeout(function(){
//					//overlayObj.close();
//					_DIALOG = "";
//					jLoadingClose();
//					jAlert(_T('_common','update_success'), _T('_common','success'));
//					},2000);
			},
		error:function(xmlHttpRequest,error){   
        		setTimeout(function(){        			
        			//jLoadingClose();
        			_DIALOG = "";
							jLoadingClose();
						//	jAlert(_T('_common','update_success'), _T('_common','success'));
        			},2000);
  		 }  		
	});
	num = 0;
	ddns_status();
	return false;		
}
function re_set_ddns()
{
		wd_ajax({
		type:"POST",
		url:"/cgi-bin/network_mgr.cgi",
		data:{	cmd:"cgi_ddns",
			 	f_enable:1,
				f_ddns_server:$("#id_ddns_server").attr("rel"),
				f_ddns_domain:$("#settings_networkDdnsDomain_text").val(),
				f_ddns_username:$("#settings_networkDdnsUsername_text").val(),
				f_ddns_password:$("#settings_networkDdnsPwd_text").val(),
				f_ddns_re_password:$("#settings_networkDdnsVerifyPwd_text").val()
			 },
		cache:false,
		async:true,
		success:function(){			
			},
		error:function(xmlHttpRequest,error){   
  		 }  		
	});
}
function xml_load_ddns()
{	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/network_mgr.cgi",
		data: "cmd=cgi_get_ddns",	
		dataType: "xml",	
		cache:false,
		success: function(xml){		
		
			$(xml).find('ddns').each(function(){
							
				var enable = $(this).find('enable').text();				
				var username = $(this).find('username').text();				
				var pwd = $(this).find('pwd').text();
				var domain = $(this).find('domain').text();
				var server = $(this).find('server').text();
				var timeout = $(this).find('timeout').text();
				
				setSwitch('#settings_networkDdns_switch',enable);								
				$("#settings_networkDdns_switch").unbind('click');								
				$("#settings_networkDdns_switch").click(function(){	 	
				 	var v = getSwitch('#settings_networkDdns_switch');									 	
					init_ddns();
			 		if (v == 0)
			 		{
			 			//setting
			 			set_ddns(0)
			 		}
				});			
			 _g_ddns_enable = enable;
			 _g_ddns_username = username;
			 _g_ddns_pwd = pwd;
			 _g_ddns_domain = domain;
			 _g_ddns_server = server;
			 _g_ddns_timeout = timeout;

				
				$("input[name='f_enable']").eq(1-parseInt(enable,10)).attr("checked",true);
				$("#f_ddns_server").val(server);
				$("#settings_networkDdnsDomain_text").val(domain);							
				$("#settings_networkDdnsUsername_text").val(username);
				$("#settings_networkDdnsPwd_text").val(pwd);
				$("#settings_networkDdnsVerifyPwd_text").val(pwd);		
				if (server == "")
				{
						//document.getElementById("settings_networkDdnsStatus_value").innerHTML = "";
						$("#settings_networkDdnsStatus_value").empty();//.html("");
				}		
				init_ddns();
				
			 }); 
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }  

	});
	
}	

function ddns_status()
{
	wd_ajax({		
		type: "POST",
		url: "/cgi-bin/network_mgr.cgi",
		data: "cmd=cgi_get_ddns_status",	
		dataType: "xml",	
		cache:false,
		async:false,		
		success: function(xml){		

			$(xml).find('ddns').each(function(){									
				var enable = _g_ddns_enable;
				if (enable == 0) return;			
							
				var status = $(this).find('status').text();				
				var updatetime = $(this).find('updatetime').text();				
				var nexttime = $(this).find('nexttime').text();				
				
				//var time = $(this).find('time').text();									
								
				if (enable == "1")
				{
					if (status == "done")
					{
						if (num == 2)
						{
							document.getElementById("settings_networkDdnsStatus_value").innerHTML =  _T('_ddns','update_success') + "<br> "+ _T('_ddns','last') +":"+updatetime +"<br>"+_T('_ddns','next')+":"+nexttime;	
							return;
						}	
						else
						{
							document.getElementById("settings_networkDdnsStatus_value").innerHTML =  _T('_ddns','update_success') + "<br> "+ _T('_ddns','last') +":"+updatetime +"<br>"+_T('_ddns','next')+":"+nexttime;	
						}	
						num++;
						
						ddns_status_loop = window.setTimeout("ddns_status()", 3000);
						
					}	
					if (status == "error")
					{	
						if (error_num == 0)
						{						
							re_set_ddns(1);
							document.getElementById("settings_networkDdnsStatus_value").innerHTML = _T('_ddns','connect');		
						}else if (error_num >= 1)
						{
						//var v = _T('_ddns','update_fail') + "<br> "+_T('_ddns','last')+":"+updatetime +"<br>"+_T('_ddns','next')+":"+nexttime;					
						document.getElementById("settings_networkDdnsStatus_value").innerHTML = _T('_ddns','update_fail') + "<br> "+_T('_ddns','last')+":"+updatetime +"<br>"+_T('_ddns','next')+":"+nexttime;
						}		
						
						ddns_status_loop = window.setTimeout("ddns_status()", 5000);
						error_num++;
					}	
					
					if (status == "continue")
					{								
						document.getElementById("settings_networkDdnsStatus_value").innerHTML = _T('_ddns','connect');		
						ddns_status_loop = window.setTimeout("ddns_status()", 5000);
					}	
				}				
			 }); 
			},
		 error:function(xmlHttpRequest,error){   
        	//	alert("Error: " +error);   
  		 }  

	});	
}

function init_ddns()
{
	var v = getSwitch('#settings_networkDdns_switch');								
	if (v == 1)
	{
		show("settings_networkDdns_link");
	}
	else
	{
		hide("settings_networkDdns_link");
	}		
}

								

function doCheckAll_ddns(enable)
{	
	var msg_ddns = new Array( _T('_ddns','msg1'),//"Server address cannot be empty.",
						_T('_ddns','msg2'),//"The server address cannot exceed 64 characters. Please try again.",
						_T('_ddns','msg3'),//"The host name cannot exceed 64 characters. Please try again.",
						_T('_ddns','msg4'),//"The username cannot exceed 64 characters. Please try again.",
						_T('_ddns','msg5'),//"The password cannot exceed 64 characters. Please try again.",
						_T('_ddns','msg6'),//"Passwords do not match. Please try again.",
						_T('_ddns','msg7'),//"User name cannot be empty.",
						_T('_ddns','msg8'),//"Cannot enter a blank space.",
						_T('_ddns','msg9'),//"Password cannot be empty.",
						_T('_ddns','msg10'),//"Cannot enter a blank space.",
						_T('_ddns','msg11'),//"Host name cannot be empty.",
						_T('_ddns','msg12'));//"Cannot enter a blank space.");
							
	var server = $("#id_ddns_server").attr("rel");
	if (enable  == 1)
	{	
		//check Server				
	 	if( server == "" )
		{		
			jAlert(msg_ddns[0],  _T('_common','error'));			
			return 1;
		}
		//check length
		if(server.length>64)
		{
			jAlert(msg_ddns[1], _T('_common','error'));			
			return 1;
		}
		if( $('#settings_networkDdnsDomain_text').val().length>64)
		{
			jAlert(msg_ddns[2],  _T('_common','error'));
			$('#settings_networkDdnsDomain_text').select();
			$('#settings_networkDdnsDomain_text').focus();
			return 1;
		}
		if( $('#settings_networkDdnsUsername_text').val().length>64)
		{
			jAlert(msg_ddns[3],  _T('_common','error'));
			$('#settings_networkDdnsUsername_text').select();
			$('#settings_networkDdnsUsername_text').focus();
			return 1;
		}
		if( $('#settings_networkDdnsPwd_text').val().length>64)
		{
			jAlert(msg_ddns[4],_T('_common','error'));
			$('#settings_networkDdnsPwd_text').select();
			$('#settings_networkDdnsPwd_text').focus();
			return 1;
		}
					
		
		//check pasword
		if ($('#settings_networkDdnsPwd_text').val() != $('#settings_networkDdnsVerifyPwd_text').val()) 
		{
			jAlert(msg_ddns[5],  _T('_common','error'));
			$('#settings_networkDdnsPwd_text').select();
			$('#settings_networkDdnsPwd_text').focus();			
			return 1;
		}

		if( $('#settings_networkDdnsUsername_text').val() == "" )
		{
			jAlert(msg_ddns[6], _T('_common','error'));
			$('#settings_networkDdnsUsername_text').select();
			$('#settings_networkDdnsUsername_text').focus();
			return 1;
		}
				
		if ($('#settings_networkDdnsUsername_text').val().indexOf(" ") != -1) //find the blank space
	 	{
	 		jAlert(msg_ddns[7], _T('_common','error'));
	 		$('#settings_networkDdnsUsername_text').select();
			$('#settings_networkDdnsUsername_text').focus();
	 		return 1;
	 	}	 	
		if( $('#settings_networkDdnsPwd_text').val() == "" )
		{
			jAlert(msg_ddns[8], _T('_common','error'));
			$('#settings_networkDdnsPwd_text').select();
			$('#settings_networkDdnsPwd_text').focus();
			return 1;
		}
								
		if ($('#settings_networkDdnsPwd_text').val().indexOf(" ") != -1) //find the blank space
	 	{
	 		jAlert(msg_ddns[9], _T('_common','error'));
	 		$('#settings_networkDdnsPwd_text').select();
			$('#settings_networkDdnsPwd_text').focus();
	 		return 1;
	 	}
	 	if( $('#settings_networkDdnsDomain_text').val() == "" )
		{
			jAlert(msg_ddns[10], _T('_common','error'));
			$('#settings_networkDdnsDomain_text').select();
			$('#settings_networkDdnsDomain_text').focus();
			return 1;
		}
		
		
		if ($('#settings_networkDdnsDomain_text').val().indexOf(" ") != -1) //find the blank space
	 	{
	 		jAlert(msg_ddns[11],  _T('_common','error'));
	 		$('#settings_networkDdnsDomain_text').select();
			$('#settings_networkDdnsDomain_text').focus();
	 		return 1;
	 	}
	}
	
	return 0;
}




function ddns_value()
{
//	$("#f_ddns_server").val(_g_ddns_server);
	$("#settings_networkDdnsDomain_text").val(_g_ddns_domain);							
	$("#settings_networkDdnsUsername_text").val(_g_ddns_username);
	$("#settings_networkDdnsPwd_text").val(_g_ddns_pwd);
	$("#settings_networkDdnsVerifyPwd_text").val(_g_ddns_pwd);
}

function set_ddns_diag()
{			
		xml_load_ddns();
	
		var diag=$("#ddns_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		diag.load();
		adjust_dialog_size("#ddns_Diag",650,450);
		 
		init_button();	
		language();						
		ddns_value();
		ddns_select();
		init_select();		
		hide_select();
	num = 0;
	ddns_status();	
	$("input:text").inputReset();
	ui_tab("#ddns_Diag","#settings_networkDdnsServer_select","#settings_networkDdnsSave_button");
	
			$("#ddns_Diag .close").click(function(){							
							$('#ddns_Diag .close').unbind('click');
							diag.close();
						});														
	
}


function ddns_select()
{
	var sleep_array = new Array(
'www.DynDNS.org',
'no-ip.DDNS'
//'www.tzo.com'
);


	var sleep_v_array = new Array(
			'www.DynDNS.org (Custom)',
			'no-ip.com'
			//'tzo'
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
					a[i][0] = sleep_array[i];
					a[i][1] = sleep_v_array[i];
				}


			$('#id_ddns_server_top_main').empty();				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_networkDdnsServer_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				if (_g_ddns_server == "")
					my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_ddns_server\" style=\"width:245px;\" rel='"+sleep_v_array[0]+"'>"+sleep_array[0]+"</div>";
				else
					my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_ddns_server\" style=\"width:245px;\" rel='"+_g_ddns_server+"'>"+domain_table(_g_ddns_server)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_oled_li'><div>"
				my_html_options+="<li id=\"settings_networkDdnsServerLi1_select\" class=\"li_start\" rel=\""+sleep_v_array[0]+"\"><a href='#'>"+sleep_array[0]+"</a>";
					
				
				for (var i = 1;i<sleep_array.length -1;i++)
				{		
					my_html_options+="<li id=\"settings_networkDdnsServerLi"+(i+1)+"_select\" rel=\""+sleep_v_array[i]+"\"><a href='#'>"+sleep_array[i]+"</a>";		
				}
				var j = sleep_array.length-1;
				my_html_options+="<li id=\"settings_networkDdnsServerLi"+(j+1)+"_select\" class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_ddns_server_top_main").append(my_html_options);	
				
				function domain_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = sleep_array[i];
								a[i][1] = sleep_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}			
							
						 return a[0][0];			
				}
				
}

function delete_ddns()
{
	clearTimeout(ddns_status_loop);
		var overlayObj=$("#ddns_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	overlayObj.close();
	jLoading(_T('_common','set') ,'loading' ,'s',"");
		wd_ajax({
		type: "POST",
		url: "/cgi-bin/network_mgr.cgi",
		data: "cmd=cgi_clear_ddns",	
		dataType: "html",	
		cache:false,
		success: function(xml){
			jLoadingClose();			
			setSwitch('#settings_networkDdns_switch','0');		
			init_ddns();
			
			}	
		});
	
}