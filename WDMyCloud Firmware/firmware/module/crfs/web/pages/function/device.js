function ready_device()
{
	xml_load();		
}
function clear_recycle_bin_folder()
{
	jConfirm("", _T('_recycle', 'del_msg'), _T('_recycle', 'del_msg_title'), "", function(r) {
		if (r)
		{
			jLoading(_T('_common','set'), 'loading' ,'s',"");
			wd_ajax({
				type:"POST",
				url:"/cgi-bin/system_mgr.cgi",
				data:{cmd:"cgi_clear_recycle_bin_folder"},
				cache:false,
				success:function(data){
					setTimeout("jLoadingClose()",1000);
				}
			});
		}
	});
}

function set_webdav()
{
	var webdav_enable = getSwitch('#settings_networkWebdav_switch');
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback	

	wd_ajax({
		type:"POST",
		url:"/cgi-bin/webdav_mgr.cgi",
		data:{cmd:"cgi_webdav_enable",webdav:webdav_enable},
		cache:false,
		success:function(){
			google_analytics_log('webdav-en',webdav_enable);
			setTimeout("jLoadingClose()",1000);
		}
	});
}
function set_lmb()
{
	var lmb_enable = getSwitch('#settings_networkLMB_switch');
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback

	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_lmb",lmb:lmb_enable},
		cache:false,
		success:function(){
			setTimeout("jLoadingClose()",1000);
		}
	});

}
function set_smb(enable)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback

	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_smb",enable:enable},
		cache:false,
		success:function(){
			setTimeout("jLoadingClose()",1000);
		}
	});	
}
function set_smb2(smb_type)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback

	wd_ajax({
		type:"POST",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_smb2",smb2_enable:smb_type},
		cache:false,
		success:function(){
			setTimeout("jLoadingClose()",1000);
		}
	});

}
function getSSH_pw_status()
{
	var _array = {status:0,pw:""};
	wd_ajax({
		type:"GET",
		url:"/cgi-bin/system_mgr.cgi?cmd=cgi_get_ssh_pw_status",
		cache:false,
		async:false,
		dataType: "xml",
		success: function(xml){
			var pw_status = $(xml).find('info').text();
			//var pw = $(xml).find('sshd_pw').text();
			if(pw_status.length!=0)
			{
				pw_status = pw_status.split(":");
				pw_status = pw_status[1];
				if(pw_status!="$1$$mhlP1OI3tfoDOpy8QjNVz1") _array.status=1;
			}
			
			/*
			if(pw.length!=0)
			{
				pw = Base64.decode( pw );
				_array.pw=pw;
			}
			else
				_array.pw="welc0me";*/
		}
	});
	
	return _array;
}
var _SSH = "";
function set_ssh(ssh_enable)
{
	_SSH = ssh_enable;
	var s;
	var remote_enable = getSwitch('#settings_networkRemoteServer_switch');
	var ssh = getSSH_pw_status();	//1:changed 0:default pw
	
	if(remote_enable==1 && ssh_enable==0)
	{
		//s = "You currently have remote backups running on this device. Turning OFF SSH will disable all remote backups.<br><br>Do you wish to disable SSH?";
		s = _T('_ssh','enable_desc1');
		jConfirm('M',s,_T('_ssh','ssh'),"ssh2",function(r){
			if(r)
			{
				ssh_callback();
			}
			else
			{
				setSwitch('#settings_networkSSH_switch',1);
			}
	    });		
	}
	else
	{
		ssh_callback();
		/*
		if(ssh.status==1 && ssh_enable==1)
		{
			//only change pw
			init_ssh_dialog(ssh.pw);
		}
		else
		{
			ssh_callback();
		}*/
	}
}

