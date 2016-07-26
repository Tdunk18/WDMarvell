var __CLOUD_USER_LIST_INFO = new Array();
function get_cloud_user_list()
{
	$(".cloudMenuList").empty();

	__CLOUD_USER_LIST_INFO = new Array();
	
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			
			var cloudholderMember= new Array();
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();

				if(gname==_Filter_Default_Group[0])	//0:cloudholders
				{
					$(this).find('users > user').each(function(){
						cloudholderMember.push($(this).text());
					});
				}
			});
				
			var aIndex=0;
			$(xml).find('users > item').each(function(index){
				//console.log(user_name)
				var user_name = $(this).find('name').text();
				var uid = $(this).find('uid').text();
				
				if(uid==_ADMIN_UID)
				{
					_CADMIN = user_name;
					_ADMIN_UID = uid;
					return true;					
				}
				
				//check user in cloudholders 
				if( api_filter_user(user_name,cloudholderMember) == 1 ) return true; //non-cloudholders users cannot show on GUI
				
				__CLOUD_USER_LIST_INFO[aIndex] = new Array();
				__CLOUD_USER_LIST_INFO[aIndex].username = user_name;
				__CLOUD_USER_LIST_INFO[aIndex].uid = uid;
				aIndex++;
			});
						
			__CLOUD_USER_LIST_INFO.sort(function(a, b){
			    var a1= a.username, b1= b.username;
			    if(!b1) b1=a1;
			    if(a1== b1) return 0;
			    return a1> b1? 1: -1;
			});
			
			var _admin_info = new Array()
			_admin_info[0] = new Array();
			_admin_info[0].username = _CADMIN;
			_admin_info[0].uid = _ADMIN_UID;
			
			var tmpArray = _admin_info.concat(__CLOUD_USER_LIST_INFO);
			__CLOUD_USER_LIST_INFO = tmpArray;
			
			for(i in __CLOUD_USER_LIST_INFO)
			{
				var li_obj = document.createElement("li");
				var user_name = __CLOUD_USER_LIST_INFO[i].username;
				$(li_obj).attr("id","cloud_account_" + user_name);
				if(user_name==_CADMIN)
					$(li_obj).html( "<div class='adminicon' rel='" + i +"'></div><div class='uName'>" + user_name + "</div>" );
				else
					$(li_obj).html( "<div class='uicon' rel='" + i +"'></div><div class='uName'>" + user_name + "</div>" );
				
				$(li_obj).attr('tabindex','0');
				$(".cloudMenuList").append($(li_obj));		
			}

			if( __CLOUD_USER_LIST_INFO.length > 6)
			{
				$(".ButtonArrowTop").removeClass('disable');
				$(".ButtonArrowTop").addClass('enable');

				$(".ButtonArrowBottom").removeClass('disable');
				$(".ButtonArrowBottom").addClass('enable');
			}
			else
			{
				$(".ButtonArrowTop").addClass('disable');
				$(".ButtonArrowTop").removeClass('enable');

				$(".ButtonArrowBottom").addClass('disable');
				$(".ButtonArrowBottom").removeClass('enable');				
			}
						
			$('.cloudMenuList li').unbind("click");
		    $('.cloudMenuList li').click(function() {
			    $('.cloudMenuList li').each(function() {
					$(this).removeClass('LightningSubMenuOn');
			    });
			    
			    $(this).addClass('LightningSubMenuOn');
			    
			    var i = $(this).children().attr('rel');
	
				_SEL_USER_INDEX = i;
				 do_query_user(__CLOUD_USER_LIST_INFO[i].username);		    
		    });
		    
			$('.cloudMenuList li').keypress(function(e) {
				if (e.keyCode=='13')
					$(this).click();
			});
		},
		error: function (request, status, error) {
			//alert("Error: " +error);
		}
	});
}

