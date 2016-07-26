var REST_VERSION = "2.1";
var _REST_USER_CODE_ID = -1;
var Cloud_StatusID = -1;
var _LOCAL_LOGIN=0;	//l:local 0:remote
function _REST_Login(owner,pw)
{
	$.ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/local_login?owner=" + encodeURIComponent(owner) + "&pw=" + encodeURIComponent(pw),
		url: "/web/restAPI/login.php",
		data: {
			owner: owner,
			pw: pw
		},
		dataType: "xml",
		success:function(xml){
			$("body").attr("rel","local");
			_LOCAL_LOGIN=1;
			$.cookie("local_login", "1", { expires: 365 ,path: '/' });
		},
		error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var err_id = $xml.find('error_id').text();
			if(err_id=='60' || err_id=="31") //31:Invalid login
			{
				_LOCAL_LOGIN=0;
				$("body").attr("rel","remote");
				$.cookie("local_login", "0", { expires: 365 ,path: '/' });
			}
		},
        complete: function (jqXHR, textStatus) {
			//document.form.submit();
        }
	});
	
	
}
var dictionaryList = new Array();
function cloud_text()
{
	dictionaryList = new Array();
	dictionaryList["statusdisabledtxt"] = _T('_cloud','disable');
	dictionaryList["statusreadytxt"] = _T('_cloud','ready');
	dictionaryList["statusportforwardedtxt"] = _T('_cloud','connected');
	dictionaryList["statusrelayedtxt"] = _T('_cloud','connected_desc');
	dictionaryList["statusfailedtxt"] = _T('_cloud','failed');
	dictionaryList["statusconnectingtxt"] = _T('_cloud','connecting');
	dictionaryList["NewUnregisteredDeviceTxt"] = _T('_cloud','new_device');
	dictionaryList["statusdisconnectingtxt"] = _T('_cloud','disconnecting');
	dictionaryList["statusdisabledexplainedtxt"] = _T('_cloud','disable_desc');
	dictionaryList["statusdisabledexplained2txt"] = _T('_cloud','disable_desc2');
	dictionaryList["statusrelayedexplainedtxt"] = _T('_cloud','dexplainedtxt');
	dictionaryList["statusmanualrelayedexplainedtxt_part1"] = _T('_cloud','explainedtxt_part1');
	dictionaryList["statusmanualrelayedexplainedtxt_part2"] = _T('_cloud','explainedtxt_part2');
	dictionaryList["statusfailedexplainedtxt"] = _T('_cloud','failedexplainedtxt');
	dictionaryList["statusconnectingexplainedtxt"] = _T('_cloud','connectingexplainedtxt');
	dictionaryList["statusreadyexplainedtxt"] = _T('_cloud','readyexplainedtxt');
	dictionaryList['statusretrievingtxt'] = _T('_cloud','retrievingtxt');
	dictionaryList['statusportforwardedexplainedtxt'] = _T('_cloud','portforwardedexplainedtxt');
	
}
var gConnectivity_selection = "";
var gDeviceUsersCount=0;
var _Device_Status_Array = new Array();
var _cloud_entry = "";
function _REST_Get_Device_Status(entry)
{
	/*
	http://2.66.65.65/api/2.1/rest/device
	<device>
	<device_id>499827</device_id>
	<device_type>6</device_type>
	<communication_status>disabled</communication_status>
	<remote_access>true</remote_access>
	<local_ip />
	<default_ports_only>false</default_ports_only>
	<manual_port_forward>FALSE</manual_port_forward>
	<manual_external_http_port />
	<manual_external_https_port />
	<internal_port>80</internal_port>
	<internal_ssl_port>443</internal_ssl_port>
	 </device>	*/
	var timeout=10000;
	
	cloud_text();
	gDeviceUsersCount = _REST_get_device_user_count();
	clearTimeout(Cloud_StatusID);
	_cloud_entry = entry;
	
	wd_ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device",
		url: "/web/restAPI/restAPI_action.php?action=device",
		dataType: "xml",
		success:function(xml)
		{
			var communication_status = $(xml).find('communication_status').text();
			var remote_access = $(xml).find('remote_access').text();
			var manual_port_forward = $(xml).find('manual_port_forward').text().toLowerCase();
			var default_ports_only = $(xml).find('default_ports_only').text().toLowerCase();
			var manual_external_http_port = $(xml).find('manual_external_http_port').text();
			var manual_external_https_port = $(xml).find('manual_external_https_port').text();

			_Device_Status_Array.remote_access = remote_access;
			_Device_Status_Array.manual_port_forward = manual_port_forward;
			_Device_Status_Array.default_ports_only = default_ports_only;
			_Device_Status_Array.manual_external_http_port = manual_external_http_port;
			_Device_Status_Array.manual_external_https_port = manual_external_https_port;
		    var commStatusTxt = '';
		    var commStatusHelp = '';
		    if (remote_access == 'false') {
		    	
		    	setSwitch('#settings_generalCloud_switch',0);
		    	
		    	$("#settings_generalUSBContent_switch").attr('disabled',true);
		    	
		    	$("#settings_generalCloud_link").hide();
		        //$('#SettingNetworkRemoteAccessToggle').attr('checked', false);
		        //$('#remote_access_configure_section').hide();
		
		        //$('.remote_access_ui_state').each(function() {
		        //    $(this).addClass('ui-state-disabled');
		        //    $(this).attr('disabled', true);
		        //});
		    }
		    else {
		    	setSwitch('#settings_generalCloud_switch',1);
		    	$("#settings_generalUSBContent_switch").attr('disabled',false);
		    	
		        //$('#SettingNetworkRemoteAccessToggle').attr('checked', true);
		        //$('#remote_access_configure_section').show();
		        $("#settings_generalCloud_link").show();
		        //$('.remote_access_ui_state').each(function() {
		        //    $(this).removeClass('ui-state-disabled');
		        //    $(this).attr('disabled', false);
		        //});
		    }
			if(Option_click==0)
			{
			    if (manual_port_forward == 'true') {
			        //$("#remote_access_settings_connectivity_manual_button").addClass("button-selected");
			        //$("#remote_access_settings_connectivity_manual_description").show();
			        gConnectivity_selection = 'manual';
			    }
			    else if (default_ports_only == 'true') {
			       // $("#remote_access_settings_connectivity_winxp_button").addClass("button-selected");
			        //$("#remote_access_settings_connectivity_winxp_description").show();
			        gConnectivity_selection = 'winxp';
			    }
			    else {
			        //$("#remote_access_settings_connectivity_auto_button").addClass("button-selected");
			        //$("#remote_access_settings_connectivity_auto_description").show();
			        gConnectivity_selection = 'auto';
			    }
	    		
	    		SetCloudMode("#cloud_connectivity",gConnectivity_selection);
	    	}
//                 "Connection Status" : 'Ready' if remote_access = true and communication_status is empty.
//                                      'Disabled' if remote_access = false
//                                      'Connecting' if remote_access = true and communication_status = 'connecting'
//                                      'Relayed' if remote_access = true and communication_status = 'relayed'
//                                      'Direct' if remote_Access = true and communication_status = 'direct'
//                                      'Failed'       if remote_Access = true and communication_status ='failed'
   			if(remote_access=='true')
   			{
   				$("#cloud_getCode_button").removeClass('gray_out');
   			}
   			else
   			{	
   				$("#cloud_getCode_button").addClass('gray_out');
   			}
   		
		    switch(communication_status){
		        case 'disabled':
		            //if($('#SettingNetworkRemoteAccessToggle').is(':checked')) {
		            if (remote_access == 'true') {
		            	if (gDeviceUsersCount == 0) {
		                    commStatusTxt = dictionaryList['statusreadytxt'];
		                    commStatusHelp = dictionaryList['statusreadyexplainedtxt'];
		            	}
		            	else
		            	{
		                	commStatusTxt = dictionaryList['statusretrievingtxt'];
		                	commStatusHelp = "";
		                }
		            }
		            else {
		                commStatusTxt = dictionaryList['statusdisabledtxt'];
		                commStatusHelp = dictionaryList['statusdisabledexplainedtxt'] + " " + dictionaryList['statusdisabledexplained2txt'];
		            }
		    		break; 
		        case 'portforwarded':
		            if (remote_access == 'false') {
		                commStatusTxt = dictionaryList['statusretrievingtxt'];
		                commStatusHelp = '';
		            }
		            else {
		                commStatusTxt = dictionaryList['statusportforwardedtxt'];
		                commStatusHelp = dictionaryList['statusportforwardedexplainedtxt'];
		            }
		    		break; 
		        case 'relayed':
		            if (remote_access == 'false') {
		                commStatusTxt = dictionaryList['statusretrievingtxt'];
		                commStatusHelp = '';
		            }
		            else {
		                commStatusTxt = dictionaryList['statusrelayedtxt'];
		                commStatusHelp = '';
		                /*if (manual_port_forward == 'true') {
		                    commStatusHelp = dictionaryList['statusmanualrelayedexplainedtxt_part1'] + '&nbsp;' + manual_external_http_port + '&nbsp;' +dictionaryList['statusmanualrelayedexplainedtxt_part2'] + '&nbsp;' + manual_external_https_port + '.';
		                }
		                else if (default_ports_only == 'true') {
		                    //commStatusHelp = dictionaryList['statusmanualrelayedexplainedtxt'];
		                    commStatusHelp = dictionaryList['statusmanualrelayedexplainedtxt_part1'] + ' 80 ' + dictionaryList['statusmanualrelayedexplainedtxt_part2'] + ' 443.';
		                }
		                else {
		                    commStatusHelp = dictionaryList['statusrelayedexplainedtxt'];
		                }*/
		            }
		    		break; 
		        case 'connecting':
		            if (remote_access == 'false') {
		                commStatusTxt = dictionaryList['statusretrievingtxt'];
		                commStatusHelp = '';
		            }
		            else {
		                commStatusTxt = dictionaryList['statusconnectingtxt'];
		                commStatusHelp = dictionaryList['statusconnectingexplainedtxt'];
		            }
		            timeout=2000;
		            break; 
		        case 'failed':
		    	default:
		    		commStatusTxt = dictionaryList['statusfailedtxt'];
		            commStatusHelp = dictionaryList['statusfailedexplainedtxt'];
		    		break; 
		    }
			
		    if (gInternetAccess == 'false' && remote_access == 'true') {
		        commStatusTxt = dictionary['noInternetAccess'];
		        commStatusHelp = "";
		    }
    			
			//communication_status = communication_status.toLowerCase();
			$("#cloud_status_value").html(commStatusTxt);
			//console.log("entry=[%s] communication_status=[%s] remote_access=[%s]",entry,communication_status,remote_access)
			if(entry=='general' && communication_status=='disabled' && remote_access!='true')
				$("#cloud_status_tr").hide();
			else
			{
				$("#cloud_status_tr").show();
				$("#cloud_statusInfo_value").html(commStatusHelp);
			}
			
			Cloud_StatusID = setTimeout("_REST_Get_Device_Status('" + entry + "');", timeout);
		},
		error: function (request, status, error) {
    		commStatusTxt = dictionaryList['statusrelayedtxt'];
            commStatusHelp = dictionaryList['statusfailedexplainedtxt'];
            if(_LOCAL_LOGIN==0)
            {
                commStatusTxt = dictionaryList['statusportforwardedtxt'];
                commStatusHelp = dictionaryList['statusportforwardedexplainedtxt'];	
            }
			$("#cloud_status_value").html(commStatusTxt);
			$("#cloud_statusInfo_value").html(commStatusHelp);
			setSwitch('#settings_generalCloud_switch',0);

			Cloud_StatusID = setTimeout("_REST_Get_Device_Status('" + entry + "');", timeout);
			switch(request.status)
			{
				case 401:
					return;
					jAlert( _T('_login','msg5'), 'warning');
					
					$("#popup_ok").click( function (){
						location.replace("/web/login.html");
					});
					break;
				case 404:
					break;
			}
		}
	});
}
var _CloudUserInfo=new Array();
var _CloudWebUserInfo = new Array();
var _CloudWebUserInfo_Temp = new Array();
function _REST_Get_User_Access_Code(username)
{
	clearTimeout(_REST_USER_CODE_ID);
	_CloudWebUserInfo = new Array();
	_CloudUserInfo = new Array();
	//http://2.66.65.65/api/2.1/rest/device_user?username=admin
	$.ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device_user?username=" + username,
		url: "/web/restAPI/restAPI_action.php?action=device_user&username=" + username,
		dataType: "xml",
		success:function(xml)
		{
			//show user's code info
			var ul_obj = document.createElement("ul"); 
			$(ul_obj).addClass('CloudUserListDiv');	
			
			var dev_count = $(xml).find('device_user').length;
			var j=0;
			var webuserFlag=0;
			$(xml).find('type').each(function(index){
				if($(this).text().length==0)
				{
					j++;
				}
				
				if($(this).text()=="webuser")
				{
					webuserFlag=1;
				}
			});
			
			
			if(dev_count==0 || j== $(xml).find('type').length || webuserFlag==0)
			{
		    	_Cloud_User_Array.name= username;
				_Cloud_User_Array.mail= "-";
				
				api_show_device_user_info(username,"-");
			}
			
			var count=0;
			$(xml).find('device_user').each(function(index){
				var email = $(this).find('email').text();
				var dac = $(this).find('dac').text();
				var active = $(this).find('active').text();
				var device_user_auth_code = $(this).find('device_user_auth_code').text();
				var device_user_id = $(this).find('device_user_id').text();
				var new_dac;
				var dac_code1,dac_code2,dac_code3;
				var type = $(this).find('type').text();
			    var app = $(this).find('application').text();
			    var name = $(this).find('name').text();
			    var mail = $(this).find('email').text();
			    
			    if (type == "webuser") {
			    	
			    	_Cloud_User_Array.name= username;
					if(mail.length==0) mail = "-";
					_Cloud_User_Array.mail= mail;
					
					api_show_device_user_info(username,mail);
			        return true;
			    }
			    				
				if(dac!="")
				{
			        dac_code1 = dac.substr(0,4);
			        dac_code2 = dac.substr(4,4);
			        dac_code3 = dac.substr(8,4);
					new_dac = dac_code1+"-"+dac_code2+"-"+dac_code3;
				}
				else
					new_dac = "-";
				
				var dac_expiration = $(this).find('dac_expiration').text();
				var device_reg_date = $(this).find('device_reg_date').text();
				
				//var new_time = localizeTimeStamp(dac_expiration);
				var date = new Date(dac_expiration * 1000);
				var new_time = multi_lang_format_time(date);
				
			    var WDDeviceClass;
			    //type 1=iPhone, 2=iPod Touch, 3=iPad, 4=Android phone, 5=Andriod tablet, 6=WD Sync, else=generic phone 

			    switch (type) {
			        case '1': 
			            WDDeviceClass = 'mobile_access_iphone_icon';
			            break;
			        case '2': 
			            WDDeviceClass = 'mobile_access_ipod_icon';
			            break;
			        case '3':
			            WDDeviceClass = 'mobile_access_ipad_icon';
			            break;
			        case '4':
			            WDDeviceClass = 'mobile_access_android_phone_icon';
			            break;
			        case '5':
			            WDDeviceClass = 'mobile_access_android_tablet_icon';
			            break;
			        case '6' :
			            WDDeviceClass = 'mobile_access_computer_icon';
			            break;
			        default:
			            if ((type != null) && (type != '')) {
			                WDDeviceClass = 'mobile_access_generic_phone_icon';
			            }
			            else {
			                WDDeviceClass = 'mobile_access_unknown_device_icon';
			            }
			            break;
			    }

			    var WDAppImageClass;
			    var mobileapp = app;
			    if ((mobileapp != null) && (mobileapp != '')) {
			        if (mobileapp.substr(0,9) == 'WD Photos') {
			            WDAppImageClass = 'mobile_access_wdphotos_icon';
			        }
			        else if ((mobileapp.substr(0,7) == 'WD Sync') || (mobileapp.substr(0,15) == 'WD 2go LiveFile') || (type == '6')) {
			            WDAppImageClass = 'mobile_access_wdsync_icon';
			        } 
			        else if (mobileapp.substr(0,10) == 'WD 2go Pro') {
			            WDAppImageClass = 'mobile_access_wd2gopro_icon';
			        } 
			        else if (mobileapp.substr(0,6) == 'WD 2go' || mobileapp.indexOf("WD My Cloud")!=-1) {
			            WDAppImageClass = 'mobile_access_wd2go_icon';
			        } 
			        else if (mobileapp.indexOf("WD Cloud")!=-1) {
			            //WDAppImageClass = 'mobile_access_wdcloud_icon';
			            WDAppImageClass = 'mobile_access_wd2go_icon';
			        }
			        else {
			            //WDAppImageClass = 'mobile_access_unknown_app_icon';
			            WDAppImageClass = 'mobile_access_unknown_icon';
			        }
			    }

    			_CloudUserInfo[index] = new Array();
    			_CloudUserInfo[index].username = username;
    			_CloudUserInfo[index].email = email;
    			_CloudUserInfo[index].device_user_auth_code = device_user_auth_code;
    			_CloudUserInfo[index].device_user_id = device_user_id;
    			
				var li_obj = document.createElement("li");
				$(li_obj).append('<div class="mobile_icon '+ WDDeviceClass + '"></div>');
				var display_dac_icon=0;
			    if ((app != null) && (app != '')) {
			        $(li_obj).append('<div class="desc">' + name + '</div>');
			        $(li_obj).append('<div class="mobile_access_application_icon '+ WDAppImageClass + '">' + app +'</div>');
			        $(li_obj).append('<div class="dac_connected">' + _T('_cloud','connected') +'</div>');
			        
			    }
			    else {
			        $(li_obj).append('<div class="desc">' + dictionaryList["NewUnregisteredDeviceTxt"] + '</div>');
//			        if (MULTI_LANGUAGE == 17)
//			        	$(li_obj).append('<div class="timeInfo_x1">' + _T('_cloud','code2') +": " + new_dac + "<br>" + _T('_cloud','expires') + ": " + new_time + '</div>');
//			        else	
			        $(li_obj).append('<div class="timeInfo">' + _T('_cloud','code2') +": " + new_dac + "<br>" + _T('_cloud','expires') + ": " + new_time + '</div>');
			        display_dac_icon=1;
			    }
    
				
				$(li_obj).append('<div id="cloud_delCode'+ index + '_link" class="delIcon uTooltip" onclick="del_user_code(\'' + index + '\',this);" title="' + _T("_common","del") + '"></div>');	

		        dateStamp = new Date();
		        seconds = Math.round(dateStamp.getTime() / 1000);
				var expireFlag;
		        if (seconds > dac_expiration) {
		           // expired = true;
		           // expireTxt = dictionaryList['expiredtxt'];
		           // newDeviceUser.find('.mobile_access_dac_status').addClass("mobile_access_expired_dac_icon");
		           expireFlag=2;
		        }
		        //else if ( device_reg_date - seconds <= 3600) {
		        //    //newDeviceUser.find('.mobile_access_dac_status').addClass("mobile_access_new_dac_icon");
		        //    expireFlag=0;
		        //}
		        else {
		            //newDeviceUser.find('.mobile_access_dac_status').addClass("mobile_access_unexpired_dac_icon");
		            expireFlag=1;
		        }
        		
        		if (display_dac_icon==1) {	
					var icon_class="";
					switch(parseInt(expireFlag,10))
					{
						case 0:
							icon_class = "mobile_access_new_dac_icon";
							break;
						case 1:
							icon_class = "mobile_access_unexpired_dac_icon";
							break;
						case 2:
							icon_class = "mobile_access_expired_dac_icon";
							break;
					}
				
					$(li_obj).append('<div class="' + icon_class + '"></div>');
				}
				
				$(ul_obj).append($(li_obj));
				count++;
			})
			//console.log(count)
			var for_str = _T('_cloud','dev_for_info');
			for_str = for_str.replace(/%s/g,username);
			$("#dev_for_info").html(for_str);
			if(count==0)
			{
				$("#dev_for_info").show();
				$("#device_code_list").hide();
			}
			else
			{
				$("#dev_for_info").hide();
				$("#device_code_list").html($(ul_obj)).show();
			}
			
			if(_Device_Status_Array.remote_access=="false")
			{
				$(".delIcon").addClass('gray_out');
				$("#dev_for_info").show();
				$("#device_code_list").hide();
			}
			else
			{
				$(".delIcon").removeClass('gray_out');
				if(count==0)
					$("#dev_for_info").show();
				else
				{
				$("#dev_for_info").hide();
				$("#device_code_list").show();
			}
			}
			
			switch(parseInt(MULTI_LANGUAGE, 10))
			{
				case 15:	//pl
					$(".CloudUserListDiv .desc").css('width','245px');
					$(".CloudUserListDiv .timeInfo").css('width','270px');
					break;
				case 9:	//ru
					$(".CloudUserListDiv .desc").css('width','245px');
					$(".CloudUserListDiv .desc").css('font-size','12px');
					$(".CloudUserListDiv .timeInfo").css('width','270px');
					break;
				case 1:	//fr
					$(".CloudUserListDiv .desc").css('width','230px');
					$(".CloudUserListDiv .timeInfo").css('width','285px');
					break;
				case 2:	//it
				case 11:	//cz
				case 12:	//nl
					$(".CloudUserListDiv .desc").css('width','220px');
					$(".CloudUserListDiv .timeInfo").css('width','295px');
					break;
				case 3:	//de
				case 4:	//es
				case 13:	//Hungarian
				case 10:	//p
					$(".CloudUserListDiv .desc").css('width','210px');
					$(".CloudUserListDiv .timeInfo").css('width','305px');
					break;
				case 17:
					$(".CloudUserListDiv .desc").css('width','180px');
					$(".CloudUserListDiv .timeInfo").css('width','335px');					
					break;
			}
								
			init_tooltip(".uTooltip");
						
			_REST_USER_CODE_ID = setTimeout(function(){
				_REST_Get_User_Access_Code(username);
			},10000);

		},
		error: function (request, status, error) {
			switch(request.status)
			{
				case 401:
					break;
				case 500:
					break;
			}
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			//$("#device_code_list").html(errorsList[errID]).show();
			var for_str = _T('_cloud','dev_for_info');
			for_str = for_str.replace(/%s/g,username);
			$("#dev_for_info").show().html(for_str);
			$("#device_code_list").hide();
		}
	});
}
function _REST_Del_WDMyCloud_Account(username)
{
	var userID="";
	var device_user_auth_code="";

	userID = _CloudWebUserInfo2.device_user_id;
	device_user_auth_code = _CloudWebUserInfo2.device_user_auth_code;
	
//	console.log("[%s] [%s]",userID,device_user_auth_code)
	
//	for(i in _CloudWebUserInfo)
//	{
//		if(_CloudWebUserInfo[i].username==username)
//		{
//			userID = _CloudWebUserInfo[i].device_user_id;
//			device_user_auth_code = _CloudWebUserInfo[i].device_user_auth_code;
//			break;
//		}
//	}
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	//http://2.66.69.244/api/2.1/rest/device_user/2561938?device_user_auth_code=879d9c7a41b96875d679f06a368f3869
	$.ajax({
		type: "DELETE",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user/" + userID + 
				"?device_user_auth_code=" + device_user_auth_code,
		/*url: "/web/restAPI/restAPI_action.php?action=device_user",
		data: {
			send_type: 'DELETE',
			userID: userID,
			device_user_auth_code: device_user_auth_code
		},*/
		dataType: "xml",
		success:function(xml)
		{
			api_cp2flash();
			_post_remove_mail();
				do_query_user(username);
			jLoadingClose();
		},
	    error: function (request, status, error) {
	    	jLoadingClose();
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
	    }
	});
	
	function _post_remove_mail()
	{
		$.ajax({
			type: "POST",
			cache: false,
			url: "/cgi-bin/account_mgr.cgi",
			data:{cmd:"cgi_remove_email",username:username},
			success: function(){
				do_query_user(username);
			}
		});
	}
}
function _REST_Del_User_Code(idx)
{
	var name = _CloudUserInfo[idx].username ;
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	$.ajax({
		type: "DELETE",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user/" + _CloudUserInfo[idx].device_user_id + 
				"?device_user_auth_code=" + _CloudUserInfo[idx].device_user_auth_code,
		//url: "/web/restAPI/restAPI_action.php?action=device_user",
		data: {
			send_type: 'DELETE',
			userID: _CloudUserInfo[idx].device_user_id,
			device_user_auth_code: _CloudUserInfo[idx].device_user_auth_code
		},
		dataType: "xml",
		success:function(xml)
		{
			api_cp2flash();
			setTimeout("jLoadingClose()",1000);
			_REST_Get_User_Access_Code(name);
		},
	    error: function (request, status, error) {
	    	jLoadingClose();
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
		}
	});
		
	//http://localhost/api/2.1/rest/device_user/{deviceUserId}?device_user_auth_code={auth_code}
}