var _SSH_PW_STATUS=0;
function ssh_callback()
{
	var str="";
	var chkBox="";
	var msg="";
	var ssh = getSSH_pw_status();	//1:changed 0:default pw
	
	if(_SSH==1)
	{
		str = _T('_ssh','enable_desc3');
		str +="<br><br>";
		chkBox = '<input type="checkbox" name="ssh_accept" id="ssh_accept" onclick="ssh_accept(this)">';	//ssh_accept() in remote.js
		
		msg = str + "<table><tr><td>" + chkBox + "</td><td>" + _T('_ssh','accept') + "</td></tr></table>";
		
		var tipclass1 = "SaveButton",tipclass2 = "SaveButton";
		if(_SSH_PW_STATUS!=-6 && _SSH_PW_STATUS!=0) tipclass1="";
		if(_SSH_PW_STATUS==-6) tipclass2="";
		
		var desc = _T("_ssh","desc3");
		var pw_tb = "<table id='ssh_pw_tb' style='display:none' width='480'>";
			pw_tb += "<tr><td colspan='3' style='padding-top:15px;'>" + desc + "</td><td></td></tr>";
			pw_tb += "<tr><td class='tdfield'>" + _T('_admin','new_pwd') + " *</td><td class='tdfield_padding'><input id='settings_SSHPW_password' type='password' name='settings_SSHPW_password' value=''></input></td><td class='tdfield_padding'><div class='TooltipIconError tip_pw_error " + tipclass1 + "'></div></td></tr>";
			pw_tb += "<tr><td class='tdfield'>" + _T('_admin','confirm_pwd') + "</td><td class='tdfield_padding'><input id='settings_SSHConfirmPW_password' type='password' name='settings_SSHConfirmPW_password' value=''></input></td><td class='tdfield_padding'><div class='TooltipIconError tip_pw2_error " + tipclass2 + "'></div></td></tr>";
			pw_tb += "</table>";
			pw_tb += "<br><br>";
		
		if(ssh.status==1) pw_tb="";
		jConfirm('M',msg + pw_tb,_T('_ssh','ssh'),"ssh",function(r){
			if(r)
			{
				var pw="";
				if(ssh.status==0)
				{
				//check ssh pw
				var chk_flag = chk_ssh_pw('#ssh_pw_tb');
				if(chk_flag!=0)
				{
					_SSH_PW_STATUS=chk_flag;
					ssh_callback();
					return;
				}
				
				_SSH_PW_STATUS=0;
					pw=$("#ssh_pw_tb input[name='settings_SSHPW_password']").val();
				}
				$("#ssh_conf_div").show();
				post_ssh(pw);
			}
			else
			{
				setSwitch('#settings_networkSSH_switch',0);
				$("#ssh_conf_div").hide();
			}
	    });
	}
	else 
	{
		post_ssh("");
	}
	
	function post_ssh(pw)
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_ssh",ssh:_SSH,pw:Base64.encode( pw )},
			cache:false,
			success:function(){
				google_analytics_log('ssh-en', _SSH);
				if(_SSH==0) _post_remote_backup(0);
				setTimeout("jLoadingClose()",1000);
			}
		});
	}
	
	function _post_remote_backup(onoff)
	{
		var pw="";
	 	wd_ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/remote_backup.cgi",
			data:{cmd:"cgi_set_rsync_server",f_onoff:onoff,f_password:pw},
			success: function(){
				setSwitch('#settings_networkRemoteServer_switch',onoff);
				init_switch();
				show_pw();
			}
		});
	}
}


var _SMB = {
			"0":"SMB 3",
			"1":"SMB 2",
			"2":"SMB 1"
		};