var _Cloud_User_Array = {name:"",mail:""};
function do_query_user(username)
{	
	var for_str = _T('_cloud','cloud_for');
	for_str = for_str.replace(/%s/g,username)
	$("#cloud_for").html(for_str);
	
	$("#cloud_desc").hide();
	$("#cloud_detail").show();
	
	for_str = _T('_cloud','dev_for');
	for_str = for_str.replace(/%s/g,username)
	$("#dev_for").html(for_str);
	_REST_Get_User_Access_Code(username);

}
function init_dashboard_click()
{
	$("#settings_generalCloudDashboard_switch").unbind('click');
    $("#settings_generalCloudDashboard_switch").click(function(){
		var pwFlag = chk_admin_pw_flag();
		var v = getSwitch('#settings_generalCloudDashboard_switch');
		if( v ==1)
		{
			var msg="";
			if(pwFlag=="0")
			{
				$("#DashboardPwDiag .TooltipIconError").removeClass('SaveButton');
				$("#DashboardPwDiag .TooltipIconError").addClass('SaveButton');
	
			  	pw_Obj=$("#DashboardPwDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
		  					onClose: function() {
								setSwitch('#settings_generalCloudDashboard_switch',_dashFlag);
							}});
				pw_Obj.load();
				$("#dash_pw_tb input[name='settings_generalPW_password']").focus();
				$("#DashboardPwDiag_title").html(_T('_cloud','dash_access').replace(/<br>/g,""))
			}
			else
			{
				_showConfirm();
			}
		}
		else
		{
			//$("#dashboard_conf_div").hide();
			set_dashboard_cloud_access(0);
		}
	});	
}
function init_dashboard_diag()
{
	var title_str = _T('_cloud','enable_title')
	$("#DashboardCloudDiag_title").html(title_str);
	
	adjust_dialog_size("#DashboardCloudDiag",450,"");
  	var dashboard_Obj=$("#DashboardCloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	dashboard_Obj.load();
	_DIALOG = dashboard_Obj;
	
	$("#DashboardCloudDiag .close").click(function(){
		$('#DashboardCloudDiag .close').unbind('click');
		dashboard_Obj.close();
		$("#DashboardCloudAccess_tb input[name='settings_generalCloudHTTPPort_text']").val(_HTTP_PORT);
		$("#DashboardCloudAccess_tb input[name='settings_generalCloudHTTPSPort_text']").val(_HTTPS_PORT);
	});
}

function init_cloud_option_diag()
{
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
		
	adjust_dialog_size("#CloudOptionDiag",750,0);
	
	$("#CloudOptionDiag_title").html(_T('_cloud','option_title'))

	$("#tip_connecitvity").attr('title',_T('_tip','cloud_automatic'));
	$("#tip_cloud_rebuild").attr('title',_T('_tip','cloud_rebuild'));	
	init_tooltip();
		
  	var option_Obj=$("#CloudOptionDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  					onClose: function() {
						Option_click=0;
						SetCloudMode("#cloud_connectivity",gConnectivity_selection);
					}
				});		
	var http_port = _Device_Status_Array.manual_external_http_port;
	var https_port = _Device_Status_Array.manual_external_https_port;
	var http_port_obj = $("#option_tb input[name='settings_generalCloudHTTPPort_text']");
	var https_port_obj = $("#option_tb input[name='settings_generalCloudHTTPSPort_text']");
	
	(http_port!="")? http_port_obj.val(http_port): http_port_obj.val("80");
	(https_port!="")? https_port_obj.val(https_port): https_port_obj.val("443");
	
	option_Obj.load();	
	_DIALOG = option_Obj;
	ui_tab("#CloudOptionDiag","#settings_generalCloudAuto_button","#settings_generalCloudSave_button");
}
function init_cloud_access_dialog(entry_page)
{
	$("#sendCloudMailDiag").hide();
	$("#editCloudMailDiag").hide();
	$("#cloudAddAccessDiag").show();
	$("#cloudGetCodeDiag").hide();
	
	$("#editCloudDiag_title").html(_T('_cloud','add_access'))
		
	adjust_dialog_size("#CloudDiag",620,"");
	
  	var access_Obj=$("#CloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	access_Obj.load();

	$.ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			
			write_user_option(xml);
			ui_tab("#CloudDiag","#user_main","#home_cloudGetCode_button");
		}
	});
}