function _REST_Set_Cloud_Access(remote_access,parameter,callback)
{
	//remote_access: true | false
	
	if(!callback)jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	$.ajax({
		type: "POST",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device?remote_access=" + remote_access + parameter,
		url: "/web/restAPI/restAPI_action.php?action=device&remote_access=" + remote_access + parameter,
		data: {
			send_type: 'PUT'
		},
		dataType: "xml",
		success:function(xml)
		{
			if(!callback)
			{
			if(remote_access=="true") 
			{	
				setSwitch('#settings_generalCloud_switch',1);
				$("#settings_generalCloud_link").show();
			}
			else
			{
				$("#settings_generalCloud_link").hide();
			}
			}
		},
	    error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
	    },
        complete: function (jqXHR, textStatus) {
        	clearTimeout(Cloud_StatusID);
			_REST_Get_Device_Status(_cloud_entry);
			if(!callback)jLoadingClose();
			//api_restart_server(); //fish20150401 mark, restart service move to REST API
			if(callback) callback();
        }
	});
	
}
function _REST_Get_Device_User_info(username)
{
	var device_uesr_info="";
	$.ajax({
		type: "GET",
		async:false,
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device_user?username=" + username,
		url: "/web/restAPI/restAPI_action.php?action=device_user&username=" + username,
		dataType: "xml",
		success:function(xml)
		{
			$(xml).find('device_user').each(function(index){
				var type = $(this).find('type').text();
			    if (type == "webuser") {
			    	device_uesr_info =  $(this);
			    	return false;
			    }
			});
		},
		error: function (request, status, error) {
			
		}
	});
	
	return device_uesr_info;
}
function _REST_Mod_User(oldName,newName,is_admin,callback)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	//http://localhost/api/@REST_API_VERSION/rest/users/{existing_username}
	
	wd_ajax({
		type: "put",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/users/" + oldName,
		dataType: "xml",
		data:{username:newName,is_admin:is_admin},
		success:function(xml)
		{
			jLoadingClose();
			
			if(callback)callback();
		},
	    error: function (request, status, error) {
	    	
	    	jLoadingClose();
	    	
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			//jAlert( err, _T('_common','error'));
			//jLoadingClose();
			jAlert( _T('_cloud','msg1'), _T('_common','error'));
	    }
	});	
}

