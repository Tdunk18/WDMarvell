function SetDomainMode(obj,val)
{
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(){
		$($(obj+ " > button").removeClass('buttonSel'))
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
				
		var v = $(this).val();
		if(v==1)
		{
			init_ads_dialog();
		}
		else if(v==2)
		{
			init_ldap_client_dialog();
		}
		else
		{
			set_ads(0);
		}
	});
}
function get_afp_status()
{
	var afp_enable;
	wd_ajax({
		type:"POST",
		cache: false,
		async: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: "cmd=cgi_get_afp_info",	
		dataType: "xml",	
		success: function(xml){							
			afp_enable=$(xml).find('afp_info > enable').text();			
		}
	});
	
	return afp_enable;
}
function set_ads(enable)
{
	var name="",pw="";
	var dns1="";
	var group="";
	var realm_name="";
	var ad_server_name="",s_pwd="";
	
	if(enable==1)
	{
		name = $('#settings_networkADSName_text').val();
		pw = $("#adsDiag_set input[name='settings_networkASDPW_password']").val();
		if( name == "" )
		{
			jAlert( _T('_ads','msg1'), _T('_common','error'));	//User Name field is empty. Enter a user name.
			return;
		}
	
		if (name.indexOf("'") != -1)
		{
			jAlert( _T('_ads','msg19'), _T('_common','error'));	//The User Name must not include the following characters: '
			return;
		}
			
		if( pw == "" )
		{
			jAlert( _T('_ads','msg2'), _T('_common','error'));	//Password field is empty. Enter a password.
			return;
		}
		
		if (pw.indexOf("'") != -1)
		{
			jAlert( _T('_ads','msg20'), _T('_common','error'));	//The Password must not include the following characters: '
			return;
		}
		
		//dns1 = _IPV4_DNS[0];
		
		dns1 = $("#adsDiag_set input[name='settings_networkADSDNS_text']").val();
		if(chk_dns(dns1)==1) return;
		
		/*group = $('#f_group').val()
		if(gname_check(group))
		{
			jAlert( _T('_ads','msg3'), _T('_common','error'));	//The workgroup name allow characters : "a-z" , "A-Z" , "0-9" , "-"
			return;
		}
			
		if( group == "" )
		{
			jAlert( _T('_ads','msg4'), _T('_common','error'));	//Please enter a workgroup.
			return;
		}*/
	
		realm_name = $('#settings_networkADSRealmName_text').val()
		if( realm_name == "" )
		{
			jAlert( _T('_ads','msg5'), _T('_common','error'));	//Please enter a realm name.
			return;
		}
		
		
		if ((realm_name.match("^[A-Za-z0-9._-]*[A-Za-z0-9][A-Za-z0-9._-]*$") === null) ||
			(realm_name.indexOf(".") === -1) || 
			(realm_name.substring(realm_name.length,realm_name.length -1) === ".") || 
			(realm_name.length < 2 )||
			(realm_name.length > 64 )){
			jAlert( _T('_ads','msg21'), _T('_common','error'));	//Improperly formatted domain name. Enter in a fully qualified domain name.
			return;
    	}
    	
		/*ad_server_name = $('#f_server_name').val()
		if( ad_server_name == "" )
		{
			jAlert( _T('_ads','msg6'), _T('_common','error'));	//Please enter a AD server name.
			return;
		}
		
		s_pwd = ad_server_name +  "." + realm_name.toLowerCase();*/
	}

	
	/*
	if(get_afp_status()==1)
	{
		jAlert( _T('_ads','msg18'), _T('_common','info'));
		$("#popup_ok").click( function (){
			post_ads();
		});
	}
	else
		post_ads();
	*/
	
	post_ads(enable);
	
	function post_ads(enable)
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		
		wd_ajax({
			type: "POST",			
			cache: false,
			dataType: "xml",
			url: "/cgi-bin/account_mgr.cgi",
			data:{cmd:"cgi_set_ads",f_enable:enable, f_name:name, 
					f_pw:Base64.encode(pw),f_realm_name:realm_name,f_dns1:dns1
				},
		   	success:function(xml){
		   		
		   		jLoadingClose();
		   		_ADS_ENABLE = 0;
		   		var status = parseInt($(xml).find('status').text(),10);
		   		if(status==54)
		   		{
		   			jAlert( _T('_ads','msg12'), _T('_common','error'));	//Failed to set servicePrincipalNames. Please make sure the Domain Name of this server matches the AD Domain.
		   			return;
		   		}
		   		
				wd_ajax({
					type: "POST",
					url: "/xml/ads_msg.xml",
					dataType: "xml",	
					cache:false,
					success: function(xml){
						var errorID = $(xml).find('id').text();
						var x1 = $(xml).find('arg1').text();
						var x2 = $(xml).find('arg2').text();

						switch(parseInt(errorID,10))
				{
					case 102:
						jAlert( _T('_ads','msg15'), _T('_common','error'));	//Authentication failed. Please re-enter the correct login credentials.
						break;
					case 103:
						jAlert( _T('_ads','msg16'), _T('_common','error'));	//User name not found on the Active Directory domain. Please make sure the user name is entered correctly.  User does not exist.
						break;
					case 104:
						jAlert( _T('_ads','msg17'), _T('_common','error'));	//Cannot resolve network address for Key Distribution Center (KDC) in the requested Active Directory domain.
						break;
					case 1:
					case 50:
					case 100:
						
						if(enable==1)
						{
							_ADS_ENABLE = 1;
							adsObj.close();
							jAlert( _T('_ads','msg8'), _T('_common','completed'));	//Successful
						}
								get_ads_info();
						break;
					case 51:
					case 101:
						jAlert( _T('_ads','msg9'), _T('_common','error'));	//Time is incorrect. Please check your systems¡¦ date and time. Sync them with your AD server. (NAS and Active Directory server will only tolerate a maximum time difference of 5 minutes.)
						break;
					case 52:
						jAlert( _T('_ads','msg10'), _T('_common','error'));	//Logon failure. The target account name is incorrect
						break;
					case 53:
						jAlert( _T('_ads','msg11'), _T('_common','error'));	//Improperly formatted account name. Please enter a valid account name.
						break;
					case 54:
						jAlert( _T('_ads','msg12'), _T('_common','error'));	//Failed to set servicePrincipalNames. Please make sure the Domain Name of this server matches the AD Domain.
						break;
					case 55:
						jAlert( _T('_ads','msg13'), _T('_common','error'));	//Failed to join domain
						break;
					case 105:
					case 56:
						jAlert( _T('_ads','msg14'), _T('_common','error'));	//Connection failed. Please check your configuration.
						break;
							case 57:
								jAlert(_T('_ads','msg13') +  _T('_ads','msg57'), _T('_common','error')); //Failed to join domain. The domain name is not defined. Please enter a domain name.
								break;
							case 58:
								jAlert(_T('_ads','msg13') +  _T('_ads','msg58'), _T('_common','error')); //Failed to join domain. The domain name is invaild. Please re-enter.
								break;
							case 59:
								jAlert(_T('_ads','msg13') +  _T('_ads','msg59'), _T('_common','error')); //Failed to join domain. Unable to open secrets database.
								break;
							case 60:
								new_str = _T('_ads','msg60').replace(/%s1/g,x1).replace(/%s2/g,x2);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. "Workgroup" set to %s1, should be %s2.
								break;
							case 61:
								new_str = _T('_ads','msg61').replace(/%s1/g,x1).replace(/%s2/g,x2);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. "Realm" set to %s1, should be %s2.
								break;
							case 62:
								new_str = _T('_ads','msg62').replace(/%s1/g,x1).replace(/%s2/g,x2);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. "Security" set to '%s1', should be %s2.
								break;
							case 63:
								new_str = _T('_ads','msg63').replace(/%s1/g,x1);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. Invalid configuration (%s1) and configuration modification was not requested.
								break;
							case 64:
								jAlert(_T('_ads','msg13') +  _T('_ads','msg64'), _T('_common','error')); //Failed to join domain. Configuration manipulation requested but not supported by backend.
								break;
							case 65:
								new_str = _T('_ads','msg65').replace(/%s1/g,x1);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. Failed to find DC for domain %s1.
								break;
							case 66:
								new_str = _T('_ads','msg66').replace(/%s1/g,x1).replace(/%s2/g,x2);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. Failed to lookup DC info for domain %s1 over rpc:%s2.
								break;
							case 67:
								new_str = _T('_ads','msg67').replace(/%s1/g,x1);
								jAlert(_T('_ads','msg13') +  new_str , _T('_common','error')); //Failed to join domain. Failed to precreate account in on %s1.
								break;
							case 68:
								new_str = _T('_ads','msg68').replace(/%s1/g,x1).replace(/%s2/g,x2);
								jAlert(_T('_ads','msg13') +  new_str, _T('_common','error')); //Failed to join domain. Failed to join domain %s1 over rpc: %s2.
								break;
							case 69:
								new_str = _T('_ads','msg69').replace(/%s1/g,x1);
								jAlert(_T('_ads','msg13') +  new_str, _T('_common','error')); //Failed to join domain. Failed to verify domain membership after joining: %s1.
								break;
				}
				
				show_field(enable);
							get_ipv4_info();
				google_analytics_log('ads-en', _ADS_ENABLE);
					},
					error:function(xmlHttpRequest,error){   
					} 
				});
			}
		});
	}
}
function gname_check(str)
{	
	var mt = str.match(/[^\sa-zA-Z0-9-]/);
	if (mt)
		return 1;
	else
		return 0;
}