function del_cloud_account(username,obj)
{
	if($(obj).hasClass('gray_out')) {return;}
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
		
	get_user_id(username);	//rest.js
	
	var email = $(".email").html();
	var msg = _T('_cloud','msg3').replace(/%s/g,email);
	jConfirm('M',msg,_T('_cloud','del_title'),"cloud2",function(r){
		if(r)
		{
			_REST_Del_WDMyCloud_Account(username);
		}
    });
}
function del_user_code(idx,obj)
{
	if($(obj).hasClass('gray_out')) {return;}
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
		
	jConfirm('M',_T('_cloud','msg4'),_T('_cloud','del_code_title'),"cloud2",function(r){
		if(r)
		{
			_REST_Del_User_Code(idx);
		}
    });
}
function send_regist_mail(username,obj)
{
	if($(obj).hasClass('gray_out')) {return;}
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
		
	$("#sendCloudMailDiag").show();
	$("#editCloudMailDiag").hide();
	$("#cloudAddAccessDiag").hide();
	$("#cloudGetCodeDiag").hide();
	
	$("#editCloudDiag_title").html(_T('_cloud','reg_mail'));
	

	get_user_id(username);
	var userID = _CloudWebUserInfo2.device_user_id;
	var email = _CloudWebUserInfo2.email;	
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	$.ajax({
		type: "PUT",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user/" +userID+"?resend_email=true"+"&type=webuser"+"&name="+username+"&email="+email,
		/*url: "/web/restAPI/restAPI_action.php?action=device_user",
		data: {
			send_type: 'PUT',
			userID: userID,
			resend_email: "true",
			type: "webuser",
			name: username,
			username: email
		},*/
		dataType: "xml",
		success:function(xml)
		{
			var status = $(xml).find('status').text();
		},
	    error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
	    },
        complete: function (jqXHR, textStatus) {
        	jLoadingClose();
        }
	});
}