function _REST_User_Delete(ftype,username,device_user_info,callback)
{
	var res="";
	var device_user_id = $(device_user_info).find('device_user_id').text();
	var device_user_auth_code = $(device_user_info).find('device_user_auth_code').text();
	
	//console.log("device_user_id=[%s] [%s][%s]",device_user_id,device_user_auth_code,device_user_info);
	if(device_user_id.length==0 || device_user_auth_code.length==0) return -1;
	
	//http://localhost/api/2.1/rest/device_user/{deviceUserId}?device_user_auth_code={auth_code}
	wd_ajax({
		type: "DELETE",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user/" + device_user_id + "?device_user_auth_code=" + device_user_auth_code,
		/*url: "/web/restAPI/restAPI_action.php?action=device_user",
		data: {
			send_type: 'DELETE',
			userID: device_user_id,
			device_user_auth_code: device_user_auth_code
		},*/
		dataType: "xml",
		success:function(xml)
		{
			api_cp2flash();
			if(callback) callback(1);
		},
		error: function (request, status, error) {
			switch(request.status)
			{
				case 401:
					break;
				case 500:
					break;
			}

			if(ftype==1)
			{
				jLoadingClose();
			var $xml = $(request.responseText);
				var res = $xml.find('error_message').text();
				var errID = "error_id_" + $xml.find('error_id').text();
				jAlert( errorsList[errID], _T('_common','error'));
			}
			
			if(callback) callback(-1);
		}
	});
}
function _REST_Change_Mail(ftype,username,device_user_info,mail,callback)
{
	//ftype: 1,remove email ,only call "DELETE"
	//		 2,change email ,call "DELETE" and "POST"
	//		 3,change email ,call "DELETE" and "POST" (no need to reload user info)
	
	var device_user_id = $(device_user_info).find('device_user_id').text();
	var device_user_auth_code = $(device_user_info).find('device_user_auth_code').text();
	var type = $(device_user_info).find('type').text();
	
	//fish20140210 for ITR:85861 , should to call "DELETE" and "POST"
	_REST_User_Delete(ftype,username,device_user_info,function(res){
		
		if(res==1)//1:success -1:fall
		{
			if(ftype==2 || ftype==3 )
			{
			_REST_Create_User(username,mail,"false",function(res){
				
					if(ftype==2)
					{
			  	jLoadingClose();
			  	get_account_xml('noLoading',function(){
			  		get_user_list(username);//reload user info	
			  	});
					}
		  	
				if(callback)callback(res);
			});
		}
		else
		{
				if(callback)callback(1);
			}
		}
		else
		{
			if(callback)callback(-1);
		}
	});//fish20140210 for ITR:85861 , should to call "DELETE" and "POST"
	
	/*
	$.ajax({
		type: "PUT",
		async: false,
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user/" +device_user_id +"?type=webuser"+"&name="+username+"&email="+mail,
		dataType: "xml",
		success:function(xml)
		{
			return 0;	
		},
	    error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
			return -1;
	    }
	});*/
}
function _REST_get_device_user_count()
{
	var count=0;
	$.ajax({
		type: "GET",
		rsync: false,
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device_user",
		url: "/web/restAPI/restAPI_action.php?action=device_user",
		dataType: "xml",
		success:function(xml)
		{
			count = $(xml).find("device_users > device_user").length;
		}
	});
	
	return count;
}
function _REST_Create_User(username,email,async,callback)
{
	var res=0;
	//http://2.66.69.244/api/2.1/rest/device_user?email=xx&username=xx
	wd_ajax({
		type: "POST",
		async: async,
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user",
		data:{username:username,email:email,send_email:"true"},
		dataType: "xml",
		success:function(xml)
		{
			if(callback) callback(res);
			api_cp2flash();
		},
	    error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
			res=-1;
			if(callback) callback(res);
		}
	});
	
	
}
function _REST_Device_Desc(hostname,desc,callback)
{
	//http://localhost/api/2.1/rest/device_description?machine_name=xx&machine_desc=xx
	$.ajax({
		type: "POST",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device_description",
		url: "/web/restAPI/restAPI_action.php?action=device_description",
		data:{
			send_type: 'PUT',
			machine_name:hostname,
			machine_desc:desc
		},
		dataType: "xml",
		success:function(xml)
		{
			if(callback)callback();
		},
	    error: function (request, status, error) {
	    	jLoadingClose();
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
	    }
	});
}