var ads_dialog_flag=0;
var adsObj="";
function init_ads_dialog()
{
	var _TITLE = _T("_ads","title");
	$("#adsDiag_title").html(_TITLE);
	$("#tip_domain_name2").attr('title',_T('_tip','ad_domain'));
	init_tooltip();
	
	//adjust_dialog_size("#adsDiag","",450)
	
  	adsObj=$("#adsDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  					onClose: function() {
						setSwitch('#settings_networkADS_switch',_ADS_ENABLE);
						show_field(_ADS_ENABLE);
					}
  			});		
	adsObj.load();
	
		$("#adsDiag_set").show();
		ui_tab("#adsDiag","#settings_networkADSName_text","#settings_networkADSSave_button");
		
	language();
	
	$("#settings_networkADSSave_button").unbind("click");
    $("#settings_networkADSSave_button").click(function(){				
		set_ads(1);
	});	
}
function get_domain_status()
{
	$("#settings_networkDomainStatus_val").html("<img src='/web/images/spinner.gif'>");

	//get info
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:{cmd:"cgi_get_ads_info",get_domain_status:1},
		dataType: "xml",
		success: function(xml){
			var domainType = $(xml).find('enable').text();	//0:off 1:ad 2:ldap
			var realm_name = $(xml).find('realm').text();
			var serverStatus = $(xml).find('status').text();
			var ldap_server="";
			if(domainType!="0")
			{
				var str="";
				if(serverStatus=="1")
					str=_T('_domain','connected_to');
				else
					str=_T('_domain','disconnected');
				
				var new_str="";
				if(domainType=="1")
				{
					new_str = str.replace(/%s/g,realm_name);
				}
				else if(domainType=="2")
				{
					new_str = str.replace(/%s/g, ldap_server);
				}
					
				$("#settings_networkDomainStatus_val").html(new_str);
			}
			
			show_field(domainType);
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }  
	});
}
function get_ads_info()
{
	//get info
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_ads_info",
		dataType: "xml",
		success: function(xml){
			var domainType = $(xml).find('enable').text();	//0:off 1:ad 2:ldap
			var name = $(xml).find('u_name').text();
			var pw = $(xml).find('u_pwd').text();
			var group = $(xml).find('workgroup').text();
			var realm_name = $(xml).find('realm').text();
			var server_name = $(xml).find('s_pwd').text();
			var DNS1 = $(xml).find('dns1').text();
			var DNS2 = $(xml).find('dns2').text();
			var serverStatus = $(xml).find('status').text();
			var b64Flag = $(xml).find('b64Flag').text();
			var ldap_server="";

			//if(pw.charCodeAt(0)==65533)
			if(b64Flag==1)
			{
				pw = Base64.decode(pw);
			}

			setSwitch('#settings_networkADS_switch',domainType);
			init_switch();			
			
			server_name = server_name.split(".");
			
			$("#settings_networkADSName_text").val(name);
			$("#adsDiag_set input[name='settings_networkASDPW_password']").val(pw);
			$("#f_group").val(group);
			$("#settings_networkADSRealmName_text").val(realm_name);
			$("#f_server_name").val(server_name[0]);
			$("#adsDiag_set input[name='settings_networkADSDNS_text']").val(DNS1);
			
			get_domain_status();
						
			show_field(domainType);
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }  
	});
}
function show_field(enable)
{
	enable = parseInt(enable,10);
	
	if(enable==1)
	{
		$("#settings_networkDomain_tr").show();
		$("#settings_networkADS_link").show();
	}
	else
	{
		$("#settings_networkDomain_tr").hide();
		$("#settings_networkADS_link").hide();
	}
}
function CheckText()
{	
	var realm=$("#settings_networkADSRealmName_text").val();

	realm=realm.toUpperCase();
	$("#settings_networkADSRealmName_text").val(realm);
}