function xml_load()
{
	myData= new Array();
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data:"cmd=cgi_get_device_info",	
		dataType: "xml",
		success: function(xml){		
			$(xml).find('device_info').each(function(){
			
				var name = $(this).find('name').text();
				var workgroup = $(this).find('workgroup').text();
				var description = $(this).find('description').text();				
				var lmb = $(this).find('lmb').text();
				var ssh = $(this).find('ssh').text();
				var rsync = $(this).find('rsync').text();
				var webdav = $(this).find('webdav').text();
				var serial_number = $(this).find('serial_number').text();
				var smb2 = $(this).find('smb2').text();
				var smb = $(this).find('smb').text();
				var sshd_pw = $(this).find('sshd_pw').text();
				
				$("#settings_generalSerialNum_value").text(serial_number)
				$("#settings_generalDeviceName_text").val(name);
				$("#settings_networkWorkgroup_text").val(workgroup);
				$("#settings_generalDesc_text").val(description);
				setSwitch('#settings_networkLMB_switch',lmb);
				setSwitch('#settings_networkSSH_switch',ssh);
				setSwitch('#settings_networkWebdav_switch',webdav);
				setSwitch('#smb_switch',smb);
				$("#smb_switch").hide();
				$("#smb_select").show();
				write_smb_select();
				$("#settings_networkMaxSmbProtocol_select").attr('rel',smb2).html(_SMB[smb2]);
				$("#smb_title").html(_T('_lan','max_smb'));				
				(ssh=='1')? $("#ssh_conf_div").show() : $("#ssh_conf_div").hide();
				//(smb=='1')? $("#wins_service").show() : $("#wins_service").hide();
			});
		},
		error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		}  
	});	
}
function chk_ssh_pw(obj_tb)
{
	var pw=$( obj_tb + " input[name='settings_SSHPW_password']").val();
	var pw2=$(obj_tb + " input[name='settings_SSHConfirmPW_password']").val();

	//set password
	if( pw == "" )
	{
		//Please enter a password.
		show_error_tip(".tip_pw_error",_T('_mail','msg11'));
		return -1;
	}
	
	if(pw_check(pw)==1)
	{
		//The password must not include the following characters:  @ : / \ % '
		show_error_tip(".tip_pw_error",_T('_pwd','msg8'));
		return -2;	
	}

	if (pw.indexOf(" ") != -1) //find the blank space
 	{
 		//Password must not contain space.
 		show_error_tip(".tip_pw_error",_T('_pwd','msg9'));
 		return -3;
 	}

	if (pw.length < 5) 
	{
		//jAlert('Password must be at least 5 characters in length. Please try again.', 'Error');
		show_error_tip(".tip_pw_error",_T('_pwd','msg10'));
 		return -4;	
	}
	
	if (pw.length > 16)
	{
		//jAlert('The password length cannot exceed 16 characters. Please try again.', 'Error');
		show_error_tip(".tip_pw_error",_T('_pwd','msg11'));
 		return -5;			
	}
			
	if( pw != pw2 )
	{
		//jAlert('The new password and confirmation password does not match. Please try again.', 'Error');
		//jAlert(_T('_pwd','msg7'), _T('_common','error'));
		show_error_tip(".tip_pw2_error",_T('_pwd','msg7'));
		return -6;
	}
	
	return 0;
}
function init_ssh_dialog()
{
	$("#edit_ssh_pw_tb .TooltipIconError").removeClass('SaveButton');
	$("#edit_ssh_pw_tb .TooltipIconError").addClass('SaveButton');
	
	var _TITLE = "SSH";
	$("#sshDiag_title").html(_TITLE);
	
	$('#edit_ssh_pw_tb input[name=settings_SSHPW_password]').val("");
	$('#edit_ssh_pw_tb input[name=settings_SSHConfirmPW_password]').val("");
	
	//language();
	
  	var sshObj=$("#sshDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
        			onBeforeLoad: function() {
    					setTimeout("$('#edit_ssh_pw_tb input[name=settings_SSHPW_password]').focus()",100);
    					ui_tab("#sshDiag","#edit_ssh_pw_tb input[name='settings_SSHPW_password']","#settings_SSHSave_button");
    				}
    			});
	sshObj.load();
	
	$("#settings_SSHSave_button").unbind('click');
    $("#settings_SSHSave_button").click(function(){
		//check ssh pw
		var chk_flag = chk_ssh_pw('#edit_ssh_pw_tb');
		if(chk_flag!=0) return;
		var pw=$("#edit_ssh_pw_tb input[name='settings_SSHPW_password']").val();
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_ssh",ssh:"1",pw:Base64.encode( pw )},
			cache:false,
			success:function(){
				google_analytics_log('ssh-en', 1);
				sshObj.close();
				jLoadingClose();
			}
		});
	});	
	
}
function write_smb_select()
{
	/*var smb = {
			"0":"SMB 3",
			"1":"SMB 2",
			"2":"SMB 1"
		};
	*/
	
	var option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="settings_networkMaxSmbProtocol_select" rel="0">'+ "SMB 3"+'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj" style="width:90px;">';
	option += "<div>";
	
	option += "<li id='settings_networkMaxSmbLi0_select' style='width:80px' rel='" + "2" + "' class='li_start'> <a href='#' onclick=\"set_smb2('2')\">" + "SMB 1" + "</a></li>";
	option += "<li id='settings_networkMaxSmbLi1_select' style='width:80px' rel='" + "1" + "'> <a href='#' onclick=\"set_smb2('1')\">" + "SMB 2" + "</a></li>";
	option += "<li id='settings_networkMaxSmbLi2_select' style='width:80px' rel='" + "0" + "' class='li_end'> <a href='#' onclick=\"set_smb2('0')\">" + "SMB 3" + "</a></li>";
	
	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";
				
	$("#smb_select").html(option);
	init_select();
}