function _REST_Get_Cloud_Info()
{
	var Remote_Access="";
	wd_ajax({
		type: "GET",
		async: false,
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device",
		url: "/web/restAPI/restAPI_action.php?action=device",
		dataType: "xml",
		success:function(xml)
		{
			Remote_Access= $(xml).find('remote_access').text();
		},
		error: function (request, status, error) {
			Remote_Access="false";
		}
	});
	
	return Remote_Access;
}
var DB_PATH = "/usr/local/nas/orion/orion.db";
function api_cp2flash()
{
	wd_ajax({
		type:"POST",
		cache: false,
		url: "/web/php/cloud.php",
		data: "cmd=cp2flash&filename="+DB_PATH,	
		dataType: "html",
		success: function(data){	
		}
	});
}
var _CloudWebUserInfo2 = new Array();
function get_user_id(username)
{
	_CloudWebUserInfo2 = new Array();
	//http://2.66.65.65/api/2.1/rest/device_user?username=admin
	$.ajax({
		type: "GET",
		async: false,
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user?username=" + username,
		dataType: "xml",
		success:function(xml)
		{
			var count=0;
			var flag=0;
			$(xml).find('device_user').each(function(index){
				var device_user_id = $(this).find('device_user_id').text();
				var email = $(this).find('email').text();
				var device_user_auth_code = $(this).find('device_user_auth_code').text();
				var type = $(this).find('type').text();
			   
			    if (type == "webuser") {
			    	_CloudWebUserInfo2.username = username;
			    	_CloudWebUserInfo2.device_user_id = device_user_id;
			    	_CloudWebUserInfo2.email = email;
			    	_CloudWebUserInfo2.device_user_auth_code = device_user_auth_code;
			    	flag=1;
			        return true;
			    }
			})
			
			if(flag==0)
			{
		    	_CloudWebUserInfo2.username = username;
		    	_CloudWebUserInfo2.device_user_id = "";
		    	_CloudWebUserInfo2.email = "";
		    	_CloudWebUserInfo2.device_user_auth_code = "";
			}
		},
		error: function (request, status, error) {

		}
	});
}