function chk_dns(dns_value)
{
	var msg_dns = new Array(
		_T('_ip', 'msg3'), //"Only numbers can be used as DNS IP addresses.",
		_T('_ip', 'msg27'), //"Invalid DNS IP address. The first set of numbers must range between 1 and 255.",
		_T('_ip', 'msg28'), //"Invalid DNS IP address. The second set of numbers must range between 0 and 255.",
		_T('_ip', 'msg29'), //"Invalid DNS IP address. The third set of numbers must range between 0 and 255.",
		_T('_ip', 'msg30'), //"Invalid DNS IP address. The fourth set of numbers must range between 1 and 254.",
		_T('_ip', 'msg8') //"Not a valid IP address!"
	);

	if( dns_value == "" )
	{
		jAlert( _T('_ip','msg38'), _T('_common','error'));
		return;
	}
			
	if (validateKey(dns_value) == 0) {
		jAlert(msg_dns[0], "warning");
		return 1;
	}
	if (!checkDigitRange(dns_value, 1, 1, 223)) {
		jAlert(msg_dns[1], "warning");
		return 1;
	}
	if (!checkDigitRange(dns_value, 2, 0, 255)) {
		jAlert(msg_dns[2], "warning");
		return 1;
	}

	if (!checkDigitRange(dns_value, 3, 0, 255)) {
		jAlert(msg_dns[3], "warning");
		return 1;
	}
	if (!checkDigitRange(dns_value, 4, 0, 255)) {
		jAlert(msg_dns[4], "warning");
		return 1;
	}
	
	return 0;
}