function edit_regist_mail(username,obj)
{
	if($(obj).hasClass('gray_out')) {return;}
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
	
	$("#sendCloudMailDiag").hide();
	$("#editCloudMailDiag").show();
	$("#cloudAddAccessDiag").hide();
	$("#cloudGetCodeDiag").hide();
	
	$("input:text").inputReset();
	
	$("#editCloudDiag_title").html(_T('_cloud','update_title'))
	adjust_dialog_size("#CloudDiag",650,0);
	
	$("#cloud_old_mail_address").html(_Cloud_User_Array.mail);
	$("#cloud_mail_text").val("");
	
	get_user_id(username);
  	var edit_Obj=$("#CloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
			onBeforeClose: function() {            			
        	}
        });
	edit_Obj.load();
	
	$("#cloud_mail_text").unbind('keypress');
	$("#cloud_mail_text").keypress(function(event) {
		if ( event.which == 13 ) {
			post_edit_email();
			//$("#edit_cloudMail_button").click();
		}
	});
	
	$("#cloud_mail_text").focus();
}
function post_edit_email()
{
		//check mail address
		var mail = $("#cloud_mail_text").val();
		if(checkmail(mail))
		{
			jAlert( _T('_mail','msg22'), _T('_common','error'));
			$("#popup_ok_button").click( function (){
				$("#popup_ok_button").unbind("click");
				$("#cloud_mail_text").focus();
			});
			return;
		}
		
		var userID="";
	
	userID = _CloudWebUserInfo2.device_user_id;
	var username = _CloudWebUserInfo2.username;
	//console.log("id[%s]",userID)
	if(_CloudWebUserInfo2.device_user_id=="")
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		//http://2.66.69.244/api/2.1/rest/device_user?email=xx&username=xx
		wd_ajax({
			type: "POST",
			cache: false,
			url: "/api/" + REST_VERSION + "/rest/device_user",
			data:{username:username,email:mail,send_email:"true"},
			dataType: "xml",
			success:function(xml)
		{
				//api_cp2flash();
				_modify_mail();
			},
		    error: function (request, status, error) {
		    	jLoadingClose();
				var $xml = $(request.responseText);
				var err = $xml.find('error_message').text();
				var errID = "error_id_" + $xml.find('error_id').text();
				jAlert( errorsList[errID], _T('_common','error'));
		    }
		});
			return;
		}

	jLoading(_T('_common','set'), 'loading' ,'s',''); //msg,title,size,callback
	var device_user_info = _REST_Get_Device_User_info(username);

	_REST_Change_Mail(2,username,device_user_info,mail,function(res){
		if(res==0) 
		{
	  		var edit_Obj=$("#CloudDiag").overlay().close();
			jLoadingClose();
			do_query_user(username);
		}
		else
		{
			jLoadingClose();
		}
	});

	/*
		$.ajax({
			type: "PUT",
			cache: false,
			url: "/api/" + REST_VERSION + "/rest/device_user/" +userID+"?type=webuser"+"&name="+username+"&email="+mail,
			dataType: "xml",
			success:function(xml)
			{
				api_cp2flash();
				_modify_mail();
			},
		    error: function (request, status, error) {
				jLoadingClose();
				var $xml = $(request.responseText);
				var err = $xml.find('error_message').text();
				var errID = "error_id_" + $xml.find('error_id').text();
				jAlert( errorsList[errID], _T('_common','error'));
		    }
		});
		*/
		function _modify_mail()
		{
			$.ajax({
				type: "POST",
				cache: false,
				url: "/cgi-bin/account_mgr.cgi",
				data:{cmd:"cgi_modify_account",mtype:2,username:username,mail:mail},
				success:function()
				{
			  	var edit_Obj=$("#CloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
					edit_Obj.close();
					jLoadingClose();
					do_query_user(username);
				}
			});
		}	
		
}
function get_code(username,entry)
{
	if($("#cloud_getCode_button").hasClass('gray_out')) {return;}
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
			
	$("#cloudGetCodeDiag").show();
	
	$("#CloudGetDiag_title").html(_T('_cloud','add_access'))

	if(entry=='home')
	{
		var obj=$("#CloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
		obj.close();
	}
			
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	$.ajax({
		type: "POST",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user?username=" + username,
		dataType: "xml",
		success: function(xml){
			
			var dac = $(xml).find('dac').text();
			var dac_expiration = $(xml).find('dac_expiration').text();
			
	        var dac_code1 = dac.substr(0,4);
	        var dac_code2 = dac.substr(4,4);
	        var dac_code3 = dac.substr(8,4);
			
			new_dac = dac_code1+"-"+dac_code2+"-"+dac_code3;
					
			$("#code_info").html(new_dac);
			
			var date = new Date(dac_expiration * 1000);
			var new_time = multi_lang_format_time(date);
			//var new_time = localizeTimeStamp(dac_expiration);
			
			$("#expiration_info").html(new_time);
			
			//jLoadingClose();
			
			if(entry=="cloud")
				_REST_Get_User_Access_Code(username);
			else
				get_cloud_count();
			
			adjust_dialog_size("#CloudGetDiag",550,"");
		  	var edit_Obj2=$("#CloudGetDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
			edit_Obj2.load();
			api_cp2flash();
		},
		error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
			/*
			switch(request.status)
			{
				case 401:
					return;
					jAlert( _T('_login','msg5'), 'warning');
					
					$("#popup_ok").click( function (){
						location.replace("/web/login.html");
					});
					break;
				case 500:
					//Failed to create device user
					jAlert( "Failed to create device user.", 'warning');
					break;
			}
			*/
		},
        complete: function (jqXHR, textStatus) {
			jLoadingClose();
			rewrite_pem();
        }
		
	});
}
//function rewrite_pem()
//{
//	$.ajax({
//		type: "POST",
//		cache: false,
//		url: "/cgi-bin/network_mgr.cgi",
//		data:{cmd:'cgi_rewrite_pem'},		
//		success: function(){
//		}
//	});		
//}
function localizeTimeStamp(seconds) {
    if (typeof seconds != 'undefined') {
        timeStamp = new Date(seconds * 1000); // in milliseconds
    }
    else {
        timeStamp = new Date();
    }

    return timeStamp.toDateString() + ' ' + timeStamp.toLocaleTimeString();
}
var Option_click=0;
function SetCloudMode(obj,val,ftype)
{
	var connection_desc = new Array();
	connection_desc['auto'] = _T('_cloud','auto_desc')
	connection_desc['manual'] = _T('_cloud','manual_desc')
	connection_desc['winxp'] = _T('_cloud','xp_desc');
		
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val)
		{
			$(this).addClass('buttonSel');
			$("#connectivity_desc").html(connection_desc[$(this).val()])
		}
		else
			$(this).removeClass('buttonSel');
	});
	
	(val=="manual") ?$("#port_tr").show() : $("#port_tr").hide();
	(val=="manual") ?$("#required_div").show() : $("#required_div").hide();
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
		
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
		
		$("#connectivity_desc").html(connection_desc[$(this).val()])
		Option_click=1;
		($(this).val()=="manual") ?$("#port_tr").show() : $("#port_tr").hide();
		($(this).val()=="manual") ?$("#required_div").show() : $("#required_div").hide();
	});
	
	$(obj).show();
}
function wd2go_db_rebuild()
{
	//http://<NAS host IP>/api/2.1/rest/mediacrawler?allshare=true&rest_method=PUT
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	$.ajax({
		type: "PUT",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/mediacrawler?allshare=true",
		dataType: "xml",
		success:function(xml)
		{
			jLoadingClose();
			_DIALOG.close();
			_DIALOG="";
		},
		error: function (request, status, error) {
			
			jLoadingClose();
			
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
			
			/*
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
				case 500:
					
					var msg = "Error retrieving content scan status. Internal server error. Retry your last operation. If the error persists, contact WD Support for assistance."
					jAlert( msg, _T('_common','error'));
					break;
			}*/
		}
	});	
}
function set_cloud_option()
{
	//auto   --> http://ip/api/2.1/rest/device?manual_port_forward=false&rest_method=put
	//manual -->http://ip/api/2.1/rest/device?manual_port_forward=true&manual_external_http_port=<http port>&manual_external_https_port=<https port>&rest_method=put
	//win xp -->http://ip/api/2.1/rest/device?manual_port_forward=false&manual_external_http_port=80&manual_external_https_port=443&rest_method=put
	var option = $("#cloud_connectivity").attr("rel");
	var param = "";
	switch(option)
	{
		case 'auto':
			param = "manual_port_forward=false&default_ports_only=false";
			break;
		case 'manual':
			var http_port = $("#option_tb input[name='settings_generalCloudHTTPPort_text']").val();
			var https_port = $("#option_tb input[name='settings_generalCloudHTTPSPort_text']").val();
			manual_external_http_port= "&manual_external_http_port="+ http_port;
			manual_external_https_port="&manual_external_https_port=" + https_port;
			default_port_only = "&default_ports_only=false";
			param = "manual_port_forward=true"+ manual_external_http_port + manual_external_https_port + default_port_only;
			break;
		case 'winxp':
			manual_external_http_port= "&manual_external_http_port="+ "80";
			manual_external_https_port="&manual_external_https_port=" + "443";
			default_port_only = "&default_ports_only=true";
			param = "manual_port_forward=false"+ manual_external_http_port + manual_external_https_port + default_port_only;
			break;
	}

	clearTimeout(Cloud_StatusID);
	
	//internet_access
	$.ajax({
		type: "PUT",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device?" + param,
		dataType: "xml",
		success:function(xml)
		{
		},
		error: function (request, status, error) {
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
		},
        complete: function (jqXHR, textStatus) {
			_DIALOG.close();
			if(option=="manual") set_port("#option_tb");
			Cloud_StatusID = setTimeout("_REST_Get_Device_Status('general')", 10);
			switch(option)
			{
				case 'auto':
					google_analytics_log('cloudaccess-mode-auto', 1);
					break;
				case 'manual':
					google_analytics_log('cloudaccess-mode-manual', 1);
					break;
				case 'winxp':
					google_analytics_log('cloudaccess-mode-winxp', 1);
					break;
			}
        }
	});
}
var _CADMIN="";
function write_user_option(xml)
{
	var cloudholderMember= new Array();
	$(xml).find('groups > item').each(function(index){
		var gname = $(this).find('name').text();

		if(gname==_Filter_Default_Group[0])	//0:cloudholders
		{
			$(this).find('users > user').each(function(){
				cloudholderMember.push($(this).text());
			});
		}
	});
			
	var user_array = new Array();
	$(xml).find('users > item').each(function(){
		
		var name = $(this).find('name').text();
		var uid = $(this).find('uid').text();
		//console.log(name)
		if(uid=="500")
		{
			_CADMIN = name;
			return true;
		}
		
		//check user in cloudholders 
		if( api_filter_user(name,cloudholderMember) == 1 ) return true; //non-cloudholders users cannot show on GUI
				
		user_array.push(name);
	});
	var admin = [_CADMIN];
	user_array.sort();
	var new_user_array = admin.concat(user_array);
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div id="user_main" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="home_cloudUser_select" rel="' + new_user_array[0] +'">'+ new_user_array[0] +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		
		if(new_user_array.length >7 )
		{			
		option += '<ul class="ul_obj" style="width:200px;height:250px;">'; 
		option += '<div class="cloud_user_access_scroll">';
		}
		else
		{
			option += '<ul class="ul_obj" style="width:200px;">';
			option += '<div>';
		}
		
		for(var i in new_user_array)
		{
			option += '<li id="home_cloudUserUl' + i +'_select" rel="' + new_user_array[i] + '" style="width:190px;"> <a href="#">' + new_user_array[i] + '</a></li>';
		}
		option += '</div>';
		option += '</ul>';
		option += '</li>';
		option += '</ul>';
		
	$("#cloud_user_select").html(option);
	
	init_select();
}
var CloudIntervalId=0;
function get_cloud_count()
{
	clearTimeout(CloudIntervalId);
	wd_ajax({
		type: "GET",
		cache: false,
		//url: "/api/" + REST_VERSION + "/rest/device_user",
		url: "/web/restAPI/restAPI_action.php?action=device_user",
		dataType: "xml",
		success:function(xml)
		{
			var count=0;
		    $(xml).find("device_users > device_user").each(function() {
				var type = $(this).find("type").text();
				var active = $(this).find("active").text();
				
				if(type!="webuser" && active=="1")
					count++;
		    });
			$('#home_cloudDevices_value').empty().text(count);
			google_analytics_log('Home-Cloud_Devices',count);
		},
		complete: function (jqXHR, textStatus) {
			CloudIntervalId = setTimeout(get_cloud_count,15000);
		}
	});
}
var _HTTP_PORT="";
var _HTTPS_PORT="";
var pw_Obj="";
function get_dashboard_cloud_access_info()
{
	$("#settings_generalCloudDashboard_switch").unbind('click');
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/network_mgr.cgi",
		data:"cmd=cgi_dashboard_cloud_access_info",	
		dataType: "xml",
		success: function(xml){
			var https_port = $(xml).find('https_port').text();
			var http_port = $(xml).find('http_port').text();
			var dashboard_cloud_access = $(xml).find('dashboard_cloud_access').text();
			_HTTP_PORT = http_port;
			_HTTPS_PORT = https_port;
			//$("#DashboardCloudAccess_tb input[name='http_port']").val(http_port);
			//$("#DashboardCloudAccess_tb input[name='https_port']").val(https_port);

			//$("#option_tb input[name='http_port']").val(http_port);
			//$("#option_tb input[name='https_port']").val(https_port);
						
			setSwitch('#settings_generalCloudDashboard_switch',dashboard_cloud_access);
			_dashFlag = dashboard_cloud_access;
			init_switch();
			init_dashboard_click();
			//(dashboard_cloud_access=='1') ?$("#dashboard_conf_div").show() : $("#dashboard_conf_div").hide();
				}
			});	
		}
	function _showConfirm()
	{
		var msg = _T('_cloud','enable_desc');
		jConfirm('M',msg,_T('_cloud','enable_title'),"cloud",function(r){
			if(r)
			{
				//$("#dashboard_conf_div").show();
				set_dashboard_cloud_access(1);
			}
			else
			{
				setSwitch('#settings_generalCloudDashboard_switch',0);
			}
	    });
	}