function api_show_device_user_info(username,mail)
{
	//show user's info
	var ul_obj = document.createElement("ul");
	$(ul_obj).addClass('CloudUserListDiv');
	
	var li_obj = document.createElement("li"); 
	$(li_obj).append('<div class="cloudIcon"></div>');
	$(li_obj).append('<div class="email">' + mail + '</div>');
	
	if(mail=='-')
	{
		$("#device_user").hide();
		var s = '<button type="button" id="cloud_signUp_button" class="sign_up_button" onclick="edit_regist_mail(\'' + username + '\',this);">'+ _T('_cloud','sing_up') + '</button>';
			s += _T('_cloud','signup_desc');
			s = s.replace(/%s/,username);
			
		$("#device_user_none_email").show().html(s);
	}
	else
	{
		$(li_obj).append('<div class="delIcon" id="cloud_delAccount_link" onclick="del_cloud_account(\'' + username + '\',this);" ></div>');
		$(li_obj).append('<div class="emailIcon" id="cloud_sendMail_link" onclick="send_regist_mail(\'' + username + '\',this);"></div>');
	
		$(li_obj).append('<div class="edit" id="cloud_editMail_link" onclick="edit_regist_mail(\'' + username + '\',this);" ></div>');
		
		$(ul_obj).append($(li_obj));
		
		$("#device_user").show().html($(ul_obj));
		$("#device_user_none_email").hide();
		$("#cloud_editMail_link").attr("title",_T("_cloud","edit")).addClass("uTooltip");
		$("#cloud_sendMail_link").attr("title",_T("_cloud","resend")).addClass("uTooltip");
		$("#cloud_delAccount_link").attr("title",_T("_common","del")).addClass("uTooltip");
		init_tooltip(".uTooltip");
	}
	
	if(_Device_Status_Array.remote_access=="false")
	{
		$(".edit").addClass('gray_out');
		$(".emailIcon").addClass('gray_out');
		$(".delIcon").addClass('gray_out');
		$(".sign_up_button").addClass('gray_out');
	}
	else
	{
		$(".edit").removeClass('gray_out');
		$(".emailIcon").removeClass('gray_out');
		$(".delIcon").removeClass('gray_out');
		$(".sign_up_button").removeClass('gray_out');	
	}
}
var gInternetAccess="true";
function _REST_Get_Internet_Access()
{
	wd_ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/internet_access",
		url: "/web/restAPI/restAPI_action.php?action=internet_access",
		dataType: "xml",
		success:function(xml)
		{
			gInternetAccess = $(xml).find('connectivity').text();
		},
	    error: function (request, status, error) {
			gInternetAccess="false";
	    }
	});
}

function api_restart_server()
{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/web/php/cloud.php",
		data:{cmd:"restart_server"},
		dataType: "xml",
		success:function(xml)
		{
			
		},
	    error: function (request, status, error) {
			
	    }
	});	
}

function _REST_Device(callback)
{
	var _CloudDeviceInfo = new Array();
	wd_ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device",
		url: "/web/restAPI/restAPI_action.php?action=device",
		dataType: "xml",
		success:function(xml)
		{
			var communication_status = $(xml).find('communication_status').text();
			var remote_access = $(xml).find('remote_access').text();
			var manual_port_forward = $(xml).find('manual_port_forward').text().toLowerCase();
			var default_ports_only = $(xml).find('default_ports_only').text().toLowerCase();
			var manual_external_http_port = $(xml).find('manual_external_http_port').text();
			var manual_external_https_port = $(xml).find('manual_external_https_port').text();

			_CloudDeviceInfo.remote_access = remote_access;
			_CloudDeviceInfo.manual_port_forward = manual_port_forward;
			_CloudDeviceInfo.default_ports_only = default_ports_only;
			_CloudDeviceInfo.manual_external_http_port = manual_external_http_port;
			_CloudDeviceInfo.manual_external_https_port = manual_external_https_port;
			
			if(callback) callback(_CloudDeviceInfo);
		},
		error: function (request, status, error) {
		}
	});
}
function _REST_set_external_volume_scan(v)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	wd_ajax({
		type: "PUT",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/external_volume_scan?external_scan="+ v,
		dataType: "xml",
		success:function(xml)
		{
			jLoadingClose();
			if($(xml).find("status").text()!="success")
			{
				jAlert( _T('_remote_backup','fail'), 'warning');
			}
		},
		error: function (request, status, error) {
		}
	});
}