function set_dashboard()
{
	var pw = $("#dash_pw_tb input[name='settings_generalPW_password']").val();
	//check pw
	var chk_flag = chk_pw_format();
	if(chk_flag==-1)
	{
		$("#dash_pw_tb input[name='settings_generalPW_password']").focus();
		return;
	}
	else if(chk_flag==-2)
	{
		$("#dash_pw_tb input[name='settings_generalConfirmPW_password']").focus();
		chk_pw_format();
		return;
	}
	set_admin_pw(pw);
	//$("#dashboard_conf_div").show();
	pw_Obj.close();
	set_dashboard_cloud_access(1);
}

function set_dashboard_cloud_access(enable)
{
	switch(parseInt(MULTI_LANGUAGE, 10))
	{
		case 9:	//ru
			adjust_dialog_size("#cloud_msg_Diag", 580, 200);
			break;
		default:
			adjust_dialog_size("#cloud_msg_Diag", 450, 200);
			break;
	}
	
	_dashFlag = enable;
  	var msg_Obj=$("#cloud_msg_Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
	msg_Obj.load();
	
	$("#cloud_msg_title").html(_T('_cloud','dash_access').replace(/<br>/g,""))
	$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/network_mgr.cgi",
		data:"cmd=cgi_dashboard_cloud_access&enable=" + enable,	
		dataType: "html",
		success: function(data){
			setTimeout(_ping,5000);
			
			google_analytics_log('dashboard-cloud-en', enable);
			
		},
		error: function (request, status, error) {
			setTimeout(_ping,5000);
		}
	});	
	
	function _ping()
	{
		var v = chk_server();
		if(v!=0)
		{
			setTimeout(_ping,2000);
		}
		else
		{
			//setTimeout("jLoadingClose()",2000);
			msg_Obj.close();
		}
	}
}
function chk_server(){
	var server_status=-1;
	wd_ajax({
		async:false,
		url: '/system_ready.html?r=' +new Date().getTime(),
		success: function(result){
			server_status = 0;
			return false;
		},     
		error: function(result){
			server_status = 1;
			return false;
		}
	});       
	return server_status; 
}
function chk_admin_pw_flag()
{
	var pwFlag=0;
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			var user_array = new Array();
			$(xml).find('users > item').each(function(){
				var name = $(this).find('name').text();
				var uid = $(this).find('uid').text();
				
				if(uid=="500")
				{
					pwFlag = $(this).find('pwd').text();
					return false;
				}
			});
		},
		error: function (request, status, error) {
			chk_admin_pw_flag();
		}
	});
	
	return pwFlag;
}
function show_error_tooltip(tipID,msg)
{
	$(tipID).attr('title',msg);
	$(tipID).removeClass('SaveButton');
	init_tooltip(".TooltipIconError");
}
function chk_pw_format()
{
	var obj_tb = "#dash_pw_tb";
	var pw=$( obj_tb + " input[name='settings_generalPW_password']").val();
	var pw2=$(obj_tb + " input[name='settings_generalConfirmPW_password']").val();

	//set password
	if( pw == "" )
	{
		//Please enter a password.
		show_error_tooltip(".tip_pw_error",_T('_mail','msg11'));
		return -1;
	}
	
	if(pw_check(pw)==1)
	{
		//The password must not include the following characters:  @ : / \ % '
		show_error_tooltip(".tip_pw_error",_T('_pwd','msg8'));
		return -1;	
	}

	if (pw.indexOf(" ") != -1) //find the blank space
 	{
 		//Password must not contain space.
 		show_error_tooltip(".tip_pw_error",_T('_pwd','msg9'));
 		return -1;
 	}

	if (pw.length < 5) 
	{
		//jAlert('Password must be at least 5 characters in length. Please try again.', 'Error');
		show_error_tooltip(".tip_pw_error",_T('_pwd','msg10'));
 		return -1;	
	}
	
	if (pw.length > 16)
	{
		//jAlert('The password length cannot exceed 16 characters. Please try again.', 'Error');
		show_error_tooltip(".tip_pw_error",_T('_pwd','msg11'));
 		return -1;			
	}
			
	if( pw != pw2 )
	{
		//jAlert('The new password and confirmation password does not match. Please try again.', 'Error');
		show_error_tooltip(".tip_pw2_error",_T('_pwd','msg7'));
		return -2;
	}
}	
function set_admin_pw(pw)
{
	pw = Base64.encode( pw );
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		dataType: "xml",
		data:{cmd:"cgi_modify_account",mtype:"3",username:"admin",
					pw:pw,pw_off:"off"},
		success:function(xml)
		{

		}
	});
}
function chk_keypress(e)
{
//	if (e.keyCode=='13')
//	{
//		alert("111")
//	  	var edit_Obj=$("#CloudDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
//		edit_Obj.load();
//		
//		alert("aaaaaaaaa")
//	}
}