function _REST_get_external_volume_scan()
{
	wd_ajax({
		type: "GET",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/external_volume_scan?external_scan",
		dataType: "xml",
		success:function(xml)
		{
			var v = $(xml).find("external_scan").text();
			(v=="true")? v=1:v=0;
			setSwitch('#settings_generalUSBContent_switch',v);
		},
		error: function (request, status, error) {
		}
	});	
}function _REST_Set_User_Permission(sharename,username,permission)
{
	var r="",w="",d="";
	
	for(var i=0 in _SMBInfo)
	{
		if(_SMBInfo[i].sname==sharename)
		{
			r=_SMBInfo[i].read_list;
			w=_SMBInfo[i].write_list;
			d=_SMBInfo[i].invalid_users;
			break;
		}
	}
	
	var tmpName = "#" + username +"#";
	var _Type = "";
	var _Url = "";
	if(permission=="RW" || permission=="RO")
	{
		if(r.indexOf(tmpName)==-1 && w.indexOf(tmpName)==-1)
		{
			_Type = "POST";
		}
		else
		{
			if(r.indexOf(tmpName)!=-1 && permission=="RO")
			{
				jLoadingClose();
				return;
			}

			if(w.indexOf(tmpName)!=-1 && permission=="RW")
			{
				jLoadingClose();
				return;
			}
						
			_Type = "PUT";
		}

		//_Url = "/api/" + REST_VERSION + "/rest/share_access/" + sharename + "?username=" + username+ "&access=" + permission;
		_Url = "/web/restAPI/restAPI_action.php?action=share_access&access=" + permission;
	}
	else
	{
		if(d.indexOf(tmpName)!=-1)
		{
			jLoadingClose();
			return;
		}
		else if(r.indexOf(tmpName)==-1 && w.indexOf(tmpName)==-1)
		{
			jLoadingClose();
			return;
		}
		_Type = "DELETE";
		//_Url = "/api/" + REST_VERSION + "/rest/share_access/" + sharename + "?username=" + username;
		_Url = "/web/restAPI/restAPI_action.php?action=share_access";
	}
	
	wd_ajax({
		type: 'POST',
		cache: false,
		url: _Url,
		dataType: "xml",
		data: {
			send_type: _Type,
			sharename: sharename,
			username: username
		},
		success:function(xml)
		{
			get_smb_xml(function(){
			Get_SMB_Info();
			jLoadingClose();
			});
		},
		error: function (request, status, error) {
	    	jLoadingClose();
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
		}
	});
}
function _REST_Set_Share_Permission(sharename,username,permission)
{
	var r = __SHARE_LIST_INFO[_SEL_INDEX].read_list;
	var w = __SHARE_LIST_INFO[_SEL_INDEX].write_list;
	var d = __SHARE_LIST_INFO[_SEL_INDEX].invalid_users;
	
	var tmpName = "#" + username +"#";
	
	var _Type = "";
	var _Url = "";
	if(permission=="RW" || permission=="RO")
	{
		if(r.indexOf(tmpName)==-1 && w.indexOf(tmpName)==-1)
		{
			_Type = "POST";
		}
		else
		{
			if(r.indexOf(tmpName)!=-1 && permission=="RO")
			{
				jLoadingClose();
				return;
			}

			if(w.indexOf(tmpName)!=-1 && permission=="RW")
			{
				jLoadingClose();
				return;
			}
						
			_Type = "PUT";
		}

		//_Url = "/api/" + REST_VERSION + "/rest/share_access/" + sharename + "?username=" + username+ "&access=" + permission;
		_Url = "/web/restAPI/restAPI_action.php?action=share_access&access=" + permission;
	}
	else
	{
		if(d.indexOf(tmpName)!=-1)
		{
			jLoadingClose();
			return;
		}
		else if(r.indexOf(tmpName)==-1 && w.indexOf(tmpName)==-1)
		{
			jLoadingClose();
			return;
		}
		_Type = "DELETE";
		//_Url = "/api/" + REST_VERSION + "/rest/share_access/" + sharename + "?username=" + username;
		_Url = "/web/restAPI/restAPI_action.php?action=share_access";
	}
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: _Url,
		data: {
			send_type: _Type,
			sharename: sharename,
			username: username
		},
		dataType: "xml",
		success:function(xml)
		{			
			var r="",w="",d="";
			if(__SHARE_LIST_INFO[_SEL_INDEX].read_list.length!=0)
			{
				r=__SHARE_LIST_INFO[_SEL_INDEX].read_list.replace(/#/g,"").split(",");
			}
			if(__SHARE_LIST_INFO[_SEL_INDEX].write_list.length!=0)
			{
				w=__SHARE_LIST_INFO[_SEL_INDEX].write_list.replace(/#/g,"").split(",");
			}
			if(__SHARE_LIST_INFO[_SEL_INDEX].invalid_users.length!=0)
			{
				d=__SHARE_LIST_INFO[_SEL_INDEX].invalid_users.replace(/#/g,"").split(",");
			}
			
			var _r = new Array();
			var _w = new Array();
			var _d = new Array();

			for(var i=0 in r)
			{
				if(r[i]==username)
				{
					continue;
				}
				else
				{
					_r.push(r[i]);
				}
			}
			
			for(var i=0 in w)
			{
				if(w[i]==username)
				{
					continue;
				}
				else
				{
					_w.push(w[i]);
				}
			}

			for(var i=0 in d)
			{
				if(d[i]==username)
				{
					continue;
				}
				else
				{
					_d.push(d[i]);
				}
			}

			var newRO="",newRW="",newD="";
			if(_r.length!=0)
			{
				newRO= _r.toString().replace(/,/g,'#,#');
				newRO = "#" + newRO +"#";
			}
			if(_w.length!=0)
			{
				newRW= _w.toString().replace(/,/g,'#,#');
				newRW = "#" + newRW +"#";
			}
			if(_d.length!=0)
			{
				newD= _d.toString().replace(/,/g,'#,#');
				newD = "#" + newD +"#";
			}
			
			if(permission=="RW")
			{
				__SHARE_LIST_INFO[_SEL_INDEX].read_list = newRO;
				
				if(newRW.length!=0)
				{
					__SHARE_LIST_INFO[_SEL_INDEX].write_list = newRW + "," + tmpName;
				}
				else
				{
					__SHARE_LIST_INFO[_SEL_INDEX].write_list = tmpName;
				}
				__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = newD;
			}
			else if( permission=="RO")
			{
				if(newRO.length!=0)
				{
					__SHARE_LIST_INFO[_SEL_INDEX].read_list = newRO + "," + tmpName;
				}
				else
				{
					__SHARE_LIST_INFO[_SEL_INDEX].read_list = tmpName;
				}
				__SHARE_LIST_INFO[_SEL_INDEX].write_list = newRW;
				__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = newD;
			}
			else
			{
				__SHARE_LIST_INFO[_SEL_INDEX].read_list = newRO;
				__SHARE_LIST_INFO[_SEL_INDEX].write_list = newRW;
				if(newD.length!=0)
				{
					__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = newD + "," + tmpName;
				}
				else
				{
					__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = tmpName;
				}
				
			}
			
			jLoadingClose();
		},
		error: function (request, status, error) {
	    	jLoadingClose();
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
		}
	});
}